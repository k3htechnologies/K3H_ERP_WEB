import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { BudgetApi } from "@/features/budget/api/BudgetApi";
import type { AddUpdateBudget, BudgetSaveResponse, BudgetListResponse, FilterWithPaginationBudgetRequest, SubmitBudgetForApprovalData, SubmitBudgetForApprovalResponse, FilterWithInventoryProjectBasementPodiumWingBudgetRequest, InventoryProjectBasementPodiumWingBudgetResponse } from "@/features/budget/models/BudgetModel";

export abstract class BudgetDatasource {
    abstract pullBudget(params: FilterWithPaginationBudgetRequest, signal?: AbortSignal): Promise<BudgetListResponse>;
    abstract addUpdateBudget(data: AddUpdateBudget): Promise<BudgetSaveResponse>;
    abstract submitBudgetForApproval(data: SubmitBudgetForApprovalData): Promise<SubmitBudgetForApprovalResponse>;
    abstract pullInventoryProjectBasementPodiumWingBudget(params: FilterWithInventoryProjectBasementPodiumWingBudgetRequest, signal?: AbortSignal): Promise<InventoryProjectBasementPodiumWingBudgetResponse>;

}

export class BudgetDatasourceImpl implements BudgetDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullBudget(params: FilterWithPaginationBudgetRequest, signal?: AbortSignal): Promise<BudgetListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 20).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.InventoryFlatFloorBasementPodiumWingId) queryParams.append("InventoryFlatFloorBasementPodiumWingId", params.InventoryFlatFloorBasementPodiumWingId.toString());
            if (params.BudgetId) queryParams.append("BudgetId", params.BudgetId.toString());
            if (params.CategoryName) queryParams.append("CategoryName", params.CategoryName.trim());
            if (params.LevelType) queryParams.append("LevelType", params.LevelType.trim());
            if (params.Uom) queryParams.append("Uom", params.Uom.trim());
            if (params.Flat) queryParams.append("Flat", params.Flat.trim());
            if (params.ApprovalStatus) queryParams.append("ApprovalStatus", params.ApprovalStatus.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${BudgetApi.PULL}?${queryParams.toString()}`, { signal }
            );

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
            return await this.k3hHttpClient.postRequestWithAuthentication(
                BudgetApi.ADD_UPDATE,
                data
            );

        } catch (error: any) {
            console.log("ERROR: ADD UPDATE BUDGET", error);

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateBudget(data);
            }
            throw error
        }
    }

    async submitBudgetForApproval(data: SubmitBudgetForApprovalData): Promise<SubmitBudgetForApprovalResponse> {

        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(BudgetApi.SUBMIT_BUDGET_FOR_APPROVAL, data);

        } catch (error: any) {

            console.log("ERROR: SUBMIT BUDGET FOR APPROVAL", error);

            if (error instanceof TokenExpiredException) {

                return await this.submitBudgetForApproval(data);
            }
            throw error
        }
    }

    async pullInventoryProjectBasementPodiumWingBudget(params: FilterWithInventoryProjectBasementPodiumWingBudgetRequest, signal?: AbortSignal): Promise<InventoryProjectBasementPodiumWingBudgetResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: (params.ProjectId ?? 0).toString(),
                InventoryFlatFloorBasementPodiumWingId: (params.InventoryFlatFloorBasementPodiumWingId ?? 0).toString(),
            });
            if (params.SearchText) queryParams.append("SearchText", params.SearchText);

            return await this.k3hHttpClient.getRequestWithAuthentication( `${BudgetApi.INVENTORY_PROJECT_BASEMENT_PODIUM_WING_BUDGET}?${queryParams.toString()}`, { signal });

        } catch (error: any) {

            console.error("ERROR: PULL INVENTORY PROJECT BASEMENT PODIUM WING BUDGET:", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullInventoryProjectBasementPodiumWingBudget(params);
            }
            throw error;
        }
    }
}
