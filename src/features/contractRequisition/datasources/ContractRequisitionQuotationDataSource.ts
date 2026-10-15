import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { ContractRequisitionQuotationListResponse, ContractRequisitionQuotationSaveReponse, ContractRequisitionSummaryOfQuotationListResponse, DeleteContractRequisitionQuotation, FilterWithContractRequisitionQuotationRequest, FilterWithContractRequisitionSummaryOfQuotationRequest } from "@/features/contractRequisition/models/ContractRequisitionQuotationModel";
import { ContractRequisitionQuotationApi } from "@/features/contractRequisition/api/ContractRequisitionQuotationApi";

export abstract class ContractRequisitionQuotationDatasource {
    abstract pullContractRequisitionQuotation(params: FilterWithContractRequisitionQuotationRequest, signal?: AbortSignal): Promise<ContractRequisitionQuotationListResponse>;
    abstract addUpdateContractRequisitionQuotation(FormData: FormData): Promise<ContractRequisitionQuotationSaveReponse>;
    abstract deleteContractRequisitionQuotation(params: DeleteContractRequisitionQuotation): Promise<DeleteContractRequisitionQuotation>;
    abstract pullContractRequisitionSummaryOfQuotation(params: FilterWithContractRequisitionSummaryOfQuotationRequest, signal?: AbortSignal): Promise<ContractRequisitionSummaryOfQuotationListResponse>;
}

export class ContractRequisitionQuotationDatasourceImpl implements ContractRequisitionQuotationDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullContractRequisitionQuotation(params: FilterWithContractRequisitionQuotationRequest, signal?: AbortSignal): Promise<ContractRequisitionQuotationListResponse> {
        try {
            const queryParams = new URLSearchParams({
                ContractRequisitionId: (params.ContractRequisitionId ?? 0).toString()
            })

            if (params.ContractRequisitionId) queryParams.append('ContractRequisitionId', params.ContractRequisitionId.toString());
            if (params.ProjectId) queryParams.append('ProjectId', (params.ProjectId).toString());
            if (params.UniqueKey?.trim()) queryParams.append('Uniquekey', params.UniqueKey.trim());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ContractRequisitionQuotationApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;

        } catch (error: any) {

            console.error('ERROR: PULL Contract REQUISITION QUOTATION :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullContractRequisitionQuotation(params);
            }

            throw error
        }
    }

    async addUpdateContractRequisitionQuotation(FormData: FormData): Promise<ContractRequisitionQuotationSaveReponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                ContractRequisitionQuotationApi.ADD_UPDATE,
                FormData
            )

            return response;

        } catch (error) {

            console.error('ERROR: ADD  Contract REQUISITION  QUOTATION:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateContractRequisitionQuotation(FormData);
            }
            throw error
        }
    }

    async deleteContractRequisitionQuotation(params: DeleteContractRequisitionQuotation): Promise<DeleteContractRequisitionQuotation> {
        try {
            const queryParams = new URLSearchParams({
                ContractRequisitionQuotationTermsId: (params.ContractRequisitionQuotationTermsId ?? 0).toString(),
                ContractRequisitionId: (params.ContractRequisitionId ?? 0).toString(),
                Uniquekey: params.UniqueKey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ContractRequisitionQuotationApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE Contract REQUISITION :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteContractRequisitionQuotation(params);

            }
            throw error
        }
    }

    async pullContractRequisitionSummaryOfQuotation(params: FilterWithContractRequisitionSummaryOfQuotationRequest, signal?: AbortSignal): Promise<ContractRequisitionSummaryOfQuotationListResponse> {

        try {
            const queryParams = new URLSearchParams({
                ContractRequisitionId: (params.ContractRequisitionId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString()
            })


            return await this.k3hHttpClient.getRequestWithAuthentication(`${ContractRequisitionQuotationApi.PULL_SUMMARY_OF_QUITATION}?${queryParams.toString()}`, { signal })


        } catch (error: any) {

            console.error('ERROR: PULL Contract REQUISITION SUMMARY OF QUOTATION :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullContractRequisitionSummaryOfQuotation(params);
            }

            throw error
        }
    }
}