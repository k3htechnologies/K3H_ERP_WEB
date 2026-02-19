import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { SettingsDashboardDatasourceImpl } from '@/features/settingsDashboard/datasource/SettingsDashboardDatasource';
import type { SettingsDashboardDatasetResponse } from '@/features/settingsDashboard/models/SettingsDashboardModel';

const settingsDashboardDatasource = new SettingsDashboardDatasourceImpl();

export const settingsDashboardService = {
    apiCallPullSettingsDashboard: async (signal?: AbortSignal): Promise<E.Either<Failure, SettingsDashboardDatasetResponse>> => {
        try {
            const response = await settingsDashboardDatasource.pullSettingsDashboard(signal);
            return E.right(response);
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    }
}