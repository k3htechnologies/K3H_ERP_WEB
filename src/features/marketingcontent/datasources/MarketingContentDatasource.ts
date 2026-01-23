import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {

    DeleteMarketingContentRequest,
    FilterWithPaginationMarketingContentRequest,
    MarketingContentDeleteResponse,
    MarketingContentListResponse,
    MarketingContentSaveResponse

} from "@/features/marketingContent/models/MarketingContentModel";
import { MarketingContentApi } from "@/features/marketingContent/api/MarketingContentApi";

export abstract class MarketingContentDatasource {

    abstract pullMarketingContent(params: FilterWithPaginationMarketingContentRequest, signal?: AbortSignal): Promise<MarketingContentListResponse>;
    abstract addUpdateMarketingContent(data: FormData): Promise<MarketingContentSaveResponse>;
    abstract deleteMarketingContent(params: DeleteMarketingContentRequest): Promise<MarketingContentDeleteResponse>;
}

export class MarketingContentDatasourceImpl implements MarketingContentDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullMarketingContent(params: FilterWithPaginationMarketingContentRequest, signal?: AbortSignal): Promise<MarketingContentListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.MarketingContentId) queryParams.append("MarketingContentId", params.MarketingContentId.toString());
            if (params.MarketingContentFolderId) queryParams.append("MarketingContentFolderId", params.MarketingContentFolderId.toString());
            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.Title?.trim()) queryParams.append("Title", params.Title.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${MarketingContentApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL MARKETING CONTENT :", error);

            if (error === TokenExpiredException) {
                await this.pullMarketingContent(params);
            }
            throw error;
        }
    }

    async addUpdateMarketingContent(formData: FormData): Promise<MarketingContentSaveResponse> {
        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                MarketingContentApi.ADD_UPDATE,
                formData
            )
            return response
        } catch (error: any) {
            console.error("ERROR: ADD UPDATE MARKETING CONTENT :", error);

            if (error instanceof TokenExpiredException) {
                await this.addUpdateMarketingContent(formData);
            }
            throw error;
        }
    }

    async deleteMarketingContent(params: DeleteMarketingContentRequest): Promise<MarketingContentDeleteResponse> {
        try {

            const queryParams = new URLSearchParams({
                MarketingContentId: (params.MarketingContentId ?? 0).toString(),
                MarketingContentFolderId: (params.MarketingContentFolderId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? "",
                ProjectId: (params.ProjectId ?? 0).toString(),
            });

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${MarketingContentApi.DELETE}?${queryParams.toString()}`
            )
            return response

        } catch (error) {

            if (error === TokenExpiredException) {

                console.error("ERROR: DELETE MARKETING CONTENT  :", error);

                await this.deleteMarketingContent(params);
            }
            throw error;
        }
    }
}
