import baseClient from "@/core/config/baseClient";
import type { AddUpdateEmployeeLetter, AddUpdateEmployeeLetterAcceptEmployee, AddUpdateEmployeeLetterShowEmployee, DeleteEmployeeLetter, EmployeeLetterAcceptEmployeeSaveResponse, EmployeeLetterDeleteResponse, EmployeeLetterListResponse, EmployeeLetterSaveResponse, EmployeeLetterShowEmployeeSaveResponse, FilterWithPaginationEmployeeLetterRequest } from "@/features/employeeMaster/models/EmployeeLetterModal";
import { EmployeeMasterApi } from "@/features/employeeMaster/api/EmployeeMasterApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class EmployeeLetterDatasource {
    abstract pullEmployeeLetter(params: FilterWithPaginationEmployeeLetterRequest): Promise<EmployeeLetterListResponse>;
    abstract addUpdateEmployeeLetter(data: AddUpdateEmployeeLetter): Promise<EmployeeLetterSaveResponse>;
    abstract addUpdateEmployeeLetterShowEmployee(data: AddUpdateEmployeeLetterShowEmployee): Promise<EmployeeLetterShowEmployeeSaveResponse>;
    abstract addUpdateEmployeeLetterAcceptEmployee(data: AddUpdateEmployeeLetterAcceptEmployee): Promise<EmployeeLetterAcceptEmployeeSaveResponse>;
    abstract deleteEmployeeLetter(params: DeleteEmployeeLetter): Promise<EmployeeLetterDeleteResponse>;
}

export class EmployeeLetterDatasourceImpl implements EmployeeLetterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullEmployeeLetter(params: FilterWithPaginationEmployeeLetterRequest): Promise<EmployeeLetterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.EmployeeId) queryParams.append("EmployeeId", params.EmployeeId.toString());
            if (params.EmployeeLetterId) queryParams.append("EmployeeLetterId", params.EmployeeLetterId.toString());
            if (params.Title) queryParams.append("Title", params.Title.toString());
            if (params.DocumentName) queryParams.append("DocumentName", params.DocumentName.toString());
            if (params.IsAcceptEmployee) queryParams.append('IsAcceptEmployee', params.IsAcceptEmployee.toString());
            if (params.IsShowEmployee) queryParams.append('IsShowEmployee', params.IsShowEmployee.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${EmployeeMasterApi.PULL_EMPLOYEE_LETTER}?${queryParams.toString()}`
            )
            return response

        } catch (error) {

            console.log("ERROR : PULL EMPLOYEE  LETTER:", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullEmployeeLetter(params);
            }
            throw error
        }
    }

    async addUpdateEmployeeLetter(data: AddUpdateEmployeeLetter): Promise<EmployeeLetterSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                EmployeeMasterApi.ADD_UPDATE_EMPLOYEE_LETTER,
                data
            )
            return response

        } catch (error) {

            console.log("ERROR : ADD UPDATE EMPLOYEE LETTER", error);

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateEmployeeLetter(data);
            }

            throw error
        }
    };

    async addUpdateEmployeeLetterShowEmployee(data: AddUpdateEmployeeLetterShowEmployee): Promise<EmployeeLetterShowEmployeeSaveResponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                EmployeeMasterApi.ADD_UPDATE_EMPLOYEE_LETTER_SHOW_EMPLOYEE,
                data
            )
            return response

        } catch (error) {

            console.log("ERROR : ADD UPDATE EMPLOYEE LETTER SHOW EMPLOYEE", error);

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateEmployeeLetterShowEmployee(data);
            }
            throw error
        }

    };

    async addUpdateEmployeeLetterAcceptEmployee(data: AddUpdateEmployeeLetterAcceptEmployee): Promise<EmployeeLetterAcceptEmployeeSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                EmployeeMasterApi.ADD_UPDATE_EMPLOYEE_LETTER_ACCEPT_EMPLOYEE,
                data
            )
            return response

        } catch (error) {

            console.log("ERROR : ADD UPDATE EMPLOYEE LETTER ACCEPT EMPLOYEE", error);

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateEmployeeLetterAcceptEmployee(data);
            }
            throw error
        }
    };

    async deleteEmployeeLetter(params: DeleteEmployeeLetter): Promise<EmployeeLetterDeleteResponse> {

        try {
            const queryParams = new URLSearchParams({
                EmployeeLetterId: (params.EmployeeLetterId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                EmployeeId: (params.EmployeeId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${EmployeeMasterApi.DELETE_EMPLOYEE_LETTER}?${queryParams.toString()}`
            )

            return response;

        } catch (error) {

            console.error('ERRPR : DELETE EMPLOYEE LETTER:', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteEmployeeLetter(params);
            }

            throw error
        }
    }

}


