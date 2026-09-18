import baseClient from "@/core/config/baseClient";
import type { FilterWithPaginationMaterialAndVendorReport, FilterWithPaginationMaterialPurchaseReport, FilterWithPaginationMaterialRequisitionReport, FilterWithPaginationVendorWiseMaterialCountReport, MaterialAndVendorReportListResponse, MaterialPurchaseReportListResponse, MaterialRequisitionReportListResponse, VendorWiseMaterialCountReportListRespone } from "@/features/materialRequisitionReport/models/MaterialRequisitionReportModel";
import { MaterialRequisitionReportApi } from "@/features/materialRequisitionReport/api/MaterialRequisitionReportApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class MaterialRequisitionReportDataSource {
    abstract pullVendorWiseMaterialCountReport(params: FilterWithPaginationVendorWiseMaterialCountReport, signal?: AbortSignal): Promise<VendorWiseMaterialCountReportListRespone>;
    abstract pullMaterialAndVendorReport(params: FilterWithPaginationMaterialAndVendorReport, signal?: AbortSignal): Promise<MaterialAndVendorReportListResponse>;
    abstract pullMaterialRequisitionReport(params: FilterWithPaginationMaterialRequisitionReport, signal?: AbortSignal): Promise<MaterialRequisitionReportListResponse>;
    abstract pullMaterialPurchaseReport(params: FilterWithPaginationMaterialPurchaseReport, signal?: AbortSignal): Promise<MaterialPurchaseReportListResponse>
}

export class MaterialRequisitionReportDataSourceImpl implements MaterialRequisitionReportDataSource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullVendorWiseMaterialCountReport(params: FilterWithPaginationVendorWiseMaterialCountReport, signal?: AbortSignal): Promise<VendorWiseMaterialCountReportListRespone> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 20).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.VendorName) queryParams.append("VendorName", params.VendorName.trim());
            if (params.FromDate) queryParams.append("FromDate", params.FromDate.trim());
            if (params.ToDate) queryParams.append("ToDate", params.ToDate.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(

                `${MaterialRequisitionReportApi.PULL_VENDOR_WISE_MATERIAL_COUNT_REPORT}?${queryParams.toString()}`, { signal })

            return response

        } catch (error) {

            console.error("Error : PULL VENDOR WISE MATERIAL COUNT REPORT", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullVendorWiseMaterialCountReport(params, signal);
            }
            throw error
        }
    }

    async pullMaterialAndVendorReport(params: FilterWithPaginationMaterialAndVendorReport, signal?: AbortSignal): Promise<MaterialAndVendorReportListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 20).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.VendorId) queryParams.append("VendorId", params.VendorId.toString());
            if (params.MaterialName) queryParams.append("MaterialName", params.MaterialName.trim());
            if (params.SubMaterialName) queryParams.append("SubMaterialName", params.SubMaterialName.trim());
            if (params.FromDate) queryParams.append("FromDate", params.FromDate.trim());
            if (params.ToDate) queryParams.append("ToDate", params.ToDate.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(

                `${MaterialRequisitionReportApi.PULL_MATERIAL_AND_VENDOR_REPORT}?${queryParams.toString()}`, { signal })

            return response

        } catch (error) {

            console.error("Error : PULL MATERIAL AND VENDOR REPORT", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullMaterialAndVendorReport(params, signal);
            }
            throw error
        }
    }

    async pullMaterialRequisitionReport(params: FilterWithPaginationMaterialRequisitionReport, signal?: AbortSignal): Promise<MaterialRequisitionReportListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 20).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.MaterialName) queryParams.append("MaterialName", params.MaterialName.trim());
            if (params.SubMaterialName) queryParams.append("SubMaterialName", params.SubMaterialName.trim());
            if (params.FromDate) queryParams.append("FromDate", params.FromDate.trim());
            if (params.ToDate) queryParams.append("ToDate", params.ToDate.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(

                `${MaterialRequisitionReportApi.PULL_MATERIAL_REPORT}?${queryParams.toString()}`, { signal })

            return response

        } catch (error) {

            console.error("Error : PULL MATERIAL REQUISITION REPORT", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullMaterialRequisitionReport(params, signal);
            }
            throw error
        }
    }

    async pullMaterialPurchaseReport(params: FilterWithPaginationMaterialPurchaseReport, signal?: AbortSignal): Promise<MaterialPurchaseReportListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 20).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.SystemGeneratedCode) queryParams.append("SystemGeneratedCode", params.SystemGeneratedCode.trim());
            if (params.FromDate) queryParams.append("FromDate", params.FromDate.trim());
            if (params.ToDate) queryParams.append("ToDate", params.ToDate.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(

                `${MaterialRequisitionReportApi.PULL_MATERIAL_PURCHASE_REPORT}?${queryParams.toString()}`, { signal })

            return response

        } catch (error) {

            console.error("Error : PULL MATERIAL PURCHASE REPORT", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullMaterialPurchaseReport(params, signal);
            }
            throw error
        }
    }
}

