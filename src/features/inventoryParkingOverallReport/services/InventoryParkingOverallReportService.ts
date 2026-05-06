import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import type { FilterWithPaginationInventoryParkingOverallReportRequest, InventoryParkingOverallReportResponse } from '@/features/inventoryParkingOverallReport/models/InventoryParkingOverallReportModel'
import { InventoryParkingOverallReportDatasourceImpl } from '@/features/inventoryParkingOverallReport/datasources/InventoryParkingOverallReportDatasource';

const inventoryParkingOverallReportDatasource = new InventoryParkingOverallReportDatasourceImpl();

export const inventoryParkingOverallReportService = {

    apiCallPullInventoryParkingOverallReport: async (params: FilterWithPaginationInventoryParkingOverallReportRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, InventoryParkingOverallReportResponse>> => {
        try {
            return E.right(await inventoryParkingOverallReportDatasource.pullInventoryParkingOverallReport(params, options?.signal));
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    }

}