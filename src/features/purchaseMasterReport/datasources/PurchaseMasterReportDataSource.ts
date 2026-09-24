import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { PurchaseMasterReportApi } from "@/features/purchaseMasterReport/api/PurchaseMasterReportApi";
import type { FilterWithPaginationPurchaseMasterReport, PurchaseMasterReportListResponse } from "@/features/purchaseMasterReport/models/PurchaseMasterReportModel";

export abstract class PurchaseMasterReportDatasource {
    abstract pullPurchaseMasterReport(params: FilterWithPaginationPurchaseMasterReport, signal?: AbortSignal): Promise<PurchaseMasterReportListResponse>;
    
}

export class PurchaseMasterReportDatasourceImpl implements PurchaseMasterReportDatasource {
    
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullPurchaseMasterReport(params: FilterWithPaginationPurchaseMasterReport, signal?: AbortSignal): Promise<PurchaseMasterReportListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            if (params.MaterialRequisitionId) queryParams.append('MaterialRequisitionId', params.MaterialRequisitionId.toString());
            if (params.SystemGeneratedCode?.trim()) queryParams.append('SystemGeneratedCode', params.SystemGeneratedCode.trim());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate);
            if (params.ToDate) queryParams.append('ToDate', params.ToDate);
            if (params.ProjectName?.trim()) queryParams.append('ProjectName', params.ProjectName.trim());
            if (params.VendorName?.trim()) queryParams.append('VendorName', params.VendorName.trim());
            if (params.MaterialName?.trim()) queryParams.append('MaterialName', params.MaterialName.trim());
            if (params.SubMaterialName?.trim()) queryParams.append('SubMaterialName', params.SubMaterialName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(`${PurchaseMasterReportApi.PULL}?${queryParams.toString()}`, { signal })
            
        } catch (error: any) {

            console.error('ERROR: PULL PURCHASE MASTER REPORT :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullPurchaseMasterReport(params);
            }

            throw error
        }
    }
    
}