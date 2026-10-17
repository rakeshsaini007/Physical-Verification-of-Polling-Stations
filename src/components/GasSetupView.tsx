import React, { useState } from 'react';
import { GOOGLE_APPS_SCRIPT_URL } from '../config/gasConfig';
import { getActiveGasUrl, setCustomGasUrl, isGasUrlConfigured } from '../services/gasService';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Terminal,
  HelpCircle
} from 'lucide-react';

export const GasSetupView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [inputUrl, setInputUrl] = useState(getActiveGasUrl());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const isConfigured = isGasUrlConfigured();

  const handleCopyCode = async () => {
    try {
      // Fetch or read code.js
      const res = await fetch('/code.js');
      const text = res.ok ? await res.text() : '// code.js is located in project root';
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleSaveUrl = () => {
    setCustomGasUrl(inputUrl);
    alert('गूगल ऐप स्क्रिप्ट वेब ऐप URL सफलतापूर्वक सहेज लिया गया है!');
  };

  const handleTestConnection = async () => {
    if (!inputUrl || !inputUrl.startsWith('https://script.google.com')) {
      setTestStatus('error');
      setTestMessage('कृपया वैध Google Apps Script Web App URL दर्ज करें (https://script.google.com/macros/s/.../exec)');
      return;
    }

    setTestStatus('testing');
    setTestMessage('कनेक्शन का परीक्षण किया जा रहा है...');

    try {
      const testUrl = `${inputUrl}${inputUrl.includes('?') ? '&' : '?'}action=getAll`;
      const res = await fetch(testUrl, { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        setTestStatus('success');
        setTestMessage(`सफलतापूर्वक कनेक्टेड! Google Sheets में ${json.verifications?.length || 0} सत्यापन रिकॉर्ड एवं ${json.masterBooths?.length || 0} मास्टर बूथ मिले।`);
        setCustomGasUrl(inputUrl);
      } else {
        setTestStatus('error');
        setTestMessage(`सर्वर से त्रुटि कोड ${res.status} प्राप्त हुआ। कृपया सुनिश्चित करें कि Deploy में "Who has access: Anyone" चुना गया है।`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`कनेक्ट नहीं हो सका (${err.message || 'CORS / नेटवर्क त्रुटि'})। सुनिश्चित करें कि आपने Apps Script को Web App के रूप में 'Anyone' एक्सेस के साथ तैनात (Deploy) किया है।`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Title */}
      <div className="mb-6 text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full inline-block mb-2">
          Google Apps Script & Google Sheets Integration
        </span>
        <h1 className="text-2xl font-bold text-slate-900">
          गूगल ऐप स्क्रिप्ट (Backend) सेटअप गाइड
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          डेटा सीधे आपके अपने Google Sheets स्प्रेडशीट में सुरक्षित व अपडेट होगा
        </p>
      </div>

      {/* Target Config File Highlight Card */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 mb-8 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0">
            <FileCode className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-amber-950">
              यूआरएल प्रविष्टि हेतु फ़ाइल: <span className="font-mono bg-amber-200/80 px-2 py-0.5 rounded text-amber-900">src/config/gasConfig.ts</span>
            </h2>
            <p className="text-xs text-amber-900 mt-1 leading-relaxed">
              आपके निर्देशानुसार, Google Apps Script Deploy URL को कोड में सुरक्षित रखने के लिए फ़ाइल <strong>src/config/gasConfig.ts</strong> बनाई गई है। आप नीचे दिए गए बॉक्स में भी URL पेस्ट कर सकते हैं अथवा सीधे <code className="font-mono font-bold">src/config/gasConfig.ts</code> में <code className="font-mono font-bold">GOOGLE_APPS_SCRIPT_URL</code> वेरिएबल में दर्ज कर सकते हैं।
            </p>
          </div>
        </div>

        {/* Live URL Input & Test */}
        <div className="mt-4 pt-4 border-t border-amber-200">
          <label className="block text-xs font-bold text-amber-950 mb-1">
            Google Apps Script Web App URL:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
            />
            <button
              onClick={handleSaveUrl}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
            >
              सेव करें
            </button>
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              {testStatus === 'testing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>परीक्षण...</span>
                </>
              ) : (
                <span>कनेक्शन टेस्ट करें</span>
              )}
            </button>
          </div>

          {testMessage && (
            <div className={`mt-2 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
              testStatus === 'success' 
                ? 'bg-emerald-100 text-emerald-800 font-medium' 
                : testStatus === 'error'
                  ? 'bg-rose-100 text-rose-800 font-medium'
                  : 'bg-blue-100 text-blue-800'
            }`}>
              {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{testMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Step by step deployment instructions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span>आसान 4 चरणों में Google Apps Script सेटअप करें:</span>
        </h2>

        <div className="space-y-4 text-xs text-slate-700">
          
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </span>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-sm">नई Google Sheets खोलें</h3>
              <p className="mt-0.5">
                ब्राउज़र में <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-amber-700 font-semibold underline inline-flex items-center gap-0.5">sheets.new <ExternalLink className="w-3 h-3" /></a> खोलें। अपनी स्प्रेडशीट का नाम दें (उदा० <em>&quot;मतदेय स्थल भौतिक सत्यापन 2026&quot;</em>)।
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </span>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-sm">Apps Script एडिटर खोलें</h3>
              <p className="mt-0.5">
                शीट्स के मेनू में <strong>Extensions (एक्सटेंशन)</strong> &rarr; <strong>Apps Script</strong> पर क्लिक करें।
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">code.js का कोड पेस्ट करें</h3>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'कोड कॉपी हो गया!' : 'code.js कॉपी करें'}</span>
                </button>
              </div>
              <p className="mt-1">
                प्रोजेक्ट रूट में उपस्थित <strong>code.js</strong> का सम्पूर्ण कोड Apps Script एडिटर में <code>Code.gs</code> की जगह पेस्ट करें और ऊपर डिस्क आइकॉन (Save) दबाएं।
              </p>
              <p className="mt-1 text-slate-500">
                (सुझाव: एक बार ऊपर फ़ंक्शन ड्रॉपडाउन से <code>setupInitialSheets</code> चुनकर Run करें, यह सभी 16 कॉलम्स और मास्टर बूथ स्वतः बना देगा)।
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              4
            </span>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-sm">Web App के रूप में Deploy (तैनात) करें</h3>
              <p className="mt-0.5">
                ऊपर दाईं ओर <strong>Deploy</strong> बटन &rarr; <strong>New deployment</strong> चुनें:
              </p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 font-medium">
                <li>Select type (गियर) &rarr; <strong>Web app</strong></li>
                <li>Execute as: <strong>Me</strong> (मेरी ईमेल)</li>
                <li>Who has access: <strong className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded">Anyone (कोई भी व्यक्ति)</strong> (महत्वपूर्ण!)</li>
              </ul>
              <p className="mt-1">
                Deploy पर क्लिक करें और जो <strong>Web app URL</strong> मिले, उसे <code className="font-mono bg-slate-200 px-1 rounded">src/config/gasConfig.ts</code> में पेस्ट करें!
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Code preview & copy card */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-xs font-semibold text-white">/code.js (Google Apps Script Code)</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'कॉपी हो गया' : 'संपूर्ण कोड कॉपी करें'}</span>
          </button>
        </div>
        <p className="text-xs text-slate-400 font-mono leading-relaxed">
          // doGet एवं doPost हैंडल्स - बूथ संख्या के आधार पर स्वतः जाँच एवं रो अपडेट/इंसर्ट
          <br />
          // Col 1 से 16 तक का आधिकारिक प्रारूप
          <br />
          // यह फ़ाइल प्रोजेक्ट के रूट डायरेक्टरी में &apos;code.js&apos; नाम से उपस्थित है।
        </p>
      </div>

    </div>
  );
};
