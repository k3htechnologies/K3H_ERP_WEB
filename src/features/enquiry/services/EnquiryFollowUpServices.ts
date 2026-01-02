import type { Failure } from '@/core/api/FailureResponse';
import type {
    FilterWithPaginationEnquiryFollowUpRequest,
    AddUpdateEnquiryFollowUpRequest,
    DeleteEnquiryFollowUpRequest,
    EnquiryFollowUpListResponse,
    EnquiryFollowUpSaveResponse,
    EnquiryFollowUpDeleteResponse
} from '@/features/enquiry/models/EnquiryFollowUpModel'
import * as E from 'fp-ts/Either';
import { EnquiryFollowUpDatasourceImpl } from '@/features/enquiry/datasources/EnquiryFollowUpDatasource';

const EnquiryFollowUpDatasource = new EnquiryFollowUpDatasourceImpl();

export const enquiryFollowUpService = {

    apiCallPullEnquiryFollowUp: async (params: FilterWithPaginationEnquiryFollowUpRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, EnquiryFollowUpListResponse>> => {
        try {

            return E.right(await EnquiryFollowUpDatasource.pullEnquiryFollowUp(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateEnquiryFollowUp: async (params: AddUpdateEnquiryFollowUpRequest): Promise<E.Either<Failure, EnquiryFollowUpSaveResponse>> => {
        try {

            return E.right(await EnquiryFollowUpDatasource.addUpadateEnquiryFollowUp(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteEnquiryFollowUp: async (params: DeleteEnquiryFollowUpRequest): Promise<E.Either<Failure, EnquiryFollowUpDeleteResponse>> => {
        try {

            return E.right(await EnquiryFollowUpDatasource.deleteEnquiryFollowUp(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
