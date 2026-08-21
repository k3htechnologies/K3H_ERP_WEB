import type { Failure } from '@/core/api/FailureResponse'
import { CandidateDatasourceImpl } from '@/features/hireSpace/jobOpening/datasources/CandidateDatasource'
import type {
    FilterWithPaginationCandidateRequest,
    AddUpdateCandidateRemarkRequest,
    FilterWithPaginationCandidateRemarkRequest,
    AddUpdateCandidateStageRequest,
    FilterWithPaginationCandidateApplicationTimelineRequest,
    CandidateListResponse,
    CandidateRemarkSaveResponse,
    CandidateRemarkListResponse,
    CandidateStageSaveResponse,
    CandidateApplicationTimelineListResponse
} from '@/features/hireSpace/jobOpening/models/CandidateModel'
import * as E from 'fp-ts/Either'


const candidateDatasource = new CandidateDatasourceImpl()

export const CandidateService = {

    apiCallPullCandidate: async (params: FilterWithPaginationCandidateRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CandidateListResponse>> => {
        try {

            return E.right(await candidateDatasource.pullCandidate(params, options?.signal))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallAddUpdateCandidateRemark: async (params: AddUpdateCandidateRemarkRequest): Promise<E.Either<Failure, CandidateRemarkSaveResponse>> => {
        try {

            return E.right(await candidateDatasource.addUpdateCandidateRemark(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallPullCandidateRemark: async (params: FilterWithPaginationCandidateRemarkRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CandidateRemarkListResponse>> => {
        try {

            return E.right(await candidateDatasource.pullCandidateRemark(params, options?.signal))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallAddUpdateCandidateStage: async (params: AddUpdateCandidateStageRequest): Promise<E.Either<Failure, CandidateStageSaveResponse>> => {
        try {

            return E.right(await candidateDatasource.addUpdateCandidateStage(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallPullCandidateApplicationTimeline: async (params: FilterWithPaginationCandidateApplicationTimelineRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CandidateApplicationTimelineListResponse>> => {
        try {

            return E.right(await candidateDatasource.pullCandidateApplicationTimeline(params, options?.signal))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },
}
