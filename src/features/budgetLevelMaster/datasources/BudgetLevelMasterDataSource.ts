import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { AddUpdateBudgetLevelMaster, BudgetLevelMasterListResponse, BudgetLevelMasterSaveResponse, DeleteBudgetLevelMasterRequest, DeleteBudgetLevelMasterResponse, FilterWithPaginationBudgetLevelMasterRequest } from "@/features/budgetLevelMaster/models/BudgetLevelMasterModel";
import { BudgetLevelMasterApi } from "@/features/budgetLevelMaster/api/BudgetLevelMasterApi";

export abstract class BudgetLevelMasterDatasource {
    abstract pullBudgetLevelMaster(params: FilterWithPaginationBudgetLevelMasterRequest, signal?: AbortSignal): Promise<BudgetLevelMasterListResponse>;
    abstract addUpdateBudgetLevelMaster(data: AddUpdateBudgetLevelMaster): Promise<BudgetLevelMasterSaveResponse>;
}

export class BudgetLevelMasterDatasourceImpl implements BudgetLevelMasterDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullBudgetLevelMaster(params: FilterWithPaginationBudgetLevelMasterRequest, signal?: AbortSignal): Promise<BudgetLevelMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BudgetLevelMasterId) queryParams.append("BudgetLevelMasterId", params.BudgetLevelMasterId.toString());
            if (params.LevelType) queryParams.append("LevelType", params.LevelType.trim());
            if (params.CategoryName) queryParams.append("CategoryName", params.CategoryName.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${BudgetLevelMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL BUDGET LEVEL MASTER:", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullBudgetLevelMaster(params);
            }
            throw error;
        }
    }

    async addUpdateBudgetLevelMaster(data: AddUpdateBudgetLevelMaster): Promise<BudgetLevelMasterSaveResponse> {

        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                BudgetLevelMasterApi.ADD_UPDATE,
                data
            )
            return response

        } catch (error: any) {

            console.log("ERROR: ADD UPDATE BUDGET LEVEL MASTER", error);

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateBudgetLevelMaster(data);
            }
            throw error
        }
    }

    async deleteBudgetLevelMaster(params: DeleteBudgetLevelMasterRequest): Promise<DeleteBudgetLevelMasterResponse> {

        try {
            const queryParams = new URLSearchParams({
                BudgetLevelMasterId: (params.BudgetLevelMasterId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? ""
            })
            
            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${BudgetLevelMasterApi.DELETE}?${queryParams.toString()}`
            )
            return response

        } catch (error: any) {

            console.log("ERROR : DELETE BUDGET LEVEL MASTER", error);

            if (error instanceof TokenExpiredException) {

                return await this.deleteBudgetLevelMaster(params);
            }
            throw error
        }
    }

}
