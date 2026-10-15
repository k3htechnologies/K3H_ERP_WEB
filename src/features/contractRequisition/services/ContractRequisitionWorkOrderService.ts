import * as E from 'fp-ts/Either';

import type { Failure } from "@/core/api/FailureResponse";
import type { ContractRequisitionWorkOrderDeleteResponse, ContractRequisitionWorkOrderListResponse, ContractRequisitionWorkOrderSaveResponse, DeleteContractRequisitionWorkOrder, FilterWithPaginationContractRequisitionWorkOrder, GenerateContractRequisitionWorkOrderPdfData, GenerateContractRequisitionWorkOrderPdfSaveResponse } from "@/features/contractRequisition/models/ContractRequisitionWorkOrderModel";
import { ContractRequisitionWorkOrderDatasourceImpl } from '@/features/contractRequisition/datasources/ContractRequisitionWorkOrderDataSource';

export const ContractRequisitionWorkOrderDataSource = new ContractRequisitionWorkOrderDatasourceImpl();

export const contractRequisitionWorkOrderService = {

    apiCallPullContractRequisitionWorkOrder: async (params: FilterWithPaginationContractRequisitionWorkOrder, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ContractRequisitionWorkOrderListResponse>> => {

        try {

            return E.right(await ContractRequisitionWorkOrderDataSource.pullContractRequisitionWorkOrder(params, options?.signal));
            
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateContractRequisitionWorkOrder: async (formData: FormData): Promise<E.Either<Failure, ContractRequisitionWorkOrderSaveResponse>> => {

        try {

            return E.right(await ContractRequisitionWorkOrderDataSource.addUpdateContractRequisitionWorkOrder(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteContractRequisitionWorkOrder: async (params: DeleteContractRequisitionWorkOrder): Promise<E.Either<Failure, ContractRequisitionWorkOrderDeleteResponse>> => {

        try {

            return E.right(await ContractRequisitionWorkOrderDataSource.deleteContractRequisitionWorkOrder(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallGenerateContractRequisitionWorkOrderPdf: async (params: GenerateContractRequisitionWorkOrderPdfData): Promise<E.Either<Failure, GenerateContractRequisitionWorkOrderPdfSaveResponse>> => {

        try {

            return E.right(await ContractRequisitionWorkOrderDataSource.generateContractRequisitionWorkOrderPdf(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },
}
