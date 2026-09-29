import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type { TeamWorkspaceDashboardResponse } from '@/features/teamWorkspaceDashboard/models/TeamWorkspaceDashboardModel'
import { TeamWorkspaceDashboardApi } from '@/features/teamWorkspaceDashboard/api/TeamWorkspaceDashboardApi'

export abstract class TeamWorkspaceDashboardDatasource {
    abstract pullTeamWorkspaceDashboard(signal?: AbortSignal): Promise<TeamWorkspaceDashboardResponse>
}

export class TeamWorkspaceDashboardDatasourceImpl implements TeamWorkspaceDashboardDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullTeamWorkspaceDashboard(signal?: AbortSignal): Promise<TeamWorkspaceDashboardResponse> {
        try {
            return await this.k3hHttpClient.getRequestWithAuthentication(TeamWorkspaceDashboardApi.PULL, { signal })

        } catch (error: any) {
            console.error('ERROR: PULL TEAM WORKSPACE DASHBOARD :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullTeamWorkspaceDashboard(signal)
            }

            throw error
        }
    }
}
