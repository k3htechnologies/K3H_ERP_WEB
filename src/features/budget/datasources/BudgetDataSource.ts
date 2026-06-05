import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { BudgetApi } from "@/features/budget/api/BudgetApi";
import type { AddUpdateBudget, BudgetSaveResponse, BudgetListResponse, FilterWithPaginationBudgetRequest } from "@/features/budget/models/BudgetModel";

export abstract class BudgetDatasource {
    abstract pullBudget(params: FilterWithPaginationBudgetRequest, signal?: AbortSignal): Promise<BudgetListResponse>;
    abstract addUpdateBudget(data: AddUpdateBudget): Promise<BudgetSaveResponse>;
}

export class BudgetDatasourceImpl implements BudgetDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullBudget(params: FilterWithPaginationBudgetRequest, signal?: AbortSignal): Promise<BudgetListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BudgetLevelMasterId) queryParams.append("BudgetLevelMasterId", params.BudgetLevelMasterId.toString());
            if (params.CategoryName) queryParams.append("CategoryName", params.CategoryName.trim());
            if (params.LevelType) queryParams.append("LevelType", params.LevelType.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${BudgetApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL BUDGET:", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullBudget(params);
            }
            throw error;
        }
    }

    async addUpdateBudget(data: AddUpdateBudget): Promise<BudgetSaveResponse> {

        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                BudgetApi.ADD_UPDATE,
                data
            )
            return response

        } catch (error: any) {
            console.log("ERROR: ADD UPDATE BUDGET", error);

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateBudget(data);
            }
            throw error
        }
    }
}
