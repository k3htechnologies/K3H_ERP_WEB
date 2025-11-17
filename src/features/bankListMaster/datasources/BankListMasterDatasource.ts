import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { BanKListMasterApi } from '@/features/bankListMaster/api/BankListMasterApi'
import type {
    FilterWithPaginationBankListMasterRequest,
    BankListMasterListResponse
} from '@/features/bankListMaster/models/BankListMasterModel'

export abstract class BankListMasterDatasource {

    abstract pullBankListMaster(params: FilterWithPaginationBankListMasterRequest, signal?: AbortSignal): Promise<BankListMasterListResponse>;
   
}

export class BankListMasterDatasourceImpl implements BankListMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullBankListMaster(params: FilterWithPaginationBankListMasterRequest, signal?: AbortSignal): Promise<BankListMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.BankListMasterId) queryParams.append('BankListMasterId', params.BankListMasterId.toString());
            if (params.BankName?.trim()) queryParams.append('BankName', params.BankName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${BanKListMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL BANK LIST MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullBankListMaster(params);
            }

            throw error
        }
    }

    
}
