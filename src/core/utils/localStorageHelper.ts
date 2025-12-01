import type { EmployeeData } from "@/features/authentication/models/AuthenticationModel"
import { LOCAL_STORAGE_KEYS } from "../constants/localStorageKeys"
import type { ModuleData } from "@/features/menu/models/MenuModel";
import type { CountryStateCityDistrictVillageData } from "@/features/technical/models/TechnicalModel";

export const LocalStorageHelper = {
    //#region STORE EMPLOYEE DATA
    storeEmployeeData: (employeeData: EmployeeData[] | EmployeeData): void => {
        try {
            const dataToStore = Array.isArray(employeeData) ? employeeData[0] : employeeData;

            localStorage.setItem(LOCAL_STORAGE_KEYS.EMPLOYEE, JSON.stringify(dataToStore));

            localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, dataToStore.Token);

        } catch (error) {
            console.error('Error storing employee data:', error)
        }
    },
    //#endregion
    //#region STORE BANK LIST MASTER COLUMNS
    storeBankListMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.BANK_LIST_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Bank List Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET BANK LIST MASTER COLUMNS
    getBankListMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.BANK_LIST_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.BANK_LIST_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Bank List Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region GET EMPLOYEE DATA 
    getStoredEmployeeData: (): EmployeeData | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.EMPLOYEE)
        if (stored) {
            try {

                return JSON.parse(stored) as EmployeeData;

            } catch (error) {
                console.error('Error parsing stored employee data:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE TOKEN 
    storeToken: (token: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);

        } catch (error) {
            console.error('Error storing Token:', error)
        }
    },
    //#endregion
    //#region GET TOKEN  
    getStoredTokenData: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN)
        if (stored) {
            try {

                return stored;

            } catch (error) {
                console.error('Error parsing stored employee data:', error)
                return null
            }
        }
        return null
    },

    //#endregion
    //#region STORE LAST VISITED PAGE 
    storeLastVisitedPage: (path: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_VISITED_PAGE, path);

        } catch (error) {
            console.error('Error storing last visited page:', error)
        }
    },
    //#endregion
    //#region GET LAST VISITED PAGE 
    getLastVisitedPage: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_VISITED_PAGE)
        if (stored) {
            try {

                return localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_VISITED_PAGE);;

            } catch (error) {
                console.error('Error reading last visited page:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE DEPARTMENT MASTER COLUMNS
    storeDepartmentMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.DAPARTMENT_MASTER_SELECTED_COLUMNS, columns);

        } catch (error) {
            console.error('Error Department Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET DEPARTMENT MASTER COLUMNS
    getDepartmentMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.DAPARTMENT_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {

                return localStorage.getItem(LOCAL_STORAGE_KEYS.DAPARTMENT_MASTER_SELECTED_COLUMNS);

            } catch (error) {
                console.error('Error reading Department Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE DESIGNATION MASTER COLUMNS
    storeDesignationMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.DESIGNATION_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Designation Master Columns Details:', error);
        }
    },
    //#endregion
    //#region GET DESIGNATION MASTER COLUMNS
    getDesignationMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.DESIGNATION_MASTER_SELECTED_COLUMNS);
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.DESIGNATION_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Designation Master Columns Details:', error);
                return null;
            }
        }
        return null;
    },
    //#endregion
    //#region STORE EMPLOYEE MASTER COLUMNS
    storeEmployeeMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.EMPLOYEE_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Employee Master Columns Details:', error);
        }
    },
    //#endregion
    //#region GET EMPLOYEE MASTER COLUMNS
    getEmployeeMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.EMPLOYEE_MASTER_SELECTED_COLUMNS);
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.EMPLOYEE_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Employee Master Columns Details:', error);
                return null;
            }
        }
        return null;
    },
    //#endregion
    //#region STORE BRANCH MASTER COLUMNS
    storeBranchMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.BRANCH_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Branch Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET BRANCH MASTER COLUMNS
    getBranchMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.BRANCH_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.BRANCH_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Branch Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE BRANCH ASSOCIATIONS MASTER COLUMNS
    storeBranchAssociationsMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.BRANCH_ASSOCIATIONS_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Branch Associations Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET BRANCH ASSOCIATIONS MASTER COLUMNS
    getBranchAssociationsMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.BRANCH_ASSOCIATIONS_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.BRANCH_ASSOCIATIONS_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Branch Associations Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE ASSET MASTER COLUMNS
    storeAssetMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.ASSET_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Asset Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET ASSET MASTER COLUMNS
    getAssetMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ASSET_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.ASSET_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Asset Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE ASSET MAPPING MASTER COLUMNS
    storeAssetMappingMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.ASSET_MAPPING_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Asset Mapping Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET ASSET MAPPING MASTER COLUMNS
    getAssetMappingMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ASSET_MAPPING_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.ASSET_MAPPING_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Asset Mapping Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE DEDUCTION MASTER COLUMNS
    storeDeductionMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.DEDUCTION_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Deduction Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET DEDUCTION MASTER COLUMNS
    getDeductionMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.DEDUCTION_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.DEDUCTION_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Deduction Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE EARNING MASTER COLUMNS
    storeEarningMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.EARNING_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Earning Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET EARNING MASTER COLUMNS
    getEarningMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.EARNING_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.EARNING_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Earning Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE VENDOR COLUMNS
    storeVendorTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.VENDOR_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Vendor Columns Details:', error)
        }
    },
    //#endregion
    //#region GET VENDOR COLUMNS
    getVendorTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.VENDOR_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.VENDOR_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Vendor Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE COMPANY MASTER COLUMNS
    storeCompanyMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.COMPANY_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Company Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET COMPANY MASTER COLUMNS
    getCompanyMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.COMPANY_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.COMPANY_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Company Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE HOLIDAY MASTER COLUMNS
    storeHolidayMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.HOLIDAY_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Holiday Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET HOLIDAY MASTER COLUMNS
    getHolidayMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.HOLIDAY_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.HOLIDAY_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Holiday Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE HOLIDAY MAPPING MASTER COLUMNS
    storeHolidayMappingMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.HOLIDAY_MAPPING_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Holiday Mapping Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET HOLIDAY MAPPING MASTER COLUMNS
    getHolidayMappingMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.HOLIDAY_MAPPING_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.HOLIDAY_MAPPING_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Holiday Mapping Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE LEAVE ENCASHMENT MASTER COLUMNS
    storeLeaveEncashmentMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.LEAVE_ENCASHMENT_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Leave Encashment Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET LEAVE ENCASHMENT MASTER COLUMNS
    getLeaveEncashmentMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.LEAVE_ENCASHMENT_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.LEAVE_ENCASHMENT_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Leave Encashment Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE LEAVE TYPE MASTER COLUMNS
    storeLeaveTypeMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.LEAVE_TYPE_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Leave Type Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET LEAVE TYPE MASTER COLUMNS
    getLeaveTypeMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.LEAVE_TYPE_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.LEAVE_TYPE_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Leave Type Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE SHIFT MASTER COLUMNS
    storeShiftMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.SHIFT_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Shift Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET SHIFT MASTER COLUMNS
    getShiftMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.SHIFT_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.SHIFT_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Shift Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE SHIFT MAPPING MASTER COLUMNS
    storeShiftMappingMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.SHIFT_MAPPING_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Shift Mapping Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET SHIFT MAPPING MASTER COLUMNS
    getShiftMappingMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.SHIFT_MAPPING_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.SHIFT_MAPPING_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Shift Mapping Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE WEEK OFF MAPPING MASTER COLUMNS
    storeWeekOffMappingMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.WEEK_OFF_MAPPING_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Week Off Mapping Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET WEEK OFF MAPPING MASTER COLUMNS
    getWeekOffMappingMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.WEEK_OFF_MAPPING_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.WEEK_OFF_MAPPING_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Week Off Mapping Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE WEEK OFF MASTER COLUMNS
    storeWeekOffMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.WEEK_OFF_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Week Off Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET WEEK OFF MASTER COLUMNS
    getWeekOffMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.WEEK_OFF_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.WEEK_OFF_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Week Off Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE TNC MASTER COLUMNS
    storeTncMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.TNC_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Tnc Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET TNC MASTER COLUMNS
    getTncMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.TNC_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.TNC_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Tnc Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE SUB MATERIAL MASTER COLUMNS
    storeSubMaterialMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.SUB_MATERIAL_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Sub Material Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET SUB MATERIAL MASTER COLUMNS
    getSubMaterialMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.SUB_MATERIAL_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.SUB_MATERIAL_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Sub Material Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE UOM MASTER COLUMNS
    storeUomMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.UOM_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Uom Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET UOM MASTER COLUMNS
    getUomMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.UOM_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.UOM_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Uom Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE MATERIAL MASTER COLUMNS
    storeMaterialMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.MATERIAL_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Material Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET MATERIAL MASTER COLUMNS
    getMaterialMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.MATERIAL_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.MATERIAL_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Material Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE PROJECT DOCUMENT CATEGORY MASTER COLUMNS
    storeProjectDocumentCategoryMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECT_DOCUMENT_CATEGORY_MASTER_SELECTED_COLUMNS, columns);
        } catch (error) {
            console.error('Error Project Document Category Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET PROJECT DOCUMENT CATEGORY MASTER COLUMNS
    getProjectDocumentCategoryMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECT_DOCUMENT_CATEGORY_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {
                return localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECT_DOCUMENT_CATEGORY_MASTER_SELECTED_COLUMNS);
            } catch (error) {
                console.error('Error reading Project Document Category Master Columns Details:', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE MENU DATA
    storeMenuData: (menuData: ModuleData[] | ModuleData): void => {
        try {

            localStorage.setItem(LOCAL_STORAGE_KEYS.MENU_MODULE, JSON.stringify(menuData));

        } catch (error) {
            console.error('ERROR : STORING MENU DATA :', error)
        }
    },
    //#endregion
    //#region GET MENU DATA 
    getMenuData: (): ModuleData[] | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.MENU_MODULE)
        if (stored) {
            try {

                return JSON.parse(stored) as ModuleData[];

            } catch (error) {
                console.error('ERROR : GET MENU DATA :', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region STORE COUNTRY_STATE_DISTRICT_CITY_VILLAGE DATA
    storeCountry_State_District_City_Village_Data: (locationData: CountryStateCityDistrictVillageData[] | ModuleData): void => {
        try {

            localStorage.setItem(LOCAL_STORAGE_KEYS.COMPANY_MASTER_SELECTED_COLUMNS, JSON.stringify(locationData));

        } catch (error) {
            console.error('ERROR : STORING MENU DATA :', error)
        }
    },
    //#endregion
    //#region GET COUNTRY_STATE_DISTRICT_CITY_VILLAGE DATA 
    getCountry_State_District_City_VillageData: (): CountryStateCityDistrictVillageData[] | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.COMPANY_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {

                return JSON.parse(stored) as CountryStateCityDistrictVillageData[];

            } catch (error) {
                console.error('ERROR : GET COUNTRY STATE DISTRICT CITY VILLAGE DATA :', error)
                return null
            }
        }
        return null
    },
    //#endregion
    //#region CLEAR LOCAL STORAGE 
    clearLocalStorageData: (): void => {
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.EMPLOYEE)
            localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN)
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
            localStorage.removeItem(LOCAL_STORAGE_KEYS.MENU_MODULE);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.COUNTRY_STATE_DISTRICT_CITY_VILLAGE_MASTER);
        } catch (error) {
            console.error('ERROR : CLEARING LOCAL STORAGE:', error)
        }
    },
    //#endregion
}
