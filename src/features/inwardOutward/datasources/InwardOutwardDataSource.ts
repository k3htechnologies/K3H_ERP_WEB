import baseClient from "@/core/config/baseClient"
import { TokenExpiredException } from "@/core/config/baseClientexceptions"
import type { DeleteInwardAndOutWardRequest, DeleteInwardOutwardRevertHistoryRequest, FilterWithPaginationInwardAndOutWardRequest, FilterWithPaginationSenderReceiverByMobileNoRequest, InwardAndOutWardDeleteResponse, InwardAndOutWardListResponse, InwardAndOutWardSaveResponse, InwardOutwardRevertSaveResponse, SenderReceiverByMobileNoDataListResponse } from "@/features/inwardOutward/models/InwardOutwardModel"
import { InwardOutwardApi } from "@/features/inwardOutward/api/InwardOutwardApi"

export abstract class InwardAndOutWardDatasource {

    abstract pullInwardAndOutWard(params: FilterWithPaginationInwardAndOutWardRequest, signal?: AbortSignal): Promise<InwardAndOutWardListResponse>;
    abstract addUpdateInwardAndOutWard(data: FormData): Promise<InwardAndOutWardSaveResponse>;
    abstract deleteInwardAndOutWardRequest(params: DeleteInwardAndOutWardRequest): Promise<InwardAndOutWardDeleteResponse>;
    abstract addRevertInwardAndOutWard(data: FormData): Promise<InwardOutwardRevertSaveResponse>;
    abstract deleteInwardOutwardRevertHistory(params: DeleteInwardOutwardRevertHistoryRequest): Promise<InwardAndOutWardDeleteResponse>;
    abstract pullSenderReceiverByMobileNoData(params: FilterWithPaginationSenderReceiverByMobileNoRequest, signal?: AbortSignal): Promise<SenderReceiverByMobileNoDataListResponse>;

}
export class InwardAndOutWardDatasourceImpl implements InwardAndOutWardDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullInwardAndOutWard(params: FilterWithPaginationInwardAndOutWardRequest, signal?: AbortSignal): Promise<InwardAndOutWardListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: (params.PageSize ?? 10).toString(),
                pageNumber: (params.PageNumber ?? 1).toString(),
            })
            if (params.InwardOutwardId?.toString()) queryParams.append('InwardOutwardId', params.InwardOutwardId.toString().trim());
            if (params.SenderName?.trim()) queryParams.append('SenderName', params.SenderName.trim());
            if (params.ReceiverName?.trim()) queryParams.append('ReceiverName', params.ReceiverName.trim());
            if (params.DocumentType?.trim()) queryParams.append('DocumentType', params.DocumentType.trim());
            if (params.DeliveryStatus?.trim()) queryParams.append('DeliveryStatus', params.DeliveryStatus.trim());
            if (params.DocumentTitle?.trim()) queryParams.append('DocumentTitle', params.DocumentTitle.trim());
            if (params.SenderMobileNumber?.trim()) queryParams.append('SenderMobileNumber', params.SenderMobileNumber.trim());
            if (params.ReceiverMobileNumber?.trim()) queryParams.append('ReceiverMobileNumber', params.ReceiverMobileNumber.trim());
            if (params.SystemGeneratedCode?.trim()) queryParams.append('SystemGeneratedCode', params.SystemGeneratedCode.trim());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(`${InwardOutwardApi.PULL}?${queryParams.toString()}`, { signal });

        } catch (error: any) {
            console.error('ERROR: PULL INWARD OUTWARD :', error);

            if (error === TokenExpiredException) {
                await this.pullInwardAndOutWard(params);
            }
            throw error
        }
    }

    async addUpdateInwardAndOutWard(formData: FormData): Promise<InwardAndOutWardSaveResponse> {
        try {

            return await this.k3hHttpClient.multipartRequestWithAuthentication(
                InwardOutwardApi.ADD_UPDATE,
                formData
            );

        } catch (error) {

            console.error('ERROR: ADD UPDATE INWARD OUTWARD :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateInwardAndOutWard(formData);
            }
            throw error
        }
    }

    async deleteInwardAndOutWardRequest(params: DeleteInwardAndOutWardRequest): Promise<InwardAndOutWardDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                InwardOutwardId: params.InwardOutwardId.toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            return await this.k3hHttpClient.deleteRequestWithAuthentication(`${InwardOutwardApi.DELETE}?${queryParams.toString()}`)


        } catch (error) {

            console.error('ERROR: DELETE INWARD OUTWARD :', error)

            if (error === TokenExpiredException) {

                await this.deleteInwardAndOutWardRequest(params);

            }
            throw error
        }
    }

    async addRevertInwardAndOutWard(formData: FormData): Promise<InwardOutwardRevertSaveResponse> {
        try {

            return await this.k3hHttpClient.multipartRequestWithAuthentication(
                InwardOutwardApi.ADD_REVERT,
                formData
            );

        } catch (error) {

            console.error('ERROR: ADD INWARD OUTWARD REVERT:', error)

            if (error === TokenExpiredException) {
                await this.addRevertInwardAndOutWard(formData);
            }
            throw error
        }
    }

    async deleteInwardOutwardRevertHistory(params: DeleteInwardOutwardRevertHistoryRequest): Promise<InwardAndOutWardDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                InwardOutwardId: params.InwardOutwardId.toString(),
                InwardOutwardRevertId: params.InwardOutwardRevertId.toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            return await this.k3hHttpClient.deleteRequestWithAuthentication(`${InwardOutwardApi.DELETE_REVERT}?${queryParams.toString()}`)


        } catch (error) {

            console.error('ERROR: DELETE INWARD OUTWARD REVERT :', error)

            if (error === TokenExpiredException) {

                await this.deleteInwardOutwardRevertHistory(params);

            }
            throw error
        }
    }

    async pullSenderReceiverByMobileNoData(params: FilterWithPaginationSenderReceiverByMobileNoRequest, signal?: AbortSignal): Promise<SenderReceiverByMobileNoDataListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: (params.PageSize ?? 10).toString(),
                pageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.MobileNumber?.trim()) queryParams.append('MobileNumber', params.MobileNumber.trim());

            return await this.k3hHttpClient.getRequestWithAuthentication(`${InwardOutwardApi.PULL_SENDER_RECEIVER_BY_MOBILE_NO}?${queryParams.toString()}`, { signal });

        } catch (error: any) {
            console.error('ERROR: PULL SENDER RECEIVER BY MOBILE NO:', error);

            if (error === TokenExpiredException) {
                await this.pullSenderReceiverByMobileNoData(params);
            }
            throw error
        }
    }
}