
import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {
    FilterWithPaginationAchievementRequest,
    ProjectAchievementListResponse,
    AchievementClosingListResponse,
    AchievementSourcingListResponse,
    WalkinsRevisitReportListResponse,
    FilterWithPaginationClickAchievementRequest,
    BookingReportListResponse,
    IBMOBMReportListResponse
} from "@/features/achievement/models/AchievementReportModel";

import { AchievementReportApi } from "@/features/achievement/api/AchievementReportApi";

export abstract class AchievementReportDatasource {

    abstract pullProjectAchievementReport(params: FilterWithPaginationAchievementRequest, signal?: AbortSignal): Promise<ProjectAchievementListResponse>;
    abstract pullSourcingAchievementReport(params: FilterWithPaginationAchievementRequest, signal?: AbortSignal): Promise<AchievementSourcingListResponse>;
    abstract pullClosingAchievementReport(params: FilterWithPaginationAchievementRequest, signal?: AbortSignal): Promise<AchievementClosingListResponse>;
    abstract pullWalkinsRevisitReport(params: FilterWithPaginationClickAchievementRequest, signal?: AbortSignal): Promise<WalkinsRevisitReportListResponse>;
    abstract pullBookingReport(params: FilterWithPaginationClickAchievementRequest, signal?: AbortSignal): Promise<BookingReportListResponse>;
    abstract pullIBMOBMReport(params: FilterWithPaginationClickAchievementRequest, signal?: AbortSignal): Promise<IBMOBMReportListResponse>;
}

export class AchievementReportDatasourceImpl implements AchievementReportDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullProjectAchievementReport(params: FilterWithPaginationAchievementRequest, signal?: AbortSignal): Promise<ProjectAchievementListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 20),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.ProjectName) queryParams.append("ProjectName", params.ProjectName.toString());
            if (params.EmployeeName) queryParams.append('EmployeeName', params.EmployeeName.toString());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());
            if (params.FilterType?.trim()) queryParams.append("FilterType", params.FilterType.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${AchievementReportApi.PULL_ACHIEVEMENT_BY_PROJECT}?${queryParams.toString()}`, { signal }
            )

            return response

        } catch (error: any) {

            console.error("ERROR: PULL ACHIEVEMENT PROJECT REPORT :", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullProjectAchievementReport(params);
            }
            throw error;
        }
    }

    async pullSourcingAchievementReport(params: FilterWithPaginationAchievementRequest, signal?: AbortSignal): Promise<AchievementSourcingListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 20),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.ProjectName) queryParams.append("ProjectName", params.ProjectName.toString());
            if (params.EmployeeName) queryParams.append('EmployeeName', params.EmployeeName.toString());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());
            if (params.FilterType?.trim()) queryParams.append("FilterType", params.FilterType.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${AchievementReportApi.PULL_ACHIEVEMENT_BY_SOURCING}?${queryParams.toString()}`, { signal }
            )

            return response

        } catch (error: any) {

            console.error("ERROR: PULL ACHIEVEMENT SOURCING REPORT :", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullSourcingAchievementReport(params);
            }
            throw error;
        }
    }

    async pullClosingAchievementReport(params: FilterWithPaginationAchievementRequest, signal?: AbortSignal): Promise<AchievementClosingListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 20),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.ProjectName) queryParams.append("ProjectName", params.ProjectName.toString());
            if (params.EmployeeName) queryParams.append('EmployeeName', params.EmployeeName.toString());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());
            if (params.FilterType?.trim()) queryParams.append("FilterType", params.FilterType.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${AchievementReportApi.PULL_ACHIEVEMENT_BY_CLOSING}?${queryParams.toString()}`, { signal }
            )

            return response

        } catch (error: any) {

            console.error("ERROR: PULL ACHIEVEMENT CLOSING REPORT :", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullClosingAchievementReport(params);
            }
            throw error;
        }
    }

    async pullWalkinsRevisitReport(params: FilterWithPaginationClickAchievementRequest, signal?: AbortSignal): Promise<WalkinsRevisitReportListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 20),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.EmployeeId) queryParams.append("EmployeeId", params.EmployeeId.toString());
            if (params.ProjectName) queryParams.append("ProjectName", params.ProjectName.toString());
            if (params.TabName) queryParams.append('TabName', params.TabName.toString());
            if (params.ColumnName) queryParams.append('ColumnName', params.ColumnName.toString());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());
            if (params.FilterType?.trim()) queryParams.append("FilterType", params.FilterType.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${AchievementReportApi.PULL_ACHIEVEMENT_DRILL_DOWN_REPORT}?${queryParams.toString()}`, { signal }
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

    async pullBookingReport(params: FilterWithPaginationClickAchievementRequest, signal?: AbortSignal): Promise<BookingReportListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 20),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.EmployeeId) queryParams.append("EmployeeId", params.EmployeeId.toString());
            if (params.ProjectName) queryParams.append("ProjectName", params.ProjectName.toString());
            if (params.TabName) queryParams.append('TabName', params.TabName.toString());
            if (params.ColumnName) queryParams.append('ColumnName', params.ColumnName.toString());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());
            if (params.FilterType?.trim()) queryParams.append("FilterType", params.FilterType.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${AchievementReportApi.PULL_ACHIEVEMENT_DRILL_DOWN_REPORT}?${queryParams.toString()}`, { signal }
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

    async pullIBMOBMReport(params: FilterWithPaginationClickAchievementRequest, signal?: AbortSignal): Promise<IBMOBMReportListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 20),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.EmployeeId) queryParams.append("EmployeeId", params.EmployeeId.toString());
            if (params.ProjectName) queryParams.append("ProjectName", params.ProjectName.toString());
            if (params.TabName) queryParams.append('TabName', params.TabName.toString());
            if (params.ColumnName) queryParams.append('ColumnName', params.ColumnName.toString());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());
            if (params.FilterType?.trim()) queryParams.append("FilterType", params.FilterType.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${AchievementReportApi.PULL_ACHIEVEMENT_DRILL_DOWN_REPORT}?${queryParams.toString()}`, { signal }
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
