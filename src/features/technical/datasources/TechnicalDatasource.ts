import baseClient from '@/core/config/baseClient'
import { TechnicalApi } from '@/features/technical/api/TechnicalApi'
import type { FilterWithPaginationNotificationRequest, NotificationListResponse, TechnicalListResponse } from '@/features/technical/models/TechnicalModel'

export abstract class TechnicalDatasource {

    abstract getEnvironment(): Promise<TechnicalListResponse>;
    abstract pullNotification(params: FilterWithPaginationNotificationRequest): Promise<NotificationListResponse>;
}

export class TechnicalDatasourceImpl implements TechnicalDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async getEnvironment(): Promise<TechnicalListResponse> {
        try {

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TechnicalApi.GETENVIRONMENT}`);

            return response;

        } catch (error) {

            console.error('Error: GET ENVIRONMENT :', error);
            throw error
        }
    }

    async pullNotification(params: FilterWithPaginationNotificationRequest): Promise<NotificationListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 20).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TechnicalApi.PULL_NOTIFICATION}?${queryParams.toString()}`
            )

            return response;
        } catch (error) {

            console.error('ERROR: PULL NOTIFICATION :', error);
            throw error
        }
    }
}
