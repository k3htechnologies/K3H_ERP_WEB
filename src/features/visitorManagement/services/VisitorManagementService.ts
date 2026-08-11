import { VisitorManagementDatasourceImpl } from '@/features/visitorManagement/datasources/VisitorManagementDatasource'
import type {
    DeleteVisitorRequest,
    FilterWithPaginationVisitorManagement,
    FilterWithPaginationVisitorsByMobileNoRequest,
    VisitorManagementDeleteResponse,
    VisitorManagementListResponse,
} from '@/features/visitorManagement/models/VisitorManagementModel'
import type { Failure } from '@/core/api/FailureResponse'
import * as E from 'fp-ts/Either'

const visitorManagementDatasource = new VisitorManagementDatasourceImpl();

export const visitorManagementService = {

    apiCallPullVisitorManagement: async (params: FilterWithPaginationVisitorManagement, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, VisitorManagementListResponse>> => {
        try {

            return E.right(await visitorManagementDatasource.pullVisitorManagement(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateVisitorManagement: async (formData: FormData): Promise<E.Either<Failure, VisitorManagementListResponse>> => {
        try {

            return E.right(await visitorManagementDatasource.addUpdateVisitorManagement(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteVisitorManagement: async (params: DeleteVisitorRequest): Promise<E.Either<Failure, VisitorManagementDeleteResponse>> => {
        try {

            return E.right(await visitorManagementDatasource.deleteVisitorManagement(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullVisitorByMobileNo: async (params: FilterWithPaginationVisitorsByMobileNoRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, VisitorManagementListResponse>> => {

        try {

            return E.right(await visitorManagementDatasource.pullVisitorsByMobileNoData(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}