import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { ChannelPartnerDashboardDatasourceImpl } from '@/features/channelPartnerDashboard/datasources/ChannelPartnerDashboardDatasource';
import type { ChannelPartnerDashboardResponse } from '@/features/channelPartnerDashboard/models/ChannelPartnerDashboardModel';

const ChannelPartnerDashboardDatasource = new ChannelPartnerDashboardDatasourceImpl();

export const channelPartnerDashboardService = {

    apiCallPullChannelPartnerDashboard: async (signal?: AbortSignal): Promise<E.Either<Failure, ChannelPartnerDashboardResponse>> => {
        try {

            const response = await ChannelPartnerDashboardDatasource.pullChannelPartnerDashboard(signal);
            return E.right(response);

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }

}
