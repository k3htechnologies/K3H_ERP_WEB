import type { Failure } from '@/core/api/FailureResponse'
import { JobOpeningDatasourceImpl } from '@/features/hireSpace/jobOpening/datasources/JobOpeningDatasource'
import type {
    FilterWithPaginationJobOpeningRequest,
    AddUpdateJobOpeningRequest,
    DeleteJobOpeningRequest,
    JobOpeningListResponse,
    JobOpeningSaveResponse,
    JobOpeningDeleteResponse
} from '@/features/hireSpace/jobOpening/models/JobOpeningModel'
import * as E from 'fp-ts/Either'

const jobOpeningDatasource = new JobOpeningDatasourceImpl()

export const JobOpeningService = {

    apiCallPullJobOpening: async (params: FilterWithPaginationJobOpeningRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, JobOpeningListResponse>> => {
        try {

            return E.right(await jobOpeningDatasource.pullJobOpening(params, options?.signal))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
            
        }
    },

    apiCallAddUpdateJobOpening: async (params: AddUpdateJobOpeningRequest): Promise<E.Either<Failure, JobOpeningSaveResponse>> => {
        try {

            return E.right(await jobOpeningDatasource.addUpdateJobOpening(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallDeleteJobOpening: async (params: DeleteJobOpeningRequest): Promise<E.Either<Failure, JobOpeningDeleteResponse>> => {
        try {

            return E.right(await jobOpeningDatasource.deleteJobOpening(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
            
        }
    },
}
