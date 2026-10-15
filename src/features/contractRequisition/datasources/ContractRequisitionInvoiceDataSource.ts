import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { DeleteContractRequisitionInvoice, FilterWithPaginationContractRequisitionInvoice, FilterWithPaginationContractRequisitionInvoiceSummary, ContractRequisitionInvoiceDeleteResponse, ContractRequisitionInvoiceListResponse, ContractRequisitionInvoiceSaveResponse, ContractRequisitionInvoiceSummaryListResponse } from "@/features/contractRequisition/models/ContractRequisitionInvoiceModel";
import { ContractRequisitionInvoiceApi } from "@/features/contractRequisition/api/ContractRequisitionInvoiceApi";

export abstract class ContractRequisitionInvoiceDatasource {
    abstract pullContractRequisitionInvoice(params: FilterWithPaginationContractRequisitionInvoice, signal?: AbortSignal): Promise<ContractRequisitionInvoiceListResponse>;
    abstract addUpdateContractRequisitionInvoice(data: FormData): Promise<ContractRequisitionInvoiceSaveResponse>;
    abstract deleteContractRequisitionInvoice(params: DeleteContractRequisitionInvoice): Promise<ContractRequisitionInvoiceDeleteResponse>;
    abstract pullContractRequisitionInvoiceSummary(params: FilterWithPaginationContractRequisitionInvoiceSummary, signal?: AbortSignal): Promise<ContractRequisitionInvoiceSummaryListResponse>;
}

export class ContractRequisitionInvoiceDatasourceImpl implements ContractRequisitionInvoiceDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullContractRequisitionInvoice(params: FilterWithPaginationContractRequisitionInvoice, signal?: AbortSignal): Promise<ContractRequisitionInvoiceListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            if (params.ContractRequisitionId) queryParams.append('ContractRequisitionId', params.ContractRequisitionId.toString());
            if (params.UniqueKey) queryParams.append('Uniquekey', params.UniqueKey);
            if (params.ContractRequisitionInvoiceId) queryParams.append('ContractRequisitionInvoiceId', params.ContractRequisitionInvoiceId.toString());
            if (params.ContractRequisitionWorkOrderId) queryParams.append('ContractRequisitionWorkOrderId', params.ContractRequisitionWorkOrderId.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ContractRequisitionInvoiceApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL Contract REQUISITION INVOICE:', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullContractRequisitionInvoice(params);
            }

            throw error
        }
    }

    async addUpdateContractRequisitionInvoice(formData: FormData): Promise<ContractRequisitionInvoiceSaveResponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                ContractRequisitionInvoiceApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE Contract REQUISITION INVOICE :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateContractRequisitionInvoice(formData);
            }
            throw error
        }
    }

    async deleteContractRequisitionInvoice(params: DeleteContractRequisitionInvoice): Promise<ContractRequisitionInvoiceDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ContractRequisitionInvoiceId: (params.ContractRequisitionInvoiceId ?? 0).toString(),
                ContractRequisitionId: (params.ContractRequisitionId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                Uniquekey: (params.UniqueKey ?? ''),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ContractRequisitionInvoiceApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE Contract REQUISITION INVOICE :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteContractRequisitionInvoice(params);

            }

            throw error
        }
    }

    async pullContractRequisitionInvoiceSummary(params: FilterWithPaginationContractRequisitionInvoiceSummary, signal?: AbortSignal): Promise<ContractRequisitionInvoiceSummaryListResponse> {
        try {
            const queryParams = new URLSearchParams({
                ContractRequisitionId: (params.ContractRequisitionId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ContractRequisitionInvoiceApi.PULL_INVOICE_SUMMARY}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL Contract REQUISITION INVOICE SUMMARY :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullContractRequisitionInvoiceSummary(params);
            }

            throw error
        }
    }
}