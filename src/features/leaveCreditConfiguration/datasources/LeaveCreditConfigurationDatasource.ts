import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { LeaveCreditConfigurationApi } from '@/features/leaveCreditConfiguration/api/LeaveCreditConfigurationApi'
import type { AddUpdateLeaveCreditConfigurationRequest, DeleteLeaveCreditConfigurationRequest, FilterWithPaginationLeaveCreditConfigurationRequest, LeaveCreditConfigurationDeleteResponse, LeaveCreditConfigurationListResponse, LeaveCreditConfigurationSaveResponse } from '../models/LeaveCreditConfigurationModel'


export abstract class LeaveCreditConfigurationDatasource {

    abstract pullLeaveCreditConfiguration(params: FilterWithPaginationLeaveCreditConfigurationRequest, signal?: AbortSignal): Promise<LeaveCreditConfigurationListResponse>;
    abstract addUpdateLeaveCreditConfiguration(data: AddUpdateLeaveCreditConfigurationRequest): Promise<LeaveCreditConfigurationSaveResponse>;
    abstract deleteLeaveCreditConfiguration(params: DeleteLeaveCreditConfigurationRequest): Promise<LeaveCreditConfigurationDeleteResponse>;
}

export class LeaveCreditConfigurationDatasourceImpl implements LeaveCreditConfigurationDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullLeaveCreditConfiguration(params: FilterWithPaginationLeaveCreditConfigurationRequest, signal?: AbortSignal): Promise<LeaveCreditConfigurationListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.LeaveCreditConfigurationId) queryParams.append('LeaveCreditConfigurationId', params.LeaveCreditConfigurationId.toString());
            if (params.LeavePeriodMode?.trim()) queryParams.append('LeavePeriodMode', params.LeavePeriodMode.trim());
            if (params.FinancialYearStartDate?.trim()) queryParams.append('FinancialYearStartDate', params.FinancialYearStartDate.trim());
            if (params.FinancialYearEndDate?.trim()) queryParams.append('FinancialYearEndDate', params.FinancialYearEndDate.trim());
            if (params.DepartmentName?.trim()) queryParams.append('DepartmentName', params.DepartmentName.trim());
            if (params.DesignationName?.trim()) queryParams.append('DesignationName', params.DesignationName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${LeaveCreditConfigurationApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL LEAVE CREDIT CONFIGURATION :', error);

            if (error === TokenExpiredException) {
                await this.pullLeaveCreditConfiguration(params);
            }

            throw error
        }
    }

    async addUpdateLeaveCreditConfiguration(params: AddUpdateLeaveCreditConfigurationRequest): Promise<LeaveCreditConfigurationSaveResponse> {

        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                LeaveCreditConfigurationApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE LEAVE CREDIT CONFIGURATION :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateLeaveCreditConfiguration(params);
            }
            throw error
        }
    }

    async deleteLeaveCreditConfiguration(params: DeleteLeaveCreditConfigurationRequest): Promise<LeaveCreditConfigurationDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                LeaveCreditConfigurationId: (params.LeaveCreditConfigurationId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${LeaveCreditConfigurationApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE LEAVE CREDIT CONFIGURATION :', error)

            if (error === TokenExpiredException) {

                await this.deleteLeaveCreditConfiguration(params);

            }

            throw error
        }
    }
}



