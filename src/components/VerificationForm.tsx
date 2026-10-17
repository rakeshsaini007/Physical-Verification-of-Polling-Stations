import React, { useState, useEffect } from 'react';
import { VerificationRecord, MasterBooth, YesNo, BuildingCondition, MergedSchoolStatus, DoorsStatus } from '../types';
import { MASTER_BOOTHS } from '../data/masterBooths';
import { DEFAULT_ASSEMBLY_CONSTITUENCY, DEFAULT_TEHSIL_NAME, DEFAULT_DEPARTMENT_NAME } from '../config/gasConfig';
import { ExistingDataCard } from './ExistingDataCard';
import { BoothOfficerCard } from './BoothOfficerCard';
import { 
  Save, 
  RefreshCw, 
  Check, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

interface VerificationFormProps {
  existingRecords: VerificationRecord[];
  onSaveRecord: (record: VerificationRecord) => Promise<void>;
  isSubmitting: boolean;
  preselectedBoothNo?: string | number | null;
  masterBooths?: MasterBooth[];
}

export const VerificationForm: React.FC<VerificationFormProps> = ({
  existingRecords,
  onSaveRecord,
  isSubmitting,
  preselectedBoothNo,
  masterBooths = MASTER_BOOTHS,
}) => {
  // Assembly and Tehsil
  const [assemblyConstituency, setAssemblyConstituency] = useState(DEFAULT_ASSEMBLY_CONSTITUENCY);
  const [tehsilName, setTehsilName] = useState(DEFAULT_TEHSIL_NAME);

  // Booth Selection & Auto Population
  const [boothNoInput, setBoothNoInput] = useState<string>(preselectedBoothNo ? String(preselectedBoothNo) : '1');
  const [boothName, setBoothName] = useState<string>('');
  const [selectedMasterBooth, setSelectedMasterBooth] = useState<MasterBooth | null>(null);
  const [existingRecord, setExistingRecord] = useState<VerificationRecord | null>(null);

  // Valid booths check against MasterBooths sheet
  const availableMasterBooths = masterBooths && masterBooths.length > 0 ? masterBooths : MASTER_BOOTHS;
  const validBoothNumbers = availableMasterBooths.map(b => String(b.boothNo).trim());
  const trimmedBoothNo = boothNoInput.trim();
  const isBoothValid = trimmedBoothNo !== '' && validBoothNumbers.includes(trimmedBoothNo);
  const isInvalidBooth = trimmedBoothNo !== '' && !validBoothNumbers.includes(trimmedBoothNo);

  // Form Fields (Columns 3 to 16)
  const [roomCount, setRoomCount] = useState<string>('2');
  const [buildingCondition, setBuildingCondition] = useState<BuildingCondition>('सही');
  const [mergedSchoolStatus, setMergedSchoolStatus] = useState<MergedSchoolStatus>('लागू नहीं');
  const [doorsCount, setDoorsCount] = useState<DoorsStatus>('2');
  const [waterAvailable, setWaterAvailable] = useState<YesNo>('हाँ');
  const [toiletAvailable, setToiletAvailable] = useState<YesNo>('हाँ');
  const [waitingRoomShade, setWaitingRoomShade] = useState<YesNo>('हाँ');
  const [electricityAvailable, setElectricityAvailable] = useState<YesNo>('हाँ');
  const [furnitureAvailable, setFurnitureAvailable] = useState<YesNo>('हाँ');
  const [rampAvailable, setRampAvailable] = useState<YesNo>('हाँ');
  const [roadCondition, setRoadCondition] = useState<string>('पक्का मार्ग');
  const [departmentName, setDepartmentName] = useState<string>(DEFAULT_DEPARTMENT_NAME);
  const [developmentBlock, setDevelopmentBlock] = useState<string>('स्वार');

  // Handle Booth Number input change -> Auto-populate Booth Name & Check Existing Data
  useEffect(() => {
    const trimmed = boothNoInput.trim();
    if (!trimmed) {
      setBoothName('');
      setSelectedMasterBooth(null);
      setExistingRecord(null);
      return;
    }

    // 1. Look up Master Booth (MasterBooths sheet) to validate and auto-populate
    const master = availableMasterBooths.find(b => String(b.boothNo).trim() === trimmed);
    if (master) {
      setBoothName(master.boothName);
      setSelectedMasterBooth(master);
    } else {
      setBoothName('');
      setSelectedMasterBooth(null);
      setExistingRecord(null);
      return;
    }

    // 2. Check if verification data already exists for this booth
    const foundExisting = existingRecords.find(r => String(r.boothNo).trim() === trimmed);
    if (foundExisting) {
      setExistingRecord(foundExisting);
      // Auto-fill existing values into form so user can review or update
      populateFormFromRecord(foundExisting);
    } else {
      setExistingRecord(null);
      // Reset form to reasonable defaults if switching to non-existing booth
      if (master) {
        setRoomCount('2');
        setBuildingCondition('सही');
        setMergedSchoolStatus('लागू नहीं');
        setDoorsCount('2');
        setWaterAvailable('हाँ');
        setToiletAvailable('हाँ');
        setWaitingRoomShade('हाँ');
        setElectricityAvailable('हाँ');
        setFurnitureAvailable('हाँ');
        setRampAvailable('हाँ');
        setRoadCondition('पक्का मार्ग');
        setDepartmentName(DEFAULT_DEPARTMENT_NAME);
        setDevelopmentBlock('स्वार');
      }
    }
  }, [boothNoInput, existingRecords, availableMasterBooths]);

  // Sync if preselectedBoothNo changes externally
  useEffect(() => {
    if (preselectedBoothNo) {
      setBoothNoInput(String(preselectedBoothNo));
    }
  }, [preselectedBoothNo]);

  const populateFormFromRecord = (rec: VerificationRecord) => {
    if (rec.boothName) setBoothName(rec.boothName);
    if (rec.roomCount !== undefined) setRoomCount(String(rec.roomCount));
    if (rec.buildingCondition) setBuildingCondition(rec.buildingCondition);
    if (rec.mergedSchoolStatus) setMergedSchoolStatus(rec.mergedSchoolStatus);
    if (rec.doorsCount) setDoorsCount(rec.doorsCount);
    if (rec.waterAvailable) setWaterAvailable(rec.waterAvailable);
    if (rec.toiletAvailable) setToiletAvailable(rec.toiletAvailable);
    if (rec.waitingRoomShade) setWaitingRoomShade(rec.waitingRoomShade);
    if (rec.electricityAvailable) setElectricityAvailable(rec.electricityAvailable);
    if (rec.furnitureAvailable) setFurnitureAvailable(rec.furnitureAvailable);
    if (rec.rampAvailable) setRampAvailable(rec.rampAvailable);
    if (rec.roadCondition) setRoadCondition(rec.roadCondition);
    if (rec.departmentName) setDepartmentName(rec.departmentName);
    if (rec.developmentBlock) setDevelopmentBlock(rec.developmentBlock);
    if (rec.assemblyConstituency) setAssemblyConstituency(rec.assemblyConstituency);
    if (rec.tehsilName) setTehsilName(rec.tehsilName);
  };

  const handleResetToExisting = () => {
    if (existingRecord) {
      populateFormFromRecord(existingRecord);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boothNoInput.trim()) {
      alert('कृपया मतदेय स्थल संख्या (Booth No) दर्ज करें।');
      return;
    }
    if (!isBoothValid) {
      alert(`त्रुटि: मतदेय स्थल संख्या "${boothNoInput}" "MasterBooths" शीट में मौजूद नहीं है!\n\nकेवल "MasterBooths" शीट में दर्ज संख्याएं (${validBoothNumbers.join(', ')}) ही मान्य हैं।`);
      return;
    }
    if (!boothName.trim()) {
      alert('कृपया मतदेय स्थल का नाम दर्ज करें।');
      return;
    }

    const newRecord: VerificationRecord = {
      boothNo: boothNoInput.trim(),
      boothName: boothName.trim(),
      roomCount: roomCount,
      buildingCondition: buildingCondition,
      buildingConditionProper: buildingCondition === 'सही' ? 'सही' : '',
      buildingConditionDilapidated: buildingCondition === 'जीर्णशीर्ण' ? 'जीर्णशीर्ण' : '',
      mergedSchoolStatus: mergedSchoolStatus,
      doorsCount: doorsCount,
      waterAvailable: waterAvailable,
      toiletAvailable: toiletAvailable,
      waitingRoomShade: waitingRoomShade,
      electricityAvailable: electricityAvailable,
      furnitureAvailable: furnitureAvailable,
      rampAvailable: rampAvailable,
      roadCondition: roadCondition,
      departmentName: departmentName,
      developmentBlock: developmentBlock,
      assemblyConstituency: assemblyConstituency,
      tehsilName: tehsilName,
      bloName: selectedMasterBooth?.bloName || existingRecord?.bloName || '',
      bloDesignation: selectedMasterBooth?.bloDesignation || existingRecord?.bloDesignation || '',
      bloMobile: selectedMasterBooth?.bloMobile || existingRecord?.bloMobile || '',
      supervisorName: selectedMasterBooth?.supervisorName || existingRecord?.supervisorName || '',
      supervisorDesignation: selectedMasterBooth?.supervisorDesignation || existingRecord?.supervisorDesignation || '',
      supervisorMobile: selectedMasterBooth?.supervisorMobile || existingRecord?.supervisorMobile || '',
    };

    await onSaveRecord(newRecord);
  };

  const isExisting = !!existingRecord;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Official Header matching Screenshot 1 */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-xs">
        <div className="text-center pb-4 border-b border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full inline-block mb-2">
            निर्वाचन आयोग उत्तर प्रदेश / जिला प्रशासन
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            मतदेय स्थलों के भौतिक सत्यापन का प्रारूप
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Format for Physical Verification of Polling Stations
          </p>
        </div>

        {/* Assembly and Tehsil Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              विधान सभा निर्वाचन क्षेत्र की संख्या व नाम :-
            </label>
            <input
              type="text"
              value={assemblyConstituency}
              onChange={(e) => setAssemblyConstituency(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="34 - स्वार"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              तहसील का नाम :-
            </label>
            <input
              type="text"
              value={tehsilName}
              onChange={(e) => setTehsilName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="स्वार"
            />
          </div>
        </div>
      </div>

      {/* Booth Selector & Auto Population Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              कॉलम 2: मतदेय स्थल की सं० व नाम (Booth No. & Name)
            </h2>
            <p className="text-xs text-slate-500">
              केवल &quot;MasterBooths&quot; शीट में दर्ज संख्याएं ही मान्य होंगी
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Booth No Input with Strict MasterBooths Validation */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>मतदेय स्थल की संख्या (Booth No) *</span>
              {isBoothValid && (
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" /> मान्य बूथ
                </span>
              )}
              {isInvalidBooth && (
                <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-600" /> अमान्य बूथ
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={boothNoInput}
                onChange={(e) => setBoothNoInput(e.target.value)}
                className={`w-full pl-3 pr-10 py-2.5 text-base font-bold rounded-lg focus:outline-none transition-all border-2 ${
                  isInvalidBooth
                    ? 'border-rose-500 bg-rose-50/50 text-rose-950 focus:ring-2 focus:ring-rose-400'
                    : isBoothValid
                      ? 'border-emerald-500 bg-emerald-50/30 text-emerald-950 focus:ring-2 focus:ring-emerald-400'
                      : 'border-amber-300 bg-amber-50/50 text-amber-900 focus:ring-2 focus:ring-amber-500'
                }`}
                placeholder="उदा० 1, 2, 3..."
                required
              />
              <div className="absolute right-3 top-3">
                {isInvalidBooth ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                ) : isBoothValid ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="text-xs text-slate-400 font-mono">#NO</span>
                )}
              </div>
            </div>

            {/* Validation Feedback Message */}
            {isInvalidBooth && (
              <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-700 leading-snug">
                <p className="font-bold flex items-center gap-1">
                  <span>❌ यह बूथ संख्या &quot;MasterBooths&quot; शीट में मौजूद नहीं है!</span>
                </p>
                <p className="mt-1 text-slate-600">
                  कृपया केवल मास्टर सूची में दर्ज मान्य संख्या भरें (उपलब्ध बूथ: <strong>{validBoothNumbers.slice(0, 10).join(', ')}{validBoothNumbers.length > 10 ? '...' : ''}</strong>)
                </p>
              </div>
            )}
            {isBoothValid && (
              <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                <span>✓ &quot;MasterBooths&quot; शीट से सत्यापित (Verified)</span>
              </p>
            )}
          </div>

          {/* Auto-populated Booth Name */}
          <div className="md:col-span-8">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>मतदेय स्थल का नाम (Booth Name - Auto Populated) *</span>
              {selectedMasterBooth && (
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> मास्टर डायरेक्टरी से स्वतः प्राप्त
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={boothName}
                onChange={(e) => setBoothName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                placeholder="मतदेय स्थल का नाम स्वतः आ जाएगा या टाइप करें..."
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              जैसे ही आप बूथ संख्या बदलेंगे, मास्टर सूची से नाम स्वतः प्रविष्ट होगा।
            </p>
          </div>
        </div>
      </div>

      {/* If Data Already Present: Show Existing Data Card */}
      {existingRecord && (
        <ExistingDataCard
          record={existingRecord}
          onResetToExisting={handleResetToExisting}
        />
      )}

      {/* Selected Booth Officer Details Card */}
      {selectedMasterBooth && (
        <BoothOfficerCard booth={selectedMasterBooth} isComplete={isExisting} />
      )}

      {/* Verification Details Form (Columns 3 to 16) */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              भौतिक सत्यापन प्रविष्टि (Physical Verification Fields 3 to 16)
            </h2>
            <p className="text-xs text-slate-500">
              प्रारूप के अनुसार सभी 16 स्तम्भों की स्थिति दर्ज करें
            </p>
          </div>
          <div className="text-right">
            <span className={`text-xs px-2.5 py-1 rounded font-semibold ${
              isExisting ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {isExisting ? 'स्थिति: संशोधन मोड (Update)' : 'स्थिति: नवीन प्रविष्टि (New)'}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Row 1: Rooms & Building Physical Condition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
            
            {/* Col 3: Room Count */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                कॉलम 3: मतदेय स्थल पर कमरों की उपलब्धता / संख्या *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={roomCount}
                  onChange={(e) => setRoomCount(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                  placeholder="2"
                  required
                />
                <span className="text-xs text-slate-500 shrink-0">कमरे</span>
              </div>
            </div>

            {/* Col 4 & 5: Building Physical Condition (सही / जीर्णशीर्ण) */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                कॉलम 4 व 5: भवन की भौतिक स्थिति *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBuildingCondition('सही')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    buildingCondition === 'सही'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>सही (Proper)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBuildingCondition('जीर्णशीर्ण')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    buildingCondition === 'जीर्णशीर्ण'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>जीर्णशीर्ण (Dilapidated)</span>
                </button>
              </div>
            </div>

            {/* Col 6: Merged Primary School Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                कॉलम 6: मर्ज प्राथमिक वि० क्रियाशील/बन्द *
              </label>
              <select
                value={mergedSchoolStatus}
                onChange={(e) => setMergedSchoolStatus(e.target.value as MergedSchoolStatus)}
                className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="लागू नहीं">लागू नहीं (Not Merged)</option>
                <option value="क्रियाशील">क्रियाशील (Functional)</option>
                <option value="बन्द">बन्द (Closed)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Doors & Basic Amenities (Columns 7 to 13) */}
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              कॉलम 7 से 13: कमरों के दरवाजे एवं मूलभूत सुविधाएं
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Col 7: Doors count in room */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  कॉलम 7: दरवाजों की स्थिति *
                </label>
                <select
                  value={doorsCount}
                  onChange={(e) => setDoorsCount(e.target.value as DoorsStatus)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="1">1 (एक दरवाजा)</option>
                  <option value="2">2 (दो दरवाजे)</option>
                  <option value="दरवाजा नहीं">दरवाजा नहीं</option>
                  <option value="अन्य">अन्य</option>
                </select>
              </div>

              {/* Col 8: Water availability */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  कॉलम 8: पानी की उपलब्धता *
                </label>
                <div className="flex gap-2">
                  {(['हाँ', 'नहीं'] as YesNo[]).map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setWaterAvailable(val)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md border cursor-pointer ${
                        waterAvailable === val
                          ? val === 'हाँ' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-700 text-white border-slate-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Col 9: Toilet availability */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  कॉलम 9: शौचालय की उपलब्धता *
                </label>
                <div className="flex gap-2">
                  {(['हाँ', 'नहीं'] as YesNo[]).map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setToiletAvailable(val)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md border cursor-pointer ${
                        toiletAvailable === val
                          ? val === 'हाँ' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-700 text-white border-slate-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Col 10: Waiting room / Shade */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  कॉलम 10: वेटिंग रूम / छाया व्यवस्था *
                </label>
                <div className="flex gap-2">
                  {(['हाँ', 'नहीं'] as YesNo[]).map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setWaitingRoomShade(val)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md border cursor-pointer ${
                        waitingRoomShade === val
                          ? val === 'हाँ' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-700 text-white border-slate-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Col 11: Electricity */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  कॉलम 11: विद्युत व्यवस्था *
                </label>
                <div className="flex gap-2">
                  {(['हाँ', 'नहीं'] as YesNo[]).map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setElectricityAvailable(val)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md border cursor-pointer ${
                        electricityAvailable === val
                          ? val === 'हाँ' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-700 text-white border-slate-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Col 12: Furniture */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  कॉलम 12: फर्नीचर की व्यवस्था *
                </label>
                <div className="flex gap-2">
                  {(['हाँ', 'नहीं'] as YesNo[]).map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setFurnitureAvailable(val)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md border cursor-pointer ${
                        furnitureAvailable === val
                          ? val === 'हाँ' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-700 text-white border-slate-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Col 13: Ramp availability */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  कॉलम 13: रैम्प की उपलब्धता *
                </label>
                <div className="flex gap-2">
                  {(['हाँ', 'नहीं'] as YesNo[]).map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setRampAvailable(val)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md border cursor-pointer ${
                        rampAvailable === val
                          ? val === 'हाँ' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-700 text-white border-slate-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Row 3: Approach Road, Department & Development Block (Columns 14 to 16) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
            
            {/* Col 14: Road condition */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                कॉलम 14: पहुंचने हेतु सड़क मार्ग की स्थिति *
              </label>
              <select
                value={roadCondition}
                onChange={(e) => setRoadCondition(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                required
              >
                <option value="पक्का मार्ग">पक्का मार्ग (Paved / Metalled Road)</option>
                <option value="खड़ंजा / पक्का">खड़ंजा / पक्का (Brick Paved / Metalled)</option>
                <option value="खड़ंजा मार्ग">खड़ंजा मार्ग (Brick Paved Road)</option>
                <option value="कच्चा मार्ग">कच्चा मार्ग (Unpaved / Dirt Road)</option>
                <option value="सुगम डामर रोड">सुगम डामर रोड (Smooth Tar Road)</option>
                <option value="सम्पर्क मार्ग (पैदल / पगडण्डी)">सम्पर्क मार्ग (पैदल / पगडण्डी)</option>
                {roadCondition && !['पक्का मार्ग', 'खड़ंजा / पक्का', 'खड़ंजा मार्ग', 'कच्चा मार्ग', 'सुगम डामर रोड', 'सम्पर्क मार्ग (पैदल / पगडण्डी)'].includes(roadCondition) && (
                  <option value={roadCondition}>{roadCondition}</option>
                )}
              </select>
            </div>

            {/* Col 15: Department Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                कॉलम 15: भवन जिस विभाग का है *
              </label>
              <select
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                required
              >
                <option value="बेसिक शिक्षा विभाग">बेसिक शिक्षा विभाग (Basic Education)</option>
                <option value="माध्यमिक शिक्षा">माध्यमिक शिक्षा (Secondary Education)</option>
                <option value="उच्च शिक्षा विभाग">उच्च शिक्षा विभाग (Higher Education)</option>
                <option value="पंचायत भवन">पंचायत भवन (Panchayat Bhawan)</option>
                <option value="ग्राम विकास विभाग">ग्राम विकास विभाग (Rural Development)</option>
                <option value="सामुदायिक केंद्र">सामुदायिक केंद्र (Community Center)</option>
                <option value="अन्य शासकीय भवन">अन्य शासकीय भवन (Other Govt Building)</option>
                {departmentName && !['बेसिक शिक्षा विभाग', 'माध्यमिक शिक्षा', 'उच्च शिक्षा विभाग', 'पंचायत भवन', 'ग्राम विकास विभाग', 'सामुदायिक केंद्र', 'अन्य शासकीय भवन'].includes(departmentName) && (
                  <option value={departmentName}>{departmentName}</option>
                )}
              </select>
            </div>

            {/* Col 16: Development Block Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                कॉलम 16: विकास खण्ड का नाम *
              </label>
              <select
                value={developmentBlock}
                onChange={(e) => setDevelopmentBlock(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                required
              >
                <option value="स्वार">स्वार (Suar)</option>
                <option value="बिलासपुर">बिलासपुर (Bilaspur)</option>
                <option value="चमरौआ">चमरौआ (Chamraua)</option>
                <option value="सैदनगर">सैदनगर (Saidanagar)</option>
                <option value="शाहबाद">शाहबाद (Shahbad)</option>
                <option value="मिलक">मिलक (Milak)</option>
                {developmentBlock && !['स्वार', 'बिलासपुर', 'चमरौआ', 'सैदनगर', 'शाहबाद', 'मिलक'].includes(developmentBlock) && (
                  <option value={developmentBlock}>{developmentBlock}</option>
                )}
              </select>
            </div>

          </div>

        </div>

        {/* Submit / Update Button Zone */}
        <div className="mt-8 pt-5 border-t border-slate-200 flex justify-end">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Dynamic Button: Changes to Update if data is already present! */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-bold text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                isSubmitting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : isExisting
                    ? 'bg-amber-600 hover:bg-amber-700 active:scale-[0.99] ring-2 ring-amber-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>प्रक्रियाधीन है... (Saving)</span>
                </>
              ) : isExisting ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>विवरण अपडेट करें (Update Verification)</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>विवरण सुरक्षित करें (Submit Verification)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
