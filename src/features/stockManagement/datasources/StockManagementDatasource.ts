import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type { AddUpdateStockManagementRequest, AddUpdateStockUsage, FilterWithPaginationStockManagementHistoryRequest, FilterWithPaginationStockManagementRequest, StockManagementHistoryListResponse, StockManagementListResponse, StockManagementSaveResponse } from 'features/stockManagement/models/StockManagementModel';
import { StockManagementApi } from '@/features/stockManagement/api/StockManagementApi';

export abstract class StockManagementDatasource {

    abstract pullStockManagement(params: FilterWithPaginationStockManagementRequest, signal?: AbortSignal): Promise<StockManagementListResponse>;
    abstract pullStockManagementHistory(params: FilterWithPaginationStockManagementHistoryRequest, signal?: AbortSignal): Promise<StockManagementHistoryListResponse>;
    abstract addUpdateStockManagement(data: AddUpdateStockManagementRequest): Promise<StockManagementSaveResponse>;
}

export class StockManagementDatasourceImpl implements StockManagementDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullStockManagement(params: FilterWithPaginationStockManagementRequest, signal?: AbortSignal): Promise<StockManagementListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.MaterialName?.trim()) queryParams.append('MaterialName', params.MaterialName.trim());
            if (params.SubMaterialName?.trim()) queryParams.append('SubMaterialName', params.SubMaterialName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${StockManagementApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL STOCK MANAGEMENT :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullStockManagement(params);
            }

            throw error
        }
    }

    async pullStockManagementHistory(params: FilterWithPaginationStockManagementHistoryRequest, signal?: AbortSignal): Promise<StockManagementHistoryListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.SubMaterialMasterId) queryParams.append('SubMaterialMasterId', params.SubMaterialMasterId.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${StockManagementApi.PULL_STOCK_HISTORY}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL STOCK MANAGEMENT HISTORY :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullStockManagementHistory(params);
            }
            throw error
        }
    }
    async pullStockSummary(params: FilterWithPaginationStockManagementRequest, signal?: AbortSignal): Promise<StockManagementListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.MaterialName?.trim()) queryParams.append('MaterialName', params.MaterialName.trim());
            if (params.SubMaterialName?.trim()) queryParams.append('SubMaterialName', params.SubMaterialName.trim());
            if (params.MaterialId) queryParams.append('MaterialId', params.MaterialId.toString());
            if (params.SubMaterialId) queryParams.append('SubMaterialId', params.SubMaterialId.toString());
            if (params.MaterialMasterId) queryParams.append('MaterialMasterId', params.MaterialMasterId.toString());
            if (params.SubMaterialMasterId) queryParams.append('SubMaterialMasterId', params.SubMaterialMasterId.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${StockManagementApi.PULL_SUMMARY}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL STOCK MANAGEMENT SUMMARY :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullStockSummary(params);
            }
            throw error
        }
    }
    async addUpdateStockManagement(params: AddUpdateStockManagementRequest): Promise<StockManagementSaveResponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                StockManagementApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE STOCK MANAGEMENT :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateStockManagement(params);
            }
            throw error
        }
    }

     async addUpdateStockManagementUsage(params: AddUpdateStockUsage): Promise<StockManagementSaveResponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                StockManagementApi.ADD_UPDATE_STOCKUSAGE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE STOCK MANAGEMENT :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateStockManagementUsage(params);
            }
            throw error
        }
    }
}
