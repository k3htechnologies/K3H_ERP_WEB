import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { ContractRequisitionWorkOrderDeleteResponse, ContractRequisitionWorkOrderListResponse, ContractRequisitionWorkOrderSaveResponse, DeleteContractRequisitionWorkOrder, FilterWithPaginationContractRequisitionWorkOrder, GenerateContractRequisitionWorkOrderPdfData, GenerateContractRequisitionWorkOrderPdfSaveResponse } from "@/features/contractRequisition/models/ContractRequisitionWorkOrderModel";
import { ContractRequisitionWorkOrderApi } from "@/features/contractRequisition/api/ContractRequisitionWorkOrderApi";

export abstract class ContractRequisitionWorkOrderDatasource {
    abstract pullContractRequisitionWorkOrder(params: FilterWithPaginationContractRequisitionWorkOrder, signal?: AbortSignal): Promise<ContractRequisitionWorkOrderListResponse>;
    abstract addUpdateContractRequisitionWorkOrder(data: FormData): Promise<ContractRequisitionWorkOrderSaveResponse>;
    abstract deleteContractRequisitionWorkOrder(params: DeleteContractRequisitionWorkOrder): Promise<ContractRequisitionWorkOrderDeleteResponse>;
    abstract generateContractRequisitionWorkOrderPdf(params: GenerateContractRequisitionWorkOrderPdfData): Promise<GenerateContractRequisitionWorkOrderPdfSaveResponse>;
}

export class ContractRequisitionWorkOrderDatasourceImpl implements ContractRequisitionWorkOrderDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullContractRequisitionWorkOrder(params: FilterWithPaginationContractRequisitionWorkOrder, signal?: AbortSignal): Promise<ContractRequisitionWorkOrderListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            if (params.ContractRequisitionId) queryParams.append('ContractRequisitionId', params.ContractRequisitionId.toString());
            if (params.Uniquekey) queryParams.append('Uniquekey', params.Uniquekey);
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ContractRequisitionWorkOrderApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL Contract REQUISITION Work ORDER:', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullContractRequisitionWorkOrder(params);
            }

            throw error
        }
    }

    async addUpdateContractRequisitionWorkOrder(formData: FormData): Promise<ContractRequisitionWorkOrderSaveResponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                ContractRequisitionWorkOrderApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE Contract REQUISITION Work ORDER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateContractRequisitionWorkOrder(formData);
            }
            throw error
        }
    }

    async deleteContractRequisitionWorkOrder(params: DeleteContractRequisitionWorkOrder): Promise<ContractRequisitionWorkOrderDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ContractRequisitionWorkOrderId: (params.ContractRequisitionWorkOrderId ?? 0).toString(),
                ContractRequisitionId: (params.ContractRequisitionId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ContractRequisitionWorkOrderApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE Contract REQUISITION Work ORDER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteContractRequisitionWorkOrder(params);
            }
            throw error
        }
    }

    async generateContractRequisitionWorkOrderPdf(params: GenerateContractRequisitionWorkOrderPdfData): Promise<GenerateContractRequisitionWorkOrderPdfSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ContractRequisitionWorkOrderApi.GENERATE_WORK_ORDER_PDF,
                params
            )
            return response

        } catch (error) {

            console.error('ERROR: GENERATE Contract REQUISITION PURCHASE ORDER PDF :', error)

            if (error instanceof TokenExpiredException) {

                return await this.generateContractRequisitionWorkOrderPdf(params);
            }
            throw error
        }
    }

}