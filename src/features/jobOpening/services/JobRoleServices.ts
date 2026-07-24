import { Failure } from "@/core/api/FailureResponse";
import { JobRoleDatasourceImpl } from "@/features/jobOpening/datasources/JobRoleDatasource";
import type {
  JobRoleListRequest,
  JobRoleListResponse,
  AddJobRoleResponse,
  UpdateJobRoleResponse,
  JobOpeningListRequest,
  JobOpeningListResponse,
  PullCandidatesRequest,
  PullCandidatesResponse,
  DeleteJobOpeningRequest,
  DeleteJobOpeningResponse,
  AddUpdateCandidateRemarkRequest,
  AddUpdateCandidateRemarkResponse,
  PullCandidateRemarkRequest,
  PullCandidateRemarkResponse,
  PullCandidateApplicationTimelineRequest,
  PullCandidateApplicationTimelineResponse,
  ScheduleInterviewRequest,
  ScheduleInterviewResponse,
  PullCandidateInterviewRequest,
  PullCandidateInterviewResponse,
  UpdateCandidateStateRequest,
  UpdateCandidateStateResponse,
} from "@/features/jobOpening/models/JobRoleModel";

import * as E from "fp-ts/Either";

const jobRoleDatasource = new JobRoleDatasourceImpl();

const toFailure = (error: unknown, fallback?: string): Failure => {
  if (error instanceof Error && error.message) {
    return new Failure(error.message);
  }
  return new Failure(fallback);
};

export const jobRoleService = {
  apiCallPullJobDepartments: async (
    options?: { signal?: AbortSignal },
  ): Promise<E.Either<Failure, JobRoleListResponse>> => {
    try {
      return E.right(await jobRoleDatasource.pullJobDepartments(options?.signal));
    } catch (error: unknown) {
      return E.left(toFailure(error));
    }
  },

  apiCallPullJobRoles: async (
    params: JobRoleListRequest,
    options?: { signal?: AbortSignal },
  ): Promise<E.Either<Failure, JobRoleListResponse>> => {
    try {
      return E.right(await jobRoleDatasource.pullJobRoles(params, options?.signal));
    } catch (error: unknown) {
      return E.left(toFailure(error));
    }
  },

  apiCallAddUpdateJobRole: async (
    formData: FormData,
  ): Promise<E.Either<Failure, AddJobRoleResponse | UpdateJobRoleResponse>> => {
    try {
      return E.right(await jobRoleDatasource.addUpdateJobRole(formData));
    } catch (error: unknown) {
      return E.left(toFailure(error));
    }
  },

  // ---------------- Job Opening ----------------

  apiCallPullJobOpenings: async (
    params: JobOpeningListRequest,
    options?: { signal?: AbortSignal },
  ): Promise<E.Either<Failure, JobOpeningListResponse>> => {
    try {
      return E.right(await jobRoleDatasource.pullJobOpenings(params, options?.signal));
    } catch (error: unknown) {
      return E.left(toFailure(error));
    }
  },


  apiCallPullCandidates: async (
    params: PullCandidatesRequest,
    options?: { signal?: AbortSignal }, // <-- 1. Add the options parameter here
  ): Promise<E.Either<Failure, PullCandidatesResponse>> => {
    try {
      // <-- 2. Pass the signal to your datasource (if your datasource supports it)
      return E.right(await jobRoleDatasource.PullCandidates(params, options?.signal)); 
    } catch (error: unknown) {
      return E.left(toFailure(error));
    }
  },

  apiCallDeleteJobOpening: async (
    params: DeleteJobOpeningRequest,
  ): Promise<E.Either<Failure, DeleteJobOpeningResponse>> => {
    try {
      return E.right(await jobRoleDatasource.deleteJobOpening(params));
    } catch (error: unknown) {
      return E.left(toFailure(error));
    }
  },

  // ---------------- Candidate Remark / Selection Stage ----------------

  apiCallAddUpdateCandidateRemark: async (
    params: AddUpdateCandidateRemarkRequest,
  ): Promise<E.Either<Failure, AddUpdateCandidateRemarkResponse>> => {
    try {
      return E.right(await jobRoleDatasource.addUpdateCandidateRemark(params));
    } catch (error: unknown) {
      return E.left(toFailure(error));
    }
  },

  apiCallPullCandidateRemark: async (
    params: PullCandidateRemarkRequest,
    options?: { signal?: AbortSignal },
  ): Promise<E.Either<Failure, PullCandidateRemarkResponse>> => {
    try {
      return E.right(
        await jobRoleDatasource.pullCandidateRemark(params, options?.signal),
      );
    } catch (error: unknown) {
      return E.left(toFailure(error));
    }
  },

  apiCallPullCandidateApplicationTimeline: async (
    params: PullCandidateApplicationTimelineRequest,
    options?: { signal?: AbortSignal },
  ): Promise<E.Either<Failure, PullCandidateApplicationTimelineResponse>> => {
    try {
      return E.right(
        await jobRoleDatasource.pullCandidateApplicationTimeline(
          params,
          options?.signal,
        ),
      );
    } catch (error: unknown) {
      return E.left(
        toFailure(error, "Unable to load candidate timeline."),
      );
    }
  },

  apiCallScheduleInterview: async (
    params: ScheduleInterviewRequest,
  ): Promise<E.Either<Failure, ScheduleInterviewResponse>> => {
    try {
      return E.right(await jobRoleDatasource.scheduleInterview(params));
    } catch (error: unknown) {
      return E.left(toFailure(error, "Unable to schedule interview."));
    }
  },

  apiCallPullCandidateInterviews: async (
    params: PullCandidateInterviewRequest,
    options?: { signal?: AbortSignal },
  ): Promise<E.Either<Failure, PullCandidateInterviewResponse>> => {
    try {
      return E.right(
        await jobRoleDatasource.pullCandidateInterviews(
          params,
          options?.signal,
        ),
      );
    } catch (error: unknown) {
      return E.left(toFailure(error, "Unable to load interviews."));
    }
  },

  apiCallUpdateCandidateState: async (
    params: UpdateCandidateStateRequest,
  ): Promise<E.Either<Failure, UpdateCandidateStateResponse>> => {
    try {
      return E.right(await jobRoleDatasource.updateCandidateState(params));
    } catch (error: unknown) {
      return E.left(toFailure(error));
    }
  },

};
