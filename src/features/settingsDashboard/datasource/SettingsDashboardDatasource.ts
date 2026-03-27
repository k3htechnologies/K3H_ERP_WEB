import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type { SettingsDashboardDatasetResponse } from '@/features/settingsDashboard/models/SettingsDashboardModel';
import { SettingsDashboardApi } from '@/features/settingsDashboard/api/settingsDashboardApi';

export abstract class SettingsDashboardDatasource {
    abstract pullSettingsDashboard(signal?: AbortSignal): Promise<SettingsDashboardDatasetResponse>;
}

export class SettingsDashboardDatasourceImpl implements SettingsDashboardDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullSettingsDashboard(signal?: AbortSignal): Promise<SettingsDashboardDatasetResponse> {
        try {

            return await this.k3hHttpClient.getRequestWithAuthentication(`${SettingsDashboardApi.PULL}`, { signal })
            
        } catch (error: any) {

            console.error('ERROR: PULL SETTINGS DASHBOARD :', error);

            if (error instanceof TokenExpiredException) {

                return  await this.pullSettingsDashboard(signal);
            }
            throw error
        }
    }

}
