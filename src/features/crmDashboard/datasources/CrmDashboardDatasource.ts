import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type { CrmDashboardResponse,CrmMilestoneCollectionResponse } from '@/features/crmDashboard/models/CrmDashboardModel'
import { CrmDashboardApi } from '@/features/crmDashboard/api/CrmDashboardApi'

export abstract class CrmDashboardDatasource {

    abstract pullCrmDashboard(ProjectId: number, FilterType?: string, FromDate?: string, ToDate?: string, signal?: AbortSignal): Promise<CrmDashboardResponse>;
    abstract pullCrmMilestoneCollection(ProjectId: number, FilterType?: string, FromDate?: string, ToDate?: string, ExportType?: string,signal?: AbortSignal): Promise<CrmMilestoneCollectionResponse>;
}

export class CrmDashboardDatasourceImpl implements CrmDashboardDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullCrmDashboard(ProjectId: number, FilterType?: string, FromDate?: string | null, ToDate?: string | null, signal?: AbortSignal): Promise<CrmDashboardResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: ProjectId.toString(),
                FilterType: FilterType || "Month",
                FromDate: FromDate || "",
                ToDate: ToDate || ""
            })
            return await this.k3hHttpClient.getRequestWithAuthentication(`${CrmDashboardApi.PULL}?${queryParams.toString()}`, { signal })

        } catch (error: any) {

            console.error('ERROR: PULL CRM DASHBOARD :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullCrmDashboard(ProjectId, FilterType, FromDate, ToDate, signal);
            }

            throw error
        }
    }

    async pullCrmMilestoneCollection(ProjectId: number, FilterType?: string, FromDate?: string | null, ToDate?: string | null,ExportType?: string, signal?: AbortSignal): Promise<CrmMilestoneCollectionResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: ProjectId.toString(),
                FilterType: FilterType || "Month",
                FromDate: FromDate || "",
                ToDate: ToDate || "",
                ExportType:ExportType|| ""
            })
            return await this.k3hHttpClient.getRequestWithAuthentication(`${CrmDashboardApi.PULL_CRM_MILESTONE_COLLECTION}?${queryParams.toString()}`, { signal })

        } catch (error: any) {

            console.error('ERROR: PULL CRM DASHBOARD :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullCrmMilestoneCollection(ProjectId, FilterType, FromDate, ToDate,ExportType, signal);
            }

            throw error
        }
    }

}
