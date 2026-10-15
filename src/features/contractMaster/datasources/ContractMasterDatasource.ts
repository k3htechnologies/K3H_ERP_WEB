import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { AddUpdateContractMasterRequest, ContractMasterDeleteResponse, ContractMasterListResponse, ContractMasterSaveReponse, DeleteContractMasterRequest, FilterWithPaginationContractMaster } from "@/features/contractMaster/models/ContractMasterModel";
import { ContractMasterApi } from "@/features/contractMaster/api/ContractMasterApi";

export abstract class ContractMasterDatasource {
    abstract pullContractMaster(params: FilterWithPaginationContractMaster, signal?: AbortSignal): Promise<ContractMasterListResponse>;
    abstract addUpdateContractMaster(payload: AddUpdateContractMasterRequest): Promise<ContractMasterSaveReponse>;
    abstract deleteContractMaster(params: DeleteContractMasterRequest): Promise<ContractMasterDeleteResponse>;
}

export class ContractMasterDatasourceImpl implements ContractMasterDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullContractMaster(params: FilterWithPaginationContractMaster, signal?: AbortSignal): Promise<ContractMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ContractMasterId) queryParams.append('ContractMasterId', params.ContractMasterId.toString());
            if (params.ContractName?.trim()) queryParams.append('ContractName', params.ContractName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ContractMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL Contract MASTER :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullContractMaster(params);
            }

            throw error
        }
    }
    async addUpdateContractMaster(params: AddUpdateContractMasterRequest): Promise<ContractMasterSaveReponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ContractMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE Contract MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateContractMaster(params);
            }
            throw error
        }
    }

    async deleteContractMaster(params: DeleteContractMasterRequest): Promise<ContractMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ContractMasterId: (params.ContractMasterId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ContractMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE Contract MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteContractMaster(params);

            }

            throw error
        }
    }

}