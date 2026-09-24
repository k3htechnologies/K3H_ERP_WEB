import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { CandidateApi } from '@/features/hireSpace/jobOpening/api/CandidateApi'
import type {
    FilterWithPaginationCandidateRequest,
    AddUpdateCandidateRemarkRequest,
    FilterWithPaginationCandidateRemarkRequest,
    AddUpdateCandidateStageRequest,
    CandidateListResponse,
    CandidateRemarkSaveResponse,
    CandidateRemarkListResponse,
    CandidateStageSaveResponse,
} from '@/features/hireSpace/jobOpening/models/CandidateModel'

export abstract class CandidateDatasource {

    abstract pullCandidate(params: FilterWithPaginationCandidateRequest, signal?: AbortSignal): Promise<CandidateListResponse>
    abstract addUpdateCandidateRemark(data: AddUpdateCandidateRemarkRequest): Promise<CandidateRemarkSaveResponse>
    abstract pullCandidateRemark(params: FilterWithPaginationCandidateRemarkRequest, signal?: AbortSignal): Promise<CandidateRemarkListResponse>
    abstract addUpdateCandidateStage(data: AddUpdateCandidateStageRequest): Promise<CandidateStageSaveResponse>
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
            if (params.CandidateId !== undefined) queryParams.append('CandidateId', params.CandidateId.toString())
            if (params.JobOpeningId !== undefined) queryParams.append('JobOpeningId', params.JobOpeningId.toString())
            if (params.ApplicationStatus?.trim()) queryParams.append('ApplicationStatus', params.ApplicationStatus.trim())
            if (params.FullName?.trim()) queryParams.append('FullName', params.FullName.trim())

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${CandidateApi.PULL}?${queryParams.toString()}`,
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
}
