import * as E from "fp-ts/Either";

import type { Failure } from "@/core/api/FailureResponse";
import { ContractRequisitionBoqDatasourceImpl } from "@/features/contractRequisition/datasources/ContractRequisitionBoqDataSource";
import type { AddUpdateContractRequisitionBoqRequest, ContractRequisitionBoqListResponse, ContractRequisitionBoqSaveReponse, FilterWithPaginationContractRequisitionBoq } from "@/features/contractRequisition/models/ContractRequisitionBoqModel";

const ContractRequisitionBoqDatasource = new ContractRequisitionBoqDatasourceImpl();

export const contractRequisitionBoqService = {
  apiCallPullContractRequisitionBoq: async (
    params: FilterWithPaginationContractRequisitionBoq,
    options?: { signal?: AbortSignal },
  ): Promise<E.Either<Failure, ContractRequisitionBoqListResponse>> => {
    try {
      return E.right(await ContractRequisitionBoqDatasource.pullContractRequisitionBoq(params, options?.signal));
    } catch (error: any) {
      return E.left({ message: error.message, code: error.code });
    }
  },

  apiCallToAddContractRequisitionBoq: async (request: AddUpdateContractRequisitionBoqRequest): Promise<E.Either<Failure, ContractRequisitionBoqSaveReponse>> => {
    try {
      return E.right(await ContractRequisitionBoqDatasource.addUpdateContractRequisitionBoq(request));
    } catch (error: any) {
      return E.left({ message: error.message, code: error.code });
    }
  },
};
