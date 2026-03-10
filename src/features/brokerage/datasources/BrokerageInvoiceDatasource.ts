import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { BrokerageInvoiceApi } from "@/features/brokerage/api/BrokerageInvoiceApi";
import type {
    BrokerageBookingListResponse,
    FilterWithPaginationBrokerageBookingRequest
} from "@/features/brokerage/models/BrokerageInvoiceModel";

export abstract class BrokerageBookingDatasource {

    abstract pullBrokerageBooking(params: FilterWithPaginationBrokerageBookingRequest, signal?: AbortSignal): Promise<BrokerageBookingListResponse>;
}

export class BrokerageDatasourceImpl implements BrokerageBookingDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullBrokerageBooking(params: FilterWithPaginationBrokerageBookingRequest, signal?: AbortSignal): Promise<BrokerageBookingListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.ApplicantMobileNumber) queryParams.append('ApplicantMobileNumber', params.ApplicantMobileNumber.toString());
            if (params.ApplicantName?.trim()) queryParams.append("ApplicantName", params.ApplicantName.trim());
            if (params.ChannelPartnerName?.trim()) queryParams.append("ChannelPartnerName", params.ChannelPartnerName.trim());
            if (params.Floor?.trim()) queryParams.append("Floor", params.Floor.trim());
            if (params.Wing?.trim()) queryParams.append("Wing", params.Wing.trim());
            if (params.Flat?.trim()) queryParams.append("Flat", params.Flat.trim());
            if (params.Source?.trim()) queryParams.append("Source", params.Source.trim());
            if (params.AgreementValue) queryParams.append("AgreementValue", params.AgreementValue.toString());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${BrokerageInvoiceApi.PULL_BOOKING}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL BROKERAGE BOOKING DATA :", error);

            if (error === TokenExpiredException) {

                await this.pullBrokerageBooking(params);
            }
            throw error;
        }
    }

}
