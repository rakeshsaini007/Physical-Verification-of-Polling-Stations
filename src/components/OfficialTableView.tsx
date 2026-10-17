import React, { useState } from 'react';
import { VerificationRecord, MasterBooth } from '../types';
import { MASTER_BOOTHS } from '../data/masterBooths';
import { Printer, Download, Search, Filter, Edit3, CheckCircle2, AlertCircle, Plus } from 'lucide-react';

interface OfficialTableViewProps {
  verifications: VerificationRecord[];
  onEditBooth: (boothNo: string | number) => void;
  onAddNew: () => void;
  assemblyConstituency?: string;
  tehsilName?: string;
}

export const OfficialTableView: React.FC<OfficialTableViewProps> = ({
  verifications,
  onEditBooth,
  onAddNew,
  assemblyConstituency = '34 - स्वार',
  tehsilName = 'स्वार',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');

  // Map master booths with verification records
  const allBoothRows = MASTER_BOOTHS.map((mBooth) => {
    const matchedVer = verifications.find(
      (v) => String(v.boothNo).trim() === String(mBooth.boothNo).trim()
    );
    return {
      master: mBooth,
      verification: matchedVer || null,
      isVerified: !!matchedVer,
    };
  });

  // Also include any verified booths that might not be in the initial master list
  verifications.forEach((v) => {
    const alreadyIncluded = allBoothRows.some(
      (row) => String(row.master.boothNo).trim() === String(v.boothNo).trim()
    );
    if (!alreadyIncluded) {
      allBoothRows.push({
        master: {
          boothNo: v.boothNo,
          boothName: v.boothName,
          bloName: v.bloName || '',
          bloDesignation: v.bloDesignation || '',
          bloMobile: v.bloMobile || '',
          supervisorName: v.supervisorName || '',
          supervisorDesignation: v.supervisorDesignation || '',
          supervisorMobile: v.supervisorMobile || '',
        },
        verification: v,
        isVerified: true,
      });
    }
  });

  // Sort by booth number
  allBoothRows.sort((a, b) => Number(a.master.boothNo) - Number(b.master.boothNo));

  // Filter rows
  const filteredRows = allBoothRows.filter((row) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      String(row.master.boothNo).includes(q) ||
      row.master.boothName.toLowerCase().includes(q) ||
      (row.verification?.developmentBlock || '').toLowerCase().includes(q);

    if (!matchSearch) return false;

    if (statusFilter === 'verified') return row.isVerified;
    if (statusFilter === 'pending') return !row.isVerified;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = [
      'क०सं०',
      'मतदेय स्थल सं०',
      'मतदेय स्थल का नाम',
      'कमरों की उपलब्धता/संख्या',
      'भवन भौतिक स्थिति (सही)',
      'भवन भौतिक स्थिति (जीर्णशीर्ण)',
      'मर्ज विद्यालय क्रियाशील/बन्द',
      'कमरों में दरवाजों की स्थिति',
      'पानी की उपलब्धता',
      'शौचालय की उपलब्धता',
      'वेटिंग रूम/छाया की व्यवस्था',
      'विद्युत व्यवस्था',
      'फर्नीचर की व्यवस्था',
      'रैम्प की उपलब्धता',
      'सड़क मार्ग की स्थिति',
      'विभाग का नाम',
      'विकास खण्ड का नाम',
      'बी०एल०ओ० नाम',
      'बी०एल०ओ० मो०',
      'सुपरवाइजर नाम',
      'सुपरवाइजर मो०',
      'सत्यापन दिनांक'
    ];

    const rows = filteredRows.map((r, index) => {
      const v = r.verification;
      return [
        index + 1,
        `"${r.master.boothNo}"`,
        `"${r.master.boothName.replace(/"/g, '""')}"`,
        v?.roomCount || '',
        v?.buildingCondition === 'सही' ? 'सही' : '',
        v?.buildingCondition === 'जीर्णशीर्ण' ? 'जीर्णशीर्ण' : '',
        v?.mergedSchoolStatus || '',
        v?.doorsCount || '',
        v?.waterAvailable || '',
        v?.toiletAvailable || '',
        v?.waitingRoomShade || '',
        v?.electricityAvailable || '',
        v?.furnitureAvailable || '',
        v?.rampAvailable || '',
        `"${(v?.roadCondition || '').replace(/"/g, '""')}"`,
        `"${(v?.departmentName || '').replace(/"/g, '""')}"`,
        `"${(v?.developmentBlock || '').replace(/"/g, '""')}"`,
        `"${(r.master.bloName || '').replace(/"/g, '""')}"`,
        `"${r.master.bloMobile || ''}"`,
        `"${(r.master.supervisorName || '').replace(/"/g, '""')}"`,
        `"${r.master.supervisorMobile || ''}"`,
        `"${v?.updatedAt || 'लंबित'}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `मतदेय_स्थल_भौतिक_सत्यापन_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const verifiedCount = allBoothRows.filter(r => r.isVerified).length;
  const totalCount = allBoothRows.length;

  return (
    <div className="max-w-[1500px] mx-auto py-6 px-3 sm:px-6">
      
      {/* Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        
        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="बूथ सं० या नाम खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              सभी ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('verified')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                statusFilter === 'verified' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              सत्यापित ({verifiedCount})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                statusFilter === 'pending' ? 'bg-orange-600 text-white shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              लंबित ({totalCount - verifiedCount})
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>नई प्रविष्टि करें</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel / CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>प्रिंट (Print Proforma)</span>
          </button>
        </div>
      </div>

      {/* Official Printable Register Document matching Screenshot 1 */}
      <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-sm overflow-hidden print:border-none print:shadow-none print:p-0">
        
        {/* Official Header */}
        <div className="text-center pb-4 mb-4 border-b border-slate-400">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-wide">
            मतदेय स्थलों के भौतिक सत्यापन का प्रारूप
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm font-bold text-slate-800 mt-2 px-2">
            <div>
              विधान सभा निर्वाचन क्षेत्र की संख्या व नाम :- <span className="underline">{assemblyConstituency}</span>
            </div>
            <div>
              तहसील का नाम :- <span className="underline">{tehsilName}</span>
            </div>
          </div>
        </div>

        {/* Table representation matching exact Screenshot 1 (Columns 1 to 16) */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-800 text-[11px] leading-tight text-slate-900 text-center font-sans">
            <thead>
              {/* Top Header Row */}
              <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-800">
                <th rowSpan={2} className="border border-slate-800 px-1.5 py-2 w-10">
                  कं०स०
                </th>
                <th rowSpan={2} className="border border-slate-800 px-2 py-2 min-w-[180px] text-left">
                  मतदेय स्थल की सं० व नाम
                </th>
                <th rowSpan={2} className="border border-slate-800 px-1 py-2 w-16">
                  मतदेय स्थल पर कमरों की उपलब्धता / संख्या
                </th>
                <th colSpan={3} className="border border-slate-800 px-1 py-1.5 bg-slate-200/60">
                  भवन की भौतिक स्थिति
                </th>
                <th rowSpan={2} className="border border-slate-800 px-1 py-2 w-16">
                  कमरों में दरवाजों की स्थिति (एक या दो)
                </th>
                <th rowSpan={2} className="border border-slate-800 px-1 py-2 w-14">
                  पानी की उपलब्धता (हाँ/नहीं)
                </th>
                <th rowSpan={2} className="border border-slate-800 px-1 py-2 w-14">
                  शौचालय की उपलब्धता (हाँ/नहीं)
                </th>
                <th rowSpan={2} className="border border-slate-800 px-1 py-2 w-16">
                  बूथ पर वेटिंग रूम/छाया की व्यवस्था (हाँ/नहीं)
                </th>
                <th rowSpan={2} className="border border-slate-800 px-1 py-2 w-14">
                  विद्युत व्यवस्था (हाँ/नहीं)
                </th>
                <th rowSpan={2} className="border border-slate-800 px-1 py-2 w-14">
                  फर्नीचर की व्यवस्था (हाँ/नहीं)
                </th>
                <th rowSpan={2} className="border border-slate-800 px-1 py-2 w-14">
                  रैम्प की उपलब्धता (हाँ/नहीं)
                </th>
                <th rowSpan={2} className="border border-slate-800 px-1.5 py-2 min-w-[100px]">
                  मतदेय स्थल पर पहुंचने हेतु सड़क मार्ग की स्थिति
                </th>
                <th rowSpan={2} className="border border-slate-800 px-1.5 py-2 min-w-[100px]">
                  जिस भवन में मतदेय स्थल स्थापित है उस विभाग का नाम
                </th>
                <th rowSpan={2} className="border border-slate-800 px-1 py-2 w-20">
                  विकास खण्ड का नाम
                </th>
                <th rowSpan={2} className="border border-slate-800 px-2 py-2 w-16 print:hidden">
                  कार्यवाही
                </th>
              </tr>

              {/* Sub-header row for Columns 4, 5, 6 */}
              <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-800">
                <th className="border border-slate-800 px-1 py-1 w-12 font-medium">सही</th>
                <th className="border border-slate-800 px-1 py-1 w-14 font-medium">जीर्णशीर्ण</th>
                <th className="border border-slate-800 px-1 py-1 min-w-[130px] font-medium text-[10px]">
                  शासन के द्वारा मर्ज किये गये प्राथमिक शिक्षा के विद्यालय क्रियाशील अथवा बन्द की स्थिति
                </th>
              </tr>

              {/* Column Numbers Row: 1 to 16 */}
              <tr className="bg-slate-200/80 font-bold text-slate-800 border-b border-slate-800 text-[10px]">
                <td className="border border-slate-800 py-0.5">1</td>
                <td className="border border-slate-800 py-0.5">2</td>
                <td className="border border-slate-800 py-0.5">3</td>
                <td className="border border-slate-800 py-0.5">4</td>
                <td className="border border-slate-800 py-0.5">5</td>
                <td className="border border-slate-800 py-0.5">6</td>
                <td className="border border-slate-800 py-0.5">7</td>
                <td className="border border-slate-800 py-0.5">8</td>
                <td className="border border-slate-800 py-0.5">9</td>
                <td className="border border-slate-800 py-0.5">10</td>
                <td className="border border-slate-800 py-0.5">11</td>
                <td className="border border-slate-800 py-0.5">12</td>
                <td className="border border-slate-800 py-0.5">13</td>
                <td className="border border-slate-800 py-0.5">14</td>
                <td className="border border-slate-800 py-0.5">15</td>
                <td className="border border-slate-800 py-0.5">16</td>
                <td className="border border-slate-800 py-0.5 print:hidden">-</td>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row, idx) => {
                const v = row.verification;
                const isProper = v?.buildingCondition === 'सही';
                const isDilapidated = v?.buildingCondition === 'जीर्णशीर्ण';

                return (
                  <tr
                    key={row.master.boothNo}
                    className={`border-b border-slate-800 hover:bg-amber-50/40 transition-colors ${
                      row.isVerified ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    {/* 1: Sl No */}
                    <td className="border border-slate-800 px-1 py-1.5 font-mono">
                      {idx + 1}
                    </td>

                    {/* 2: Booth No & Name */}
                    <td className="border border-slate-800 px-2 py-1.5 text-left font-medium">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900">
                          बूथ सं० {row.master.boothNo}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold shrink-0 border ${
                          row.isVerified
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-orange-100 text-orange-800 border-orange-300'
                        }`}>
                          {row.isVerified ? 'Complete' : 'Pending'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-700">
                        {row.master.boothName}
                      </div>
                      {row.master.bloName && (
                        <div className="text-[9px] text-slate-500 mt-0.5 print:hidden">
                          बीएलओ: {row.master.bloName} ({row.master.bloMobile})
                        </div>
                      )}
                    </td>

                    {/* 3: Rooms count */}
                    <td className="border border-slate-800 px-1 py-1.5 font-semibold">
                      {v ? v.roomCount : '-'}
                    </td>

                    {/* 4: Proper (सही) */}
                    <td className="border border-slate-800 px-1 py-1.5">
                      {isProper ? '✓ सही' : ''}
                    </td>

                    {/* 5: Dilapidated (जीर्णशीर्ण) */}
                    <td className="border border-slate-800 px-1 py-1.5 text-rose-700 font-semibold">
                      {isDilapidated ? 'जीर्णशीर्ण' : ''}
                    </td>

                    {/* 6: Merged school status */}
                    <td className="border border-slate-800 px-1 py-1.5 text-[10px]">
                      {v ? v.mergedSchoolStatus : '-'}
                    </td>

                    {/* 7: Doors count */}
                    <td className="border border-slate-800 px-1 py-1.5">
                      {v ? v.doorsCount : '-'}
                    </td>

                    {/* 8: Water */}
                    <td className={`border border-slate-800 px-1 py-1.5 font-semibold ${v?.waterAvailable === 'हाँ' ? 'text-emerald-800' : 'text-rose-700'}`}>
                      {v ? v.waterAvailable : '-'}
                    </td>

                    {/* 9: Toilet */}
                    <td className={`border border-slate-800 px-1 py-1.5 font-semibold ${v?.toiletAvailable === 'हाँ' ? 'text-emerald-800' : 'text-rose-700'}`}>
                      {v ? v.toiletAvailable : '-'}
                    </td>

                    {/* 10: Waiting room / shade */}
                    <td className="border border-slate-800 px-1 py-1.5">
                      {v ? v.waitingRoomShade : '-'}
                    </td>

                    {/* 11: Electricity */}
                    <td className={`border border-slate-800 px-1 py-1.5 font-semibold ${v?.electricityAvailable === 'हाँ' ? 'text-emerald-800' : 'text-rose-700'}`}>
                      {v ? v.electricityAvailable : '-'}
                    </td>

                    {/* 12: Furniture */}
                    <td className="border border-slate-800 px-1 py-1.5">
                      {v ? v.furnitureAvailable : '-'}
                    </td>

                    {/* 13: Ramp */}
                    <td className={`border border-slate-800 px-1 py-1.5 font-semibold ${v?.rampAvailable === 'हाँ' ? 'text-emerald-800' : 'text-rose-700'}`}>
                      {v ? v.rampAvailable : '-'}
                    </td>

                    {/* 14: Road Condition */}
                    <td className="border border-slate-800 px-1.5 py-1.5 text-[10px]">
                      {v ? v.roadCondition : '-'}
                    </td>

                    {/* 15: Department Name */}
                    <td className="border border-slate-800 px-1.5 py-1.5 text-[10px]">
                      {v ? v.departmentName : '-'}
                    </td>

                    {/* 16: Development Block Name */}
                    <td className="border border-slate-800 px-1 py-1.5 font-medium">
                      {v ? v.developmentBlock : '-'}
                    </td>

                    {/* Action Column */}
                    <td className="border border-slate-800 px-1 py-1.5 print:hidden">
                      <button
                        onClick={() => onEditBooth(row.master.boothNo)}
                        className={`px-2 py-1 text-[11px] font-semibold rounded flex items-center justify-center gap-1 mx-auto cursor-pointer transition-colors ${
                          row.isVerified
                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{row.isVerified ? 'अपडेट' : 'सत्यापित'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Official Signatures Section for Printing/Submission */}
        <div className="hidden print:grid grid-cols-4 gap-6 pt-12 mt-8 text-center text-xs font-bold text-slate-900 border-t border-slate-400">
          <div>
            <div className="h-10"></div>
            <p className="border-t border-slate-800 pt-1">हस्ताक्षर बी०एल०ओ०</p>
            <p className="text-[10px] font-normal text-slate-600">(नाम व पदनाम)</p>
          </div>
          <div>
            <div className="h-10"></div>
            <p className="border-t border-slate-800 pt-1">हस्ताक्षर सुपरवाइजर</p>
            <p className="text-[10px] font-normal text-slate-600">(लेखपाल / सुपरवाइजर)</p>
          </div>
          <div>
            <div className="h-10"></div>
            <p className="border-t border-slate-800 pt-1">हस्ताक्षर भौतिक सत्यापनकर्ता</p>
            <p className="text-[10px] font-normal text-slate-600">(सत्यापन अधिकारी)</p>
          </div>
          <div>
            <div className="h-10"></div>
            <p className="border-t border-slate-800 pt-1">तहसीलदार / सहायक निर्वाचक रजिस्ट्रीकरण अधि०</p>
            <p className="text-[10px] font-normal text-slate-600">{tehsilName}</p>
          </div>
        </div>

      </div>
    </div>
  );
};
