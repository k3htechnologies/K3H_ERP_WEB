import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {

} from '@/features/litigation/models/LitigationModel'
import type {
    
    DeleteLitigationHearingRequest,
    FilterWithPaginationLitigationHearingRequest,
    LitigationHearingDeleteResponse,
    LitigationHearingListResponse,
    LitigationHearingSaveResponse

} from "@/features/litigation/models/LitigationHearingModel";

import { LitigationHearingApi } from "@/features/litigation/api/LitigationHearingApi";

export abstract class LitigationHearingDatasource {

    abstract pullLitigationHearing(params: FilterWithPaginationLitigationHearingRequest, signal?: AbortSignal): Promise<LitigationHearingListResponse>;
    abstract addUpadateLitigationHearing(data: FormData): Promise<LitigationHearingSaveResponse>;
    abstract deleteLitigationHearing(params: DeleteLitigationHearingRequest): Promise<LitigationHearingDeleteResponse>;
}

export class LitigationHearingDatasourceImpl implements LitigationHearingDatasource {
    private get k3hHttpClient() {
        return baseClient
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
                `${LitigationHearingApi.PULL_HEARING}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL LITIGATION HEARING:', error);

            if (error instanceof TokenExpiredException) {

                return  await this.pullLitigationHearing(params);
            }

            throw error
        }
    }
    async addUpadateLitigationHearing(formData: FormData): Promise<LitigationHearingSaveResponse> {

        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                LitigationHearingApi.ADD_UPDATE_HEARING,
                formData
            )
            return response

        } catch (error) {

            console.error('ERROR:ADD UPDATE LITIGATION HEARING:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpadateLitigationHearing(formData);
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
                `${LitigationHearingApi.DELETE_HEARING}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE LITIGATION HEARING:', error)

            if (error instanceof TokenExpiredException) {

                return  await this.deleteLitigationHearing(params);
            }

            throw error
        }
    }
}

