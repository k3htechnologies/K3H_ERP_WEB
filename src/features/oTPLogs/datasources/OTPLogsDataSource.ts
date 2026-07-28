import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { FilterWithPaginationOTPLogsRequest, OTPLogsListResponse } from "@/features/oTPLogs/models/OTPLogsModel";
import { OTPLogsApi } from "@/features/oTPLogs/api/OTPLogsApi";

export abstract class OTPLogsDatasource {
    abstract pullOTPLogs(params: FilterWithPaginationOTPLogsRequest, signal?: AbortSignal): Promise<OTPLogsListResponse>;
}

export class OTPLogsDatasourceImpl implements OTPLogsDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullOTPLogs(params: FilterWithPaginationOTPLogsRequest, signal?: AbortSignal): Promise<OTPLogsListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            })

            if (params.MobileNumber) queryParams.append("MobileNumber", params.MobileNumber.trim());
            if (params.Module) queryParams.append("Module", params.Module.trim());
            if (params.FromDate) queryParams.append("FromDate", params.FromDate.trim());
            if (params.ToDate) queryParams.append("ToDate", params.ToDate.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${OTPLogsApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL OTP LOGS :", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullOTPLogs(params);
            }
            throw error;
        }
    }
}

