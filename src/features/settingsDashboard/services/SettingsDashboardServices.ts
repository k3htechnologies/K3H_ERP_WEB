import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { SettingsDashboardDatasourceImpl } from '@/features/settingsDashboard/datasource/SettingsDashboardDatasource';
import type { FilterWithPaginationSettingsDashboard, SettingsDashboardDatasetResponse } from '@/features/settingsDashboard/models/SettingsDashboardModel';

const settingsDashboardDatasource = new SettingsDashboardDatasourceImpl();

export const settingsDashboardService = {
    apiCallPullSettingsDashboard: async (params: FilterWithPaginationSettingsDashboard, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, SettingsDashboardDatasetResponse>> => {
        try {
            return E.right(await settingsDashboardDatasource.pullSettingsDashboard(params, options?.signal));
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    }
}