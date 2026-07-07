
import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

import { AOpAchievementReportApi } from "@/features/aopAchievement/api/AopAchievementReportApi";
import type { AOP_BookingReportListResponse, AOP_IBMOBMReportListResponse, AOP_WalkinsRevisitReportListResponse, ChannelPartnerAOPListResponse, FilterWithPaginationAopAchievementRequest, FilterWithPaginationClickAchievementRequest } from "@/features/aopAchievement/models/AopAchievementReportModel";

export abstract class AopAchievementReportDatasource {

    abstract pullAOPAchievementReport(params: FilterWithPaginationAopAchievementRequest, signal?: AbortSignal): Promise<ChannelPartnerAOPListResponse>;
    abstract pullWalkinsRevisitReport(params: FilterWithPaginationClickAchievementRequest, signal?: AbortSignal): Promise<AOP_WalkinsRevisitReportListResponse>;
    abstract pullBookingReport(params: FilterWithPaginationClickAchievementRequest, signal?: AbortSignal): Promise<AOP_BookingReportListResponse>;
    abstract pullIBMOBMReport(params: FilterWithPaginationClickAchievementRequest, signal?: AbortSignal): Promise<AOP_IBMOBMReportListResponse>;

}

export class AopAchievementReportDatasourceImpl implements AopAchievementReportDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullAOPAchievementReport(params: FilterWithPaginationAopAchievementRequest, signal?: AbortSignal): Promise<ChannelPartnerAOPListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 20),
                pageNumber: String(params.PageNumber ?? 1),
            });


            if (params.Name) queryParams.append('Name', params.Name.toString());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());
            if (params.FilterType?.trim()) queryParams.append("FilterType", params.FilterType.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(`${AOpAchievementReportApi.PULL_AOP_ACHIEVEMENT}?${queryParams.toString()}`, { signal });


        } catch (error: any) {

            console.error("ERROR: PULL AOP ACHIEVEMENT REPORT :", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullAOPAchievementReport(params);
            }
            throw error;
        }
    }

    async pullWalkinsRevisitReport(params: FilterWithPaginationClickAchievementRequest, signal?: AbortSignal): Promise<AOP_WalkinsRevisitReportListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 20),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ChannelPartnerId) queryParams.append("ChannelPartnerId", params.ChannelPartnerId.toString());
            if (params.Name) queryParams.append("Name", params.Name.toString());
            if (params.TabName) queryParams.append('TabName', params.TabName.toString());
            if (params.ColumnName) queryParams.append('ColumnName', params.ColumnName.toString());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());
            if (params.FilterType?.trim()) queryParams.append("FilterType", params.FilterType.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${AOpAchievementReportApi.PULL_AOP_ACHIEVEMENT_DRILL_DOWN_REPORT}?${queryParams.toString()}`, { signal }
            )

            return response

        } catch (error: any) {

            console.error("ERROR: PULL ACHIEVEMENT CLICK REPORT :", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullWalkinsRevisitReport(params);
            }
            throw error;
        }
    }

    async pullBookingReport(params: FilterWithPaginationClickAchievementRequest, signal?: AbortSignal): Promise<AOP_BookingReportListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 20),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ChannelPartnerId) queryParams.append("ChannelPartnerId", params.ChannelPartnerId.toString());
            if (params.Name) queryParams.append("Name", params.Name.toString());
            if (params.TabName) queryParams.append('TabName', params.TabName.toString());
            if (params.ColumnName) queryParams.append('ColumnName', params.ColumnName.toString());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());
            if (params.FilterType?.trim()) queryParams.append("FilterType", params.FilterType.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${AOpAchievementReportApi.PULL_AOP_ACHIEVEMENT_DRILL_DOWN_REPORT}?${queryParams.toString()}`, { signal }
            )

            return response

        } catch (error: any) {

            console.error("ERROR: PULL ACHIEVEMENT CLICK REPORT :", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullBookingReport(params);
            }
            throw error;
        }
    }

    async pullIBMOBMReport(params: FilterWithPaginationClickAchievementRequest, signal?: AbortSignal): Promise<AOP_IBMOBMReportListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 20),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ChannelPartnerId) queryParams.append("ChannelPartnerId", params.ChannelPartnerId.toString());
            if (params.Name) queryParams.append("Name", params.Name.toString());
            if (params.TabName) queryParams.append('TabName', params.TabName.toString());
            if (params.ColumnName) queryParams.append('ColumnName', params.ColumnName.toString());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());
            if (params.FilterType?.trim()) queryParams.append("FilterType", params.FilterType.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${AOpAchievementReportApi.PULL_AOP_ACHIEVEMENT_DRILL_DOWN_REPORT}?${queryParams.toString()}`, { signal }
            )

            return response

        } catch (error: any) {

            console.error("ERROR: PULL ACHIEVEMENT CLICK REPORT :", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullIBMOBMReport(params);
            }
            throw error;
        }
    }

}
