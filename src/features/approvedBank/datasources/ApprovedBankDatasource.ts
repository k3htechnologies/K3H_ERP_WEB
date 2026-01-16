import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { ApprovedBankApi } from "@/features/approvedBank/api/ApprovedBankApi";
import type {

    AddUpdateApprovedBankWithFolderRequest,
    ApprovedBankFolderListResponse,
    ApprovedBankWithFolderDeleteResponse,
    ApprovedBankWithFolderSaveResponse,
    DeleteApprovedBankWithFolderRequest,
    FilterWithPaginationApprovedBankWithFolderRequest
    
} from "@/features/approvedBank/models/ApprovedBankModel";

export abstract class ApprovedBankWithFolderDatasource {

    abstract pullApprovedBankWithFolder(params: FilterWithPaginationApprovedBankWithFolderRequest, signal?: AbortSignal): Promise<ApprovedBankFolderListResponse>;
    abstract addUpdateApprovedBankWithFolder(data: AddUpdateApprovedBankWithFolderRequest): Promise<ApprovedBankWithFolderSaveResponse>;
    abstract deleteApprovedBankWithFolderRequest(params: DeleteApprovedBankWithFolderRequest): Promise<ApprovedBankWithFolderDeleteResponse>;
}

export class ApprovedBankWithFolderDatasourceImpl implements ApprovedBankWithFolderDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullApprovedBankWithFolder(params: FilterWithPaginationApprovedBankWithFolderRequest, signal?: AbortSignal): Promise<ApprovedBankFolderListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ApprovedBankFolderId) queryParams.append("ApprovedBankFolderId", params.ApprovedBankFolderId.toString());
            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BankName?.trim()) queryParams.append("BankName", params.BankName.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ApprovedBankApi.PULL}?${queryParams.toString()}`,{ signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL APPROVED BANK :", error);

            if (error === TokenExpiredException) {
                await this.pullApprovedBankWithFolder(params);
            }
            throw error;
        }
    }

    async addUpdateApprovedBankWithFolder(params: AddUpdateApprovedBankWithFolderRequest): Promise<ApprovedBankWithFolderSaveResponse> {
        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ApprovedBankApi.ADD_UPDATE,
                params
            )
            return response
        } catch (error: any) {
            console.error("ERROR: ADD UPDATE APPROVED BANK :", error);

            if (error instanceof TokenExpiredException) {
                await this.addUpdateApprovedBankWithFolder(params);
            }
            throw error;
        }
    }

    async deleteApprovedBankWithFolderRequest(params: DeleteApprovedBankWithFolderRequest): Promise<ApprovedBankWithFolderDeleteResponse> {
        try {

            const queryParams = new URLSearchParams({
                ApprovedBankFolderId: (params.ApprovedBankFolderId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? "",
                ProjectId: (params.ProjectId ?? 0).toString(),
            });

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ApprovedBankApi.DELETE}?${queryParams.toString()}`
            )
            return response

        } catch (error) {

            if (error === TokenExpiredException) {

                console.error("ERROR: DELETE APPROVED BANK :", error);

                await this.deleteApprovedBankWithFolderRequest(params);
            }
            throw error;
        }
    }
}
