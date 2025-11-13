import type { EmployeeData } from "@/features/authentication/models/AuthenticationModel"
import { LOCAL_STORAGE_KEYS } from "../constants/localStorageKeys"
import type { ModuleData } from "@/features/menu/models/MenuModel";

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
    //#region CLEAR LOCAL STORAGE 
    clearLocalStorageData: (): void => {
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.EMPLOYEE)
            localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN)
            localStorage.removeItem(LOCAL_STORAGE_KEYS.LAST_VISITED_PAGE);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.DAPARTMENT_MASTER_SELECTED_COLUMNS);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.DESIGNATION_MASTER_SELECTED_COLUMNS);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.MENU_MODULE);
        } catch (error) {
            console.error('ERROR : CLEARING LOCAL STORAGE:', error)
        }
    },
    //#endregion
}
