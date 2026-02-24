
import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {

    PaymentScheduleMasterDeleteResponse,
    PaymentScheduleMasterListResponse,
    DeletePaymentScheduleMasterRequest,
    FilterWithPaginationPaymentScheduleMasterRequest,
    AddUpdatePaymentScheduleMasterRequest,
    FilterWithPaginationPaymentScheduleMasterReportRequest,
    PaymentScheduleMasterReportListResponse,
    FilterWithPaginationCostSheetReportRequest,
    CostSheetReportListResponse,
    FilterWithPaginationProjectInventoryStructureRequest,
    ProjectInventoryStructureListResponse,

} from "@/features/paymentScheduleMaster/models/PaymentScheduleMasterModel";
import { PaymentScheduleMasterApi } from "@/features/paymentScheduleMaster/api/PaymentScheduleMasterApi";

export abstract class PaymentScheduleMasterDatasource {

    abstract pullPaymentScheduleMaster(params: FilterWithPaginationPaymentScheduleMasterRequest, signal?: AbortSignal): Promise<PaymentScheduleMasterListResponse>;
    abstract addUpdatePaymentScheduleMaster(data: AddUpdatePaymentScheduleMasterRequest[]): Promise<PaymentScheduleMasterListResponse>;
    abstract deletePaymentScheduleMaster(params: DeletePaymentScheduleMasterRequest): Promise<PaymentScheduleMasterDeleteResponse>;

    abstract pullProjectInventoryStructure(params: FilterWithPaginationProjectInventoryStructureRequest, signal?: AbortSignal): Promise<ProjectInventoryStructureListResponse>;

    // PAYMENT SCHEDULE REPORT
    abstract pullPaymentScheduleMasterReport(params: FilterWithPaginationPaymentScheduleMasterReportRequest, signal?: AbortSignal): Promise<PaymentScheduleMasterReportListResponse>;
    abstract pullCostSheetReport(params: FilterWithPaginationCostSheetReportRequest, signal?: AbortSignal): Promise<CostSheetReportListResponse>;

}

export class PaymentScheduleMasterDatasourceImpl implements PaymentScheduleMasterDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullPaymentScheduleMaster(params: FilterWithPaginationPaymentScheduleMasterRequest, signal?: AbortSignal): Promise<PaymentScheduleMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BuildingId) queryParams.append("BuildingId", params.BuildingId.toString());
            if (params.PaymentScheduleMasterId) queryParams.append("PaymentScheduleMasterId", params.PaymentScheduleMasterId.toString());
            if (params.Name) queryParams.append('Name', params.Name.toString());
            if (params.Wing) queryParams.append('Wing', params.Wing.toString());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PaymentScheduleMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL PAYMENT SCHEDULE MASTER :", error);

            if (error === TokenExpiredException) {

                await this.pullPaymentScheduleMaster(params);
            }
            throw error;
        }
    }

    async addUpdatePaymentScheduleMaster(params: AddUpdatePaymentScheduleMasterRequest[]): Promise<PaymentScheduleMasterListResponse> {
        try {

            const payload = {
                PaymentScheduleMasterJSON: JSON.stringify(params)
            };

            return await this.k3hHttpClient.postRequestWithAuthentication(PaymentScheduleMasterApi.ADD_UPDATE, payload);

        } catch (error) {

            console.error('ERROR: ADD UPDATE PAYMENT SCHEDULE MASTER:', error);
            if (error === TokenExpiredException) {
                await this.addUpdatePaymentScheduleMaster(params);
            }
            throw error;
        }
    }

    async deletePaymentScheduleMaster(params: DeletePaymentScheduleMasterRequest): Promise<PaymentScheduleMasterDeleteResponse> {
        try {
            
            const queryParams = new URLSearchParams({
                PaymentScheduleMasterId: (params.PaymentScheduleMasterId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${PaymentScheduleMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            if (error === TokenExpiredException) {

                console.error('ERROR: DELETE PAYMENT SCHEDULE MASTER:', error);

                await this.deletePaymentScheduleMaster(params);
            }

            throw error
        }
    }

    async pullProjectInventoryStructure(params: FilterWithPaginationProjectInventoryStructureRequest, signal?: AbortSignal): Promise<ProjectInventoryStructureListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BuildingId) queryParams.append("BuildingId", params.BuildingId.toString());
            if (params.Wing) queryParams.append('Wing', params.Wing.toString());
            if (params.FlatConfiguration) queryParams.append('FlatConfiguration', params.FlatConfiguration.toString());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PaymentScheduleMasterApi.PULL_BUILDING}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL PROJECT INVENTORY STRUCTURE :", error);

            if (error === TokenExpiredException) {

                await this.pullProjectInventoryStructure(params);
            }
            throw error;
        }
    }

    // PAYMENT SCHEDULE REPORT

    async pullPaymentScheduleMasterReport(params: FilterWithPaginationPaymentScheduleMasterReportRequest, signal?: AbortSignal): Promise<PaymentScheduleMasterReportListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BuildingId) queryParams.append("BuildingId", params.BuildingId.toString());
            if (params.PaymentScheduleMasterId) queryParams.append("PaymentScheduleMasterId", params.PaymentScheduleMasterId.toString());
            if (params.Rate) queryParams.append("Rate", params.Rate.toString());
            if (params.Wing) queryParams.append('Wing', params.Wing.toString());
            if (params.FlatConfiguration) queryParams.append('FlatConfiguration', params.FlatConfiguration.toString());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PaymentScheduleMasterApi.PULL_PAYMENT_SCHEDULE_REPORT}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL PAYMENT SCHEDULE MASTER REPORT:", error);

            if (error === TokenExpiredException) {

                await this.pullPaymentScheduleMasterReport(params);
            }
            throw error;
        }
    }

    async pullCostSheetReport(params: FilterWithPaginationCostSheetReportRequest, signal?: AbortSignal): Promise<CostSheetReportListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BuildingId) queryParams.append("BuildingId", params.BuildingId.toString());
            if (params.PaymentScheduleMasterId) queryParams.append("PaymentScheduleMasterId", params.PaymentScheduleMasterId.toString());
            if (params.Rate) queryParams.append("Rate", params.Rate.toString());
            if (params.Wing) queryParams.append('Wing', params.Wing.toString());
            if (params.FlatConfiguration) queryParams.append('FlatConfiguration', params.FlatConfiguration.toString());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PaymentScheduleMasterApi.PULL_COST_SHEET_REPORT}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL COST SHEET REPORT :", error);

            if (error === TokenExpiredException) {

                await this.pullCostSheetReport(params);
            }
            throw error;
        }
    }
}
