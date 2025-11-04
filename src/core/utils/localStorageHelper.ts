import type { EmployeeData } from "../../features/authentication/models/AuthenticationModel"
import { LOCAL_STORAGE_KEYS } from "../constants/localStorageKeys"

export const LocalStorageHelper = {
    //  ==========================EMPLOYEE DATA STORE IN LOCAL STORAGE =========================================== 
    storeEmployeeData: (employeeData: EmployeeData): void => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.EMPLOYEE, JSON.stringify(employeeData))
            localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, employeeData.Token)
        } catch (error) {
            console.error('Error storing employee data:', error)
        }
    },

    //  ==========================GET EMPLOYEE DATA STORE IN LOCAL STORAGE ===========================================
    getStoredEmployeeData: (): EmployeeData | null => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.EMPLOYEE)
        if (stored) {
            try {
                return JSON.parse(stored) as EmployeeData
            } catch (error) {
                console.error('Error parsing stored employee data:', error)
                return null
            }
        }
        return null
    },

    //  ==========================CLEAR LOCAL STORAGE ===========================================
    clearLocalStorageData: (): void => {
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.EMPLOYEE)
            localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN)
        } catch (error) {
            console.error('Error clearing local storage:', error)
        }
    },
}
