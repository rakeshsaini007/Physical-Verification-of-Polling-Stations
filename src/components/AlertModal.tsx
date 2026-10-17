import React from 'react';
import { CheckCircle2, AlertCircle, X, RefreshCw, FileCheck } from 'lucide-react';

export interface AlertNotificationData {
  type: 'saved' | 'updated' | 'error';
  title: string;
  message: string;
  boothNo?: string | number;
  boothName?: string;
  timestamp?: string;
}

interface AlertModalProps {
  alertData: AlertNotificationData | null;
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ alertData, onClose }) => {
  if (!alertData) return null;

  const isUpdate = alertData.type === 'updated';
  const isError = alertData.type === 'error';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-center transform transition-all animate-in zoom-in-95 duration-150">
        
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center mb-4">
          {isError ? (
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
          ) : isUpdate ? (
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <RefreshCw className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileCheck className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900">
          {alertData.title}
        </h3>

        {/* Message */}
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {alertData.message}
        </p>

        {/* Booth Details Pill */}
        {alertData.boothNo && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>मतदेय स्थल संख्या:</span>
              <span className="font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                बूथ #{alertData.boothNo}
              </span>
            </div>
            {alertData.boothName && (
              <div className="mt-1 text-slate-600">
                {alertData.boothName}
              </div>
            )}
            <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>कार्रवाई प्रकार: {isUpdate ? 'रिकॉर्ड अपडेट (Update)' : 'नवीन सुरक्षित (Save)'}</span>
              <span>{alertData.timestamp || 'अभी-अभी'}</span>
            </div>
          </div>
        )}

        {/* OK / Confirm Button */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white shadow-xs cursor-pointer transition-colors ${
              isError
                ? 'bg-rose-600 hover:bg-rose-700'
                : isUpdate
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            ठीक है (OK)
          </button>
        </div>

      </div>
    </div>
  );
};
