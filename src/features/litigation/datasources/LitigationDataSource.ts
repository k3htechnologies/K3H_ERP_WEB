import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { LitigationApi } from '@/features/litigation/api/LitigationApi'
import type {
    FilterWithPaginationLitigationRequest,
    LitigationListResponse,
    LitigationSaveResponse,
    LitigationDeleteResponse,
    LitigationHearingListResponse,
    LitigationHearingSaveResponse,
    LitigationHearingDeleteResponse,
    LitigationClosureListResponse,
    LitigationClosureSaveResponse,
    DeleteLitigationRequest,
    DeleteLitigationHearingRequest,
    FilterWithPaginationLitigationHearingRequest,
    FilterWithPaginationLitigationClosureRequest,
    AddUpdateLitigationRequest,

} from '@/features/litigation/models/LitigationModel'

export abstract class LitigationDatasource {
    abstract pullLitigation(params: FilterWithPaginationLitigationRequest, signal?: AbortSignal): Promise<LitigationListResponse>;
    abstract addUpadateLitigation(data: AddUpdateLitigationRequest): Promise<LitigationSaveResponse>;
    abstract deleteLitigation(params: DeleteLitigationRequest): Promise<LitigationDeleteResponse>;

    abstract pullLitigationHearing(params: FilterWithPaginationLitigationHearingRequest, signal?: AbortSignal): Promise<LitigationHearingListResponse>;
    abstract addUpadateLitigationHearing(data: FormData): Promise<LitigationHearingSaveResponse>;
    abstract deleteLitigationHearing(params: DeleteLitigationHearingRequest): Promise<LitigationHearingDeleteResponse>;

    abstract pullLitigationClosure(params: FilterWithPaginationLitigationClosureRequest, signal?: AbortSignal): Promise<LitigationClosureListResponse>;
    abstract addUpadateLitigationClosure(data: FormData): Promise<LitigationClosureSaveResponse>;
}

export class LitigationDatasourceImpl implements LitigationDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullLitigation(params: FilterWithPaginationLitigationRequest, signal?: AbortSignal): Promise<LitigationListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.LitigationId) queryParams.append('LitigationId', params.LitigationId.toString());
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.CaseNumber?.trim()) queryParams.append('CaseNumber', params.CaseNumber.trim());
            if (params.Title?.trim()) queryParams.append('Title', params.Title.trim());
            if (params.CourtName?.trim()) queryParams.append('CourtName', params.CourtName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${LitigationApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL LITIGATION:', error);

            if (error === TokenExpiredException) {
                await this.pullLitigation(params);
            }

            throw error
        }
    }
    async addUpadateLitigation(params: AddUpdateLitigationRequest): Promise<LitigationSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                LitigationApi.ADD_UPDATE,
                params
            )
            return response

        } catch (error) {

            console.error('ERROR:ADD UPDATE LITIGATION :', error)

            if (error === TokenExpiredException) {
                await this.addUpadateLitigation(params);
            }
            throw error
        }
    }

    async pullLitigationHearing(params: FilterWithPaginationLitigationHearingRequest, signal?: AbortSignal): Promise<LitigationHearingListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.LitigationHearingId) queryParams.append('LitigationHearingId', params.LitigationHearingId.toString());
            if (params.LitigationId) queryParams.append('LitigationId', params.LitigationId.toString());
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${LitigationApi.PULL_HEARING}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL LITIGATION HEARING:', error);

            if (error === TokenExpiredException) {
                await this.pullLitigationHearing(params);
            }

            throw error
        }
    }
    async addUpadateLitigationHearing(formData: FormData): Promise<LitigationHearingSaveResponse> {

        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                LitigationApi.ADD_UPDATE_HEARING,
                formData
            )
            return response

        } catch (error) {

            console.error('ERROR:ADD UPDATE LITIGATION HEARING:', error)

            if (error === TokenExpiredException) {
                await this.addUpadateLitigationHearing(formData);
            }
            throw error
        }
    }

    async pullLitigationClosure(params: FilterWithPaginationLitigationClosureRequest, signal?: AbortSignal): Promise<LitigationClosureListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.LitigationClosureId) queryParams.append('LitigationClosureId', params.LitigationClosureId.toString());
            if (params.LitigationId) queryParams.append('LitigationId', params.LitigationId.toString());
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${LitigationApi.PULL_CLOSURE}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL LITIGATION CLOSURE:', error);

            if (error === TokenExpiredException) {
                await this.pullLitigationClosure(params);
            }

            throw error
        }
    }
    async addUpadateLitigationClosure(formData: FormData): Promise<LitigationClosureSaveResponse> {

        try {
            debugger
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                LitigationApi.ADD_UPDATE_CLOSURE,
                formData
            )
            return response

        } catch (error) {

            console.error('ERROR:ADD UPDATE LITIGATION CLOSURE:', error)

            if (error === TokenExpiredException) {
                await this.addUpadateLitigationClosure(formData);
            }
            throw error
        }
    }

    async deleteLitigation(params: DeleteLitigationRequest): Promise<LitigationDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                LitigationId: (params.LitigationId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${LitigationApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE LITIGATION :', error)

            if (error === TokenExpiredException) {

                await this.deleteLitigation(params);
            }

            throw error
        }
    }

    async deleteLitigationHearing(params: DeleteLitigationHearingRequest): Promise<LitigationHearingDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                LitigationId: (params.LitigationId ?? 0).toString(),
                LitigationHearingId: (params.LitigationHearingId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${LitigationApi.DELETE_HEARING}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE LITIGATION HEARING:', error)

            if (error === TokenExpiredException) {

                await this.deleteLitigationHearing(params);
            }

            throw error
        }
    }
}

