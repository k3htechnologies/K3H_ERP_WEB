import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { HolidayMasterApi } from '@/features/holidayMaster/api/HolidayMasterApi'
import type {
    FilterWithPaginationHolidayMasterRequest,
    DeleteHolidayMasterRequest,
    HolidayMasterListResponse,
    HolidayMasterSaveResponse,
    HolidayMasterDeleteResponse
} from '@/features/holidayMaster/models/HolidayMasterModel'

export abstract class HolidayMasterDatasource {

    abstract pullHolidayMaster(params: FilterWithPaginationHolidayMasterRequest, signal?: AbortSignal): Promise<HolidayMasterListResponse>;
    abstract addUpdateHolidayMaster(data: FormData): Promise<HolidayMasterSaveResponse>;
    abstract deleteHolidayMaster(params: DeleteHolidayMasterRequest): Promise<HolidayMasterDeleteResponse>;
}

export class HolidayMasterDatasourceImpl implements HolidayMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullHolidayMaster(params: FilterWithPaginationHolidayMasterRequest, signal?: AbortSignal): Promise<HolidayMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.HolidayMasterId) queryParams.append('HolidayMasterId', params.HolidayMasterId.toString());
            if (params.HolidayName?.trim()) queryParams.append('HolidayName', params.HolidayName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${HolidayMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL HOLIDAY MASTER :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullHolidayMaster(params);
            }

            throw error
        }
    }

    async addUpdateHolidayMaster(formData: FormData): Promise<HolidayMasterSaveResponse> {

        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                HolidayMasterApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE HOLIDAY MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateHolidayMaster(formData);
            }
            throw error
        }
    }

    async deleteHolidayMaster(params: DeleteHolidayMasterRequest): Promise<HolidayMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                HolidayMasterId: (params.HolidayMasterId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${HolidayMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE HOLIDAY MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteHolidayMaster(params);

            }

            throw error
        }
    }
}
