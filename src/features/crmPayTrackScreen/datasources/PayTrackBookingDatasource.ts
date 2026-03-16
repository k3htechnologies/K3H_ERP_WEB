import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { FilterWithPaginationPayTrackBooking, PayTrackBookingListResponse } from "@/features/crmPayTrackScreen/models/PayTrackBookingModel";
import { PayTrackBookingApi } from "@/features/crmPayTrackScreen/api/PayTrackBookingApi";

export abstract class PayTrackBookingDatasource {
    abstract pullPayTrackBooking(params: FilterWithPaginationPayTrackBooking, signal?: AbortSignal): Promise<PayTrackBookingListResponse>;
}

export class PayTrackBookingDatasourceImpl implements PayTrackBookingDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullPayTrackBooking(params: FilterWithPaginationPayTrackBooking, signal?: AbortSignal): Promise<PayTrackBookingListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BookingId) queryParams.append("BookingId", params.BookingId.toString());
            if (params.FromDate) queryParams.append("FromDate", params.FromDate);
            if (params.ToDate) queryParams.append("ToDate", params.ToDate);
            if (params.Wing?.trim()) queryParams.append('Wing', params.Wing.trim());
            if (params.ApplicantName?.trim()) queryParams.append('ApplicantName', params.ApplicantName.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PayTrackBookingApi.PULL}?${queryParams.toString()}`,
                { signal }
            )

            return response;
        } catch (error: any) {

            console.error("ERROR: PULL PAYTRACK BOOKING :", error);

            if (error === TokenExpiredException) {
                await this.pullPayTrackBooking(params);
            }
            throw error;

        }
    }

}


