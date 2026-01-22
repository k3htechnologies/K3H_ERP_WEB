import type { Failure } from '@/core/api/FailureResponse';

import * as E from 'fp-ts/Either';
import type {

    AddUpdateMarketingContentFolderRequest,
    MarketingContentFolderListResponse,
    MarketingContentFolderDeleteResponse,
    MarketingContentFolderSaveResponse,
    DeleteMarketingContentFolderRequest,
    FilterWithPaginationMarketingContentFolderRequest

} from '@/features/marketingcontent/models/MarketingContentFolderModel';
import { MarketingContentFolderDatasourceImpl } from '@/features/marketingcontent/datasources/MarketingContentFolderDatasource';


const MarketingContentFolderDatasource = new MarketingContentFolderDatasourceImpl();

export const marketingContentFolderService = {

    apiCallPullMarketingContentFolder: async (params: FilterWithPaginationMarketingContentFolderRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MarketingContentFolderListResponse>> => {
        try {

            return E.right(await MarketingContentFolderDatasource.pullMarketingContentFolder(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateMarketingContentFolder: async (params: AddUpdateMarketingContentFolderRequest): Promise<E.Either<Failure, MarketingContentFolderSaveResponse>> => {
        try {

            return E.right(await MarketingContentFolderDatasource.addUpdateMarketingContentFolder(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteMarketingContentFolder: async (params: DeleteMarketingContentFolderRequest): Promise<E.Either<Failure, MarketingContentFolderDeleteResponse>> => {
        try {

            return E.right(await MarketingContentFolderDatasource.deleteMarketingContentFolder(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
