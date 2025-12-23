import type { Failure } from '@/core/api/FailureResponse';
import type {
    FilterWithPaginationEnquiryMasterRequest,
    AddUpdateEnquiryMasterRequest,
    DeleteEnquiryMasterRequest,
    EnquiryMasterListResponse,
    EnquiryMasterSaveResponse,
    EnquiryMasterDeleteResponse
} from '@/features/EnquiryMaster/models/EnquiryMasterModel'
import * as E from 'fp-ts/Either';
import {  } from '@/features/EnquiryMaster/datasources/EnquiryMasterDatasource';
import { EnquiryMasterDatasourceImpl } from '../datasources/EnquiryMasterDatasource';

const EnquiryMasterDatasource = new EnquiryMasterDatasourceImpl();

export const EnquiryMasterService = {

    apiCallPullEnquiryMaster: async (params: FilterWithPaginationEnquiryMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, EnquiryMasterListResponse>> => {
        try {

            return E.right(await EnquiryMasterDatasource.pullEnquiryMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateEnquiryMaster: async (params: AddUpdateEnquiryMasterRequest): Promise<E.Either<Failure, EnquiryMasterSaveResponse>> => {
        try {

            return E.right(await EnquiryMasterDatasource.addUpadateEnquiryMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteEnquiryMaster: async (params: DeleteEnquiryMasterRequest): Promise<E.Either<Failure, EnquiryMasterDeleteResponse>> => {
        try {

            return E.right(await EnquiryMasterDatasource.deleteEnquiryMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
