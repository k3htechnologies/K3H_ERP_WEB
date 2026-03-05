import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { HolidayMappingMasterApi } from '@/features/holidayMappingMaster/api/HolidayMappingMasterApi'
import type {
    FilterWithPaginationHolidayMappingMasterRequest,
    AddUpdateHolidayMappingMasterRequest,
    DeleteHolidayMappingMasterRequest,
    HolidayMappingMasterListResponse,
    HolidayMappingMasterSaveResponse,
    HolidayMappingMasterDeleteResponse
} from '@/features/holidayMappingMaster/models/HolidayMappingMasterModel'

export abstract class HolidayMappingMasterDatasource {

    abstract pullHolidayMappingMaster(params: FilterWithPaginationHolidayMappingMasterRequest, signal?: AbortSignal): Promise<HolidayMappingMasterListResponse>;
    abstract addUpdateHolidayMappingMaster(data: AddUpdateHolidayMappingMasterRequest): Promise<HolidayMappingMasterSaveResponse>;
    abstract deleteHolidayMappingMaster(params: DeleteHolidayMappingMasterRequest): Promise<HolidayMappingMasterDeleteResponse>;
}

export class HolidayMappingMasterDatasourceImpl implements HolidayMappingMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullHolidayMappingMaster(params: FilterWithPaginationHolidayMappingMasterRequest, signal?: AbortSignal): Promise<HolidayMappingMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })
            if (params.HolidayMappingMasterId) queryParams.append('HolidayMappingMasterId', params.HolidayMappingMasterId.toString());
            if (params.BranchName?.trim()) queryParams.append('BranchName', params.BranchName.trim());
            if (params.HolidayName?.trim()) queryParams.append('HolidayName', params.HolidayName.trim());
            if (params.DepartmentName?.trim()) queryParams.append('DepartmentName', params.DepartmentName.trim());
            if (params.FromHolidayDate?.trim()) queryParams.append('FromHolidayDate', params.FromHolidayDate.trim());
            if (params.ToHolidayDate?.trim()) queryParams.append('ToHolidayDate', params.ToHolidayDate.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${HolidayMappingMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL HOLIDAY MAPPING MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullHolidayMappingMaster(params);
            }

            throw error
        }
    }

    async addUpdateHolidayMappingMaster(params: AddUpdateHolidayMappingMasterRequest): Promise<HolidayMappingMasterSaveResponse> {

        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                HolidayMappingMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE HOLIDAY MAPPING MASTER :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateHolidayMappingMaster(params);
            }
            throw error
        }
    }

    async deleteHolidayMappingMaster(params: DeleteHolidayMappingMasterRequest): Promise<HolidayMappingMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                HolidayMappingMasterId: (params.HolidayMappingMasterId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${HolidayMappingMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE HOLIDAY MAPPING MASTER :', error)

            if (error === TokenExpiredException) {

                await this.deleteHolidayMappingMaster(params);

            }

            throw error
        }
    }
}
