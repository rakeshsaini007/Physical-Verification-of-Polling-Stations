import React from 'react';
import { MasterBooth } from '../types';
import { User, Phone, Shield, Building2 } from 'lucide-react';

interface BoothOfficerCardProps {
  booth: MasterBooth;
  isComplete?: boolean;
}

export const BoothOfficerCard: React.FC<BoothOfficerCardProps> = ({ booth, isComplete }) => {
  const status = isComplete !== undefined ? (isComplete ? 'Complete' : 'Pending') : (booth.status || 'Pending');

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            मतदेय स्थल संबंधित अधिकारी विवरण (Master Directory)
          </span>
        </div>
        <div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 border shadow-2xs ${
            status === 'Complete' 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
              : 'bg-orange-100 text-orange-800 border-orange-300'
          }`}>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Status:</span>
            <span>{status}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BLO Box */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              बी०एल०ओ० (Booth Level Officer)
            </span>
            <span className="text-xs font-medium text-slate-500">
              पद: {booth.bloDesignation || 'AWW / शिक्षक'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-900">
                {booth.bloName}
              </span>
            </div>
            {booth.bloMobile && (
              <a
                href={`tel:${booth.bloMobile}`}
                className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-mono font-medium bg-amber-50/80 px-2 py-1 rounded hover:bg-amber-100 transition-colors"
              >
                <Phone className="w-3 h-3" />
                <span>{booth.bloMobile}</span>
              </a>
            )}
          </div>
        </div>

        {/* Supervisor Box */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              सुपरवाइजर (Supervisor)
            </span>
            <span className="text-xs font-medium text-slate-500">
              पद: {booth.supervisorDesignation || 'LP (लेखपाल)'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-900">
                {booth.supervisorName}
              </span>
            </div>
            {booth.supervisorMobile && (
              <a
                href={`tel:${booth.supervisorMobile}`}
                className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-mono font-medium bg-blue-50/80 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
              >
                <Phone className="w-3 h-3" />
                <span>{booth.supervisorMobile}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
