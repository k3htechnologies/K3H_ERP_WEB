import type { Failure } from '@/core/api/FailureResponse'
import * as E from 'fp-ts/Either'
import { TeamWorkspaceDashboardDatasourceImpl } from '@/features/teamWorkspaceDashboard/datasources/TeamWorkspaceDashboardDatasource'
import type { TeamWorkspaceDashboardResponse } from '@/features/teamWorkspaceDashboard/models/TeamWorkspaceDashboardModel'

const teamWorkspaceDashboardDatasource = new TeamWorkspaceDashboardDatasourceImpl()

export const teamWorkspaceDashboardService = {
    apiCallPullTeamWorkspaceDashboard: async (options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TeamWorkspaceDashboardResponse>> => {
        try {
            return E.right(
                await teamWorkspaceDashboardDatasource.pullTeamWorkspaceDashboard(options?.signal),
            )
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },
}
