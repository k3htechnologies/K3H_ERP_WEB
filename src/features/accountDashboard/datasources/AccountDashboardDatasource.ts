import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from '@/core/config/baseClientexceptions';
import { AccountDashboardApi } from '@/features/accountDashboard/api/AccountDashboardApi';
import type { AccountDashboardDatasetResoponse } from '@/features/accountDashboard/models/AccountDashboardModel';
import type { RedevelopmentDashboardDatasetResponse } from "@/features/redevelopmentDashboard/models/RedevelopmentDashboardModel";

export abstract class AccountDashboardDatasource {

    abstract pullAccountDashboard(CompanyId: number, FinancialYear?: string, signal?: AbortSignal): Promise<AccountDashboardDatasetResoponse>;
}


export class AccountDashboardDatasourceImpl implements AccountDashboardDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullAccountDashboard(CompanyId: number, FinancialYear?: string, signal?: AbortSignal): Promise<RedevelopmentDashboardDatasetResponse> {
        try {

            const queryParams = new URLSearchParams({
                CompanyId: CompanyId.toString()
            })

            if (FinancialYear) queryParams.append('FinancialYear', FinancialYear.toString());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${AccountDashboardApi.PULL}?${queryParams.toString()}`, { signal })

            return response;

        } catch (error: any) {

            console.error('ERROR: PULL ACCOUNT DASHBOARD :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullAccountDashboard(CompanyId, FinancialYear);
            }

            throw error
        }
    }

}





