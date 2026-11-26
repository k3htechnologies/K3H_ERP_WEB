import * as E from 'fp-ts/Either';

import type { Failure } from "@/core/api/FailureResponse";
import type { ContractMasterListResponse, FilterWithPaginationContractMaster } from '@/features/contractMaster/models/ContractMasterModel';
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

}