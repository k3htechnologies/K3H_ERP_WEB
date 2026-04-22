import baseClient from "@/core/config/baseClient";
import type { DeleteBookingLoanDetailsRequest, FilterWithPaginationBookingLoanDetails, BookingLoanDetailsDeleteResponse, BookingLoanDetailsListResponse, BookingLoanDetailsSaveReponse, AddUpdateBookingLoanDetailsRequest, UpdateBookingLoanDetailsStatusRequest, BookingLoanDetailsStatusUpdateReponse } from "@/features/crmPayTrack/models/BookingLoanDetailsModel";
import { BookingLoanDetailsApi } from "@/features/crmPayTrack/api/BookingLoanDetailsApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class BookingLoanDetailsDatasource {
    abstract pullBookingLoanDetails(params: FilterWithPaginationBookingLoanDetails, signal?: AbortSignal): Promise<BookingLoanDetailsListResponse>;
    abstract addUpdateBookingLoanDetails(data: AddUpdateBookingLoanDetailsRequest): Promise<BookingLoanDetailsSaveReponse>;
    abstract updateBookingLoanDetailsStatus(params: UpdateBookingLoanDetailsStatusRequest): Promise<BookingLoanDetailsStatusUpdateReponse>;
    abstract deleteBookingLoanDetails(params: DeleteBookingLoanDetailsRequest): Promise<BookingLoanDetailsDeleteResponse>;

}


export class BookingLoanDetailsDatasourceImpl implements BookingLoanDetailsDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullBookingLoanDetails(params: FilterWithPaginationBookingLoanDetails, signal?: AbortSignal): Promise<BookingLoanDetailsListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.BookingId) queryParams.append('BookingId', params.BookingId.toString());
            if (params.BookingLoanDetailsId) queryParams.append('BookingLoanDetailsId', params.BookingLoanDetailsId.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${BookingLoanDetailsApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL BOOKING LOAN DETAILS :', error);

            if (error instanceof TokenExpiredException) {
                return await this.pullBookingLoanDetails(params);
            }

            throw error
        }
    }
    async addUpdateBookingLoanDetails(params: AddUpdateBookingLoanDetailsRequest): Promise<BookingLoanDetailsSaveReponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                BookingLoanDetailsApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE BOOKING LOAN DETAILS :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateBookingLoanDetails(params);
            }
            throw error
        }
    }

    async updateBookingLoanDetailsStatus(params: UpdateBookingLoanDetailsStatusRequest): Promise<BookingLoanDetailsStatusUpdateReponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                BookingLoanDetailsApi.UPDATE_STATUS,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: UPDATE BOOKING LOAN DETAILS STATUS :', error)

            if (error instanceof TokenExpiredException) {
                return await this.updateBookingLoanDetailsStatus(params);
            }
            throw error
        }
    }

    async deleteBookingLoanDetails(params: DeleteBookingLoanDetailsRequest): Promise<BookingLoanDetailsDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                
                BookingLoanDetailsId: (params.BookingLoanDetailsId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                projectId: (params.ProjectId ?? 0).toString(),
                BookingId: (params.BookingId ?? 0).toString(),

            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${BookingLoanDetailsApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE BOOKING LOAN DETAILS :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteBookingLoanDetails(params);

            }

            throw error
        }
    }

}