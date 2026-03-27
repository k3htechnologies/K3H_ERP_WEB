import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type { LitigationDashboardDatasetResponse } from '@/features/litigationDashboard/models/litigationDashboardModel'
import { LitigationDashboardApi } from '@/features/litigationDashboard/api/litigationDashboardApi'

export abstract class LitigationDashboardDatasource {

    abstract pullLitigationDashboard(ProjectId: number, signal?: AbortSignal): Promise<LitigationDashboardDatasetResponse>;
}

export class LitigationDashboardDatasourceImpl implements LitigationDashboardDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullLitigationDashboard(ProjectId: number, signal?: AbortSignal): Promise<LitigationDashboardDatasetResponse> {
        try {

            const queryParams = new URLSearchParams({
                ProjectId: ProjectId.toString()
            })

            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${LitigationDashboardApi.PULL}?${queryParams.toString()}`, { signal } )
            return response;

        } catch (error: any) {

            console.error('ERROR: PULL LITIGATION DASHBOARD :', error);

           if (error instanceof TokenExpiredException) {

                return  await this.pullLitigationDashboard(ProjectId);
            }

            throw error
        }
    }

}
