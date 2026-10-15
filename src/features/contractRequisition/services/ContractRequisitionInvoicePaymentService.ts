import * as E from 'fp-ts/Either';

import type { Failure } from "@/core/api/FailureResponse";
import { ContractRequisitionInvoicePaymentDatasourceImpl } from '@/features/contractRequisition/datasources/ContractRequisitionInvoicePaymentDataSource';
import type { ContractRequisitionInvoicePaymentDeleteResponse, ContractRequisitionInvoicePaymentListResponse, ContractRequisitionInvoicePaymentSaveResponse, DeleteContractRequisitionInvoicePayment, FilterWithPaginationContractRequisitionInvoicePayment } from '@/features/contractRequisition/models/ContractRequisitionInvoicePaymentModel';

export const ContractRequisitionInvoicePaymentDataSource = new ContractRequisitionInvoicePaymentDatasourceImpl();

export const contractRequisitionInvoicePaymentService = {

    apiCallPullContractRequisitionInvoicePayment: async (params: FilterWithPaginationContractRequisitionInvoicePayment, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ContractRequisitionInvoicePaymentListResponse>> => {

        try {

            return E.right(await ContractRequisitionInvoicePaymentDataSource.pullContractRequisitionInvoicePayment(params, options?.signal));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateContractRequisitionInvoicePayment: async (formData: FormData): Promise<E.Either<Failure, ContractRequisitionInvoicePaymentSaveResponse>> => {

        try {

            return E.right(await ContractRequisitionInvoicePaymentDataSource.addUpdateContractRequisitionInvoicePayment(formData));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteContractRequisitionInvoicePayment: async (params: DeleteContractRequisitionInvoicePayment): Promise<E.Either<Failure, ContractRequisitionInvoicePaymentDeleteResponse>> => {

        try {

            return E.right(await ContractRequisitionInvoicePaymentDataSource.deleteContractRequisitionInvoicePayment(params));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },
}

