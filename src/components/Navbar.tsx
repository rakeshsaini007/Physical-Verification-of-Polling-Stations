import React from 'react';
import { Database, FileSpreadsheet, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { isGasUrlConfigured, getActiveGasUrl } from '../services/gasService';

interface NavbarProps {
  activeTab: 'form' | 'table' | 'gas';
  setActiveTab: (tab: 'form' | 'table' | 'gas') => void;
  verifiedCount: number;
  totalBooths: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  verifiedCount,
  totalBooths,
}) => {
  const gasConnected = isGasUrlConfigured();
  const gasUrl = getActiveGasUrl();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              निर्वाचन
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 block leading-tight whitespace-nowrap">
                मतदेय स्थल सत्यापन पोर्टल
              </span>
              <span className="text-xs text-slate-500 hidden sm:block">
                विधान सभा निर्वाचन क्षेत्र - भौतिक सत्यापन प्रारूप
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap text-xs sm:text-sm ${
                activeTab === 'form'
                  ? 'bg-amber-50 text-amber-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>डेटा प्रविष्टि (Form)</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap text-xs sm:text-sm ${
                activeTab === 'table'
                  ? 'bg-amber-50 text-amber-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>सत्यापन रजिस्टर ({verifiedCount}/{totalBooths})</span>
            </button>

            <button
              onClick={() => setActiveTab('gas')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap text-xs sm:text-sm ${
                activeTab === 'gas'
                  ? 'bg-amber-50 text-amber-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Google Apps Script</span>
            </button>
          </nav>

          {/* Zone 3: Connection Status Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('gas')}
              title={gasConnected ? `Google Sheets Synced: ${gasUrl}` : 'Click to configure Google Apps Script URL'}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                gasConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              {gasConnected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline">Google Sheets लिंक सक्रिय</span>
                  <span className="md:hidden">Sheets लिंक</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden md:inline">GAS URL कॉन्फ़िगर करें</span>
                  <span className="md:hidden">GAS सेटअप</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
