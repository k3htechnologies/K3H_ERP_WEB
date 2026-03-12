import type { Failure } from '@/core/api/FailureResponse'
import type {
    AddPayrollApprovalRequest,
  FilterWithPayrollApprovalStatus,
  PayrollApprovalListResponse,
  
} from '@/features/payrollReport/models/PayrollApprovalModel'

import * as E from 'fp-ts/Either'
import { PayrollApprovalDatasourceImpl } from '../datasources/PayrollApprovalDatasource'

const payrollApprovalDatasource = new PayrollApprovalDatasourceImpl()

export const payrollApprovalService = {

  apiCallPullApprovalStatus: async (params: FilterWithPayrollApprovalStatus, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PayrollApprovalListResponse>> => {
          
          try {
              return E.right(await payrollApprovalDatasource.pullApprovalStatus(params, options?.signal));
  
          } catch (error: any) {
  
              return E.left({ message: error.message, code: error.code });
  
          }
  },
      

  apiCallAddPayrollApproval: async ( params: AddPayrollApprovalRequest): Promise<E.Either<Failure, PayrollApprovalListResponse>> => {
   try {

      return E.right(await payrollApprovalDatasource.addPayrollApproval(params))

   }
   catch (error: any) {

      return E.left({ message: error.message, code: error.code})

    }
  }     
}