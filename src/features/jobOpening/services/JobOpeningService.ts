import type { Failure } from '@/core/api/FailureResponse';
import type {
    FilterWithPaginationJobOpeningRequest,
    AddUpdateJobOpeningRequest,
    DeleteJobOpeningRequest,
    PullCandidatesRequest,
    AddUpdateCandidateRemarkRequest,
    PullCandidateRemarkRequest,
    UpdateCandidateStageRequest,
    PullCandidateApplicationTimelineRequest,
    ScheduleInterviewRequest,
    PullCandidateInterviewRequest,
    JobOpeningListResponse,
    JobOpeningSaveResponse,
    JobOpeningDeleteResponse,
    PullCandidatesResponse,
    AddUpdateCandidateRemarkResponse,
    PullCandidateRemarkResponse,
    UpdateCandidateStageResponse,
    PullCandidateApplicationTimelineResponse,
    ScheduleInterviewResponse,
    PullCandidateInterviewResponse
} from '@/features/jobOpening/models/JobOpeningModel'
import * as E from 'fp-ts/Either';
import { JobOpeningDatasourceImpl } from '@/features/jobOpening/datasources/JobOpeningDatasource';

const jobOpeningDatasource = new JobOpeningDatasourceImpl();

export const jobOpeningService = {

    apiCallPullJobOpening: async (params: FilterWithPaginationJobOpeningRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, JobOpeningListResponse>> => {
        try {

            return E.right(await jobOpeningDatasource.pullJobOpening(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateJobOpening: async (params: AddUpdateJobOpeningRequest): Promise<E.Either<Failure, JobOpeningSaveResponse>> => {
        try {

            return E.right(await jobOpeningDatasource.addUpdateJobOpening(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteJobOpening: async (params: DeleteJobOpeningRequest): Promise<E.Either<Failure, JobOpeningDeleteResponse>> => {
        try {

            return E.right(await jobOpeningDatasource.deleteJobOpening(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullCandidates: async (params: PullCandidatesRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PullCandidatesResponse>> => {
        try {

            return E.right(await jobOpeningDatasource.pullCandidates(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateCandidateRemark: async (params: AddUpdateCandidateRemarkRequest): Promise<E.Either<Failure, AddUpdateCandidateRemarkResponse>> => {
        try {

            return E.right(await jobOpeningDatasource.addUpdateCandidateRemark(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullCandidateRemark: async (params: PullCandidateRemarkRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PullCandidateRemarkResponse>> => {
        try {

            return E.right(await jobOpeningDatasource.pullCandidateRemark(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallUpdateCandidateStage: async (params: UpdateCandidateStageRequest): Promise<E.Either<Failure, UpdateCandidateStageResponse>> => {
        try {

            return E.right(await jobOpeningDatasource.updateCandidateStage(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullCandidateApplicationTimeline: async (params: PullCandidateApplicationTimelineRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PullCandidateApplicationTimelineResponse>> => {
        try {

            return E.right(await jobOpeningDatasource.pullCandidateApplicationTimeline(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallScheduleInterview: async (params: ScheduleInterviewRequest): Promise<E.Either<Failure, ScheduleInterviewResponse>> => {
        try {

            return E.right(await jobOpeningDatasource.scheduleInterview(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullCandidateInterviews: async (params: PullCandidateInterviewRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PullCandidateInterviewResponse>> => {
        try {

            return E.right(await jobOpeningDatasource.pullCandidateInterviews(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
