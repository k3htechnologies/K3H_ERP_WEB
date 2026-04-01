import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {

    AddUpdateMarketingContentFolderRequest,
    MarketingContentFolderListResponse,
    DeleteMarketingContentFolderRequest,
    FilterWithPaginationMarketingContentFolderRequest,
    MarketingContentFolderSaveResponse,
    MarketingContentFolderDeleteResponse

} from "@/features/marketingContent/models/MarketingContentFolderModel";
import { MarketingContentFolderApi } from "@/features/marketingContent/api/MarketingContentFolderApi";

export abstract class MarketingContentFolderDatasource {

    abstract pullMarketingContentFolder(params: FilterWithPaginationMarketingContentFolderRequest, signal?: AbortSignal): Promise<MarketingContentFolderListResponse>;
    abstract addUpdateMarketingContentFolder(data: AddUpdateMarketingContentFolderRequest): Promise<MarketingContentFolderSaveResponse>;
    abstract deleteMarketingContentFolder(params: DeleteMarketingContentFolderRequest): Promise<MarketingContentFolderDeleteResponse>;
}

export class MarketingContentFolderDatasourceImpl implements MarketingContentFolderDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullMarketingContentFolder(params: FilterWithPaginationMarketingContentFolderRequest, signal?: AbortSignal): Promise<MarketingContentFolderListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.MarketingContentFolderId) queryParams.append("MarketingContentFolderId", params.MarketingContentFolderId.toString());
            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.MarketingContentFolderName?.trim()) queryParams.append("MarketingContentFolderName", params.MarketingContentFolderName.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${MarketingContentFolderApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL MARKETING CONTENT FOLDER :", error);

            if (error instanceof TokenExpiredException) {
                return await this.pullMarketingContentFolder(params);
            }
            throw error;
        }
    }

    async addUpdateMarketingContentFolder(params: AddUpdateMarketingContentFolderRequest): Promise<MarketingContentFolderSaveResponse> {
        try {

            const payLoad: AddUpdateMarketingContentFolderRequest = {
                MarketingContentFolderId: params.MarketingContentFolderId ?? 0,
                ProjectId: params.ProjectId ?? 0,
                Uniquekey: params.Uniquekey ?? '',
                MarketingContentFolderName: params.MarketingContentFolderName ?? ''
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                MarketingContentFolderApi.ADD_UPDATE,
                payLoad
            )
            return response
        } catch (error: any) {
            console.error("ERROR: ADD UPDATE MARKETING CONTENT FOLDER:", error);

            if (error instanceof TokenExpiredException) {
                await this.addUpdateMarketingContentFolder(params);
            }
            throw error;
        }
    }

    async deleteMarketingContentFolder(params: DeleteMarketingContentFolderRequest): Promise<MarketingContentFolderDeleteResponse> {
        try {

            const queryParams = new URLSearchParams({
                MarketingContentFolderId: (params.MarketingContentFolderId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? "",
                ProjectId: (params.ProjectId ?? 0).toString(),
            });

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${MarketingContentFolderApi.DELETE}?${queryParams.toString()}`
            )
            return response

        } catch (error) {

            console.error("ERROR: DELETE MARKETING CONTENT FOLDER :", error);
            if (error instanceof TokenExpiredException) {
                return await this.deleteMarketingContentFolder(params);
            }
            throw error;
        }
    }
}
