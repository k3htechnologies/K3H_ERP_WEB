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
<<<<<<< HEAD
import {  } from '@/features/enquiry/datasources/EnquiryDatasource';
import { EnquiryDatasourceImpl } from '@/features/enquiry/datasources/EnquiryDatasource';
=======
import { } from '@/features/enquiry/datasources/EnquiryDatasource';
import { EnquiryDatasourceImpl } from '../datasources/EnquiryDatasource';
>>>>>>> bfa44a9e8ca7f45ab97331bc2bbbfdc1c50e4df5

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
