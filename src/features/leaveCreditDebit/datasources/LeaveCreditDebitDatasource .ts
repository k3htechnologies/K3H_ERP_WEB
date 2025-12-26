import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { LeaveCreditDebitApi } from '@/features/leaveCreditDebit/api/LeaveCreditDebitApi'
import type { AddUpdateLeaveCreditDebitRequest, DeleteLeaveCreditDebitRequest, FilterWithPaginationLeaveCreditDebitRequest, LeaveCreditDebitDeleteResponse, LeaveCreditDebitListResponse, LeaveCreditDebitSaveResponse } from '../models/leaveCreditDebit'


export abstract class LeaveCreditDebitDatasource {

    abstract pullLeaveCreditDebit(params: FilterWithPaginationLeaveCreditDebitRequest, signal?: AbortSignal): Promise<LeaveCreditDebitListResponse>;
    abstract addUpdateLeaveCreditDebit(data: AddUpdateLeaveCreditDebitRequest): Promise<LeaveCreditDebitSaveResponse>;
    abstract deleteLeaveCreditDebit(params: DeleteLeaveCreditDebitRequest): Promise<LeaveCreditDebitDeleteResponse>;
}

export class LeaveCreditDebitDatasourceImpl implements LeaveCreditDebitDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullLeaveCreditDebit(params: FilterWithPaginationLeaveCreditDebitRequest, signal?: AbortSignal): Promise<LeaveCreditDebitListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.LeaveCreditDebitId) queryParams.append('LeaveCreditDebitId', params.LeaveCreditDebitId.toString());
            if (params.LeavePeriodMode?.trim()) queryParams.append('LeavePeriodMode', params.LeavePeriodMode.trim());
            if (params.FYyear) queryParams.append('FYyear', params.FYyear.toString());
            if (params.Month?.trim()) queryParams.append('Month', params.Month.trim());
            if (params.DepartmentName?.trim()) queryParams.append('DepartmentName', params.DepartmentName.trim());
            if (params.DesignationName?.trim()) queryParams.append('DesignationName', params.DesignationName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${LeaveCreditDebitApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL LEAVE CREDIT DEBIT :', error);

            if (error === TokenExpiredException) {
                await this.pullLeaveCreditDebit(params);
            }

            throw error
        }
    }

    async addUpdateLeaveCreditDebit(params: AddUpdateLeaveCreditDebitRequest): Promise<LeaveCreditDebitSaveResponse> {

        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                LeaveCreditDebitApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE LEAVE CREDIT DEBIT :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateLeaveCreditDebit(params);
            }
            throw error
        }
    }

    async deleteLeaveCreditDebit(params: DeleteLeaveCreditDebitRequest): Promise<LeaveCreditDebitDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                LeaveCreditDebitId: (params.LeaveCreditDebitId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${LeaveCreditDebitApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE LEAVE CREDIT DEBIT :', error)

            if (error === TokenExpiredException) {

                await this.deleteLeaveCreditDebit(params);

            }

            throw error
        }
    }
}



