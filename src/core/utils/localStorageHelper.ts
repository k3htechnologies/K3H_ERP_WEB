import type { EmployeeData } from "@/features/authentication/models/AuthenticationModel";
import { LOCAL_STORAGE_FOR_STATE_KEYS, LOCAL_STORAGE_KEYS } from "../constants/localStorageKeys";
import type { ModuleData } from "@/features/menu/models/MenuModel";
import type { CountryStateCityDistrictVillageData } from "@/features/technical/models/TechnicalModel";

export const LocalStorageHelper = {
  //EMPLOYEE DATA
  storeEmployeeData: (employeeData: EmployeeData[] | EmployeeData): void => {
    try {
      const dataToStore = Array.isArray(employeeData) ? employeeData[0] : employeeData;

      localStorage.setItem(LOCAL_STORAGE_KEYS.EMPLOYEE, JSON.stringify(dataToStore));

      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, dataToStore.Token);
    } catch (error) {
      console.error("Error storing employee data:", error);
    }
  },

  //COMMAN
  storeBankListMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.BANK_LIST_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Bank List Master Columns Details:", error);
    }
  },

  getBankListMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.BANK_LIST_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.BANK_LIST_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Bank List Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeMenuData: (menuData: ModuleData[] | ModuleData): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.MENU_MODULE, JSON.stringify(menuData));
    } catch (error) {
      console.error("ERROR : STORING MENU DATA :", error);
    }
  },

  getMenuData: (): ModuleData[] | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.MENU_MODULE);
    if (stored) {
      try {
        return JSON.parse(stored) as ModuleData[];
      } catch (error) {
        console.error("ERROR : GET MENU DATA :", error);
        return null;
      }
    }
    return null;
  },

  storeCountry_State_District_City_Village_Data: (locationData: CountryStateCityDistrictVillageData[] | ModuleData): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.COUNTRY_STATE_DISTRICT_CITY_VILLAGE_MASTER, JSON.stringify(locationData));
    } catch (error) {
      console.error("ERROR : STORING MENU DATA :", error);
    }
  },

  getCountry_State_District_City_VillageData: (): CountryStateCityDistrictVillageData[] | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.COUNTRY_STATE_DISTRICT_CITY_VILLAGE_MASTER);
    if (stored) {
      try {
        return JSON.parse(stored) as CountryStateCityDistrictVillageData[];
      } catch (error) {
        console.error("ERROR : GET COUNTRY STATE DISTRICT CITY VILLAGE DATA :", error);
        return null;
      }
    }
    return null;
  },

  storeSelectedProject: (projectId: number): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_PROJECT_ID, String(projectId));
    } catch (error) {
      console.error("Error storing selected project:", error);
    }
  },

  getSelectedProject: (): number | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.SELECTED_PROJECT_ID);
    if (stored) {
      const parsed = Number(stored);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  },

  //SETTING -> COMPANY SETUP
  getStoredEmployeeData: (): EmployeeData | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.EMPLOYEE);
    if (stored) {
      try {
        return JSON.parse(stored) as EmployeeData;
      } catch (error) {
        console.error("Error parsing stored employee data:", error);
        return null;
      }
    }
    return null;
  },

  storeToken: (token: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
    } catch (error) {
      console.error("Error storing Token:", error);
    }
  },

  getStoredTokenData: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    if (stored) {
      try {
        return stored;
      } catch (error) {
        console.error("Error parsing stored employee data:", error);
        return null;
      }
    }
    return null;
  },


  storeLastVisitedPage: (path: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_VISITED_PAGE, path);
    } catch (error) {
      console.error("Error storing last visited page:", error);
    }
  },

  getLastVisitedPage: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_VISITED_PAGE);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_VISITED_PAGE);
      } catch (error) {
        console.error("Error reading last visited page:", error);
        return null;
      }
    }
    return null;
  },

  storeDepartmentMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.DAPARTMENT_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Department Master Columns Details:", error);
    }
  },

  getDepartmentMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.DAPARTMENT_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.DAPARTMENT_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Department Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeDesignationMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.DESIGNATION_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Designation Master Columns Details:", error);
    }
  },

  getDesignationMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.DESIGNATION_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.DESIGNATION_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Designation Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeEmployeeMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.EMPLOYEE_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Employee Master Columns Details:", error);
    }
  },

  getEmployeeMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.EMPLOYEE_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.EMPLOYEE_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Employee Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeTenantTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.TENANT_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Tenant Columns Details:", error);
    }
  },

  getTenantTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.TENANT_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.TENANT_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Tenant Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeBranchMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.BRANCH_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Branch Master Columns Details:", error);
    }
  },

  getBranchMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.BRANCH_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.BRANCH_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Branch Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeBranchAssociationsMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.BRANCH_ASSOCIATIONS_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Branch Associations Master Columns Details:", error);
    }
  },

  getBranchAssociationsMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.BRANCH_ASSOCIATIONS_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.BRANCH_ASSOCIATIONS_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Branch Associations Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeAssetMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ASSET_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Asset Master Columns Details:", error);
    }
  },

  getAssetMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ASSET_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.ASSET_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Asset Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeAssetMappingMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ASSET_MAPPING_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Asset Mapping Master Columns Details:", error);
    }
  },

  getAssetMappingMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ASSET_MAPPING_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.ASSET_MAPPING_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Asset Mapping Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeDeductionMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.DEDUCTION_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Deduction Master Columns Details:", error);
    }
  },

  getDeductionMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.DEDUCTION_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.DEDUCTION_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Deduction Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeEarningMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.EARNING_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Earning Master Columns Details:", error);
    }
  },

  getEarningMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.EARNING_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.EARNING_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Earning Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeVendorTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.VENDOR_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Vendor Columns Details:", error);
    }
  },

  getVendorTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.VENDOR_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.VENDOR_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Vendor Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeCompanyMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.COMPANY_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Company Master Columns Details:", error);
    }
  },

  getCompanyMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.COMPANY_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.COMPANY_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Company Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },


  storeHolidayMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.HOLIDAY_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Holiday Master Columns Details:", error);
    }
  },

  getHolidayMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.HOLIDAY_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.HOLIDAY_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Holiday Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeHolidayMappingMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.HOLIDAY_MAPPING_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Holiday Mapping Master Columns Details:", error);
    }
  },

  getHolidayMappingMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.HOLIDAY_MAPPING_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.HOLIDAY_MAPPING_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Holiday Mapping Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeLeaveEncashmentMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.LEAVE_ENCASHMENT_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Leave Encashment Master Columns Details:", error);
    }
  },

  getLeaveEncashmentMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.LEAVE_ENCASHMENT_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.LEAVE_ENCASHMENT_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Leave Encashment Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeLeaveTypeMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.LEAVE_TYPE_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Leave Type Master Columns Details:", error);
    }
  },

  getLeaveTypeMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.LEAVE_TYPE_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.LEAVE_TYPE_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Leave Type Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeLeaveTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.LEAVE_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Leave Columns Details:", error);
    }
  },

  getLeaveTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.LEAVE_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.LEAVE_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Leave Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeLeaveCreditConfigurationTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.LEAVE_CREDIT_CONFIGURATION_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Leave Credit Configuration Columns Details:", error);
    }
  },

  getLeaveCreditConfigurationTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.LEAVE_CREDIT_CONFIGURATION_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.LEAVE_CREDIT_CONFIGURATION_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Leave Credit Configuration Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeOutdoorTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.OUTDOOR_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Outdoor Columns Details:", error);
    }
  },

  getOutdoorTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.OUTDOOR_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.OUTDOOR_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Outdoor Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeCompOffTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.COMP_OFF_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Comp Off Columns Details:", error);
    }
  },

  getCompOffTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.COMP_OFF_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.COMP_OFF_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Comp Off Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeShiftMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SHIFT_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Shift Master Columns Details:", error);
    }
  },

  getShiftMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.SHIFT_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.SHIFT_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Shift Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeShiftMappingMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SHIFT_MAPPING_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Shift Mapping Master Columns Details:", error);
    }
  },

  getShiftMappingMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.SHIFT_MAPPING_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.SHIFT_MAPPING_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Shift Mapping Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeWeekOffMappingMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.WEEK_OFF_MAPPING_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Week Off Mapping Master Columns Details:", error);
    }
  },

  getWeekOffMappingMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.WEEK_OFF_MAPPING_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.WEEK_OFF_MAPPING_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Week Off Mapping Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeWeekOffMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.WEEK_OFF_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Week Off Master Columns Details:", error);
    }
  },

  getWeekOffMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.WEEK_OFF_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.WEEK_OFF_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Week Off Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeTncMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.TNC_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Tnc Master Columns Details:", error);
    }
  },

  getTncMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.TNC_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.TNC_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Tnc Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeSubMaterialMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SUB_MATERIAL_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Sub Material Master Columns Details:", error);
    }
  },

  getSubMaterialMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.SUB_MATERIAL_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.SUB_MATERIAL_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Sub Material Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeUomMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.UOM_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Uom Master Columns Details:", error);
    }
  },

  getUomMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.UOM_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.UOM_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Uom Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeMaterialMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.MATERIAL_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Material Master Columns Details:", error);
    }
  },

  getMaterialMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.MATERIAL_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.MATERIAL_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Material Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  //SALE
  storeChannelPartnerTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CHANNEL_PARTNER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Channel Partner Columns Details:", error);
    }
  },

  getChannelPartnerTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.CHANNEL_PARTNER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.CHANNEL_PARTNER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Channel Partner Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeChannelPartnerUniverseTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CHANNEL_PARTNER_UNIVERSE_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Channel Partner Columns Details:", error);
    }
  },

  getChannelPartnerUniverseTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.CHANNEL_PARTNER_UNIVERSE_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.CHANNEL_PARTNER_UNIVERSE_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Channel Partner Universe Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeChannelPartnerSourcingTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CHANNEL_PARTNER_SOURCING_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Channel Partner Sourcing Columns Details:", error);
    }
  },

  getChannelPartnerSourcingTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.CHANNEL_PARTNER_SOURCING_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.CHANNEL_PARTNER_SOURCING_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Channel Partner Sourcing Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeEnquiryTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ENQUIRY_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Enquiry Master Columns Details:", error);
    }
  },

  getEnquiryTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ENQUIRY_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.ENQUIRY_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Enquiry Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeIsGRE: (projectId: number): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_PROJECT_ID, String(projectId));
    } catch (error) {
      console.error("Error storing selected GRE:", error);
    }
  },

  getSelectedIsGRE: (): number | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.SELECTED_PROJECT_ID);
    if (stored) {
      const parsed = Number(stored);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  },

  storeCallingDataTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CALLING_DATA_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Calling Data Columns Details:", error);
    }
  },

  getCallingDataTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.CALLING_DATA_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.CALLING_DATA_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Calling Data Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeCallLogTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CALL_LOG_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Call Log Columns Details:", error);
    }
  },

  getCallLogTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.CALL_LOG_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.CALL_LOG_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Call Log Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeBookingTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.BOOKING_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error BOOKING Columns Details:", error);
    }
  },

  getBookingTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.BOOKING_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.BOOKING_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Booking Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeIncentiveReportTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.INCENTIVE_REPORT_COLUMNS, columns);
    } catch (error) {
      console.error("Error INCENTIVE REPORT Columns Details:", error);
    }
  },

  getIncentiveReportTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.INCENTIVE_REPORT_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.INCENTIVE_REPORT_COLUMNS);
      } catch (error) {
        console.error("Error reading INCENTIVE REPORT Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storePaymentScheduleSchemeMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PAYMENT_SCHEDULE_SCHEME_MASTER_COLUMNS, columns);
    } catch (error) {
      console.error("Error PAYMENT SCHEDULE SCHEME MASTER Columns Details:", error);
    }
  },

  getPaymentScheduleSchemeMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.PAYMENT_SCHEDULE_SCHEME_MASTER_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.PAYMENT_SCHEDULE_SCHEME_MASTER_COLUMNS);
      } catch (error) {
        console.error("Error reading PAYMENT SCHEDULE SCHEME MASTER Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeAchievementByProjectTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_PROJECT_COLUMNS, columns);
    } catch (error) {
      console.error('Error Achievement by Project Columns Details:', error)
    }
  },

  getAchievementByProjectTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_PROJECT_COLUMNS)
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_PROJECT_COLUMNS);
      } catch (error) {
        console.error('Error reading Achievement by Project Columns Details:', error)
        return null
      }
    }
    return null
  },

  storeAchievementBySourcingTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_SOURCING_COLUMNS, columns);
    } catch (error) {
      console.error('Error Achievement by Sourcing Columns Details:', error)
    }
  },

  getAchievementBySourcingTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_SOURCING_COLUMNS)
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_SOURCING_COLUMNS);
      } catch (error) {
        console.error('Error reading Achievement by Sourcing Columns Details:', error)
        return null
      }
    }
    return null
  },

  storeAchievementByClosingTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CLOSING_COLUMNS, columns);
    } catch (error) {
      console.error('Error Achievement by Closing Columns Details:', error)
    }
  },

  getAchievementByClosingTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CLOSING_COLUMNS)
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CLOSING_COLUMNS);
      } catch (error) {
        console.error('Error reading Achievement by Closing Columns Details:', error)
        return null
      }
    }
    return null
  },

  storeAchievementByWalkinsRevisitTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_WALKINS_REVISIT_COLUMNS, columns);
    } catch (error) {
      console.error('Error Achievement by Walkins Revisit Columns Details:', error)
    }
  },

  getAchievementByWalkinsRevisitTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_WALKINS_REVISIT_COLUMNS)
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_WALKINS_REVISIT_COLUMNS);
      } catch (error) {
        console.error('Error reading Achievement by Walkins Revisit Columns Details:', error)
        return null
      }
    }
    return null
  },

  storeAchievementByBookingTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_BOOKING_COLUMNS, columns);
    } catch (error) {
      console.error('Error Achievement by Booking Columns Details:', error)
    }
  },

  getAchievementByBookingTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_BOOKING_COLUMNS)
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_BOOKING_COLUMNS);
      } catch (error) {
        console.error('Error reading Achievement by Booking Columns Details:', error)
        return null
      }
    }
    return null
  },

  storeAchievementByIbmObmTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_IBMOBM_COLUMNS, columns);
    } catch (error) {
      console.error('Error Achievement by IbmObm Columns Details:', error)
    }
  },

  getAchievementByIbmObmTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_IBMOBM_COLUMNS)
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_IBMOBM_COLUMNS);
      } catch (error) {
        console.error('Error reading Achievement by IbmObm Columns Details:', error)
        return null
      }
    }
    return null
  },

  //AOP ACHIEVEMENT

  storeAchievementByChannelPartnerTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CHANNEL_PARTNER_COLUMNS, columns);
    } catch (error) {
      console.error('Error Achievement by Channel Partner Columns Details:', error)
    }
  },

  getAchievementByChannelPartnerTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CHANNEL_PARTNER_COLUMNS)
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CHANNEL_PARTNER_COLUMNS);
      } catch (error) {
        console.error('Error reading Achievement by Channel Partner Columns Details:', error)
        return null
      }
    }
    return null
  },
  
  storeAchievementByChannelPartnerWalkinsRevisitTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CHANNEL_PARTNER_WALKINS_REVISIT_COLUMNS, columns);
    } catch (error) {
      console.error('Error Achievement by Channel Partner Walkins Revisit Columns Details:', error)
    }
  },

  getAchievementByChannelPartnerWalkinsRevisitTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CHANNEL_PARTNER_WALKINS_REVISIT_COLUMNS)
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CHANNEL_PARTNER_WALKINS_REVISIT_COLUMNS);
      } catch (error) {
        console.error('Error reading Achievement by Channel Partner Walkins Revisit Columns Details:', error)
        return null
      }
    }
    return null
  },

  storeAchievementByChannelPartnerBookingTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CHANNEL_PARTNER_BOOKING_COLUMNS, columns);
    } catch (error) {
      console.error('Error Achievement by Channel Partner Booking Columns Details:', error)
    }
  },

  getAchievementByChannelPartnerBookingTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CHANNEL_PARTNER_BOOKING_COLUMNS)
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CHANNEL_PARTNER_BOOKING_COLUMNS);
      } catch (error) {
        console.error('Error reading Achievement by Channel Partner Booking Columns Details:', error)
        return null
      }
    }
    return null
  },

  storeAchievementByChannelPartnerIbmObmTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CHANNEL_PARTNER_IBMOBM_COLUMNS, columns);
    } catch (error) {
      console.error('Error Achievement by Channel Partner IbmObm Columns Details:', error)
    }
  },

  getAchievementByChannelPartnerIbmObmTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CHANNEL_PARTNER_IBMOBM_COLUMNS)
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CHANNEL_PARTNER_IBMOBM_COLUMNS);
      } catch (error) {
        console.error('Error reading Achievement by Channel Partner IbmObm Columns Details:', error)
        return null
      }
    }
    return null
  },

  //PROJECT DOCUMENT
  storeProjectDocumentCategoryMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECT_DOCUMENT_CATEGORY_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Project Document Category Master Columns Details:", error);
    }
  },

  getProjectDocumentCategoryMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECT_DOCUMENT_CATEGORY_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECT_DOCUMENT_CATEGORY_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Project Document Category Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeApprovalDocumentCategoryMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.APPROVAL_DOCUMENT_CATEGORY_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Approval Document Category Master Columns Details:", error);
    }
  },

  getApprovalDocumentCategoryMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.APPROVAL_DOCUMENT_CATEGORY_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.APPROVAL_DOCUMENT_CATEGORY_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Approval Document Category Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeProjectRERADocumentCategoryMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECT_RERA_DOCUMENT_CATEGORY_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Project RERA Document Category Master Columns Details:", error);
    }
  },

  getProjectRERADocumentCategoryMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECT_RERA_DOCUMENT_CATEGORY_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECT_RERA_DOCUMENT_CATEGORY_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Project RERA Document Category Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  //REDEVELOPMENT
  storeRedevelopmentBuildingTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.REDEVELOPMENT_BUILDING_COLUMNS, columns);
    } catch (error) {
      console.error("Error Redevelopment Building Columns Details:", error);
    }
  },

  getRedevelopmentBuildingTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.REDEVELOPMENT_BUILDING_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.REDEVELOPMENT_BUILDING_COLUMNS);
      } catch (error) {
        console.error("Error reading Redevelopment Building Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  //LEGAL
  storeLitigationTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.LITIGATION_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Litigation Columns Details:", error);
    }
  },

  getLitigationTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.LITIGATION_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.LITIGATION_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Litigation Columns Details:", error);
        return null;
      }
    }
    return null;
  },


  //CRM 

  storePayTrackBookingTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PAY_TRACK_BOOKING_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error PAY TRACK BOOKING Columns Details:", error);
    }
  },

  getPayTrackBookingTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.PAY_TRACK_BOOKING_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.PAY_TRACK_BOOKING_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Pay Track Booking Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storePayTrackReportTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PAY_TRACK_REPORT_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error PAY TRACK REPORT Columns Details:", error);
    }
  },

  getPayTrackReportTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.PAY_TRACK_REPORT_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.PAY_TRACK_REPORT_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Pay Track Report Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeBrokerageBookingTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.BROKERAGE_BOOKING_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error('Error Brokerage Booking Columns Details:', error)
    }
  },

  getBrokerageBookingTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.BROKERAGE_BOOKING_SELECTED_COLUMNS)
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.BROKERAGE_BOOKING_SELECTED_COLUMNS);
      } catch (error) {
        console.error('Error reading Brokerage Booking Columns Details:', error)
        return null
      }
    }
    return null
  },

  storePayTrackCallLogTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PAY_TRACK_CALL_LOG_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Pay Track Call Log Columns Details:", error);
    }
  },

  getPayTrackCallLogTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.PAY_TRACK_CALL_LOG_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.PAY_TRACK_CALL_LOG_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading  Pay Track Call Log Columns Details:", error);
        return null;
      }
    }
    return null;
  },

  storeDailyCollectionReportTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.DAILY_COLLECTION_REPORT_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error('Error Daily Collection Report Columns Details:', error)
    }
  },

  getDailyCollectionReportTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.DAILY_COLLECTION_REPORT_SELECTED_COLUMNS)
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.DAILY_COLLECTION_REPORT_SELECTED_COLUMNS);
      } catch (error) {
        console.error('Error reading Daily Collection Report Columns Details:', error)
        return null
      }
    }
    return null
  },
  //MORE

  storeInwardOutwardTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.INWARD_OUTWARD_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error('Error Inward Outward Columns Details:', error)
    }
  },

  getInwardOutwardTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.INWARD_OUTWARD_SELECTED_COLUMNS)
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.INWARD_OUTWARD_SELECTED_COLUMNS);
      } catch (error) {
        console.error('Error reading Inward Outward Columns Details:', error)
        return null
      }
    }
    return null
  },

  getTicketMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.TICKET_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.TICKET_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading  Ticket Master Columns Details:", error);
        return null;
      }
    }
    return null;

  },

  storeTicketMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.TICKET_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Ticket Master Columns Details:", error);
    }
  },

  //TAX TRACKER
  storeNoticeSectionMasterTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.NOTICE_SECTION_MASTER_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Notice Section Master Columns Details:", error);
    }
  },

  getNoticeSectionMasterTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.NOTICE_SECTION_MASTER_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.NOTICE_SECTION_MASTER_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Notice Section Master Columns Details:", error);
        return null;
      }
    }
    return null;
  },
  //ESTIMATION AND BUDGET
  storeBudgetTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.BUDGET_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error('Error Budget Columns Details:', error)
    }
  },

  getBudgetTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.BUDGET_SELECTED_COLUMNS)
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.BUDGET_SELECTED_COLUMNS);
      } catch (error) {
        console.error('Error reading Budget Columns Details:', error)
        return null
      }
    }
    return null
  },
  //#region MATERIAL REQUISITION

  storeMaterialRequisitionTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.MATERIAL_REQUISITION_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("Error Material Requisition Columns Details:", error);
    }
  },
  getMaterialRequisitionTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.MATERIAL_REQUISITION_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.MATERIAL_REQUISITION_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Material Requisition Columns Details:", error);
        return null;
      }
    }
    return null;
  },
  //#endregion

  //#region PROJECT PROFESSIONAL DETAILS
  storeProjectProfessionalDetailsTableColumns: (columns: string): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECT_PROFESSIONAL_DETAILS_SELECTED_COLUMNS, columns);
    } catch (error) {
      console.error("ERROR Project Professional Details Columns Details", error);
    }
  },
  getProjectProfessionalDetailsTableColumns: (): string | null => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECT_PROFESSIONAL_DETAILS_SELECTED_COLUMNS);
    if (stored) {
      try {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECT_PROFESSIONAL_DETAILS_SELECTED_COLUMNS);
      } catch (error) {
        console.error("Error reading Project Professional Details Columns Details:", error);
        return null
      }
    }
    return null
  },
  //#endregion
  //#region CLEAR LOCAL STORAGE
  clearLocalStorageData: (): void => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.EMPLOYEE);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.LAST_VISITED_PAGE);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.DAPARTMENT_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.DESIGNATION_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.BRANCH_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.BRANCH_ASSOCIATIONS_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ASSET_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ASSET_MAPPING_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.DEDUCTION_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.EARNING_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.VENDOR_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.COMPANY_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.BANK_LIST_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.HOLIDAY_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.HOLIDAY_MAPPING_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.LEAVE_ENCASHMENT_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.LEAVE_TYPE_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.COMP_OFF_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.SHIFT_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.SHIFT_MAPPING_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.WEEK_OFF_MAPPING_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.WEEK_OFF_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.EMPLOYEE_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TNC_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.SUB_MATERIAL_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.UOM_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.MATERIAL_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.PROJECT_DOCUMENT_CATEGORY_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.PROJECT_RERA_DOCUMENT_CATEGORY_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.MENU_MODULE);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.COUNTRY_STATE_DISTRICT_CITY_VILLAGE_MASTER);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.SELECTED_PROJECT_ID);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.LITIGATION_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CALLING_DATA_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CALL_LOG_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.BOOKING_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.PAY_TRACK_BOOKING_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.PAY_TRACK_REPORT_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.PAYMENT_SCHEDULE_SCHEME_MASTER_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.BROKERAGE_BOOKING_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.PAY_TRACK_CALL_LOG_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.INWARD_OUTWARD_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_PROJECT_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CLOSING_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_SOURCING_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_WALKINS_REVISIT_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_BOOKING_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_IBMOBM_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TICKET_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.DAILY_COLLECTION_REPORT_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.NOTICE_SECTION_MASTER_SELECTED_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.BUDGET_SELECTED_COLUMNS);

      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CHANNEL_PARTNER_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CHANNEL_PARTNER_WALKINS_REVISIT_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CHANNEL_PARTNER_BOOKING_COLUMNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACHIEVEMENT_BY_CHANNEL_PARTNER_IBMOBM_COLUMNS);


      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.EMPLOYEE);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.COMPANY);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.VENDOR);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.PROJECT_MASTER);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.ASSET_MASTER);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.ASSET_MAPPING_MASTER);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.DEDUCTION_MASTER);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.SHIFT_MASTER);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.WEEK_OFF_MASTER);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.LITIGATION);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.CHANNEL_PARTNER);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.CHANNEL_PARTNER_SOURCING);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.CHANNEL_PARTNER_UNIVERSE);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.INCENTIVE_REPORT);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.OUTDOOR);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.LEAVE);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.LEAVECREDITCONFIGURATION);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.BOOKING);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.PAY_TRACK_BOOKING);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.INWARD_OUTWARD);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.BOOKING_Brokerage);
      localStorage.removeItem(LOCAL_STORAGE_FOR_STATE_KEYS.TICKET);


    } catch (error) {
      console.error("ERROR : CLEARING LOCAL STORAGE:", error);
    }
  },
  //#endregion
};