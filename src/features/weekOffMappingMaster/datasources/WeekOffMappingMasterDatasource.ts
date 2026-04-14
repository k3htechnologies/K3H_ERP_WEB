import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { WeekOffMappingMasterApi } from '@/features/weekOffMappingMaster/api/WeekOffMappingMasterApi'
import type {
    FilterWithPaginationWeekOffMappingMasterRequest,
    AddUpdateWeekOffMappingMasterRequest,
    DeleteWeekOffMappingMasterRequest,
    WeekOffMappingMasterListResponse,
    WeekOffMappingMasterSaveResponse,
    WeekOffMappingMasterDeleteResponse
} from '@/features/weekOffMappingMaster/models/WeekOffMappingMasterModel'

export abstract class WeekOffMappingMasterDatasource {

    abstract pullWeekOffMappingMaster(params: FilterWithPaginationWeekOffMappingMasterRequest, signal?: AbortSignal): Promise<WeekOffMappingMasterListResponse>;
    abstract addUpdateWeekOffMappingMaster(data: AddUpdateWeekOffMappingMasterRequest): Promise<WeekOffMappingMasterSaveResponse>;
    abstract deleteWeekOffMappingMaster(params: DeleteWeekOffMappingMasterRequest): Promise<WeekOffMappingMasterDeleteResponse>;
}

export class WeekOffMappingMasterDatasourceImpl implements WeekOffMappingMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullWeekOffMappingMaster(params: FilterWithPaginationWeekOffMappingMasterRequest, signal?: AbortSignal): Promise<WeekOffMappingMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
                IsCheckEmployeeWeekOffPolicy: (params.IsCheckEmployeeWeekOffPolicy ?? false).toString(),
            })

            if (params.WeekOffPolicyMasterMappingId) queryParams.append('WeekOffPolicyMasterMappingId', params.WeekOffPolicyMasterMappingId.toString());
            if (params.WeekOffPolicyName?.trim()) queryParams.append('WeekOffPolicyName]', params.WeekOffPolicyName.trim());
            if (params.DepartmentName?.trim()) queryParams.append('DepartmentName', params.DepartmentName.trim());
            if (params.EmployeeName?.trim()) queryParams.append('EmployeeName', params.EmployeeName.trim());
            if (params.EmployeeId) queryParams.append('EmployeeId', params.EmployeeId.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${WeekOffMappingMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL WEEK OF MAPPING MASTER :', error);

            if (error instanceof TokenExpiredException) {
                return  await this.pullWeekOffMappingMaster(params);
            }

            throw error
        }
    }

    async addUpdateWeekOffMappingMaster(params: AddUpdateWeekOffMappingMasterRequest): Promise<WeekOffMappingMasterSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                WeekOffMappingMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE WEEK OF MAPPING MASTER :', error)

           if (error instanceof TokenExpiredException) {
                return   await this.addUpdateWeekOffMappingMaster(params);
            }
            throw error
        }
    }

    async deleteWeekOffMappingMaster(params: DeleteWeekOffMappingMasterRequest): Promise<WeekOffMappingMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                WeekOffPolicyMasterMappingId: (params.WeekOffPolicyMasterMappingId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${WeekOffMappingMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE WEEK OF MAPPING MASTER :', error)

            if (error instanceof TokenExpiredException) {
                return  await this.deleteWeekOffMappingMaster(params);

            }

            throw error
        }
    }
}
