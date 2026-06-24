import baseClient from "@/core/config/baseClient";
import type { FilterWithPaginationParkingModificationDetails, ParkingModificationDetailsListResponse, ParkingModificationDetailsSaveReponse } from "@/features/crmPayTrack/models/ParkingModificationModel";
import { PayTrackParkingModificationApi } from "@/features/crmPayTrack/api/PayTrackParkingModificationApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class PayTrackParkingModificationDatasource {
    abstract pullParkingModificationDetails(params: FilterWithPaginationParkingModificationDetails, signal?: AbortSignal): Promise<ParkingModificationDetailsListResponse>;
    abstract addUpdateParkingModificationDetails(formData: FormData): Promise<ParkingModificationDetailsSaveReponse>;
}

export class PayTrackParkingModificationDatasourceImpl implements PayTrackParkingModificationDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullParkingModificationDetails(params: FilterWithPaginationParkingModificationDetails, signal?: AbortSignal): Promise<ParkingModificationDetailsListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.BookingId) queryParams.append('BookingId', params.BookingId.toString());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PayTrackParkingModificationApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL PARKING MODIFICATION DETAILS :', error);

            if (error instanceof TokenExpiredException) {
                return await this.pullParkingModificationDetails(params);
            }

            throw error
        }
    }

    async addUpdateParkingModificationDetails(formData: FormData): Promise<ParkingModificationDetailsSaveReponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                PayTrackParkingModificationApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE PARKING MODIFICATION DETAILS :', error)

            if (error instanceof TokenExpiredException) {
                
                return await this.addUpdateParkingModificationDetails(formData);
            }
            throw error
        }
    }

}