import * as E from 'fp-ts/Either';
import type { AddUpdatePreSaleEnquiryRequest, DeletePreSaleEnquiryRequest, FilterWithPaginationPreSaleEnquiryRequest, PreSaleEnquiryDeleteResponse, PreSaleEnquiryListResponse, PreSaleEnquirySaveResponse } from "@/features/preSaleEnquiry/models/PreSaleEnquiryModel";
import type { Failure } from "@/core/api/FailureResponse";
import { PreSaleEnquiryDataSourceImpl } from '@/features/preSaleEnquiry/dataSources/PreSaleEnquiryDataSource';

const PreSaleEnquiryDataSource = new PreSaleEnquiryDataSourceImpl();

export const preSaleEnquiryService = {

    apiCallPullPreSaleEnquiry: async (params: FilterWithPaginationPreSaleEnquiryRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PreSaleEnquiryListResponse>> => {

        try {

            return E.right(await PreSaleEnquiryDataSource.pullPreSaleEnquiry(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdatePreSaleEnquiry: async (data: AddUpdatePreSaleEnquiryRequest): Promise<E.Either<Failure, PreSaleEnquirySaveResponse>> => {

        try {

            return E.right(await PreSaleEnquiryDataSource.addUpdatePreSaleEnquiry(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeletePreSaleEnquiry: async (data: DeletePreSaleEnquiryRequest): Promise<E.Either<Failure, PreSaleEnquiryDeleteResponse>> => {

        try {

            return E.right(await PreSaleEnquiryDataSource.deletePreSaleEnquiry(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    }

}