import * as E from 'fp-ts/Either';

import type { Failure } from "@/core/api/FailureResponse";
import { ContractRequisitionQuotationDatasourceImpl } from '@/features/contractRequisition/datasources/ContractRequisitionQuotationDataSource';
import type { ContractRequisitionQuotationListResponse, ContractRequisitionQuotationSaveReponse, ContractRequisitionSummaryOfQuotationListResponse, DeleteContractRequisitionQuotation, FilterWithContractRequisitionQuotationRequest, FilterWithContractRequisitionSummaryOfQuotationRequest } from '@/features/contractRequisition/models/ContractRequisitionQuotationModel';

const contractRequisitionQuotationDatasource = new ContractRequisitionQuotationDatasourceImpl

export const contractRequisitionQuotationService = {

    apiCallPullContractRequisitionQuotation: async (params: FilterWithContractRequisitionQuotationRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ContractRequisitionQuotationListResponse>> => {
        try {

            return E.right(await contractRequisitionQuotationDatasource.pullContractRequisitionQuotation(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallToAddContractRequisitionQuotation: async (FormData: FormData): Promise<E.Either<Failure, ContractRequisitionQuotationSaveReponse>> => {
        try {

            return E.right(await contractRequisitionQuotationDatasource.addUpdateContractRequisitionQuotation(FormData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteContractRequisitionQuotation: async (params: DeleteContractRequisitionQuotation): Promise<E.Either<Failure, DeleteContractRequisitionQuotation>> => {
        try {

            return E.right(await contractRequisitionQuotationDatasource.deleteContractRequisitionQuotation(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }

    },

    apiCallPullContractRequisitionSummaryOfQuotation: async (params: FilterWithContractRequisitionSummaryOfQuotationRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ContractRequisitionSummaryOfQuotationListResponse>> => {
        try {

            return E.right(await contractRequisitionQuotationDatasource.pullContractRequisitionSummaryOfQuotation(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}