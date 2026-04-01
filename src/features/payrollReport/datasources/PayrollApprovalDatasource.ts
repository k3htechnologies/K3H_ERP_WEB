import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type {  AddPayrollApprovalRequest, FilterWithPayrollApprovalStatus, PayrollApprovalListResponse } from '../models/PayrollApprovalModel'
import { PayrollApprovalApi } from '../api/PayrollApprovalApi'

export abstract class PayrollApprovalDatasource {

    abstract addPayrollApproval( data: AddPayrollApprovalRequest): Promise<PayrollApprovalListResponse>
}

export class PayrollApprovalDatasourceImpl implements PayrollApprovalDatasource {

    private get k3hHttpClient() {
        return baseClient
    }

    async pullApprovalStatus(params: FilterWithPayrollApprovalStatus, signal?: AbortSignal): Promise<PayrollApprovalListResponse> {
            try {
                const queryParams = new URLSearchParams({
                    Id: (params.Id).toString(),
                    ModuleName: (params.ModuleName).toString(),
                    RequestId:(params.RequestId).toString()
                })
    
                const response = await this.k3hHttpClient.getRequestWithAuthentication(
                    `${PayrollApprovalApi.PULL}?${queryParams.toString()}`, { signal }
                )
                return response;
            } catch (error: any) {
    
                console.error('ERROR: PULL APPROVAL STATUS :', error);
    
               if (error instanceof TokenExpiredException) {
                   return await this.pullApprovalStatus(params);
                }
    
                throw error
            }
    }
    
    async addPayrollApproval(data: AddPayrollApprovalRequest ): Promise<PayrollApprovalListResponse> {
    try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                PayrollApprovalApi.ADD,
                data
            )

            return response

        } catch (error) {

            console.error('Error: Add Payroll Approval:', error)

            if (error instanceof TokenExpiredException) {
               return await this.addPayrollApproval(data)
            }

            throw error
        }
    }
}