import baseClient from '@/core/config/baseClient'
import { EmployeeMasterApi } from '@/features/employeeMaster/api/EmployeeMasterApi'
import type {
    FilterWithPaginationEmployeeMasterRequest,
    AddUpdateEmployeeMasterRequest,
    EmployeeMasterListResponse,
    LocationResponse,
    SetEmployeeMPINRequest,
    EmployeeMPINRequestResponse
} from '@/features/employeeMaster/models/EmployeeMasterModel'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'

export abstract class EmployeeMasterDatasource {

    abstract pullEmployeeMaster(params: FilterWithPaginationEmployeeMasterRequest): Promise<EmployeeMasterListResponse>;
    abstract addUpdateEmployeeMaster(params: AddUpdateEmployeeMasterRequest): Promise<EmployeeMasterListResponse>;
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
            if (params.EmployeeCode?.trim()) queryParams.append('EmployeeCode', params.EmployeeCode.trim());
            if (params.EmployeeName?.trim()) queryParams.append('EmployeeName', params.EmployeeName.trim());
            if (params.MobileNumber?.trim()) queryParams.append('MobileNumber', params.MobileNumber.trim());
            if (params.Gender?.trim()) queryParams.append('Gender', params.Gender.trim());

            if (params.DepartmentName?.trim()) queryParams.append('DepartmentName', params.DepartmentName.trim());
            if (params.DesignationName?.trim()) queryParams.append('DesignationName', params.DesignationName.trim());
            if (params.BranchName?.trim()) queryParams.append('BranchName', params.BranchName.trim());
            if (params.CompanyName?.trim()) queryParams.append('CompanyName', params.CompanyName.trim());
            if (params.ReportPersonName?.trim()) queryParams.append('ReportPersonName', params.ReportPersonName.trim());

            if (params.EmailId?.trim()) queryParams.append('EmailId', params.EmailId.trim());

            if (params.BankName?.trim()) queryParams.append('BankName', params.BankName.trim());

            if (params.BankBranchName?.trim()) queryParams.append('BankBranchName', params.BankBranchName.trim());

            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${EmployeeMasterApi.PULL}?${queryParams.toString()}`
            )

            return response
        } catch (error) {

            console.error('Error: Pull Employee Master:', error);

            if (error === TokenExpiredException) {
                await this.pullEmployeeMaster(params);
            }
            throw error
        }
    }

    async addUpdateEmployeeMaster(params: AddUpdateEmployeeMasterRequest): Promise<EmployeeMasterListResponse> {

        try {

            const payLoad: AddUpdateEmployeeMasterRequest = {
                EmployeeId: params.EmployeeId ?? 0,
                UniqueKey: params.UniqueKey ?? '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                FirstName: params.FirstName?.trim() ?? '',
                MiddleName: params.MiddleName?.trim() ?? '',
                LastName: params.LastName?.trim() ?? '',
                DepartmentMasterId: params.DepartmentMasterId ?? 0,
                DesignationMasterId: params.DesignationMasterId ?? 0,
                BranchMasterId: params.BranchMasterId ?? 0,
                Gender: params.Gender?.trim() ?? '',
                MaritalStatus: params.MaritalStatus?.trim() ?? '',
                DateOfBirth: params.DateOfBirth ?? '',
                JoiningDate: params.JoiningDate ?? '',
                IsGeoFenceLocation: params.IsGeoFenceLocation ?? false,
                EmailId: params.EmailId?.trim() ?? '',
                OfficeEmailId: params.OfficeEmailId?.trim() ?? '',
                ReportPersonId: params.ReportPersonId ?? 0,
                PersonalMobileNumber: params.PersonalMobileNumber?.trim() ?? '',
                OfficeMobileNumber: params.OfficeMobileNumber?.trim() ?? '',
                BankListMasterId: params.BankListMasterId ?? 0,
                BankBranchName: params.BankBranchName?.trim() ?? '',
                IFSCCode: params.IFSCCode?.trim() ?? '',
                AccountNo: params.AccountNo?.trim() ?? '',
                EmployeeType: params.EmployeeType?.trim() ?? '',
                EmergencyMobileNumber: params.EmergencyMobileNumber?.trim() ?? '',
                EmergencyContactPersonRelationship: params.EmergencyContactPersonRelationship?.trim() ?? '',
                CommunicationAddress: params.CommunicationAddress?.trim() ?? '',
                PermanentAddress: params.PermanentAddress?.trim() ?? '',
                BloodGroup: params.BloodGroup?.trim() ?? '',
                CompanyId: params.CompanyId ?? 0,
                CountryMasterId: params.CountryMasterId ?? 0,
                StateMasterId: params.StateMasterId ?? 0,
                DistrictMasterId: params.DistrictMasterId ?? 0,
                CityMasterId: params.CityMasterId ?? 0,
            }


            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                EmployeeMasterApi.ADD_UPDATE,
                payLoad
            )

            return response
        } catch (error) {

            console.error('Error: Add Update Employee Master:', error)

            if (error === TokenExpiredException) {
                await this.addUpdateEmployeeMaster(params);
            }


            throw error
        }
    }

    async setEmployeeMPIN(params: SetEmployeeMPINRequest): Promise<EmployeeMPINRequestResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                EmployeeMasterApi.SET_EMPLOYEE_MPIN,
                params
            )

            return response
        } catch (error) {

            console.error('Error: SET MPIN:', error)

            if (error === TokenExpiredException) {
                await this.setEmployeeMPIN(params);
            }


            throw error
        }
    }

}
