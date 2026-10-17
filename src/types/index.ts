export interface MasterBooth {
  boothNo: number | string;
  boothName: string;
  bloName: string;
  bloDesignation: string;
  bloMobile: string;
  supervisorName: string;
  supervisorDesignation: string;
  supervisorMobile: string;
  status?: 'Complete' | 'Pending';
}

export type YesNo = 'हाँ' | 'नहीं';
export type BuildingCondition = 'सही' | 'जीर्णशीर्ण' | '';
export type MergedSchoolStatus = 'क्रियाशील' | 'बन्द' | 'लागू नहीं';
export type DoorsStatus = '1' | '2' | 'दरवाजा नहीं' | 'अन्य';

export interface VerificationRecord {
  id?: string;
  serialNo?: number | string;
  boothNo: number | string;
  boothName: string;
  roomCount: number | string;
  buildingCondition: BuildingCondition;
  buildingConditionProper?: string;
  buildingConditionDilapidated?: string;
  mergedSchoolStatus: MergedSchoolStatus;
  doorsCount: DoorsStatus;
  waterAvailable: YesNo;
  toiletAvailable: YesNo;
  waitingRoomShade: YesNo;
  electricityAvailable: YesNo;
  furnitureAvailable: YesNo;
  rampAvailable: YesNo;
  roadCondition: string;
  departmentName: string;
  developmentBlock: string;
  assemblyConstituency?: string;
  tehsilName?: string;
  bloName?: string;
  bloDesignation?: string;
  bloMobile?: string;
  supervisorName?: string;
  supervisorDesignation?: string;
  supervisorMobile?: string;
  remark?: string;
  updatedAt?: string;
}

export interface GasResponse {
  status: 'success' | 'error';
  action?: 'saved' | 'updated';
  isUpdate?: boolean;
  boothNo?: string | number;
  message?: string;
  record?: VerificationRecord;
  updatedAt?: string;
  data?: any;
}
