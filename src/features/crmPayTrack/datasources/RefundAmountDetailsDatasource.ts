import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { RefundDetailsApi } from "@/features/crmPayTrack/api/RefundDetailsApi";
import type {
    RefundAmountDetailsDeleteResponse,
    RefundAmountDetailsListResponse,
    RefundAmountDetailsSaveReponse,
    DeleteRefundAmountDetailsRequest,
    FilterWithPaginationRefundAmountDetails

} from "@/features/crmPayTrack/models/RefundAmountDetailsModel";

export abstract class RefundAmountDetailsDatasource {
    abstract pullRefundAmountDetails(params: FilterWithPaginationRefundAmountDetails, signal?: AbortSignal): Promise<RefundAmountDetailsListResponse>;
    abstract addUpdateRefundAmountDetails(data: FormData): Promise<RefundAmountDetailsSaveReponse>;
    abstract deleteRefundAmountDetails(params: DeleteRefundAmountDetailsRequest): Promise<RefundAmountDetailsDeleteResponse>;
}

export class RefundAmountDetailsDatasourceImpl implements RefundAmountDetailsDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullRefundAmountDetails(params: FilterWithPaginationRefundAmountDetails, signal?: AbortSignal): Promise<RefundAmountDetailsListResponse> {
        try {
            const queryParams = new URLSearchParams();

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BookingId) queryParams.append("BookingId", params.BookingId.toString());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${RefundDetailsApi.PULL}?${queryParams.toString()}`,
                { signal }
            )

            return response;
        } catch (error: any) {

            console.error("ERROR: PULL REFUND AMOUNT DETAILS :", error);

            if (error instanceof TokenExpiredException) {
                return await this.pullRefundAmountDetails(params);
            }
            throw error;
        }
    }

    async addUpdateRefundAmountDetails(formData: FormData): Promise<RefundAmountDetailsSaveReponse> {
        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                RefundDetailsApi.ADD_UPDATE,
                formData
            )
            return response
        } catch (error: any) {
            console.error("ERROR: ADD UPDATE REFUND AMOUNT DETAILS :", error);

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateRefundAmountDetails(formData);
            }
            throw error;
        }
    }

    async deleteRefundAmountDetails(params: DeleteRefundAmountDetailsRequest): Promise<RefundAmountDetailsDeleteResponse> {
        try {

            const queryParams = new URLSearchParams({
                RefundedAmountLedgerId: (params.RefundedAmountLedgerId ?? 0).toString(),
                BookingId: (params.BookingId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? "",
            });

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${RefundDetailsApi.DELETE}?${queryParams.toString()}`
            )
            return response

        } catch (error) {

            console.error("ERROR: DELETE REFUND AMOUNT DETAILS :", error);

            if (error instanceof TokenExpiredException) {
                return await this.deleteRefundAmountDetails(params);
            }
            throw error;
        }
    }
}