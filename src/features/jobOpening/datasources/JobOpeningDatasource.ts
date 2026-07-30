import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { JobOpeningApi } from '@/features/jobOpening/api/JobOpeningApi'
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

export abstract class JobOpeningDatasource {

    abstract pullJobOpening(params: FilterWithPaginationJobOpeningRequest, signal?: AbortSignal): Promise<JobOpeningListResponse>;
    abstract addUpdateJobOpening(data: AddUpdateJobOpeningRequest): Promise<JobOpeningSaveResponse>;
    abstract deleteJobOpening(params: DeleteJobOpeningRequest): Promise<JobOpeningDeleteResponse>;
    abstract pullCandidates(params: PullCandidatesRequest, signal?: AbortSignal): Promise<PullCandidatesResponse>;
    abstract addUpdateCandidateRemark(data: AddUpdateCandidateRemarkRequest): Promise<AddUpdateCandidateRemarkResponse>;
    abstract pullCandidateRemark(params: PullCandidateRemarkRequest, signal?: AbortSignal): Promise<PullCandidateRemarkResponse>;
    abstract updateCandidateStage(data: UpdateCandidateStageRequest): Promise<UpdateCandidateStageResponse>;
    abstract pullCandidateApplicationTimeline(params: PullCandidateApplicationTimelineRequest, signal?: AbortSignal): Promise<PullCandidateApplicationTimelineResponse>;
    abstract scheduleInterview(data: ScheduleInterviewRequest): Promise<ScheduleInterviewResponse>;
    abstract pullCandidateInterviews(params: PullCandidateInterviewRequest, signal?: AbortSignal): Promise<PullCandidateInterviewResponse>;
}

