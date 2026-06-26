import baseClient from "@/core/config/baseClient";
import type { AddUpdatechannelPartnerCategoryRequest, ChannelPartnerCategoryListResponse, ChannelPartnerCategorySaveResponse, FilterWithPaginationchannelPartnerCategoryRequest } from "@/features/channelPartnerCategory/models/ChannelPartnerCategoryModel";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { ChannelPartnerCategoryApi } from "@/features/channelPartnerCategory/api/ChannelPartnerCategoryApi";

export abstract class ChannelPartnerCategoryDatasource {
    abstract pullChannelPartnerCategoryData(params: FilterWithPaginationchannelPartnerCategoryRequest, signal?: AbortSignal): Promise<ChannelPartnerCategoryListResponse>;
    abstract addUpdatechannelPartnerCategory(data: AddUpdatechannelPartnerCategoryRequest): Promise<ChannelPartnerCategorySaveResponse>;
}

export class ChannelPartnerCategoryImpl implements ChannelPartnerCategoryDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullChannelPartnerCategoryData(params: FilterWithPaginationchannelPartnerCategoryRequest, signal?: AbortSignal): Promise<ChannelPartnerCategoryListResponse> {
        try {

            const queryParams = new URLSearchParams({
                ProjectId: String(params.ProjectId ?? 20),
            });

            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ChannelPartnerCategoryApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.log("ERROR : PULL CHANNEL PARTNER CATEGORY:", error)

            if (error instanceof TokenExpiredException) {

                return await this.pullChannelPartnerCategoryData(params);
            }
            throw error
        }
    }

    async addUpdatechannelPartnerCategory(params: AddUpdatechannelPartnerCategoryRequest): Promise<ChannelPartnerCategorySaveResponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ChannelPartnerCategoryApi.ADD_UPDATE,
                params
            )
            return response

        } catch (error) {

            console.error('ERROR : ADD UPDATE CHANNEL PARTNER CATEGORY', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdatechannelPartnerCategory(params);
            }
            throw error
        }
    }

}