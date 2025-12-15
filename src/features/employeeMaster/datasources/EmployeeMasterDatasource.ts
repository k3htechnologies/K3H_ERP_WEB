import baseClient from '@/core/config/baseClient'
import { EmployeeMasterApi } from '@/features/employeeMaster/api/EmployeeMasterApi'
import type {
    FilterWithPaginationEmployeeMasterRequest,
    AddUpdateEmployeeMasterRequest,
    EmployeeMasterListResponse,
    LocationResponse
} from '../models/EmployeeMasterModel'

export abstract class EmployeeMasterDatasource {

    abstract pullEmployeeMaster(params: FilterWithPaginationEmployeeMasterRequest): Promise<EmployeeMasterListResponse>;
    abstract addUpdateEmployeeMaster(data: AddUpdateEmployeeMasterRequest): Promise<EmployeeMasterListResponse>;
}

export class EmployeeMasterDatasourceImpl implements EmployeeMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


  async pullLocationHierarchy(): Promise<LocationResponse> {
    debugger
    const response = await this.k3hHttpClient.getRequestWithAuthentication(
        `Static/PullCountryStateCityDistrictVillage`
    );
    return response;
}


    async pullEmployeeMaster(params: FilterWithPaginationEmployeeMasterRequest): Promise<EmployeeMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.EmployeeId) queryParams.append('EmployeeId', params.EmployeeId.toString());
            if (params.EmployeeName?.trim()) queryParams.append('EmployeeName', params.EmployeeName.trim());
            if (params.BranchName?.trim()) queryParams.append('BranchName', params.BranchName.trim());
            if (params.DepartmentName?.trim()) {
                // Decode if already URL-encoded (e.g., "Information+Technology+%28IT%29" -> "Information Technology (IT)")
                // URLSearchParams will then encode it properly for the URL
                let departmentName = params.DepartmentName.trim();
                try {
                    // Check if it looks like URL-encoded (contains % or +)
                    if (departmentName.includes('%') || departmentName.includes('+')) {
                        // Replace + with space first, then decode
                        departmentName = decodeURIComponent(departmentName.replace(/\+/g, ' '));
                    }
                } catch (e) {
                    // If decoding fails, use original value (it's probably not encoded)
                    departmentName = params.DepartmentName.trim();
                }
                queryParams.append('DepartmentName', departmentName);
            }
            if (params.DesignationName?.trim()) queryParams.append('DesignationName', params.DesignationName.trim());
            if (params.EmailId?.trim()) queryParams.append('EmailId', params.EmailId.trim());
            if (params.MobileNumber?.trim()) queryParams.append('MobileNumber', params.MobileNumber.trim());
            if (params.ReportPersonName?.trim()) queryParams.append('ReportPersonName', params.ReportPersonName.trim());
            if (params.BankBranchName?.trim()) queryParams.append('BankBranchName', params.BankBranchName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${EmployeeMasterApi.PULL}?${queryParams.toString()}`
            )

            return response
        } catch (error) {

            console.error('Error: Pull Employee Master:', error);
            throw error
        }
    }

    async addUpdateEmployeeMaster(data: AddUpdateEmployeeMasterRequest): Promise<EmployeeMasterListResponse> {

        try {

            const payLoad: AddUpdateEmployeeMasterRequest = {
                EmployeeId: data.EmployeeId ?? 0,
                UniqueKey: data.UniqueKey ?? '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                FirstName: data.FirstName?.trim() ?? '',
                MiddleName: data.MiddleName?.trim() ?? '',
                LastName: data.LastName?.trim() ?? '',
                DepartmentMasterId: data.DepartmentMasterId ?? 0,
                DesignationMasterId: data.DesignationMasterId ?? 0,
                BranchMasterId: data.BranchMasterId ?? 0,
                Gender: data.Gender?.trim() ?? '',
                MaritalStatus: data.MaritalStatus?.trim() ?? '',
                DateOfBirth: data.DateOfBirth ?? '',
                JoiningDate: data.JoiningDate ?? '',
                IsGeoFenceLocation: data.IsGeoFenceLocation ?? false,
                EmailId: data.EmailId?.trim() ?? '',
                OfficeEmailId: data.OfficeEmailId?.trim() ?? '',
                ReportPersonId: data.ReportPersonId ?? 0,
                PersonalMobileNumber: data.PersonalMobileNumber?.trim() ?? '',
                OfficeMobileNumber: data.OfficeMobileNumber?.trim() ?? '',
                BankListMasterId: data.BankListMasterId ?? 0,
                BankBranchName: data.BankBranchName?.trim() ?? '',
                IFSCCode: data.IFSCCode?.trim() ?? '',
                AccountNo: data.AccountNo?.trim() ?? '',
                EmployeeType: data.EmployeeType?.trim() ?? '',
                EmergencyMobileNumber: data.EmergencyMobileNumber?.trim() ?? '',
                EmergencyContactPersonRelationship: data.EmergencyContactPersonRelationship?.trim() ?? '',
                CommunicationAddress: data.CommunicationAddress?.trim() ?? '',
                PermanentAddress: data.PermanentAddress?.trim() ?? '',
                BloodGroup: data.BloodGroup?.trim() ?? '',
                CompanyId: data.CompanyId ?? 0,
                CountryMasterId: data.CountryMasterId ?? 0,
                StateMasterId: data.StateMasterId ?? 0,
                DistrictMasterId: data.DistrictMasterId ?? 0,
                CityMasterId: data.CityMasterId ?? 0,
            }


            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                EmployeeMasterApi.ADD_UPDATE,
                payLoad
            )

            return response
        } catch (error) {
            console.error('Error: Add Update Employee Master:', error)
            throw error
        }
    }

}
