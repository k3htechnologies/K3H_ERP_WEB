import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type { EnquiryOutTimeSaveResponse, SalesDashboardDatasetResponse, UpdateEnquiryOutTimeRequest } from '@/features/salesDashboard/models/SalesDashboardModel';
import { SalesDashboardApi } from '@/features/salesDashboard/api/salesDashboardApi';

export abstract class SalesDashboardDatasource {
    abstract pullSalesDashboard(ProjectId: number, signal?: AbortSignal): Promise<SalesDashboardDatasetResponse>;
    abstract UpadateEnquiryOutTime(data: UpdateEnquiryOutTimeRequest): Promise<EnquiryOutTimeSaveResponse>;
}

export class SalesDashboardDatasourceImpl implements SalesDashboardDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullSalesDashboard(ProjectId: number, signal?: AbortSignal): Promise<SalesDashboardDatasetResponse> {
        try {

            const queryParams = new URLSearchParams({
                ProjectId: ProjectId.toString()
            })
            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${SalesDashboardApi.PULL}?${queryParams.toString()}`, { signal })
            return response;

        } catch (error) {

            console.error('ERROR: PULL SALES DASHBOARD :', error);

            if (error === TokenExpiredException) {

                await this.pullSalesDashboard(ProjectId, signal);
            }

            throw error
        }
    }

    async UpadateEnquiryOutTime(params: UpdateEnquiryOutTimeRequest): Promise<EnquiryOutTimeSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                SalesDashboardApi.UPDATE_ENQUIRY_OUT_TIME,
                params
            )
            return response

        } catch (error) {

            console.error('ERROR: MARK TIME OUT :', error)

            if (error === TokenExpiredException) {
                await this.UpadateEnquiryOutTime(params);
            }
            throw error
        }
    }
}