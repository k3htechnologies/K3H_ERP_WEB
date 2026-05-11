import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { InventoryParkingOverallReportApi } from '@/features/inventoryParkingOverallReport/api/InventoryParkingOverallReportApi'
import type { FilterWithPaginationInventoryParkingOverallReportRequest, InventoryParkingOverallReportResponse, ProjectInventoryParkingDetailsResponse } from '@/features/inventoryParkingOverallReport/models/InventoryParkingOverallReportModel'

export abstract class InventoryParkingOverallReportDatasource {
    abstract pullInventoryParkingOverallReport(params: FilterWithPaginationInventoryParkingOverallReportRequest, signal?: AbortSignal): Promise<InventoryParkingOverallReportResponse>;
    abstract pullProjectInventoryParkingDetails(params: FilterWithPaginationInventoryParkingOverallReportRequest, signal?: AbortSignal): Promise<ProjectInventoryParkingDetailsResponse>;
}

export class InventoryParkingOverallReportDatasourceImpl implements InventoryParkingOverallReportDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullProjectInventoryParkingDetails(params: FilterWithPaginationInventoryParkingOverallReportRequest, signal?: AbortSignal): Promise<ProjectInventoryParkingDetailsResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 20).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.ProjectName) queryParams.append('ProjectName', params.ProjectName);
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${InventoryParkingOverallReportApi.PULL_PROJECT}?${queryParams.toString()}`, { signal })

            return response
        } catch (error) {
            console.error('Error: Pull PROJECT INVENTORY PARKING DETAILS:', error);

            if (error instanceof TokenExpiredException) {
                return await this.pullProjectInventoryParkingDetails(params, signal);
            }

            throw error
        }
    }

    async pullInventoryParkingOverallReport(params: FilterWithPaginationInventoryParkingOverallReportRequest, signal?: AbortSignal): Promise<InventoryParkingOverallReportResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 20).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.ProjectName) queryParams.append('ProjectName', params.ProjectName);
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());

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
