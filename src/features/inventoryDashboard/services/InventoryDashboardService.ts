import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { InventoryDashboardDatasourceImpl } from '@/features/inventoryDashboard/datasources/InventoryDashboardDatasource';
import type { InventoryDashboardDatasetResponse } from '@/features/inventoryDashboard/models/InventoryDashboardModel';

const inventoryDashboardDatasource = new InventoryDashboardDatasourceImpl();

export const inventoryDashboardService = {

    apiCallPullInventoryDashboard: async (ProjectId: number, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, InventoryDashboardDatasetResponse>> => {
        try {

            return E.right(await inventoryDashboardDatasource.pullInventoryDashboard(ProjectId, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }

}
