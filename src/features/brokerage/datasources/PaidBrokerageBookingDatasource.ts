import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { PaidBrokerageBookingApi } from "@/features/brokerage/api/PaidBrokerageBookingApi";
import type {
    PaidBrokerageBookingDeleteResponse,
    PaidBrokerageBookingListResponse,
    PaidBrokerageBookingSaveResponse,
    DeletePaidBrokerageBookingRequest,
    FilterWithPaginationPaidBrokerageBookingRequest
} from "@/features/brokerage/models/PaidBrokerageBookingModel";

export abstract class PaidBrokerageBookingDatasource {

    abstract pullPaidBrokerageBooking(params: FilterWithPaginationPaidBrokerageBookingRequest, signal?: AbortSignal): Promise<PaidBrokerageBookingListResponse>;
    abstract addUpdatePaidBrokerageBooking(data: FormData): Promise<PaidBrokerageBookingSaveResponse>;
    abstract deletePaidBrokerageBooking(params: DeletePaidBrokerageBookingRequest): Promise<PaidBrokerageBookingDeleteResponse>;
}

export class PaidBrokerageBookingDatasourceImpl implements PaidBrokerageBookingDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }


    async pullPaidBrokerageBooking(params: FilterWithPaginationPaidBrokerageBookingRequest, signal?: AbortSignal): Promise<PaidBrokerageBookingListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BookingId) queryParams.append('BookingId', params.BookingId.toString());
            if (params.BrokerageInvoiceId) queryParams.append('BrokerageInvoiceId', params.BrokerageInvoiceId.toString());
            if (params.PaidBrokerageBookingId) queryParams.append('PaidBrokerageBookingId', params.PaidBrokerageBookingId.toString());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PaidBrokerageBookingApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL PAID BROKERAGE BOOKING :", error);

            if (error === TokenExpiredException) {

                await this.pullPaidBrokerageBooking(params);
            }
            throw error;
        }
    }

    async addUpdatePaidBrokerageBooking(formData: FormData): Promise<PaidBrokerageBookingListResponse> {

        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                PaidBrokerageBookingApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE PAID BROKERAGE BOOKING:', error)

            if (error === TokenExpiredException) {
                await this.addUpdatePaidBrokerageBooking(formData);
            }
            throw error
        }
    }

    async deletePaidBrokerageBooking(params: DeletePaidBrokerageBookingRequest): Promise<PaidBrokerageBookingDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                PaidBrokerageBookingId: (params.PaidBrokerageBookingId ?? 0).toString(),
                BookingId: (params.BookingId ?? 0).toString(),
                BrokerageInvoiceId: (params.BrokerageInvoiceId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${PaidBrokerageBookingApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {
            if (error === TokenExpiredException) {

                console.error('ERROR: DELETE PAID BROKERAGE BOOKING:', error);

                await this.deletePaidBrokerageBooking(params);
            }
            throw error
        }
    }

}
