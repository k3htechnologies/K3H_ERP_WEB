import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { ContractMasterListResponse, FilterWithPaginationContractMaster } from "@/features/contractMaster/models/ContractMasterModel";
import { ContractMasterApi } from "@/features/contractMaster/api/ContractMasterApi";

export abstract class ContractMasterDatasource {
    abstract pullContractMaster(params: FilterWithPaginationContractMaster, signal?: AbortSignal): Promise<ContractMasterListResponse>;
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

}