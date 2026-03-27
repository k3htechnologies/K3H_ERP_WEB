import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { TncMasterApi } from '@/features/tnc/api/TncMasterApi'
import type {
    FilterWithPaginationTncMasterRequest,
    AddUpdateTncMasterRequest,
    DeleteTncMasterRequest,
    TncMasterListResponse,
    TncMasterSaveResponse,
    TncMasterDeleteResponse
} from '@/features/tnc/models/TncMasterModel'

export abstract class TncMasterDatasource {

    abstract pullTncMaster(params: FilterWithPaginationTncMasterRequest, signal?: AbortSignal): Promise<TncMasterListResponse>;
    abstract addUpdateTncMaster(data: AddUpdateTncMasterRequest): Promise<TncMasterSaveResponse>;
    abstract deleteTncMaster(params: DeleteTncMasterRequest): Promise<TncMasterDeleteResponse>;
}

export class TncMasterDatasourceImpl implements TncMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullTncMaster(params: FilterWithPaginationTncMasterRequest, signal?: AbortSignal): Promise<TncMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.TermsAndConditionsMasterId) queryParams.append('TermsAndConditionsMasterId', params.TermsAndConditionsMasterId.toString());
            if (params.ModuleName?.trim()) queryParams.append('ModuleName', params.ModuleName.trim());
            if (params.Title?.trim()) queryParams.append('Title', params.Title.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TncMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL TERMS AND CONDITIONS MASTER :', error);

            if (error instanceof TokenExpiredException) {
                return  await this.pullTncMaster(params);
            }

            throw error
        }
    }

    async addUpdateTncMaster(params: AddUpdateTncMasterRequest): Promise<TncMasterSaveResponse> {

        try {

            const payLoad: AddUpdateTncMasterRequest = {
                TermsAndConditionsMasterId: params.TermsAndConditionsMasterId ?? 0,
                Uniquekey: params.Uniquekey ?? '',
                ModuleName: params.ModuleName?.trim() ?? '',
                Title: params.Title?.trim() ?? '',
                Description: params.Description?.trim() ?? '',
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                TncMasterApi.ADD_UPDATE,
                payLoad
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE TERMS AND CONDITIONS MASTER :', error)

            if (error instanceof TokenExpiredException) {
                return   await this.addUpdateTncMaster(params);
            }
            throw error
        }
    }

    async deleteTncMaster(params: DeleteTncMasterRequest): Promise<TncMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                TermsAndConditionsMasterId: (params.TermsAndConditionsMasterId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${TncMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE TERMS AND CONDITIONS MASTER :', error)

            if (error instanceof TokenExpiredException) {
                return   await this.deleteTncMaster(params);

            }

            throw error
        }
    }
}
