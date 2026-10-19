import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { CostToCompanyApi } from "../api/CostToCompanyApi";
import type { AddUpdateCostToCompanyData, CostToCompanyByIdListResponse, CostToCompanyDeleteResponse, CostToCompanyListResponse, CostToCompanySaveResponse, DeleteCostToCompany, FilterWithPaginationCostToCompanyById, FilterWithPaginationCostToCompanyRequest } from "../models/CostToCompanyModel";

export abstract class CostToCompanyDatasource {
    abstract pullCostToCompany(params: FilterWithPaginationCostToCompanyRequest, signal?: AbortSignal): Promise<CostToCompanyListResponse>;
    abstract pullCostToCompanyById(params: FilterWithPaginationCostToCompanyById, signal?: AbortSignal): Promise<CostToCompanyByIdListResponse>;
    abstract addUpdateCostToCompany(data: AddUpdateCostToCompanyData): Promise<CostToCompanySaveResponse>;
    abstract deleteCostToCompany(params: DeleteCostToCompany): Promise<CostToCompanyDeleteResponse>;
}

export class CostToCompanyDatasourceImpl implements CostToCompanyDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullCostToCompany(params: FilterWithPaginationCostToCompanyRequest, signal?: AbortSignal): Promise<CostToCompanyListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.CostToCompanyId) queryParams.append("CostToCompanyId", params.CostToCompanyId.toString());
            if (params.EmployeeName) queryParams.append("EmployeeName", params.EmployeeName.trim());
            if (params.IsCheckPermission) queryParams.append('IsCheckPermission', params.IsCheckPermission.toString());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${CostToCompanyApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL Cost To Company:", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullCostToCompany(params);
            }
            throw error;
        }
    }

    async pullCostToCompanyById(params: FilterWithPaginationCostToCompanyById, signal?: AbortSignal): Promise<CostToCompanyByIdListResponse> {
        try {
            const queryParams = new URLSearchParams({
                CostToCompanyId: (params.CostToCompanyId ?? 0).toString(),
            });

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${CostToCompanyApi.PULL_COST_TO_COMPANY_BY_ID}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL COST TO COMPANY BY ID :", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullCostToCompanyById(params);
            }
            throw error;
        }
    }

    async addUpdateCostToCompany(data: AddUpdateCostToCompanyData): Promise<CostToCompanySaveResponse> {

        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                CostToCompanyApi.ADD_UPDATE,
                data
            )
            return response

        } catch (error: any) {

            console.log("ERROR: ADD UPDATE COST TO COMPANY", error);

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateCostToCompany(data);
            }
            throw error
        }
    }

    async deleteCostToCompany(params: DeleteCostToCompany): Promise<CostToCompanyDeleteResponse> {

        try {
            const queryParams = new URLSearchParams({
                CostToCompanyId: (params.CostToCompanyId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? ""
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${CostToCompanyApi.DELETE}?${queryParams.toString()}`
            )
            return response

        } catch (error: any) {

            console.log("ERROR : DELETE COST TO COMPANY", error);

            if (error instanceof TokenExpiredException) {

                return await this.deleteCostToCompany(params);
            }
            throw error
        }
    }

}
