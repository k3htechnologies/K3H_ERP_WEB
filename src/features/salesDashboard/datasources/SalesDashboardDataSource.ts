import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type { EnquiryOutTimeSaveResponse, SalesDashboardDatasetResponse, UpdateEnquiryOutTimeRequest } from '@/features/salesDashboard/models/SalesDashboardModel';
import { SalesDashboardApi } from '@/features/salesDashboard/api/salesDashboardApi';
import type { ProjectWiseSalesDashboardDatasetResponse } from '../models/ProjectWiseSalesDashboardModel';

export abstract class SalesDashboardDatasource {
    abstract pullSalesDashboard(ProjectId: number, FilterType?: string, FromDate?: string, ToDate?: string, signal?: AbortSignal): Promise<SalesDashboardDatasetResponse>;
    abstract UpadateEnquiryOutTime(data: UpdateEnquiryOutTimeRequest): Promise<EnquiryOutTimeSaveResponse>;
    abstract pullProjectWiseSalesDashboard(ProjectId: number, FilterType?: string, FromDate?: string, ToDate?: string, signal?: AbortSignal): Promise<ProjectWiseSalesDashboardDatasetResponse>;
}

export class SalesDashboardDatasourceImpl implements SalesDashboardDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullSalesDashboard(ProjectId: number,FilterType?: string, FromDate?: string, ToDate?: string, signal?: AbortSignal): Promise<SalesDashboardDatasetResponse> {
        try {

            const queryParams = new URLSearchParams({
                ProjectId: ProjectId.toString() ?? "0",
                FilterType: FilterType ?? "",
                FromDate: FromDate ?? "",
                ToDate: ToDate ?? "",
            });


            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${SalesDashboardApi.PULL}?${queryParams.toString()}`, { signal })
            return response;

        } catch (error) {

            console.error('ERROR: PULL SALES DASHBOARD :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullSalesDashboard(ProjectId, FilterType, FromDate, ToDate, signal);
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

            if (error instanceof TokenExpiredException) {

                return await this.UpadateEnquiryOutTime(params);
            }
            throw error
        }
    }

    async pullProjectWiseSalesDashboard(ProjectId: number,FilterType?: string, FromDate?: string, ToDate?: string, signal?: AbortSignal): Promise<ProjectWiseSalesDashboardDatasetResponse> {
        try {

            const queryParams = new URLSearchParams({
                ProjectId: ProjectId.toString() ?? "0",
                FilterType: FilterType ?? "",
                FromDate: FromDate ?? "",
                ToDate: ToDate ?? "",
            });


            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${SalesDashboardApi.PULL_PROJECT_WISE_SALES_DASHBOARD}?${queryParams.toString()}`, { signal })
            return response;

        } catch (error) {

            console.error('ERROR: PULL PROJECT WISE SALES DASHBOARD :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullProjectWiseSalesDashboard(ProjectId, FilterType, FromDate, ToDate, signal);
            }

            throw error
        }
    }
}