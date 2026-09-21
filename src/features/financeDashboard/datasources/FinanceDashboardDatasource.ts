import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from '@/core/config/baseClientexceptions';
import { FinanceDashboardApi } from '@/features/financeDashboard/api/FinanceDashboardApi';
import type { AccountDashboardDatasetResoponse } from '@/features/accountDashboard/models/AccountDashboardModel';

export abstract class FinanceDashboardDatasource {

    abstract pullFinanceDashboard(ProjectId: number, CompanyId?: string, signal?: AbortSignal): Promise<AccountDashboardDatasetResoponse>;
}

export class FinanceDashboardDatasourceImpl implements FinanceDashboardDatasource {

    private get k3hHttpClient() {
        return baseClient
    }

    async pullFinanceDashboard(ProjectId: number, CompanyId?: string, signal?: AbortSignal): Promise<AccountDashboardDatasetResoponse> {
        try {

            const queryParams = new URLSearchParams({
                ProjectId: ProjectId.toString()
            });

            if (CompanyId) queryParams.append('CompanyId', CompanyId);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${FinanceDashboardApi.PULL}?${queryParams.toString()}`, { signal })

            return response;

        } catch (error: any) {

            console.error('ERROR: PULL FINANCE DASHBOARD :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullFinanceDashboard(ProjectId, CompanyId);
            }

            throw error
        }
    }

}




