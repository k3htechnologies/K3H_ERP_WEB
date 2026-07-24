import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { JobRoleApis } from "@/features/jobOpening/api/JobRoleApi";
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

export abstract class JobRoleDatasource {
  abstract pullJobRoles(params: JobRoleListRequest, signal?: AbortSignal): Promise<JobRoleListResponse>;
  abstract pullJobDepartments(signal?: AbortSignal): Promise<JobRoleListResponse>;
  abstract addUpdateJobRole(formData: FormData): Promise<AddJobRoleResponse | UpdateJobRoleResponse>;

  abstract pullJobOpenings(params: JobOpeningListRequest, signal?: AbortSignal): Promise<JobOpeningListResponse>;
  abstract PullCandidates(params: PullCandidatesRequest, signal?: AbortSignal): Promise<PullCandidatesResponse>;
  abstract deleteJobOpening(params: DeleteJobOpeningRequest): Promise<DeleteJobOpeningResponse>;

  abstract addUpdateCandidateRemark(
    params: AddUpdateCandidateRemarkRequest,
  ): Promise<AddUpdateCandidateRemarkResponse>;
  abstract pullCandidateRemark(
    params: PullCandidateRemarkRequest,
    signal?: AbortSignal,
  ): Promise<PullCandidateRemarkResponse>;
  abstract pullCandidateApplicationTimeline(
    params: PullCandidateApplicationTimelineRequest,
    signal?: AbortSignal,
  ): Promise<PullCandidateApplicationTimelineResponse>;
  abstract scheduleInterview(
    params: ScheduleInterviewRequest,
  ): Promise<ScheduleInterviewResponse>;
  abstract pullCandidateInterviews(
    params: PullCandidateInterviewRequest,
    signal?: AbortSignal,
  ): Promise<PullCandidateInterviewResponse>;
  abstract updateCandidateState(
    params: UpdateCandidateStateRequest,
  ): Promise<UpdateCandidateStateResponse>;
}

export class JobRoleDatasourceImpl implements JobRoleDatasource {
  private get k3hHttpClient() {
    return baseClient;
  }

  async pullJobDepartments(signal?: AbortSignal): Promise<JobRoleListResponse> {
    try {
      return await this.k3hHttpClient.getRequestWithAuthentication(JobRoleApis.PULL_DEPARTMENTS, { signal });
    } catch (error: unknown) {
      if (!signal?.aborted) console.error("ERROR: PULL JOB DEPARTMENTS:", error);
      if (error instanceof TokenExpiredException) {
        return await this.pullJobDepartments(signal);
      }
      throw error;
    }
  }

  async pullJobRoles(params: JobRoleListRequest, signal?: AbortSignal): Promise<JobRoleListResponse> {
    try {
      const queryParams = new URLSearchParams({
        PageSize: (params.PageSize ?? 10).toString(),
        PageNumber: (params.PageNumber ?? 1).toString(),
      });

      if (params.DepartmentId) queryParams.append("DepartmentId", params.DepartmentId.toString());
      if (params.DepartmentName) queryParams.append("DepartmentName", params.DepartmentName);
      if (params.SortBy) queryParams.append("SortBy", params.SortBy);
      if (params.ExportType) queryParams.append("ExportType", params.ExportType);

      return await this.k3hHttpClient.getRequestWithAuthentication(`${JobRoleApis.PULL_JOB_ROLES}?${queryParams.toString()}`, { signal });
    } catch (error: unknown) {
      if (!signal?.aborted) console.error("ERROR: PULL JOB ROLES:", error);
      if (error instanceof TokenExpiredException) {
        return await this.pullJobRoles(params, signal);
      }
      throw error;
    }
  }

  async addUpdateJobRole(formData: FormData): Promise<AddJobRoleResponse | UpdateJobRoleResponse> {
    try {
      return await this.k3hHttpClient.postRequestWithAuthentication(JobRoleApis.ADD_UPDATE, formData);
    } catch (error: unknown) {
      console.error("ERROR: ADD/UPDATE JOB ROLE:", error);
      if (error instanceof TokenExpiredException) {
        return await this.addUpdateJobRole(formData);
      }
      throw error;
    }
  }

