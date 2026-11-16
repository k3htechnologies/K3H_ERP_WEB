import baseClient from "@/core/config/baseClient";
import type { AddUpdateProcessSalary, AddUpdateProcessSalaryDetails, DeleteProcessSalary, FilterWithPaginationProcessSalaryDetails, FilterWithPaginationProcessSalaryRequest, ProcessSalaryDeleteResponse, ProcessSalaryDetailsListResponse, ProcessSalaryDetailsSaveResponse, ProcessSalaryListResponse, ProcessSalarySaveResponse } from "@/features/processSalary/models/ProcessSalaryModel";
import { ProcessSalaryApi } from "@/features/processSalary/api/ProcessSalaryApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class ProcessSalaryDataSource {
    abstract pullProcessSalary(params: FilterWithPaginationProcessSalaryRequest, signal?: AbortSignal): Promise<ProcessSalaryListResponse>;
    abstract addUpdateProcessSalary(data: AddUpdateProcessSalary): Promise<ProcessSalarySaveResponse>;
    abstract deleteProcessSalary(params: DeleteProcessSalary): Promise<ProcessSalaryDeleteResponse>;
    abstract pullProcessSalaryDetails(params: FilterWithPaginationProcessSalaryDetails, signal?: AbortSignal): Promise<ProcessSalaryDetailsListResponse>;
    abstract addUpdateProcessSalaryDetails(data: AddUpdateProcessSalaryDetails): Promise<ProcessSalaryDetailsSaveResponse>;
}

export class ProcessSalaryDataSourceImpl implements ProcessSalaryDataSource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullProcessSalary(params: FilterWithPaginationProcessSalaryRequest, signal?: AbortSignal): Promise<ProcessSalaryListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 20),
                pageNumber: String(params.PageNumber ?? 1),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            });

            if (params.ProcessSalaryId) queryParams.append("ProcessSalaryId", params.ProcessSalaryId.toString());
            if (params.SalaryProcessMonthYear) queryParams.append("SalaryProcessMonthYear", params.SalaryProcessMonthYear.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProcessSalaryApi.PULL}?${queryParams.toString()}`, { signal }
            )

            return response

        } catch (error: any) {

            console.error("ERROR: PULL PROCESS SALARY :", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullProcessSalary(params);
            }
            throw error;
        }
    }

    async addUpdateProcessSalary(data: AddUpdateProcessSalary): Promise<ProcessSalarySaveResponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ProcessSalaryApi.ADD_UPDATE,
                data
            )

            return response

        } catch (error) {

            console.error('ERROR: ADD UPDATE PROCESS SALARY :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateProcessSalary(data);
            }
            throw error
        }
    }

    async deleteProcessSalary(params: DeleteProcessSalary): Promise<ProcessSalaryDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProcessSalaryId: (params.ProcessSalaryId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ProcessSalaryApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE PROCESS SALARY :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteProcessSalary(params);
            }
            throw error
        }
    }

    async pullProcessSalaryDetails(params: FilterWithPaginationProcessSalaryDetails, signal?: AbortSignal): Promise<ProcessSalaryDetailsListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 20),
                pageNumber: String(params.PageNumber ?? 1),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            });

            if (params.ProcessSalaryId) queryParams.append("ProcessSalaryId", params.ProcessSalaryId.toString());
            if (params.ProcessSalaryDetailsId) queryParams.append("ProcessSalaryDetailsId", params.ProcessSalaryDetailsId.toString());
            if (params.EmployeeName) queryParams.append("EmployeeName", params.EmployeeName.trim());
            if (params.DepartmentName) queryParams.append("DepartmentName", params.DepartmentName.trim());
            if (params.CompanyName) queryParams.append("CompanyName", params.CompanyName.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProcessSalaryApi.PULL_PROCESS_SALARY_DETAILS}?${queryParams.toString()}`, { signal }
            )

            return response

        } catch (error) {

            console.error('ERROR: PULL PROCESS SALARY DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return await this.pullProcessSalaryDetails(params)
            }

            throw error
        }
    }

    async addUpdateProcessSalaryDetails(data: AddUpdateProcessSalaryDetails): Promise<ProcessSalaryDetailsSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ProcessSalaryApi.ADD_UPDATE_PROCESS_SALARY_DETAILS,
                data
            )

            return response

        } catch (error) {

            console.error('ERROR : ADD UPDATE PROCESS SALARY DETAILS :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateProcessSalaryDetails(data)
            }

            throw error
        }
    }
}
