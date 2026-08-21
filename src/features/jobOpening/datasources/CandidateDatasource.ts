import baseClient from "@/core/config/baseClient"
import { TokenExpiredException } from "@/core/config/baseClientexceptions"
import { CandidateApi } from "@/features/jobOpening/api/CandidateApi"
import { CandidateInterviewApi } from "../api/CandidateInterviewApi"
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
} from '@/features/jobOpening/models/CandidateModel'

export abstract class CandidateDatasource {

    abstract pullCandidate(params: FilterWithPaginationCandidateRequest, signal?: AbortSignal): Promise<CandidateListResponse>
    abstract addUpdateCandidateRemark(data: AddUpdateCandidateRemarkRequest): Promise<CandidateRemarkSaveResponse>
    abstract pullCandidateRemark(params: FilterWithPaginationCandidateRemarkRequest, signal?: AbortSignal): Promise<CandidateRemarkListResponse>
    abstract addUpdateCandidateStage(data: AddUpdateCandidateStageRequest): Promise<CandidateStageSaveResponse>
    abstract pullCandidateApplicationTimeline(params: FilterWithPaginationCandidateApplicationTimelineRequest, signal?: AbortSignal): Promise<CandidateApplicationTimelineListResponse>
}

export class CandidateDatasourceImpl implements CandidateDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullCandidate(params: FilterWithPaginationCandidateRequest, signal?: AbortSignal): Promise<CandidateListResponse> {
        try {
            const queryParams = new URLSearchParams()

            if (params.DepartmentId) queryParams.append('DepartmentId', params.DepartmentId.toString())
            if (params.JobRoleMasterId) queryParams.append('JobRoleMasterId', params.JobRoleMasterId.toString())
            if (params.CareerId) queryParams.append('CareerId', params.CareerId.toString())
            if (params.ApplicationStatus) queryParams.append('ApplicationStatus', params.ApplicationStatus.toString())
            if (params.FullName?.trim()) queryParams.append('FullName', params.FullName.trim())

            const queryString = queryParams.toString()
            const url = queryString ? `${CandidateApi.PULL}?${queryString}` : CandidateApi.PULL

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                url,
                { signal }
            )

            return response;
        } catch (error: any) {
            console.error('ERROR: PULL CANDIDATE :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullCandidate(params)
            }
            throw error
        }
    }

    async addUpdateCandidateRemark(params: AddUpdateCandidateRemarkRequest): Promise<CandidateRemarkSaveResponse> {
        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                CandidateApi.ADD_UPDATE_REMARK,
                params
            )

            return response;
        } catch (error) {
            console.error('ERROR: ADD UPDATE CANDIDATE REMARK :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateCandidateRemark(params)
            }
            throw error
        }
    }

    async pullCandidateRemark(params: FilterWithPaginationCandidateRemarkRequest, signal?: AbortSignal): Promise<CandidateRemarkListResponse> {
        try {
            const queryParams = new URLSearchParams({
                CandidateRemarkId: (params.CandidateRemarkId ?? 0).toString(),
                CandidateId: (params.CandidateId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${CandidateApi.PULL_REMARK}?${queryParams.toString()}`,
                { signal }
            )

            return response;
        } catch (error: any) {
            console.error('ERROR: PULL CANDIDATE REMARK :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullCandidateRemark(params)
            }
            throw error
        }
    }

    async addUpdateCandidateStage(params: AddUpdateCandidateStageRequest): Promise<CandidateStageSaveResponse> {
        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                CandidateApi.UPDATE_STAGE,
                params
            )

            return response;
        } catch (error) {
            console.error('ERROR: ADD UPDATE CANDIDATE STAGE :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateCandidateStage(params)
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
                return await this.pullCandidateApplicationTimeline(params)
            }
            throw error
        }
    }
}
