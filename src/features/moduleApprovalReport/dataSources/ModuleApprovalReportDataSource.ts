import baseClient from "@/core/config/baseClient";
import type { FilterWithPaginationModuleApprovalReport, ModuleApprovalReportListResponse } from "../models/ModuleApprovalReportModel";
import { ModuleApprovalReportApi } from "../api/ModuleApprovalReportApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class ModuleApprovalReportDataSource {
    abstract pullModuleApprovalReport(params: FilterWithPaginationModuleApprovalReport, signal?: AbortSignal): Promise<ModuleApprovalReportListResponse>;
}

export class ModuleApprovalReportDataSourceImpl implements ModuleApprovalReportDataSource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullModuleApprovalReport(params: FilterWithPaginationModuleApprovalReport, signal?: AbortSignal): Promise<ModuleApprovalReportListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageNumber: String(params.PageNumber ?? 10),
                PageSize: String(params.PageSize ?? 0)
            })

            if (params.ModuleApprovalReportId) queryParams.append("ModuleApprovalReportId", params.ModuleApprovalReportId.toString());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);
            if (params.SortBy) queryParams.append("SortBy", params.SortBy);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ModuleApprovalReportApi.PULL}?${queryParams}`, { signal }
            )
            return response
        } catch (error: any) {

            console.error("ERROR : PULL MODULE APPROVAL REPORT :", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullModuleApprovalReport(params);
            }
            throw error
        }
    }
}