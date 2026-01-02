import type { Failure } from '@/core/api/FailureResponse';
import type {
    FilterWithPaginationEnquiryRequest,
    AddUpdateEnquiryRequest,
    DeleteEnquiryRequest,
    EnquiryListResponse,
    EnquirySaveResponse,
    EnquiryDeleteResponse
} from '@/features/enquiry/models/EnquiryModel'
import * as E from 'fp-ts/Either';
import { } from '@/features/enquiry/datasources/EnquiryDatasource';
import { EnquiryDatasourceImpl } from '../datasources/EnquiryDatasource';

const EnquiryDatasource = new EnquiryDatasourceImpl();

export const EnquiryService = {

    apiCallPullEnquiry: async (params: FilterWithPaginationEnquiryRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, EnquiryListResponse>> => {
        try {

            return E.right(await EnquiryDatasource.pullEnquiry(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateEnquiry: async (params: AddUpdateEnquiryRequest): Promise<E.Either<Failure, EnquirySaveResponse>> => {
        try {

            return E.right(await EnquiryDatasource.addUpadateEnquiry(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteEnquiry: async (params: DeleteEnquiryRequest): Promise<E.Either<Failure, EnquiryDeleteResponse>> => {
        try {

            return E.right(await EnquiryDatasource.deleteEnquiry(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
