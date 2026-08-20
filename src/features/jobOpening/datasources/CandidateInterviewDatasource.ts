import baseClient from "@/core/config/baseClient"
import { TokenExpiredException } from "@/core/config/baseClientexceptions"
import { CandidateInterviewApi } from "@/features/jobOpening/api/CandidateInterviewApi"
import type {
    FilterWithPaginationCandidateInterviewRequest,
    CandidateInterviewListResponse,
    CandidateInterviewSaveResponse
} from '@/features/jobOpening/models/CandidateInterviewModel'

export abstract class CandidateInterviewDatasource {

    abstract pullCandidateInterview(params: FilterWithPaginationCandidateInterviewRequest, signal?: AbortSignal): Promise<CandidateInterviewListResponse>
    abstract addUpdateCandidateInterview(data: FormData): Promise<CandidateInterviewSaveResponse>
}

export class CandidateInterviewDatasourceImpl implements CandidateInterviewDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullCandidateInterview(params: FilterWithPaginationCandidateInterviewRequest, signal?: AbortSignal): Promise<CandidateInterviewListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: (params.PageSize ?? 10).toString(),
                pageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.InterviewId) queryParams.append('InterviewId', params.InterviewId.toString())
            if (params.InterviewDate !== undefined && params.InterviewDate !== '') queryParams.append('InterviewDate', params.InterviewDate.toString())
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
}
