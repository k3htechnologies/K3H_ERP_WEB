import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { ContractRequisitionInvoicePaymentDeleteResponse, ContractRequisitionInvoicePaymentListResponse, ContractRequisitionInvoicePaymentSaveResponse, DeleteContractRequisitionInvoicePayment, FilterWithPaginationContractRequisitionInvoicePayment } from "@/features/contractRequisition/models/ContractRequisitionInvoicePaymentModel";
import { ContractRequisitionInvoicePaymentApi } from "@/features/contractRequisition/api/ContractRequisitionInvoicePaymentApi";

export abstract class ContractRequisitionInvoicePaymentDatasource {
    abstract pullContractRequisitionInvoicePayment(params: FilterWithPaginationContractRequisitionInvoicePayment, signal?: AbortSignal): Promise<ContractRequisitionInvoicePaymentListResponse>;
    abstract addUpdateContractRequisitionInvoicePayment(data: FormData): Promise<ContractRequisitionInvoicePaymentSaveResponse>;
    abstract deleteContractRequisitionInvoicePayment(params: DeleteContractRequisitionInvoicePayment): Promise<ContractRequisitionInvoicePaymentDeleteResponse>;
}

export class ContractRequisitionInvoicePaymentDatasourceImpl implements ContractRequisitionInvoicePaymentDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullContractRequisitionInvoicePayment(params: FilterWithPaginationContractRequisitionInvoicePayment, signal?: AbortSignal): Promise<ContractRequisitionInvoicePaymentListResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: (params.ProjectId ?? 0).toString(),
                PageNumber: (params.PageNumber ?? 0).toString(),
                PageSize: (params.PageSize ?? 0).toString(),
            })

            if (params.ContractRequisitionInvoiceId) queryParams.append('ContractRequisitionInvoiceId', params.ContractRequisitionInvoiceId.toString());
            if (params.ContractRequisitionId) queryParams.append('ContractRequisitionId', params.ContractRequisitionId.toString());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ContractRequisitionInvoicePaymentApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL Contract REQUISITION INVOICE:', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullContractRequisitionInvoicePayment(params);
            }

            throw error
        }
    }

    async addUpdateContractRequisitionInvoicePayment(formData: FormData): Promise<ContractRequisitionInvoicePaymentSaveResponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                ContractRequisitionInvoicePaymentApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE Contract REQUISITION INVOICE :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateContractRequisitionInvoicePayment(formData);
            }
            throw error
        }
    }

    async deleteContractRequisitionInvoicePayment(params: DeleteContractRequisitionInvoicePayment): Promise<ContractRequisitionInvoicePaymentDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: (params.ProjectId ?? 0).toString(),
                ContractRequisitionId: (params.ContractRequisitionId ?? 0).toString(),
                ContractRequisitionPaymentId: (params.ContractRequisitionPaymentId ?? 0).toString(),
                Uniquekey: (params.UniqueKey ?? ''),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ContractRequisitionInvoicePaymentApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE Contract REQUISITION INVOICE :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteContractRequisitionInvoicePayment(params);

            }

            throw error
        }
    }

}