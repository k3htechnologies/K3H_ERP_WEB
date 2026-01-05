import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { LitigationApi } from '@/features/litigation/api/LitigationApi'
import type {
    FilterWithPaginationLitigationRequest,
    DeleteLitigationRequest,
    LitigationListResponse,
    LitigationSaveResponse,
    LitigationDeleteResponse
} from '@/features/litigation/models/LitigationModel'

export abstract class LitigationDatasource {
    abstract pullLitigation(params: FilterWithPaginationLitigationRequest, signal?: AbortSignal): Promise<LitigationListResponse>;
    abstract addUpadateLitigation(data: FormData): Promise<LitigationSaveResponse>;
    abstract deleteLitigation(params: DeleteLitigationRequest): Promise<LitigationDeleteResponse>;
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
    async addUpadateLitigation(formData: FormData): Promise<LitigationSaveResponse> {

        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                LitigationApi.ADD_UPDATE,
                formData
            )
            return response

        } catch (error) {

            console.error('ERROR:ADD UPDATE LITIGATION :', error)

            if (error === TokenExpiredException) {
                await this.addUpadateLitigation(formData);
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

            console.error('ERROR: DEELTE LITIGATION :', error)

            if (error === TokenExpiredException) {

                await this.deleteLitigation(params);
            }

            throw error
        }
    }
}