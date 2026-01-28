import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { RedevelopmentDashboardApi } from '@/features/redevelopmentDashboard/api/RedevelopmentDashboardApi';
import type { RedevelopmentDashboardDataset } from '@/features/redevelopmentDashboard/models/RedevelopmentDashboardModel';

export abstract class RedevelopmentDashboardDatasource {

    abstract pullRedevelopmentDashboard(ProjectId: number, BuildingId?: number, signal?: AbortSignal): Promise<RedevelopmentDashboardDataset>;
}

export class RedevelopmentDashboardDatasourceImpl implements RedevelopmentDashboardDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullRedevelopmentDashboard(ProjectId: number, BuildingId?: number, signal?: AbortSignal): Promise<RedevelopmentDashboardDataset> {
        try {

            const queryParams = new URLSearchParams({
                ProjectId: ProjectId.toString()
            })

            if (BuildingId) queryParams.append('BuildingId', BuildingId.toString());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${RedevelopmentDashboardApi.PULL}?${queryParams.toString()}`, { signal } )

            return response;

        } catch (error: any) {

            console.error('ERROR: PULL REDEVELOPMENT DASHBOARD :', error);

            if (error === TokenExpiredException) {
                await this.pullRedevelopmentDashboard(ProjectId, BuildingId);
            }

            throw error
        }
    }

}
