import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { ApprovedBankFileApi } from "@/features/approvedBank/api/ApprovedBankFileApi";
import type {

    ApprovedBankFileDeleteResponse,
    ApprovedBankFileListResponse,
    ApprovedBankFileSaveResponse,
    DeleteApprovedBankFileRequest,
    FilterWithPaginationApprovedBankFileRequest

} from "@/features/approvedBank/models/ApprovedBankFileModel";

export abstract class ApprovedBankFileDatasource {

    abstract pullApprovedBankFile(params: FilterWithPaginationApprovedBankFileRequest, signal?: AbortSignal): Promise<ApprovedBankFileListResponse>;
    abstract addUpdateApprovedBankFile(data: FormData): Promise<ApprovedBankFileSaveResponse>;
    abstract deleteApprovedBankFile(params: DeleteApprovedBankFileRequest): Promise<ApprovedBankFileDeleteResponse>;
}

export class ApprovedBankFileDatasourceImpl implements ApprovedBankFileDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullApprovedBankFile(params: FilterWithPaginationApprovedBankFileRequest, signal?: AbortSignal): Promise<ApprovedBankFileListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ApprovedBankFolderId) queryParams.append("ApprovedBankFolderId", params.ApprovedBankFolderId.toString());
            if (params.ApprovedBankFileId) queryParams.append("ApprovedBankFileId", params.ApprovedBankFileId.toString());
            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.ApprovedBankFileName?.trim()) queryParams.append("ApprovedBankFileName", params.ApprovedBankFileName.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ApprovedBankFileApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL APPROVED BANK FILE :", error);

            if (error === TokenExpiredException) {
                await this.pullApprovedBankFile(params);
            }
            throw error;
        }
    }

    async addUpdateApprovedBankFile(formData: FormData): Promise<ApprovedBankFileSaveResponse> {
        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                ApprovedBankFileApi.ADD_UPDATE,
                formData
            )
            return response
        } catch (error: any) {
            console.error("ERROR: ADD UPDATE APPROVED BANK FILE :", error);

            if (error instanceof TokenExpiredException) {
                await this.addUpdateApprovedBankFile(formData);
            }
            throw error;
        }
    }

    async deleteApprovedBankFile(params: DeleteApprovedBankFileRequest): Promise<ApprovedBankFileDeleteResponse> {
        try {

            const queryParams = new URLSearchParams({
                ApprovedBankFolderId: (params.ApprovedBankFolderId ?? 0).toString(),
                ApprovedBankFileId: (params.ApprovedBankFileId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? "",
                ProjectId: (params.ProjectId ?? 0).toString(),
            });

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ApprovedBankFileApi.DELETE}?${queryParams.toString()}`
            )
            return response

        } catch (error) {

            if (error === TokenExpiredException) {

                console.error("ERROR: DELETE APPROVED BANK FILE :", error);

                await this.deleteApprovedBankFile(params);
            }
            throw error;
        }
    }
}
