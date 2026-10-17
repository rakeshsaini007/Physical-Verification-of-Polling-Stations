import React, { useState, useEffect } from 'react';
import { VerificationRecord } from './types';
import { MASTER_BOOTHS } from './data/masterBooths';
import { fetchAllData, submitVerification, isGasUrlConfigured } from './services/gasService';
import { VerificationForm } from './components/VerificationForm';
import { OfficialTableView } from './components/OfficialTableView';
import { GasSetupView } from './components/GasSetupView';
import { AlertModal, AlertNotificationData } from './components/AlertModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'table' | 'gas'>('form');
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [masterBooths, setMasterBooths] = useState(MASTER_BOOTHS);
  const [selectedBoothNo, setSelectedBoothNo] = useState<string | number | null>('1');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<AlertNotificationData | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      const { verifications: loaded, masterBooths: loadedMB } = await fetchAllData();
      setVerifications(loaded);
      if (loadedMB && loadedMB.length > 0) {
        setMasterBooths(loadedMB);
      }
    }
    loadData();
  }, []);

  const handleSaveRecord = async (record: VerificationRecord) => {
    setIsSubmitting(true);
    try {
      const result = await submitVerification(record);
      
      // Update local verifications state
      const boothNoStr = String(record.boothNo).trim();
      setVerifications(prev => {
        const idx = prev.findIndex(r => String(r.boothNo).trim() === boothNoStr);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...record, updatedAt: result.updatedAt || new Date().toLocaleString() };
          return updated;
        } else {
          return [...prev, { ...record, updatedAt: result.updatedAt || new Date().toLocaleString() }];
        }
      });

      // Prepare Alert popup
      const isUpdate = result.isUpdate;
      setAlertData({
        type: isUpdate ? 'updated' : 'saved',
        title: isUpdate ? 'डेटा सफलतापूर्वक अपडेट हुआ!' : 'डेटा सफलतापूर्वक सुरक्षित हुआ!',
        message: result.message || (isUpdate 
          ? `मतदेय स्थल सं० ${record.boothNo} का विवरण सफलतापूर्वक अपडेट कर दिया गया है।`
          : `मतदेय स्थल सं० ${record.boothNo} का विवरण सफलतापूर्वक सुरक्षित कर दिया गया है।`),
        boothNo: record.boothNo,
        boothName: record.boothName,
        timestamp: new Date().toLocaleTimeString(),
      });

    } catch (err: any) {
      console.error('Save error:', err);
      setAlertData({
        type: 'error',
        title: 'डेटा सहेजने में त्रुटि',
        message: err.message || 'डेटा सुरक्षित नहीं किया जा सका। कृपया पुनः प्रयास करें।',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBoothFromTable = (boothNo: string | number) => {
    setSelectedBoothNo(boothNo);
    setActiveTab('form');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNew = () => {
    // Find next unverified booth or 1
    const verifiedBoothNos = new Set(verifications.map(v => String(v.boothNo).trim()));
    const nextUnverified = MASTER_BOOTHS.find(m => !verifiedBoothNos.has(String(m.boothNo).trim()));
    setSelectedBoothNo(nextUnverified ? nextUnverified.boothNo : '1');
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      

      {/* Main Content Areas */}
      <main className="flex-1 pb-16">
        {activeTab === 'form' && (
          <VerificationForm
            existingRecords={verifications}
            onSaveRecord={handleSaveRecord}
            isSubmitting={isSubmitting}
            preselectedBoothNo={selectedBoothNo}
            masterBooths={masterBooths}
          />
        )}

        {activeTab === 'table' && (
          <OfficialTableView
            verifications={verifications}
            onEditBooth={handleEditBoothFromTable}
            onAddNew={handleAddNew}
            assemblyConstituency="34 - स्वार"
            tehsilName="स्वार"
          />
        )}

        {activeTab === 'gas' && (
          <GasSetupView />
        )}
      </main>

      {/* Alert Notification Modal when data is saved or updated */}
      <AlertModal
        alertData={alertData}
        onClose={() => setAlertData(null)}
      />

      {/* Clean Footer adhering to anti-slop guidelines */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>मतदेय स्थल भौतिक सत्यापन पोर्टल · विधानसभा निर्वाचन क्षेत्र स्वार (रामपुर)</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('gas')}
              className="text-amber-700 hover:underline font-medium cursor-pointer"
            >
              Google Apps Script (code.js)
            </button>
            <span>·</span>
            <span>अद्यतन प्रारूप 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
