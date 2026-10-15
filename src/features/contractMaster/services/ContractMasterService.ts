import * as E from 'fp-ts/Either';

import type { Failure } from "@/core/api/FailureResponse";
import type { AddUpdateContractMasterRequest, ContractMasterDeleteResponse, ContractMasterListResponse, ContractMasterSaveReponse, DeleteContractMasterRequest, FilterWithPaginationContractMaster } from '@/features/contractMaster/models/ContractMasterModel';
import { ContractMasterDatasourceImpl } from '@/features/contractMaster/datasources/ContractMasterDatasource';


const contractMasterDatasource = new ContractMasterDatasourceImpl

export const contractMasterService = {


  apiCallPullContractMaster: async (params: FilterWithPaginationContractMaster, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ContractMasterListResponse>> => {
    try {

      return E.right(await contractMasterDatasource.pullContractMaster(params, options?.signal));

    } catch (error: any) {

      return E.left({ message: error.message, code: error.code });

    }
  },

  apiCallToAddUpdateContractMaster: async (params: AddUpdateContractMasterRequest): Promise<E.Either<Failure, ContractMasterSaveReponse>> => {
    try {

      return E.right(await contractMasterDatasource.addUpdateContractMaster(params));

    } catch (error: any) {

      return E.left({ message: error.message, code: error.code });

    }
  },

  apiCallDeleteContractMaster: async (params: DeleteContractMasterRequest): Promise<E.Either<Failure, ContractMasterDeleteResponse>> => {
    try {

      return E.right(await contractMasterDatasource.deleteContractMaster(params));

    } catch (error: any) {

      return E.left({ message: error.message, code: error.code });

    }
  },
}