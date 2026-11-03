import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { VisitorManagementDashboardApi } from '@/features/visitorManagementDashboard/api/visitorManagementDashboardApi'
import type { FilterVisitorManagementDashboardRequest, VisitorManagementDashboardResponse } from '@/features/visitorManagementDashboard/models/VisitorManagementDashboardModel'

export abstract class VisitorManagementDashboardDatasource {
    abstract pullVisitorManagementDashboard(params: FilterVisitorManagementDashboardRequest, signal?: AbortSignal): Promise<VisitorManagementDashboardResponse>;
}

export class VisitorManagementDashboardDatasourceImpl implements VisitorManagementDashboardDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullVisitorManagementDashboard(params: FilterVisitorManagementDashboardRequest, signal?: AbortSignal): Promise<VisitorManagementDashboardResponse> {
        try {

            const queryParams = new URLSearchParams({
                Type: params.Type,
            });

            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());

            return await this.k3hHttpClient.getRequestWithAuthentication(`${VisitorManagementDashboardApi.PULL}?${queryParams.toString()}`, { signal })

        } catch (error) {

            console.error('ERROR: PULL VISITOR MANAGEMENT DASHBOARD :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullVisitorManagementDashboard(params, signal);
            }

            throw error
        }
    }
}
