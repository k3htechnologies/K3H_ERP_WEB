import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { BranchAssociationsMasterApi } from '@/features/branchAssociationsMaster/api/BranchAssociationsMasterApi'
import type {
    FilterWithPaginationBranchAssociationsMasterRequest,
    AddUpdateBranchAssociationsMasterRequest,
    BranchAssociationsMasterListResponse,
    BranchAssociationsMasterSaveResponse,
} from '@/features/branchAssociationsMaster/models/BranchAssociationsMasterModel'

export abstract class BranchAssociationsMasterDatasource {

    abstract pullBranchAssociationsMaster(params: FilterWithPaginationBranchAssociationsMasterRequest, signal?: AbortSignal): Promise<BranchAssociationsMasterListResponse>;
    abstract addUpdateBranchAssociationsMaster(data: AddUpdateBranchAssociationsMasterRequest): Promise<BranchAssociationsMasterSaveResponse>;

}

export class BranchAssociationsMasterDatasourceImpl implements BranchAssociationsMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullBranchAssociationsMaster(params: FilterWithPaginationBranchAssociationsMasterRequest, signal?: AbortSignal): Promise<BranchAssociationsMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.BranchAssociationsId) queryParams.append('BranchAssociationsId', params.BranchAssociationsId.toString());
            if (params.EmployeeName?.trim()) queryParams.append('EmployeeName', params.EmployeeName.trim());
            if (params.BranchMasterId?.trim()) queryParams.append('BranchMasterId', params.BranchMasterId.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${BranchAssociationsMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            
            return response;

        } catch (error: any) {

            console.error('ERROR: PULL BRANCH ASSOCIATIONS MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullBranchAssociationsMaster(params);
            }

            throw error
        }
    }

    async addUpdateBranchAssociationsMaster(params: AddUpdateBranchAssociationsMasterRequest): Promise<BranchAssociationsMasterSaveResponse> {

        try {

            const payLoad: AddUpdateBranchAssociationsMasterRequest = {
                BranchAssociationsId: params.BranchAssociationsId ?? 0,
                Uniquekey: params.Uniquekey ?? '',
                BranchMasterId: params.BranchMasterId?.trim() ?? '',
                EmployeeId: params.EmployeeId ?? 0
            }


            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                BranchAssociationsMasterApi.ADD_UPDATE,
                payLoad
            )

            return response;

        } catch (error) {

            console.error('ERROR: ADD UPDATE BRANCH ASSOCIATIONS MASTER :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateBranchAssociationsMaster(params);
            }
            throw error
        }
    }

}
