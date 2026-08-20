import type { Failure } from '@/core/api/FailureResponse'
import { CandidateInterviewDatasourceImpl } from '@/features/jobOpening/datasources/CandidateInterviewDatasource'
import type {
    FilterWithPaginationCandidateInterviewRequest,
    CandidateInterviewListResponse,
    CandidateInterviewSaveResponse
} from '@/features/jobOpening/models/CandidateInterviewModel'
import * as E from 'fp-ts/Either'

const candidateInterviewDatasource = new CandidateInterviewDatasourceImpl()

export const CandidateInterviewService = {

    apiCallPullCandidateInterview: async (params: FilterWithPaginationCandidateInterviewRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CandidateInterviewListResponse>> => {
        try {

            return E.right(await candidateInterviewDatasource.pullCandidateInterview(params, options?.signal))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallAddUpdateCandidateInterview: async (params: FormData): Promise<E.Either<Failure, CandidateInterviewSaveResponse>> => {
        try {

            return E.right(await candidateInterviewDatasource.addUpdateCandidateInterview(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },
}
