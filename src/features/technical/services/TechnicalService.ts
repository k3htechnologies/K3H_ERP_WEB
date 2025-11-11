import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { TechnicalDatasourceImpl } from '@/features/technical/datasources/TechnicalDatasource';
import type { FilterRefreshTokenRequest, FilterWithPaginationNotificationRequest, NotificationListResponse, TechnicalListResponse } from '@/features/technical/models/TechnicalModel';
import type { ApiResponse } from '@/core/api/ApiResponse';

const technicalDatasource = new TechnicalDatasourceImpl();

export const technicalService = {

    apiCallGetEnvironment: async (): Promise<E.Either<Failure, TechnicalListResponse>> => {
        try {

            return E.right(await technicalDatasource.getEnvironment());

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullNotification: async (params: FilterWithPaginationNotificationRequest): Promise<E.Either<Failure, NotificationListResponse>> => {
        try {

            return E.right(await technicalDatasource.pullNotification(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallRefreshToken: async (params: FilterRefreshTokenRequest): Promise<E.Either<Failure, ApiResponse<string>>> => {
        try {

            return E.right(await technicalDatasource.refreshToken(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
