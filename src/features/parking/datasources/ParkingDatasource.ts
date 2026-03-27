import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { ParkingApi } from '@/features/parking/api/ParkingApi'
import type {
    FilterWithPaginationParkingRequest,
    ParkingListResponse,
    FilterParkingRequest,
    UpdateParkingRequest,
    ParkingUpdateResponse
} from '@/features/parking/models/ParkingModel'

export abstract class ParkingDatasource {

    abstract pullParking(params: FilterParkingRequest, signal?: AbortSignal): Promise<ParkingListResponse>;
    abstract updateParking(params: UpdateParkingRequest): Promise<ParkingUpdateResponse>;
    abstract pullParkingWithPagination(params: FilterWithPaginationParkingRequest, signal?: AbortSignal): Promise<ParkingListResponse>;
}

export class ParkingDatasourceImpl implements ParkingDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullParking(params: FilterParkingRequest, signal?: AbortSignal): Promise<ParkingListResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: (params.ProjectId ?? 0).toString()
            })

            if (params.Building) queryParams.append('Building', params.Building.toString());
            if (params.Wing?.trim()) queryParams.append('Wing', params.Wing.trim());
            if (params.Floor?.trim()) queryParams.append('Floor', params.Floor.trim());
            if (params.ParkingId) queryParams.append('ParkingId', params.ParkingId.toString());
            if (params.ParkingNumber?.trim()) queryParams.append('ParkingNumber', params.ParkingNumber.trim());
            if (params.ParkingType?.trim()) queryParams.append('ParkingType', params.ParkingType.trim());
            if (params.ParkingSubType?.trim()) queryParams.append('ParkingSubType', params.ParkingSubType.trim());
            if (params.Dimensions?.trim()) queryParams.append('Dimensions', params.Dimensions.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ParkingApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL PARKING :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullParking(params);
            }

            throw error
        }
    }

    async updateParking(params: UpdateParkingRequest): Promise<ParkingUpdateResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ParkingApi.UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE PARKING :', error)

            if (error instanceof TokenExpiredException) {

                return await this.updateParking(params);
            }
            throw error
        }
    }

    async pullParkingWithPagination(params: FilterWithPaginationParkingRequest, signal?: AbortSignal): Promise<ParkingListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            if (params.Building) queryParams.append('Building', params.Building.toString());
            if (params.Wing?.trim()) queryParams.append('Wing', params.Wing.trim());
            if (params.Floor?.trim()) queryParams.append('Floor', params.Floor.trim());
            if (params.ParkingId) queryParams.append('ParkingId', params.ParkingId.toString());
            if (params.ParkingNumber?.trim()) queryParams.append('ParkingNumber', params.ParkingNumber.trim());
            if (params.ParkingType?.trim()) queryParams.append('ParkingType', params.ParkingType.trim());
            if (params.ParkingSubType?.trim()) queryParams.append('ParkingSubType', params.ParkingSubType.trim());
            if (params.Dimensions?.trim()) queryParams.append('Dimensions', params.Dimensions.trim());
            if (params.DisplayParkingId?.trim()) queryParams.append('DisplayParkingId', params.DisplayParkingId.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ParkingApi.PULL_PARKING_PAGINATION}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL PARKING WITH PAGINATION :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullParking(params);
            }

            throw error
        }
    }

}
