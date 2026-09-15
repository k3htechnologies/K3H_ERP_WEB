import baseClient from "@/core/config/baseClient";
import type { FilterWithPaginationMaterialRequisitionReport, MaterialRequisitionReportListResponse } from "@/features/materialRequisitionReport/models/MaterialRequisitionReportModel";
import { MaterialRequisitionReportApi } from "@/features/materialRequisitionReport/api/MaterialRequisitionReportApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class MaterialRequisitionReportDataSource {
    abstract pullMaterialRequisitionReport(params: FilterWithPaginationMaterialRequisitionReport, signal?: AbortSignal): Promise<MaterialRequisitionReportListResponse>;
}

export class MaterialRequisitionReportDataSourceImpl implements MaterialRequisitionReportDataSource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullMaterialRequisitionReport(params: FilterWithPaginationMaterialRequisitionReport, signal?: AbortSignal): Promise<MaterialRequisitionReportListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 20).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.VendorName) queryParams.append("VendorName", params.VendorName.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(

                `${MaterialRequisitionReportApi.PULL}?${queryParams.toString()}`, { signal })

            return response

        } catch (error) {
            console.error("Error : PULL MATERIAL REQUISITION REPORT", error);

            if (error instanceof TokenExpiredException) {
                return await this.pullMaterialRequisitionReport(params, signal);
            }

            throw error
        }
    }
}

