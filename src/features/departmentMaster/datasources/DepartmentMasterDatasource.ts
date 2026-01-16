import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { DepartmentMasterApi } from '@/features/departmentMaster/api/DepartmentMasterApi'
import type {
    FilterWithPaginationDepartmentMasterRequest,
    AddUpdateDepartmentMasterRequest,
    DeleteDepartmentMasterRequest,
    DepartmentMasterListResponse,
    DepartmentMasterSaveResponse,
    DepartmentMasterDeleteResponse
} from '@/features/departmentMaster/models/DepartmentMasterModel'

export abstract class DepartmentMasterDatasource {

    abstract pullDepartmentMaster(params: FilterWithPaginationDepartmentMasterRequest, signal?: AbortSignal): Promise<DepartmentMasterListResponse>;
    abstract addUpdateDepartmentMaster(data: AddUpdateDepartmentMasterRequest): Promise<DepartmentMasterSaveResponse>;
    abstract deleteDepartmentMaster(params: DeleteDepartmentMasterRequest): Promise<DepartmentMasterDeleteResponse>;
}

export class DepartmentMasterDatasourceImpl implements DepartmentMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullDepartmentMaster(params: FilterWithPaginationDepartmentMasterRequest, signal?: AbortSignal): Promise<DepartmentMasterListResponse> {
        try {
            
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.DepartmentMasterId) queryParams.append('DepartmentMasterId', params.DepartmentMasterId.toString());
            if (params.DepartmentName?.trim()) queryParams.append('DepartmentName', params.DepartmentName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${DepartmentMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL DEPARTMENT MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullDepartmentMaster(params);
            }

            throw error
        }
    }

    async addUpdateDepartmentMaster(params: AddUpdateDepartmentMasterRequest): Promise<DepartmentMasterSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(DepartmentMasterApi.ADD_UPDATE, params);

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE DEPARTMENT MASTER :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateDepartmentMaster(params);
            }
            throw error
        }
    }

    async deleteDepartmentMaster(params: DeleteDepartmentMasterRequest): Promise<DepartmentMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                DepartmentMasterId: (params.DepartmentMasterId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(`${DepartmentMasterApi.DELETE}?${queryParams.toString()}`);

            return response;

        } catch (error) {

            console.error('ERROR: DELETE DEPARTMENT MASTER :', error);

            if (error === TokenExpiredException) {

                await this.deleteDepartmentMaster(params);

            }

            throw error
        }
    }
}
