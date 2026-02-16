import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { BranchAssociationsMasterApi } from '@/features/branchAssociationsMaster/api/BranchAssociationsMasterApi'
import type {
    FilterWithPaginationBranchAssociationsMasterRequest,
    AddUpdateBranchAssociationsMasterRequest,
    BranchAssociationsMasterListResponse,
    BranchAssociationsMasterSaveResponse,
    DeleteBranchAssociationsRequest,
    BranchAssociationsDeleteResponse,
} from '@/features/branchAssociationsMaster/models/BranchAssociationsMasterModel'

export abstract class BranchAssociationsMasterDatasource {

    abstract pullBranchAssociationsMaster(params: FilterWithPaginationBranchAssociationsMasterRequest, signal?: AbortSignal): Promise<BranchAssociationsMasterListResponse>;
    abstract addUpdateBranchAssociationsMaster(data: AddUpdateBranchAssociationsMasterRequest): Promise<BranchAssociationsMasterSaveResponse>;
    abstract deleteBranchAssociations(params: DeleteBranchAssociationsRequest): Promise<BranchAssociationsDeleteResponse>;
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
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.BranchAssociationsId) queryParams.append('BranchAssociationsId', params.BranchAssociationsId.toString());
            if (params.EmployeeName?.trim()) queryParams.append('EmployeeName', params.EmployeeName.trim());
            if (params.BranchMasterId?.trim()) queryParams.append('BranchMasterId', params.BranchMasterId.trim());
            if (params.EmployeeId) queryParams.append('EmployeeId', params.EmployeeId.toString());
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

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                BranchAssociationsMasterApi.ADD_UPDATE,
                params
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

    async deleteBranchAssociations(params: DeleteBranchAssociationsRequest): Promise<BranchAssociationsDeleteResponse> {
            try {
                const queryParams = new URLSearchParams({
                    BranchAssociationsId: (params.BranchAssociationsId ?? 0).toString(),
                    UniqueKey: params.UniqueKey ?? '',
                })
    
                const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                    `${BranchAssociationsMasterApi.DELETE}?${queryParams.toString()}`
                )
    
                return response
    
            } catch (error) {
                
                if (error === TokenExpiredException) {
    
                    console.error('ERROR: DELETE BRANCH ASSOCIATIONS :', error);
    
                    await this.deleteBranchAssociations(params);
    
                }
    
                throw error
            }
        }
}
