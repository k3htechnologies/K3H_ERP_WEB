import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { GatePassApi } from '@/features/gatePass/api/GatePassApi'
import type {  DeleteGatePassRequest, FilterWithPaginationGatePassRequest, GatePassDeleteResponse, GatePassListResponse, GatePassOutResponse, GatePassSaveResponse, UpdateGatePassOutRequest } from '@/features/gatePass/models/GatePassModel'

export abstract class GatePassDatasource {
    abstract pullGatePass(params: FilterWithPaginationGatePassRequest, signal?: AbortSignal): Promise<GatePassListResponse>;
    abstract addUpdateGatePass(FormData: FormData): Promise<GatePassSaveResponse>;
    abstract updateGatePassOutRequest(parms: UpdateGatePassOutRequest): Promise<GatePassOutResponse>;
    abstract deleteGatePass(params: DeleteGatePassRequest): Promise<GatePassDeleteResponse>;
}

export class GatePassDatasourceImpl implements GatePassDatasource {

    private get k3hHttpClient() {
        return baseClient
    }

    async pullGatePass(params: FilterWithPaginationGatePassRequest, signal?: AbortSignal): Promise<GatePassListResponse> {
        try {

            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ExternalId) queryParams.append('ExternalId', params.ExternalId.toString());
            if (params.FullName?.trim()) queryParams.append('FullName', params.FullName.trim());
            if (params.MobileNumber?.trim()) queryParams.append('MobileNumber', params.MobileNumber.trim());
            if (params.Address?.trim()) queryParams.append('Address', params.Address.trim());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());
            if (params.Purpose?.trim()) queryParams.append('Purpose', params.Purpose.trim());
            if (params.EmployeeName?.trim()) queryParams.append('EmployeeName', params.EmployeeName.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${GatePassApi.PULL}?${queryParams.toString()}`, { signal }
            )

        } catch (error: any) {

            console.error('ERROR: PULL GATE PASS :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullGatePass(params);
            }

            throw error
        }

    }

    async addUpdateGatePass(FormData: FormData): Promise<GatePassSaveResponse> {
        try {

            return await this.k3hHttpClient.multipartRequestWithAuthentication(GatePassApi.ADD_UPDATE, FormData);

        } catch (error) {

            console.error('ERROR: ADD UPDATE GATE PASS :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateGatePass(FormData);
            }
            throw error
        }
    }

    async updateGatePassOutRequest(parms: UpdateGatePassOutRequest): Promise<GatePassOutResponse> {
        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(GatePassApi.UPDATE_OUT, parms);

        } catch (error) {

            console.error('ERROR: ADD UPDATE GATE PASS :', error)

            if (error instanceof TokenExpiredException) {

                return await this.updateGatePassOutRequest(parms);
            }
            throw error
        }
    }

    async deleteGatePass(params: DeleteGatePassRequest): Promise<GatePassDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ExternalId: (params.ExternalId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            return await this.k3hHttpClient.deleteRequestWithAuthentication(`${GatePassApi.DELETE}?${queryParams.toString()}`);

        } catch (error) {

            console.error('ERROR: DELETE GATE PASS :', error);

            if (error instanceof TokenExpiredException) {

                return await this.deleteGatePass(params);

            }

            throw error
        }
    }
}