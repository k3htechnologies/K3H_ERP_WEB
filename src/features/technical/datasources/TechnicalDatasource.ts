import type { ApiResponse } from '@/core/api/ApiResponse';
import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions';
import { TechnicalApi } from '@/features/technical/api/TechnicalApi'
import type { FilterRefreshTokenRequest, FilterWithPaginationNotificationRequest, NotificationListResponse, TechnicalListResponse } from '@/features/technical/models/TechnicalModel'

export abstract class TechnicalDatasource {

    abstract getEnvironment(): Promise<TechnicalListResponse>;
    abstract pullNotification(params: FilterWithPaginationNotificationRequest): Promise<NotificationListResponse>;
    abstract refreshToken(params: FilterRefreshTokenRequest): Promise<ApiResponse<string>>;
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

            if (error === TokenExpiredException) {

            await this.pullNotification(params);
            }

            throw error
        }
    }

    async refreshToken(params: FilterRefreshTokenRequest): Promise<ApiResponse<string>> {
        try {
            const queryParams = new URLSearchParams({
                Uniquekey: (params.Uniquekey ?? '').toString()
            })

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TechnicalApi.REFRESH_TOKEN}?${queryParams.toString()}`
            )

            return response;
        } catch (error) {
            console.error('ERROR: REFRESH TOKEN :', error);
            throw error
        }
    }
}
