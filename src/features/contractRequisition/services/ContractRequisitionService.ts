import * as E from "fp-ts/Either";

import type { Failure } from "@/core/api/FailureResponse";
import type {
  ContractRequisitionDeleteResponse, ContractRequisitionListResponse, ContractRequisitionLockAndKeyStatusResponse, ContractRequisitionSaveReponse, DeleteContractRequisitionRequest, FilterWithPaginationContractRequisition, PullProjectLockAndKeyContractStatusRequest,
} from "@/features/contractRequisition/models/ContractRequisitionModel";
import { ContractRequisitionDatasourceImpl } from "@/features/contractRequisition/datasources/ContractRequisitionDataSource";

const ContractRequisitionDatasource = new ContractRequisitionDatasourceImpl();

export const contractRequisitionService = {
  apiCallPullContractRequisition: async (
    params: FilterWithPaginationContractRequisition,
    options?: { signal?: AbortSignal },
  ): Promise<E.Either<Failure, ContractRequisitionListResponse>> => {
    try {
      return E.right(await ContractRequisitionDatasource.pullContractRequisition(params, options?.signal));
    } catch (error: any) {
      return E.left({ message: error.message, code: error.code });
    }
  },

  apiCallToAddContractRequisition: async (FormData: FormData): Promise<E.Either<Failure, ContractRequisitionSaveReponse>> => {
    try {
      return E.right(await ContractRequisitionDatasource.addUpdateContractRequisition(FormData));
    } catch (error: any) {
      return E.left({ message: error.message, code: error.code });
    }
  },

  apiCallDeleteContractRequisition: async (
    params: DeleteContractRequisitionRequest,
  ): Promise<E.Either<Failure, ContractRequisitionDeleteResponse>> => {
    try {
      return E.right(await ContractRequisitionDatasource.deleteContractRequisition(params));
    } catch (error: any) {
      return E.left({ message: error.message, code: error.code });
    }
  },
  apiCallCloseContractRequisition: async (
    payload: DeleteContractRequisitionRequest,
  ): Promise<E.Either<Failure, ContractRequisitionDeleteResponse>> => {
    try {
      return E.right(await ContractRequisitionDatasource.closeContractRequisition(payload));
    } catch (error: any) {
      return E.left({ message: error.message, code: error.code });
    }
  },
  apiCallPullProjectLockAndKeyContractStatus: async (
    payload: PullProjectLockAndKeyContractStatusRequest,
  ): Promise<E.Either<Failure, ContractRequisitionLockAndKeyStatusResponse>> => {
    try {
      return E.right(await ContractRequisitionDatasource.pullProjectLockAndKeyContractStatus(payload));
    } catch (error: any) {
      return E.left({ message: error.message, code: error.code });
    }
  }
};
