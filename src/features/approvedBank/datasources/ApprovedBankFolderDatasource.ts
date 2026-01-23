import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {

    AddUpdateApprovedBankFolderRequest,
    ApprovedBankFolderListResponse,
    ApprovedBankWithFolderDeleteResponse,
    ApprovedBankWithFolderSaveResponse,
    DeleteApprovedBankFolderRequest,
    FilterWithPaginationApprovedBankFolderRequest

} from "@/features/approvedBank/models/ApprovedBankFolderModel";
import { ApprovedBankFolderApi } from "@/features/approvedBank/api/ApprovedBankFolderApi";

export abstract class ApprovedBankWithFolderDatasource {

    abstract pullApprovedBankFolder(params: FilterWithPaginationApprovedBankFolderRequest, signal?: AbortSignal): Promise<ApprovedBankFolderListResponse>;
    abstract addUpdateApprovedBankFolder(data: AddUpdateApprovedBankFolderRequest): Promise<ApprovedBankWithFolderSaveResponse>;
    abstract deleteApprovedBankFolder(params: DeleteApprovedBankFolderRequest): Promise<ApprovedBankWithFolderDeleteResponse>;
}

export class ApprovedBankWithFolderDatasourceImpl implements ApprovedBankWithFolderDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullApprovedBankFolder(params: FilterWithPaginationApprovedBankFolderRequest, signal?: AbortSignal): Promise<ApprovedBankFolderListResponse> {
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
                `${ApprovedBankFolderApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL APPROVED BANK FOLDER :", error);

            if (error === TokenExpiredException) {
                await this.pullApprovedBankFolder(params);
            }
            throw error;
        }
    }

    async addUpdateApprovedBankFolder(params: AddUpdateApprovedBankFolderRequest): Promise<ApprovedBankWithFolderSaveResponse> {
        try {

            const payLoad: AddUpdateApprovedBankFolderRequest = {

                ApprovedBankFolderId: params.ApprovedBankFolderId ?? 0,
                ProjectId: params.ProjectId ?? 0,
                BankListMasterId: params.BankListMasterId ?? '',
                Uniquekey: params.Uniquekey ?? '',
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ApprovedBankFolderApi.ADD_UPDATE,
                payLoad
            )
            return response
        } catch (error: any) {
            console.error("ERROR: ADD UPDATE APPROVED BANK FOLDER:", error);

            if (error instanceof TokenExpiredException) {
                await this.addUpdateApprovedBankFolder(params);
            }
            throw error;
        }
    }

    async deleteApprovedBankFolder(params: DeleteApprovedBankFolderRequest): Promise<ApprovedBankWithFolderDeleteResponse> {
        try {

            const queryParams = new URLSearchParams({
                ApprovedBankFolderId: (params.ApprovedBankFolderId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? "",
                ProjectId: (params.ProjectId ?? 0).toString(),
            });

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ApprovedBankFolderApi.DELETE}?${queryParams.toString()}`
            )
            return response

        } catch (error) {

            if (error === TokenExpiredException) {

                console.error("ERROR: DELETE APPROVED BANK FOLDER :", error);

                await this.deleteApprovedBankFolder(params);
            }
            throw error;
        }
    }
}
