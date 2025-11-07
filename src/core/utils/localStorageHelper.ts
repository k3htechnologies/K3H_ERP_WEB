import type { EmployeeData } from "../../features/authentication/models/AuthenticationModel"
import { LOCAL_STORAGE_KEYS } from "../constants/localStorageKeys"

export const LocalStorageHelper = {
    //#region EMPLOYEE DATA STORE IN LOCAL STORAGE  
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
    //#region GET EMPLOYEE DATA STORE IN LOCAL STORAGE 
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
    //#region LAST VISITED PAGE DATA STORE IN LOCAL STORAGE
    storeLastVisitedPage: (path: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_VISITED_PAGE, path);

        } catch (error) {
            console.error('Error storing last visited page:', error)
        }
    },
    //#endregion
    //#region GET LAST VISITED PAGE STORE IN LOCAL STORAGE 
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
    //#region LAST VISITED PAGE DATA STORE IN LOCAL STORAGE
    storeDepartmentMasterTableColumns: (columns: string): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.DAPARTMENT_MASTER_SELECTED_COLUMNS, columns);

        } catch (error) {
            console.error('Error Department Master Columns Details:', error)
        }
    },
    //#endregion
    //#region GET LAST VISITED PAGE STORE IN LOCAL STORAGE 
    getDepartmentMasterTableColumns: (): string | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.DAPARTMENT_MASTER_SELECTED_COLUMNS)
        if (stored) {
            try {

                return localStorage.getItem(LOCAL_STORAGE_KEYS.DAPARTMENT_MASTER_SELECTED_COLUMNS);;

            } catch (error) {
                console.error('Error reading Department Master Columns Details:', error)
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
        } catch (error) {
            console.error('Error clearing local storage:', error)
        }
    },
    //#endregion
}
