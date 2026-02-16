import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { AssetMappingMasterApi } from '@/features/assetMappingMaster/api/AssetMappingMasterApi'
import type {
    FilterWithPaginationAssetMappingMasterRequest,
    AddUpdateAssetMappingMasterRequest,
    DeleteAssetMappingMasterRequest,
    AssetMappingMasterListResponse,
    AssetMappingMasterSaveResponse,
    AssetMappingMasterDeleteResponse
} from '@/features/assetMappingMaster/models/AssetMappingMasterModel'

export abstract class AssetMappingMasterDatasource {

    abstract pullAssetMappingMaster(params: FilterWithPaginationAssetMappingMasterRequest, signal?: AbortSignal): Promise<AssetMappingMasterListResponse>;
    abstract addUpdateAssetMappingMaster(data: AddUpdateAssetMappingMasterRequest): Promise<AssetMappingMasterSaveResponse>;
    abstract deleteAssetMappingMaster(params: DeleteAssetMappingMasterRequest): Promise<AssetMappingMasterDeleteResponse>;
}

export class AssetMappingMasterDatasourceImpl implements AssetMappingMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullAssetMappingMaster(params: FilterWithPaginationAssetMappingMasterRequest, signal?: AbortSignal): Promise<AssetMappingMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.AssetMasterMappingId) queryParams.append('AssetMasterMappingId', params.AssetMasterMappingId.toString());
            if (params.AssetName?.trim()) queryParams.append('AssetName', params.AssetName.trim());
            if (params.AssetMasterId) queryParams.append('AssetMasterId', params.AssetMasterId.toString());
            if (params.EmployeeName?.trim()) queryParams.append('EmployeeName', params.EmployeeName.trim());
            if (params.Status?.trim()) queryParams.append('Status', params.Status.trim());
            if (params.EmployeeId) queryParams.append('EmployeeId', params.EmployeeId.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${AssetMappingMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL ASSET MAPPING MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullAssetMappingMaster(params);
            }
            throw error
        }
    }

    async addUpdateAssetMappingMaster(params: AddUpdateAssetMappingMasterRequest): Promise<AssetMappingMasterSaveResponse> {

        try {

            const payLoad: AddUpdateAssetMappingMasterRequest = {
                AssetMasterMappingId: params.AssetMasterMappingId ?? 0,
                Uniquekey: params.Uniquekey ?? '',
                AssetMasterId: params.AssetMasterId ?? 0,
                AssignedDate: params.AssignedDate ?? null,
                EmployeeId: params.EmployeeId ?? 0,
                ReturnDate: params.ReturnDate ?? null,
                ConditionOnIssue: params.ConditionOnIssue?.trim() ?? '',
                ConditionOnReturn: params.ConditionOnReturn?.trim() ?? '',
                Remarks: params.Remarks?.trim() ?? ''
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                AssetMappingMasterApi.ADD_UPDATE,
                payLoad
            )

            return response
        } catch (error) {
            console.error('ERROR: ADD UPDATE ASSET MAPPING MASTER :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateAssetMappingMaster(params);
            }
            throw error
        }
    }

    async deleteAssetMappingMaster(params: DeleteAssetMappingMasterRequest): Promise<AssetMappingMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                AssetMasterMappingId: (params.AssetMasterMappingId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${AssetMappingMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {
            if (error === TokenExpiredException) {

                console.error('ERROR: DELETE ASSET MAPPING MASTER :', error);

                await this.deleteAssetMappingMaster(params);

            }

            throw error
        }
    }
}
