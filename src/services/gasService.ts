import { GOOGLE_APPS_SCRIPT_URL } from '../config/gasConfig';
import { VerificationRecord, GasResponse, MasterBooth } from '../types';
import { MASTER_BOOTHS, INITIAL_VERIFIED_SAMPLE } from '../data/masterBooths';

const STORAGE_KEY_VERIFICATIONS = 'polling_booth_verifications_v1';
const STORAGE_KEY_CUSTOM_URL = 'polling_booth_custom_gas_url';

export function isGasUrlConfigured(): boolean {
  const url = getActiveGasUrl();
  return (
    !!url &&
    url.startsWith('https://script.google.com') &&
    !url.includes('YOUR_SCRIPT_ID_HERE')
  );
}

export function getActiveGasUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem(STORAGE_KEY_CUSTOM_URL);
    if (custom && custom.trim().length > 0) {
      return custom.trim();
    }
  }
  return GOOGLE_APPS_SCRIPT_URL.trim();
}

export function setCustomGasUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (!url || url.trim() === '') {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_URL);
    } else {
      localStorage.setItem(STORAGE_KEY_CUSTOM_URL, url.trim());
    }
  }
}

// Local Storage helpers
export function getLocalVerifications(): VerificationRecord[] {
  if (typeof window === 'undefined') return INITIAL_VERIFIED_SAMPLE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VERIFICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_VERIFICATIONS, JSON.stringify(INITIAL_VERIFIED_SAMPLE));
      return INITIAL_VERIFIED_SAMPLE;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading localStorage:', err);
    return INITIAL_VERIFIED_SAMPLE;
  }
}

export function saveLocalVerification(record: VerificationRecord): { isUpdate: boolean; records: VerificationRecord[] } {
  const current = getLocalVerifications();
  const boothNoStr = String(record.boothNo).trim();
  const existingIdx = current.findIndex(r => String(r.boothNo).trim() === boothNoStr);

  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const updatedRecord = {
    ...record,
    updatedAt: formattedDate,
  };

  let isUpdate = false;
  let nextRecords: VerificationRecord[] = [];

  if (existingIdx >= 0) {
    isUpdate = true;
    nextRecords = [...current];
    nextRecords[existingIdx] = {
      ...current[existingIdx],
      ...updatedRecord,
      serialNo: current[existingIdx].serialNo || (existingIdx + 1),
    };
  } else {
    isUpdate = false;
    const newSerial = nextRecords.length + 1;
    nextRecords = [...current, { ...updatedRecord, serialNo: newSerial, id: `rec-${Date.now()}` }];
  }

  localStorage.setItem(STORAGE_KEY_VERIFICATIONS, JSON.stringify(nextRecords));
  return { isUpdate, records: nextRecords };
}

/**
 * Fetch all records (tries Google Apps Script first if configured, falls back to local)
 */
export async function fetchAllData(): Promise<{ verifications: VerificationRecord[]; masterBooths: MasterBooth[]; source: 'gas' | 'local' }> {
  const url = getActiveGasUrl();

  if (isGasUrlConfigured()) {
    try {
      const targetUrl = `${url}${url.includes('?') ? '&' : '?'}action=getAll`;
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        const json = await response.json();
        if (json && json.status === 'success') {
          const loadedVerifications = Array.isArray(json.verifications) ? json.verifications : [];
          const loadedMasterBooths = Array.isArray(json.masterBooths) && json.masterBooths.length > 0 
            ? json.masterBooths 
            : MASTER_BOOTHS;

          // Sync to local cache
          localStorage.setItem(STORAGE_KEY_VERIFICATIONS, JSON.stringify(loadedVerifications));
          return { verifications: loadedVerifications, masterBooths: loadedMasterBooths, source: 'gas' };
        }
      }
    } catch (networkErr) {
      console.warn('Google Apps Script fetch failed, using local storage fallback:', networkErr);
    }
  }

  return { verifications: getLocalVerifications(), masterBooths: MASTER_BOOTHS, source: 'local' };
}

/**
 * Submit or Update record in Google Apps Script
 */
export async function submitVerification(record: VerificationRecord): Promise<GasResponse> {
  const url = getActiveGasUrl();
  const hasRealGas = isGasUrlConfigured();

  // Save locally first to guarantee zero data loss
  const { isUpdate } = saveLocalVerification(record);

  if (hasRealGas) {
    try {
      // GAS Web Apps handle POST via redirect. We send payload as JSON text.
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(record),
        redirect: 'follow',
      });

      if (response.ok) {
        try {
          const resJson: GasResponse = await response.json();
          return {
            status: 'success',
            action: isUpdate ? 'updated' : 'saved',
            isUpdate,
            boothNo: record.boothNo,
            message: resJson.message || (isUpdate 
              ? `मतदेय स्थल सं० ${record.boothNo} का डेटा Google Sheets में सफलतापूर्वक अपडेट (Update) हो गया!` 
              : `मतदेय स्थल सं० ${record.boothNo} का डेटा Google Sheets में सफलतापूर्वक सुरक्षित (Save) हो गया!`),
            record,
          };
        } catch {
          // If response body isn't JSON due to redirect, but HTTP status was 200/OK
          return {
            status: 'success',
            action: isUpdate ? 'updated' : 'saved',
            isUpdate,
            boothNo: record.boothNo,
            message: isUpdate 
              ? `मतदेय स्थल सं० ${record.boothNo} का डेटा Google Sheets में सफलतापूर्वक अपडेट (Update) हो गया!` 
              : `मतदेय स्थल सं० ${record.boothNo} का डेटा Google Sheets में सफलतापूर्वक सुरक्षित (Save) हो गया!`,
            record,
          };
        }
      } else {
        throw new Error(`Google Apps Script responded with HTTP ${response.status}`);
      }
    } catch (err: any) {
      console.error('GAS POST Error:', err);
      // Still notify user that local storage worked and show the GAS error
      return {
        status: 'success',
        action: isUpdate ? 'updated' : 'saved',
        isUpdate,
        boothNo: record.boothNo,
        message: `${isUpdate ? 'अपडेट' : 'सुरक्षित'} सफल (लोकल मोड में सुरक्षित हुआ। Google Sheets सिंक में त्रुटि: ${err.message || 'नेटवर्क समस्या'})`,
        record,
      };
    }
  }

  // Pure local mode response
  return {
    status: 'success',
    action: isUpdate ? 'updated' : 'saved',
    isUpdate,
    boothNo: record.boothNo,
    message: isUpdate 
      ? `मतदेय स्थल सं० ${record.boothNo} का विवरण सफलतापूर्वक अपडेट (Update) हो गया!` 
      : `मतदेय स्थल सं० ${record.boothNo} का नया सत्यापन विवरण सफलतापूर्वक सुरक्षित (Save) हो गया!`,
    record,
  };
}
