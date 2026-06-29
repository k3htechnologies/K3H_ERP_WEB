import baseClient from "@/core/config/baseClient";
import type { DeleteParkingModificationRequest, FilterWithPaginationParkingModificationDetails, ParkingModificationDetailsDeleteReponse, ParkingModificationDetailsListResponse, ParkingModificationDetailsSaveReponse } from "@/features/crmPayTrack/models/ParkingModificationModel";
import { PayTrackParkingModificationApi } from "@/features/crmPayTrack/api/PayTrackParkingModificationApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class PayTrackParkingModificationDatasource {
    abstract pullParkingModificationDetails(params: FilterWithPaginationParkingModificationDetails, signal?: AbortSignal): Promise<ParkingModificationDetailsListResponse>;
    abstract addUpdateParkingModificationDetails(formData: FormData): Promise<ParkingModificationDetailsSaveReponse>;
    abstract deleteParkingModificationRequest(params: DeleteParkingModificationRequest): Promise<ParkingModificationDetailsDeleteReponse>;
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

    async deleteParkingModificationRequest(params: DeleteParkingModificationRequest): Promise<ParkingModificationDetailsDeleteReponse> {
        try {
            const queryParams = new URLSearchParams({
                ParkingModificationRequestId: (params.ParkingModificationRequestId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '1e7d00f7-7a70-f111-8575-74563c524328',
                BookingId: (params.BookingId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${PayTrackParkingModificationApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE PARKING MODIFICATION REQUEST :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteParkingModificationRequest(params);

            }

            throw error
        }
    }





}