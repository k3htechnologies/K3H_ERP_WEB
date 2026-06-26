import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { CollectionReportApi } from '@/features/collectionReport/api/CollectionReportApi'
import type { FilterWithPaginationCollectionReportRequest, FilterWithPaginationProjectWiseRequest, ProjectWiseCollectionReportResponse, CollectionReportResponse } from '@/features/collectionReport/models/CollectionReportModel'

export abstract class CollectionReportDatasource {
    abstract pullProjectWiseCollectionReport(params: FilterWithPaginationProjectWiseRequest, signal?: AbortSignal): Promise<ProjectWiseCollectionReportResponse>;
    abstract pullCollectionReport(params: FilterWithPaginationCollectionReportRequest, signal?: AbortSignal): Promise<CollectionReportResponse>;
}

export class CollectionReportDatasourceImpl implements CollectionReportDatasource {

    private get k3hHttpClient() {
        return baseClient
    }

    async pullProjectWiseCollectionReport(params: FilterWithPaginationProjectWiseRequest, signal?: AbortSignal): Promise<ProjectWiseCollectionReportResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 20).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.ProjectName) queryParams.append('ProjectName', params.ProjectName);
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());

            return await this.k3hHttpClient.getRequestWithAuthentication(`${CollectionReportApi.PULL_PROJECT_WISE}?${queryParams.toString()}`, { signal })

        } catch (error) {
            console.error('Error: PULL PROJECT WISE COLLECTION REPORT:', error);

            if (error instanceof TokenExpiredException) {
                return await this.pullProjectWiseCollectionReport(params, signal);
            }

            throw error
        }
    }


    async pullCollectionReport(params: FilterWithPaginationCollectionReportRequest, signal?: AbortSignal): Promise<CollectionReportResponse> {
        try {
            const queryParams = new URLSearchParams();

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.ProjectName) queryParams.append('ProjectName', params.ProjectName);
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(`${CollectionReportApi.PULL}?${queryParams.toString()}`, { signal })

        } catch (error) {
            
            console.error('Error: Pull COLLECTION REPORT:', error);

            if (error instanceof TokenExpiredException) {
                return await this.pullCollectionReport(params, signal);
            }

            throw error
        }
    }
}