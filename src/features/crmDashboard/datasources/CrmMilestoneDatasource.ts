import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type { CrmMilestoneCollectionDataResponse, CrmMilestoneSummaryResponse } from '@/features/crmDashboard/models/CrmMilestoneModel';
import { CrmDashboardApi } from '@/features/crmDashboard/api/CrmDashboardApi';

export abstract class CrmMilestoneDatasource {
    abstract pullCrmMilestoneDashboardData(ProjectId: number, FilterType?: string, FromDate?: string | null, ToDate?: string | null, ExportType?: string, signal?: AbortSignal): Promise<CrmMilestoneCollectionDataResponse>;
    abstract pullCrmMilestoneSummary(ProjectId: number, FilterType?: string, FromDate?: string | null, ToDate?: string | null, ExportType?: string, signal?: AbortSignal): Promise<CrmMilestoneSummaryResponse>;
}

export class CrmMilestoneDatasourceImpl implements CrmMilestoneDatasource {

    private get k3hHttpClient() {
        return baseClient
    }

    async pullCrmMilestoneDashboardData(ProjectId: number, FilterType?: string, FromDate?: string | null, ToDate?: string | null, ExportType?: string, signal?: AbortSignal): Promise<CrmMilestoneCollectionDataResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: ProjectId.toString(),
                FilterType: FilterType || "Month",
                FromDate: FromDate || "",
                ToDate: ToDate || "",
                ExportType: ExportType || ""
            })
            return await this.k3hHttpClient.getRequestWithAuthentication(`${CrmDashboardApi.PULL_MILESTONE_COLLECTION_NEW}?${queryParams.toString()}`, { signal })

        } catch (error: any) {

            console.error('ERROR: PULL CRM MILESTONE DASHBOARD :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullCrmMilestoneDashboardData(ProjectId, FilterType, FromDate, ToDate, ExportType, signal);
            }

            throw error
        }
    }

    async pullCrmMilestoneSummary(ProjectId: number, FilterType?: string, FromDate?: string | null, ToDate?: string | null, ExportType?: string, signal?: AbortSignal): Promise<CrmMilestoneSummaryResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: ProjectId.toString(),
                FilterType: FilterType || "Month",
                FromDate: FromDate || "",
                ToDate: ToDate || "",
                ExportType: ExportType || ""
            })
            return await this.k3hHttpClient.getRequestWithAuthentication(`${CrmDashboardApi.PULL_MILESTONE_SUMMARY}?${queryParams.toString()}`, { signal })

        } catch (error: any) {

            console.error('ERROR: PULL CRM MILESTONE SUMMARY :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullCrmMilestoneSummary(ProjectId, FilterType, FromDate, ToDate, ExportType, signal);
            }

            throw error
        }
    }
} 