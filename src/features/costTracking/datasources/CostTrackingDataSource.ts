import baseClient from "@/core/config/baseClient";
import type { AddUpdateCostTrackingData, CostTrackingListResponse, CostTrackingSaveResponse, FilterWithPaginationCostTracking } from "../models/CostTrackingModel";
import { CostTrackingApi } from "../api/CostTrackingApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class CostTrackingDataSource {
    abstract pullCostTracking(params: FilterWithPaginationCostTracking, signal?: AbortSignal): Promise<CostTrackingListResponse>;
    abstract addUpdateCostTracking(data: AddUpdateCostTrackingData): Promise<CostTrackingSaveResponse>;
}

export class CostTrackingDataSourceImpl implements CostTrackingDataSource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullCostTracking(params: FilterWithPaginationCostTracking, signal?: AbortSignal): Promise<CostTrackingListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 20).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.CostTrackingId) queryParams.append("CostTrackingId", params.CostTrackingId.toString());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${CostTrackingApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.log('ERROR : PULL COST TRACKING', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullCostTracking(params);
            }
            throw error;
        }
    }

    async addUpdateCostTracking(data: AddUpdateCostTrackingData): Promise<CostTrackingSaveResponse> {
        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(

                CostTrackingApi.ADD_UPDATE,
                data
            )
            return response

        } catch (error: any) {

            console.log("ERROR:ADD UPDATE COST TRACKING");

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateCostTracking(data);
            }

            throw error
        }
    }
}