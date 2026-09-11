import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type { FilterHireSpaceDashboardRequest, HireSpaceDashboardResponse } from '@/features/hireSpaceDashboard/models/HireSpaceDashboardModel'
import { HireSpaceDashboardApi } from '@/features/hireSpaceDashboard/api/HireSpaceDashboardApi'

export abstract class HireSpaceDashboardDatasource {

    abstract pullHireSpaceDashboard(params: FilterHireSpaceDashboardRequest, signal?: AbortSignal): Promise<HireSpaceDashboardResponse>;
}

export class HireSpaceDashboardDatasourceImpl implements HireSpaceDashboardDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullHireSpaceDashboard(params: FilterHireSpaceDashboardRequest, signal?: AbortSignal): Promise<HireSpaceDashboardResponse> {
        try {

            const queryParams = new URLSearchParams()

            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${HireSpaceDashboardApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;

        } catch (error: any) {

            console.error('ERROR: PULL HIRE SPACE DASHBOARD :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullHireSpaceDashboard(params, signal);
            }

            throw error
        }
    }

}
