import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { BookingApplicantModificationApi } from "@/features/crmPayTrack/api/BookingApplicantModificationApi";
import type { FilterWithPaginationBookingApplicantModificationRequest, BookingApplicantModificationListResponse, BookingApplicantModificationSaveReponse } from "@/features/crmPayTrack/models/BookingApplicantModificationModel";

export abstract class BookingApplicantModificationDatasource {
    abstract pullBookingApplicantModification(params: FilterWithPaginationBookingApplicantModificationRequest, signal?: AbortSignal): Promise<BookingApplicantModificationListResponse>;
    abstract addUpdateBookingApplicantModification(data: FormData): Promise<BookingApplicantModificationSaveReponse>;
}

export class BookingApplicantModificationDatasourceImpl implements BookingApplicantModificationDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullBookingApplicantModification(params: FilterWithPaginationBookingApplicantModificationRequest, signal?: AbortSignal): Promise<BookingApplicantModificationListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.BookingId) queryParams.append('BookingId', params.BookingId.toString());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${BookingApplicantModificationApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL BOOKING APPLICANT MODIFICATION :', error);

            if (error instanceof TokenExpiredException) {
                return await this.pullBookingApplicantModification(params);
            }

            throw error
        }
    }


    async addUpdateBookingApplicantModification(formData: FormData): Promise<BookingApplicantModificationSaveReponse> {
        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                BookingApplicantModificationApi.ADD_UPDATE,
                formData
            )
            return response
        } catch (error: any) {
            console.error("ERROR: ADD UPDATE BOOKING APPLICANT MODIFICATION :", error);

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateBookingApplicantModification(formData);
            }
            throw error;
        }
    }
}






