import * as E from 'fp-ts/Either';

import type { Failure } from "@/core/api/FailureResponse";
import type {
    DeleteContractRequisitionInvoice, FilterWithPaginationContractRequisitionInvoice, FilterWithPaginationContractRequisitionInvoiceSummary, ContractRequisitionInvoiceDeleteResponse, ContractRequisitionInvoiceListResponse, ContractRequisitionInvoiceSaveResponse, ContractRequisitionInvoiceSummaryListResponse
} from "@/features/contractRequisition/models/ContractRequisitionInvoiceModel";
import { ContractRequisitionInvoiceDatasourceImpl } from "@/features/contractRequisition/datasources/ContractRequisitionInvoiceDataSource";

export const ContractRequisitionInvoiceDataSource = new ContractRequisitionInvoiceDatasourceImpl();

export const contractRequisitionInvoiceService = {

    apiCallPullContractRequisitionInvoice: async (params: FilterWithPaginationContractRequisitionInvoice, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ContractRequisitionInvoiceListResponse>> => {

        try {

            return E.right(await ContractRequisitionInvoiceDataSource.pullContractRequisitionInvoice(params, options?.signal));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateContractRequisitionInvoice: async (formData: FormData): Promise<E.Either<Failure, ContractRequisitionInvoiceSaveResponse>> => {

        try {

            return E.right(await ContractRequisitionInvoiceDataSource.addUpdateContractRequisitionInvoice(formData));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteContractRequisitionInvoice: async (params: DeleteContractRequisitionInvoice): Promise<E.Either<Failure, ContractRequisitionInvoiceDeleteResponse>> => {

        try {

            return E.right(await ContractRequisitionInvoiceDataSource.deleteContractRequisitionInvoice(params));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullContractRequisitionInvoiceSummary: async (params: FilterWithPaginationContractRequisitionInvoiceSummary, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ContractRequisitionInvoiceSummaryListResponse>> => {

        try {

            return E.right(await ContractRequisitionInvoiceDataSource.pullContractRequisitionInvoiceSummary(params, options?.signal));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}

