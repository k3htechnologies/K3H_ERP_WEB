import baseClient from "@/core/config/baseClient"
import { TokenExpiredException } from "@/core/config/baseClientexceptions"
import { CandidateInterviewApi } from "@/features/hireSpace/jobOpening/api/CandidateInterviewApi"
import type {
    FilterWithPaginationCandidateInterviewRequest,
    CandidateInterviewListResponse,
    CandidateInterviewSaveResponse
} from '@/features/hireSpace/jobOpening/models/CandidateInterviewModel'
import type {
    CandidateApplicationStageListResponse,
    CandidateApplicationTimelineListResponse,
    FilterWithPaginationCandidateApplicationStageRequest,
    FilterWithPaginationCandidateApplicationTimelineRequest,
} from '@/features/hireSpace/jobOpening/models/CandidateModel'

export abstract class CandidateInterviewDatasource {

    abstract pullCandidateInterview(params: FilterWithPaginationCandidateInterviewRequest, signal?: AbortSignal): Promise<CandidateInterviewListResponse>
    abstract addUpdateCandidateInterview(data: FormData): Promise<CandidateInterviewSaveResponse>
    abstract pullCandidateApplicationStage(params: FilterWithPaginationCandidateApplicationStageRequest, signal?: AbortSignal): Promise<CandidateApplicationStageListResponse>
    abstract pullCandidateApplicationTimeline(params: FilterWithPaginationCandidateApplicationTimelineRequest, signal?: AbortSignal): Promise<CandidateApplicationTimelineListResponse>
}

export class CandidateInterviewDatasourceImpl implements CandidateInterviewDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullCandidateInterview(params: FilterWithPaginationCandidateInterviewRequest, signal?: AbortSignal): Promise<CandidateInterviewListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: params.PageSize.toString(),
                pageNumber: params.PageNumber.toString(),
            })

            if (params.InterviewId) queryParams.append('InterviewId', params.InterviewId.toString())
            if (params.InterviewDate) queryParams.append('InterviewDate', params.InterviewDate.toString())
            if (params.Month) queryParams.append('Month', params.Month.toString())
            if (params.Year) queryParams.append('Year', params.Year.toString())
            if (params.CandidateName?.trim()) queryParams.append('CandidateName', params.CandidateName.trim())
            if (params.Stage?.trim()) queryParams.append('Stage', params.Stage.trim())

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${CandidateInterviewApi.PULL}?${queryParams.toString()}`,
                { signal }
            )

            return response;
        } catch (error: any) {
            console.error('ERROR: PULL CANDIDATE INTERVIEW :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullCandidateInterview(params)
            }
            throw error
        }
    }

    async addUpdateCandidateInterview(params: FormData): Promise<CandidateInterviewSaveResponse> {
        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                CandidateInterviewApi.ADD_UPDATE,
                params
            )

            return response;
        } catch (error: any) {
            console.error('ERROR: ADD UPDATE CANDIDATE INTERVIEW :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateCandidateInterview(params)
            }
            throw error
        }
    }

    async pullCandidateApplicationStage(params: FilterWithPaginationCandidateApplicationStageRequest,signal?: AbortSignal): Promise<CandidateApplicationStageListResponse> {
        try {
            const queryParams = new URLSearchParams()

            if (params.DepartmentId) queryParams.append('DepartmentId', params.DepartmentId.toString())
            if (params.JobOpeningId !== undefined) queryParams.append('JobOpeningId', params.JobOpeningId.toString())

            const queryString = queryParams.toString()
            const url = queryString
                ? `${CandidateInterviewApi.PULL_STAGE}?${queryString}`
                : CandidateInterviewApi.PULL_STAGE

            const response = await this.k3hHttpClient.getRequestWithAuthentication(url,{ signal })

            return response;
        } catch (error: any) {
            console.error('ERROR: PULL CANDIDATE APPLICATION STAGE :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullCandidateApplicationStage(params, signal)
            }
            throw error
        }
    }

    async pullCandidateApplicationTimeline(params: FilterWithPaginationCandidateApplicationTimelineRequest, signal?: AbortSignal): Promise<CandidateApplicationTimelineListResponse> {
        try {
            const queryParams = new URLSearchParams({
                CandidateId: (params.CandidateId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${CandidateInterviewApi.PULL_TIMELINE}?${queryParams.toString()}`,
                { signal }
            )

            return response;
        } catch (error: any) {
            console.error('ERROR: PULL CANDIDATE APPLICATION TIMELINE :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullCandidateApplicationTimeline(params, signal)
            }
            throw error
        }
    }
}
