import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { InwardOutwardApi } from "@/features/inwardOutward/api/inwardOutwardApi";
import type {
    InwardOutwardListResponse,
    FilterWithPaginationInwardOutwardRequest
} from "@/features/inwardOutward/models/InwardOutwardModel";

export abstract class InwardOutwardDatasource {

    abstract pullInwardOutwardData(params: FilterWithPaginationInwardOutwardRequest, signal?: AbortSignal): Promise<InwardOutwardListResponse>;
}

export class InwardOutwardDatasourceImpl implements InwardOutwardDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullInwardOutwardData(params: FilterWithPaginationInwardOutwardRequest, signal?: AbortSignal): Promise<InwardOutwardListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);
            if (params.DeliveryType) queryParams.append("DeliveryType", params.DeliveryType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${InwardOutwardApi.PULL}?${queryParams.toString()}`, { signal }
            )
            console.log('Response is ', response);
            return response

        } catch (error: any) {

            console.error("ERROR: PULL INWARD OUTWARD DATA :", error);

            if (error === TokenExpiredException) {

                await this.pullInwardOutwardData(params);
            }
            throw error;
        }
    }

}
