import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type { ChannelPartnerDashboardResponse } from '@/features/channelPartnerDashboard/models/ChannelPartnerDashboardModel'
import { ChannelPartnerDashboardApi } from '@/features/channelPartnerDashboard/api/ChannelPartnerDashboardApi'

export abstract class ChannelPartnerDashboardDatasource {

    abstract pullChannelPartnerDashboard(signal?: AbortSignal): Promise<ChannelPartnerDashboardResponse>;
}

export class ChannelPartnerDashboardDatasourceImpl implements ChannelPartnerDashboardDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullChannelPartnerDashboard(signal?: AbortSignal): Promise<ChannelPartnerDashboardResponse> {
        try {

            return await this.k3hHttpClient.getRequestWithAuthentication(`${ChannelPartnerDashboardApi.PULL}`, { signal } )

        } catch (error: any) {

            console.error('ERROR: PULL CHANNEL PARTNER DASHBOARD :', error);

            if (error === TokenExpiredException) {
                await this.pullChannelPartnerDashboard(signal);
            }

            throw error
        }
    }

}
