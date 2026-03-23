import { LocalStorageHelper } from "@/core/utils/localStorageHelper"

export const HeaderSection = () => {

    return (
        <div className="bg-white rounded-xl p-3 mb-5 " >
            <h1 className="text-lg font-semibold text-gray-800">Welcome {LocalStorageHelper.getStoredEmployeeData()?.FullName},</h1>
            <p className="text-sm font-normal pt-2 text-gray-500">Here is your Comprehensive Daily Overview </p>
        </div>
    )
}