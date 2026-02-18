import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type { UserDashboardDatasetResponse } from '@/features/dashboard/models/UserDashboardModel';
import { UserDashboardApi } from '../api/userDashboardApi';


export abstract class UserDashboardDatasource {
    abstract pullUserDashboard(signal?: AbortSignal): Promise<UserDashboardDatasetResponse>;
}

export class UserDashboardDatasourceImpl implements UserDashboardDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullUserDashboard(signal?: AbortSignal): Promise<UserDashboardDatasetResponse> {
        try {
            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                UserDashboardApi.PULL,
                { signal }
            )
            console.log('SUCCESS: PULL USER DASHBOARD :', response);
            return response;
        } catch (error: any) {
            console.error('ERROR: PULL USER DASHBOARD :', error);
            if (error === TokenExpiredException) {
                await this.pullUserDashboard(signal);
            }
            throw error
        }
    }
}
