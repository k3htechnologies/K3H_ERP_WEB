import type { Failure } from "@/core/api/FailureResponse";
import { ChannelPartnerCategoryImpl } from "../datasources/ChannelPartnerCategoryDataSource";
import type { AddUpdatechannelPartnerCategoryRequest, ChannelPartnerCategoryListResponse, ChannelPartnerCategorySaveResponse, FilterWithPaginationchannelPartnerCategoryRequest } from "../models/ChannelPartnerCategoryModel";
import * as E from 'fp-ts/Either';

const ChannelPartnerCategoryDataSource = new ChannelPartnerCategoryImpl();

export const ChannelPartnerCategoryService = {

    apiCallpullChannelPartnerCategoryData: async (params: FilterWithPaginationchannelPartnerCategoryRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ChannelPartnerCategoryListResponse>> => {

        try {

            return E.right(await ChannelPartnerCategoryDataSource.pullChannelPartnerCategoryData(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdatechannelPartnerCategoryRequest: async (params: AddUpdatechannelPartnerCategoryRequest): Promise<E.Either<Failure, ChannelPartnerCategorySaveResponse>> => {

        try {
            return E.right(await ChannelPartnerCategoryDataSource.addUpdatechannelPartnerCategory(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    }
}