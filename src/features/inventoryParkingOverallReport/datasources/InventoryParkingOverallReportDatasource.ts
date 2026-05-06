import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { InventoryParkingOverallReportApi } from '@/features/inventoryParkingOverallReport/api/InventoryParkingOverallReportApi'
import type { FilterWithPaginationInventoryParkingOverallReportRequest, InventoryParkingOverallReportResponse } from '@/features/inventoryParkingOverallReport/models/InventoryParkingOverallReportModel'

export abstract class InventoryParkingOverallReportDatasource {
    abstract pullInventoryParkingOverallReport(params: FilterWithPaginationInventoryParkingOverallReportRequest, signal?: AbortSignal): Promise<InventoryParkingOverallReportResponse>;
}

export class InventoryParkingOverallReportDatasourceImpl implements InventoryParkingOverallReportDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullInventoryParkingOverallReport(params: FilterWithPaginationInventoryParkingOverallReportRequest, signal?: AbortSignal): Promise<InventoryParkingOverallReportResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 20).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${InventoryParkingOverallReportApi.PULL}?${queryParams.toString()}`, { signal })

            return response
        } catch (error) {
            console.error('Error: Pull INVENTORY PARKING OVERALL REPORT:', error);

            if (error instanceof TokenExpiredException) {
                return await this.pullInventoryParkingOverallReport(params, signal);
            }

            throw error
        }
    }
}
