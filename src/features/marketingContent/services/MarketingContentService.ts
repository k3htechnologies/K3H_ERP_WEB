import type {

    MarketingContentDeleteResponse,
    MarketingContentListResponse,
    MarketingContentSaveResponse,
    DeleteMarketingContentRequest,
    FilterWithPaginationMarketingContentRequest

} from "@/features/marketingContent/models/MarketingContentModel";
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { MarketingContentDatasourceImpl } from "@/features/marketingContent/datasources/MarketingContentDatasource";


const MarketingContentDatasource = new MarketingContentDatasourceImpl();

export const marketingContentService = {

    apiCallPullMarketingContent: async (params: FilterWithPaginationMarketingContentRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MarketingContentListResponse>> => {

        try {
            return E.right(await MarketingContentDatasource.pullMarketingContent(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateMarketingContent: async (data: FormData): Promise<E.Either<Failure, MarketingContentSaveResponse>> => {

        try {

            return E.right(await MarketingContentDatasource.addUpdateMarketingContent(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteMarketingContent: async (params: DeleteMarketingContentRequest): Promise<E.Either<Failure, MarketingContentDeleteResponse>> => {
        try {

            return E.right(await MarketingContentDatasource.deleteMarketingContent(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    }
}