  async pullJobOpenings(params: JobOpeningListRequest, signal?: AbortSignal): Promise<JobOpeningListResponse> {
    try {
      const queryParams = new URLSearchParams({
        PageSize: (params.PageSize ?? 10).toString(),
        PageNumber: (params.PageNumber ?? 1).toString(),
      });

      if (params.DepartmentMasterId) queryParams.append("DepartmentMasterId", params.DepartmentMasterId.toString());
      if (params.DepartmentName) queryParams.append("DepartmentName", params.DepartmentName);
      if (params.JobRoleMasterId) queryParams.append("JobRoleMasterId", params.JobRoleMasterId.toString());
      if (params.RoleName) queryParams.append("RoleName", params.RoleName);
      if (params.JobRoleStatus !== undefined) queryParams.append("JobRoleStatus", String(params.JobRoleStatus));
      if (params.ExportType) queryParams.append("ExportType", params.ExportType);

      return await this.k3hHttpClient.getRequestWithAuthentication(`${JobRoleApis.PULL_JOB_OPENING}?${queryParams.toString()}`, { signal });
    } catch (error: unknown) {
      if (!signal?.aborted) console.error("ERROR: PULL JOB OPENINGS:", error);
      if (error instanceof TokenExpiredException) {
        return await this.pullJobOpenings(params, signal);
      }
      throw error;
    }
  }

  async PullCandidates(params: PullCandidatesRequest, signal?: AbortSignal): Promise<PullCandidatesResponse> {
    const queryParams = new URLSearchParams();

    if (params.DepartmentId) queryParams.append("DepartmentId", params.DepartmentId.toString());
    if (params.JobRoleMasterId) queryParams.append("JobRoleMasterId", params.JobRoleMasterId.toString());
    if (params.CareerId) queryParams.append("CareerId", String(params.CareerId));
    if (params.ApplicationStatus) queryParams.append("ApplicationStatus", String(params.ApplicationStatus));
    // Agar FullName search karna hai, toh uska param name confirm karein (example: FullName)
    if (params.FullName) queryParams.append("FullName", params.FullName);

    const queryString = queryParams.toString();
    const url = queryString ? `${JobRoleApis.PULL_CANDIDATES}?${queryString}` : JobRoleApis.PULL_CANDIDATES;

    try {
     
      return await this.k3hHttpClient.getRequestWithAuthentication(url, { signal });
    } catch (error: unknown) {
      if (!signal?.aborted) {
        console.error("ERROR: PULL CANDIDATES:", error);
      }

      if (error instanceof TokenExpiredException) {
        return await this.PullCandidates(params, signal);
      }
      throw error;
    }
  }

  async deleteJobOpening(params: DeleteJobOpeningRequest): Promise<DeleteJobOpeningResponse> {
    try {
      const queryParams = new URLSearchParams({
        JobOpeningId: (params.JobOpeningMasterId ?? 0).toString(),
        UniqueKey: params.UniqueKey ?? "",
      });

      return await this.k3hHttpClient.deleteRequestWithAuthentication(`${JobRoleApis.DELETE_JOB_OPENING}?${queryParams.toString()}`);
    } catch (error: unknown) {
      console.error("ERROR: DELETE JOB OPENING:", error);
      if (error instanceof TokenExpiredException) {
        return await this.deleteJobOpening(params);
      }
      throw error;
    }
  }


  async addUpdateCandidateRemark(
    params: AddUpdateCandidateRemarkRequest,
  ): Promise<AddUpdateCandidateRemarkResponse> {
    try {
      return await this.k3hHttpClient.postRequestWithAuthentication(
        JobRoleApis.ADD_REMARK,
        params,
      );
    } catch (error: unknown) {
      console.error("ERROR: ADD/UPDATE CANDIDATE REMARK:", error);
      if (error instanceof TokenExpiredException) {
        return await this.addUpdateCandidateRemark(params);
      }
      throw error;
    }
  }

