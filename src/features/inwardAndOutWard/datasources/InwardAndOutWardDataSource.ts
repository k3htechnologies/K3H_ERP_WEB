import baseClient from "@/core/config/baseClient"
import { TokenExpiredException } from "@/core/config/baseClientexceptions"
import type { AddUpdateInwardAndOutWardRequest, DeleteInwardAndOutWardRequest, FilterWithPaginationInwardAndOutWardRequest, InwardAndOutWardDeleteResponse, InwardAndOutWardListResponse, InwardAndOutWardSaveResponse } from '@/features/inwardAndOutWard/models/InwardAndOutWardModel'
import { InwardApi } from "../api/InwardAndOutWardApi"

export abstract class InwardDatasource {

    abstract pullInward(params: FilterWithPaginationInwardAndOutWardRequest, signal?: AbortSignal): Promise<InwardAndOutWardListResponse>;
    abstract addUpdateInward(params: AddUpdateInwardAndOutWardRequest): Promise<InwardAndOutWardSaveResponse>;
    abstract deleteInwardRequest(params: DeleteInwardAndOutWardRequest): Promise<InwardAndOutWardDeleteResponse>;
}

export class InwardDatasourceImpl implements InwardDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullInward(params: FilterWithPaginationInwardAndOutWardRequest, signal?: AbortSignal): Promise<InwardAndOutWardListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: (params.PageSize ?? 10).toString(),
                pageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.Status?.trim()) queryParams.append('Status', params.Status.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(`${InwardApi.PULL}?${queryParams.toString()}`, { signal });

        } catch (error: any) {
            console.error('ERROR: PULL INWARD :', error);

            if (error === TokenExpiredException) {
                await this.pullInward(params);
            }
            throw error
        }
    }

    async addUpdateInward(params: AddUpdateInwardAndOutWardRequest): Promise<InwardAndOutWardSaveResponse> {
        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(
                InwardApi.ADD_UPDATE, params
            );

        } catch (error) {

            console.error('ERROR: ADD UPDATE INWARD :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateInward(params);
            }
            throw error
        }
    }

    async deleteInwardRequest(params: DeleteInwardAndOutWardRequest): Promise<InwardAndOutWardDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                UniqueKey: params.Uniquekey ?? '',
            })

            return await this.k3hHttpClient.deleteRequestWithAuthentication(`${InwardApi.DELETE}?${queryParams.toString()}`)


        } catch (error) {

            console.error('ERROR: DELETE INWARD :', error)

            if (error === TokenExpiredException) {

                await this.deleteInwardRequest(params);

            }
            throw error
        }
    }

}