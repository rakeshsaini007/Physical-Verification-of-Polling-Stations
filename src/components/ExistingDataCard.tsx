import React from 'react';
import { VerificationRecord } from '../types';
import { CheckCircle2, Clock, MapPin, Building, ShieldCheck, DoorClosed, Droplets, Zap, Accessibility, Armchair } from 'lucide-react';

interface ExistingDataCardProps {
  record: VerificationRecord;
  onResetToExisting: () => void;
}

export const ExistingDataCard: React.FC<ExistingDataCardProps> = ({
  record,
  onResetToExisting,
}) => {
  return (
    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 mb-6 text-slate-800 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/80">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-800">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                पूर्व में दर्ज रिकॉर्ड (Existing Record)
              </span>
              <span className="text-xs font-medium text-amber-900">
                बूथ सं० {record.boothNo}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                Status: Complete
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {record.boothName}
            </h3>
          </div>
        </div>

        {record.updatedAt && (
          <div className="flex items-center gap-1.5 text-xs text-amber-900/80 bg-amber-100/70 px-3 py-1.5 rounded-lg">
            <Clock className="w-3.5 h-3.5" />
            <span>अंतिम प्रविष्टि: {record.updatedAt}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 py-4 text-xs">
        <div className="bg-white/80 p-2.5 rounded-lg border border-amber-100">
          <span className="text-slate-500 block">कमरों की संख्या:</span>
          <span className="font-semibold text-slate-900 text-sm">
            {record.roomCount ? `${record.roomCount} कमरे` : 'अपरिभाषित'}
          </span>
        </div>

        <div className="bg-white/80 p-2.5 rounded-lg border border-amber-100">
          <span className="text-slate-500 block">भवन की स्थिति:</span>
          <span className={`font-semibold text-sm ${record.buildingCondition === 'सही' ? 'text-emerald-700' : 'text-rose-700'}`}>
            {record.buildingCondition || 'अनुपलब्ध'}
          </span>
        </div>

        <div className="bg-white/80 p-2.5 rounded-lg border border-amber-100">
          <span className="text-slate-500 block">दरवाजों की स्थिति:</span>
          <span className="font-semibold text-slate-900 text-sm">
            {record.doorsCount || 'अपरिभाषित'}
          </span>
        </div>

        <div className="bg-white/80 p-2.5 rounded-lg border border-amber-100">
          <span className="text-slate-500 block">मर्ज विद्यालय स्थिति:</span>
          <span className="font-semibold text-slate-900 text-sm">
            {record.mergedSchoolStatus || 'लागू नहीं'}
          </span>
        </div>

        <div className="bg-white/80 p-2.5 rounded-lg border border-amber-100">
          <span className="text-slate-500 block">सड़क मार्ग स्थिति:</span>
          <span className="font-semibold text-slate-900">
            {record.roadCondition || 'विवरण नहीं'}
          </span>
        </div>

        <div className="bg-white/80 p-2.5 rounded-lg border border-amber-100">
          <span className="text-slate-500 block">संबंधित विभाग:</span>
          <span className="font-semibold text-slate-900">
            {record.departmentName || 'बेसिक शिक्षा विभाग'}
          </span>
        </div>

        <div className="bg-white/80 p-2.5 rounded-lg border border-amber-100">
          <span className="text-slate-500 block">विकास खण्ड:</span>
          <span className="font-semibold text-slate-900">
            {record.developmentBlock || 'स्वार'}
          </span>
        </div>

        <div className="bg-white/80 p-2.5 rounded-lg border border-amber-100">
          <span className="text-slate-500 block">सुविधाएं (हाँ/नहीं):</span>
          <div className="flex flex-wrap gap-1 mt-1 text-[11px]">
            <span className={record.waterAvailable === 'हाँ' ? 'text-emerald-700 font-medium' : 'text-slate-400'}>जल:{record.waterAvailable}</span>
            <span>·</span>
            <span className={record.toiletAvailable === 'हाँ' ? 'text-emerald-700 font-medium' : 'text-slate-400'}>शौचालय:{record.toiletAvailable}</span>
            <span>·</span>
            <span className={record.electricityAvailable === 'हाँ' ? 'text-emerald-700 font-medium' : 'text-slate-400'}>विद्युत:{record.electricityAvailable}</span>
            <span>·</span>
          </div>
        </div>
      </div>

      {record.remark && (
        <div className="bg-white/90 border border-amber-200/90 rounded-lg p-3 mb-3 text-xs">
          <span className="font-bold text-amber-900 block mb-0.5">पूर्व में दर्ज अभ्युक्ति (Remark):</span>
          <p className="text-slate-800 italic font-medium">{record.remark}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-amber-200/60 text-xs text-amber-900">
        <p className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>डेटा शीट में यह रिकॉर्ड पहले से उपस्थित है। संशोधन करने के लिए नीचे फॉर्म भरें और <strong>&quot;विवरण अपडेट करें (Update Data)&quot;</strong> पर क्लिक करें।</span>
        </p>
        <button
          type="button"
          onClick={onResetToExisting}
          className="underline hover:text-amber-950 font-semibold text-xs shrink-0 cursor-pointer"
        >
          मूल दर्ज मान पुनः भरें
        </button>
      </div>
    </div>
  );
};
