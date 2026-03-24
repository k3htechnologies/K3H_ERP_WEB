import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type { FilterWithPaginationPayrollDashboard, PayrollDashboardDatasetResponse } from '@/features/payrollDashboard/models/PayrollDashboardModel';
import { PayrollDashboardApi } from '@/features/payrollDashboard/api/payrollDashboardApi';

export abstract class PayrollDashboardDatasource {

    abstract pullPayrollDashboard(params: FilterWithPaginationPayrollDashboard, signal?: AbortSignal): Promise<PayrollDashboardDatasetResponse>;
}

export class PayrollDashboardDatasourceImpl implements PayrollDashboardDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullPayrollDashboard(params: FilterWithPaginationPayrollDashboard, signal?: AbortSignal): Promise<PayrollDashboardDatasetResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: params.PageSize.toString(),
                PageNumber: params.PageNumber.toString(),
            })

            if (params.StartDate) queryParams.append("StartDate", params.StartDate);
            if (params.EndDate) queryParams.append("EndDate", params.EndDate);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${PayrollDashboardApi.PULL}?${queryParams.toString()}`, { signal })
            return response;

        } catch (error: any) {

            console.error('ERROR: PULL PAYROLL DASHBOARD :', error);

            if (error === TokenExpiredException) {
                await this.pullPayrollDashboard(params);
            }
            throw error
        }
    }

}