export class JobOpeningDatasourceImpl implements JobOpeningDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullJobOpening(params: FilterWithPaginationJobOpeningRequest, signal?: AbortSignal): Promise<JobOpeningListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.JobOpeningMasterId) queryParams.append('JobOpeningMasterId', params.JobOpeningMasterId.toString());
            if (params.DepartmentMasterId) queryParams.append('DepartmentMasterId', params.DepartmentMasterId.toString());
            if (params.DepartmentName?.trim()) queryParams.append('DepartmentName', params.DepartmentName.trim());
            if (params.JobRoleMasterId) queryParams.append('JobRoleMasterId', params.JobRoleMasterId.toString());
            if (params.RoleName?.trim()) queryParams.append('RoleName', params.RoleName.trim());
            if (params.JobRoleStatus !== undefined) queryParams.append('JobRoleStatus', params.JobRoleStatus.toString());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${JobOpeningApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: unknown) {

            console.error('ERROR: PULL JOB OPENING :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullJobOpening(params);
            }
            throw error
        }
    }

    async addUpdateJobOpening(params: AddUpdateJobOpeningRequest): Promise<JobOpeningSaveResponse> {

        try {

            const payLoad: AddUpdateJobOpeningRequest = {
                JobOpeningMasterId: params.JobOpeningMasterId ?? 0,
                UniqueKey: params.UniqueKey ?? '',
                DepartmentMasterId: params.DepartmentMasterId ?? 0,
                JobRoleMasterId: params.JobRoleMasterId ?? 0,
                JobDescription: params.JobDescription.trim(),
                JobResponsibilities: params.JobResponsibilities.trim(),
                JobRequirement: params.JobRequirement.trim(),
                JobQualification: params.JobQualification.trim(),
                JobSkills: params.JobSkills.trim(),
                WorkMode: params.WorkMode.trim(),
                ExperienceYears: params.ExperienceYears ?? 0,
                ExperienceMonths: params.ExperienceMonths ?? 0,
                NumberOfOpenings: params.NumberOfOpenings ?? 0,
                WorkLocation: params.WorkLocation.trim(),
                EmploymentType: params.EmploymentType.trim(),
                JobRoleStatus: params.JobRoleStatus
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                JobOpeningApi.ADD_UPDATE,
                payLoad
            )

            return response
        } catch (error) {
            console.error('ERROR: ADD UPDATE JOB OPENING :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateJobOpening(params);
            }
            throw error
        }
    }

    async deleteJobOpening(params: DeleteJobOpeningRequest): Promise<JobOpeningDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                JobOpeningId: (params.JobOpeningMasterId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${JobOpeningApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {
            console.error('ERROR: DELETE JOB OPENING :', error);

            if (error instanceof TokenExpiredException) {

                return await this.deleteJobOpening(params);

            }

            throw error
        }
    }

    async pullCandidates(params: PullCandidatesRequest, signal?: AbortSignal): Promise<PullCandidatesResponse> {
        try {
            const queryParams = new URLSearchParams()

            if (params.DepartmentId) queryParams.append('DepartmentId', params.DepartmentId.toString());
            if (params.JobRoleMasterId) queryParams.append('JobRoleMasterId', params.JobRoleMasterId.toString());
            if (params.CareerId) queryParams.append('CareerId', params.CareerId.toString());
            if (params.ApplicationStatus) queryParams.append('ApplicationStatus', params.ApplicationStatus.toString());
            if (params.FullName?.trim()) queryParams.append('FullName', params.FullName.trim());

            const queryString = queryParams.toString()
            const url = queryString ? `${JobOpeningApi.PULL_CANDIDATES}?${queryString}` : JobOpeningApi.PULL_CANDIDATES

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                url, { signal }
            )
            return response;
        } catch (error: unknown) {

            console.error('ERROR: PULL CANDIDATES :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullCandidates(params);
            }
            throw error
        }
    }

    async addUpdateCandidateRemark(params: AddUpdateCandidateRemarkRequest): Promise<AddUpdateCandidateRemarkResponse> {

        try {

            const payLoad: AddUpdateCandidateRemarkRequest = {
                CandidateRemarkId: params.CandidateRemarkId ?? 0,
                UniqueKey: params.UniqueKey ?? '',
                CandidateId: params.CandidateId ?? 0,
                Remark: params.Remark.trim(),
                ApplicantStatus: params.ApplicantStatus.trim()
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                JobOpeningApi.ADD_UPDATE_CANDIDATE_REMARK,
                payLoad
            )

            return response
        } catch (error: unknown) {
            console.error('ERROR: ADD UPDATE CANDIDATE REMARK :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateCandidateRemark(params);
            }
            throw error
        }
    }

    async pullCandidateRemark(params: PullCandidateRemarkRequest, signal?: AbortSignal): Promise<PullCandidateRemarkResponse> {
        try {
            const queryParams = new URLSearchParams({
                CandidateRemarkId: (params.CandidateRemarkId ?? 0).toString(),
                CandidateId: (params.CandidateId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${JobOpeningApi.PULL_CANDIDATE_REMARK}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: unknown) {

            console.error('ERROR: PULL CANDIDATE REMARK :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullCandidateRemark(params);
            }
            throw error
        }
    }

    async updateCandidateStage(params: UpdateCandidateStageRequest): Promise<UpdateCandidateStageResponse> {

        try {

            const payLoad: UpdateCandidateStageRequest = {
                CandidateId: params.CandidateId ?? 0,
                UniqueKey: params.UniqueKey ?? '',
                ApplicantStatus: params.ApplicantStatus.trim(),
                ModifiedById: params.ModifiedById ?? 0,
                ModifiedDate: params.ModifiedDate
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                JobOpeningApi.UPDATE_CANDIDATE_STAGE,
                payLoad
            )

            return response
        } catch (error: unknown) {
            console.error('ERROR: UPDATE CANDIDATE STAGE :', error)

            if (error instanceof TokenExpiredException) {

                return await this.updateCandidateStage(params);
            }
            throw error
        }
    }

    async pullCandidateApplicationTimeline(params: PullCandidateApplicationTimelineRequest, signal?: AbortSignal): Promise<PullCandidateApplicationTimelineResponse> {
        try {
            const queryParams = new URLSearchParams({
                CandidateId: (params.CandidateId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${JobOpeningApi.PULL_CANDIDATE_TIMELINE}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: unknown) {

            console.error('ERROR: PULL CANDIDATE APPLICATION TIMELINE :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullCandidateApplicationTimeline(params);
            }
            throw error
        }
    }

    async scheduleInterview(params: ScheduleInterviewRequest): Promise<ScheduleInterviewResponse> {

        try {

            const payLoad: ScheduleInterviewRequest = {
                InterviewId: params.InterviewId ?? 0,
                UniqueKey: params.UniqueKey ?? '',
                CandidateId: params.CandidateId ?? 0,
                JobOpeningMasterId: params.JobOpeningMasterId ?? 0,
                Stage: params.Stage.trim(),
                InterviewPanel: params.InterviewPanel.trim(),
                InterviewDate: params.InterviewDate,
                InterviewTime: params.InterviewTime,
                AttachmentUrl: params.AttachmentUrl.trim(),
                Remarks: params.Remarks.trim()
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                JobOpeningApi.SCHEDULE_INTERVIEW,
                payLoad
            )

            return response
        } catch (error: unknown) {
            console.error('ERROR: SCHEDULE INTERVIEW :', error)

            if (error instanceof TokenExpiredException) {

                return await this.scheduleInterview(params);
            }
            throw error
        }
    }

    async pullCandidateInterviews(params: PullCandidateInterviewRequest, signal?: AbortSignal): Promise<PullCandidateInterviewResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageNumber: (params.PageNumber ?? 1).toString(),
                PageSize: (params.PageSize ?? 10).toString(),
            })

            if (params.InterviewId) queryParams.append('InterviewId', params.InterviewId.toString());
            if (params.InterviewDate !== undefined && params.InterviewDate !== '') queryParams.append('InterviewDate', params.InterviewDate.toString());
            if (params.Month) queryParams.append('Month', params.Month.toString());
            if (params.Year) queryParams.append('Year', params.Year.toString());
            if (params.CandidateName?.trim()) queryParams.append('CandidateName', params.CandidateName.trim());
            if (params.Stage?.trim()) queryParams.append('Stage', params.Stage.trim());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${JobOpeningApi.PULL_CANDIDATE_INTERVIEWS}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: unknown) {

            console.error('ERROR: PULL CANDIDATE INTERVIEW :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullCandidateInterviews(params);
            }
            throw error
        }
    }
}
