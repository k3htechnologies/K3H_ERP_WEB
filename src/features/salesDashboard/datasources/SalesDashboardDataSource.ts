import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type { SalesDashboardDatasetResponse } from '@/features/salesDashboard/models/SalesDashboardModel';
import { SalesDashboardApi } from '../api/salesDashboardApi';

export abstract class SalesDashboardDatasource {
    abstract pullSalesDashboard(ProjectId: number, signal?: AbortSignal): Promise<SalesDashboardDatasetResponse>;
}

export class SalesDashboardDatasourceImpl implements SalesDashboardDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullSalesDashboard(ProjectId: number, signal?: AbortSignal): Promise<SalesDashboardDatasetResponse> {
        try {

            const queryParams = new URLSearchParams({
                ProjectId: ProjectId.toString()
            })
            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${SalesDashboardApi.PULL}?${queryParams.toString()}`, { signal })
            return response;

        } catch (error) {

            console.error('ERROR: PULL SALES DASHBOARD :', error);

            if (error === TokenExpiredException) {

                await this.pullSalesDashboard(ProjectId, signal);
            }

            throw error
        }
    }
}