  async pullCandidateRemark(
    params: PullCandidateRemarkRequest,
    signal?: AbortSignal,
  ): Promise<PullCandidateRemarkResponse> {
    const queryParams = new URLSearchParams({
      CandidateRemarkId: params.CandidateRemarkId.toString(),
      CandidateId: params.CandidateId.toString(),
    });

    try {
      return await this.k3hHttpClient.getRequestWithAuthentication(
        `${JobRoleApis.PULL_REMARK}?${queryParams.toString()}`,
        { signal },
      );
    } catch (error: unknown) {
      if (!signal?.aborted) {
        console.error("ERROR: PULL CANDIDATE REMARK:", error);
      }
      if (error instanceof TokenExpiredException) {
        return await this.pullCandidateRemark(params, signal);
      }
      throw error;
    }
  }

  async pullCandidateApplicationTimeline(
    params: PullCandidateApplicationTimelineRequest,
    signal?: AbortSignal,
  ): Promise<PullCandidateApplicationTimelineResponse> {
    const queryParams = new URLSearchParams({
      CandidateId: params.CandidateId.toString(),
    });

    try {
      return await this.k3hHttpClient.getRequestWithAuthentication(
        `${JobRoleApis.PULL_CANDIDATE_TIMELINE}?${queryParams.toString()}`,
        { signal },
      );
    } catch (error: unknown) {
      if (!signal?.aborted) {
        console.error("ERROR: PULL CANDIDATE TIMELINE:", error);
      }
      if (error instanceof TokenExpiredException) {
        return await this.pullCandidateApplicationTimeline(params, signal);
      }
      throw error;
    }
  }

  async scheduleInterview(
    params: ScheduleInterviewRequest,
  ): Promise<ScheduleInterviewResponse> {
    try {
      return await this.k3hHttpClient.postRequestWithAuthentication(
        JobRoleApis.SCHEDULE_INTERVIEW,
        params,
      );
    } catch (error: unknown) {
      console.error("ERROR: SCHEDULE INTERVIEW:", error);
      if (error instanceof TokenExpiredException) {
        return await this.scheduleInterview(params);
      }
      throw error;
    }
  }

  async pullCandidateInterviews(
    params: PullCandidateInterviewRequest,
    signal?: AbortSignal,
  ): Promise<PullCandidateInterviewResponse> {
    const queryParams = new URLSearchParams({
      PageSize: String(params.PageSize ?? 10),
      PageNumber: String(params.PageNumber ?? 1),
    });

    if (params.InterviewId) {
      queryParams.append("InterviewId", String(params.InterviewId));
    }
    if (params.InterviewDate !== undefined && params.InterviewDate !== "") {
      queryParams.append("InterviewDate", String(params.InterviewDate));
    }
    if (params.Month) queryParams.append("Month", String(params.Month));
    if (params.Year) queryParams.append("Year", String(params.Year));
    if (params.CandidateName) {
      queryParams.append("CandidateName", params.CandidateName);
    }
    if (params.Stage) queryParams.append("Stage", params.Stage);

    try {
      return await this.k3hHttpClient.getRequestWithAuthentication(
        `${JobRoleApis.PULL_CANDIDATE_INTERVIEW}?${queryParams.toString()}`,
        { signal },
      );
    } catch (error: unknown) {
      if (!signal?.aborted) {
        console.error("ERROR: PULL CANDIDATE INTERVIEWS:", error);
      }
      if (error instanceof TokenExpiredException) {
        return await this.pullCandidateInterviews(params, signal);
      }
      throw error;
    }
  }

  async updateCandidateState(
    params: UpdateCandidateStateRequest,
  ): Promise<UpdateCandidateStateResponse> {
    try {
      return await this.k3hHttpClient.postRequestWithAuthentication(
        JobRoleApis.UPDATE_STAGE,
        params,
      );
    } catch (error: unknown) {
      console.error("ERROR: UPDATE CANDIDATE STATE:", error);
      if (error instanceof TokenExpiredException) {
        return await this.updateCandidateState(params);
      }
      throw error;
    }
  }

}
