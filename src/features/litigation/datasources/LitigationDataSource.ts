import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {
    FilterWithPaginationLitigationRequest,
    LitigationListResponse,
    LitigationSaveResponse,
    LitigationDeleteResponse,
    DeleteLitigationRequest,
    AddUpdateLitigationRequest,
    UpdateLitigationReopenRequest,
    LitigationReopenSaveResponse,

} from '@/features/litigation/models/LitigationModel'
import { LitigationApi } from "@/features/litigation/api/LitigationApi";

export abstract class LitigationDatasource {
    abstract pullLitigation(params: FilterWithPaginationLitigationRequest, signal?: AbortSignal): Promise<LitigationListResponse>;
    abstract addUpadateLitigation(data: AddUpdateLitigationRequest): Promise<LitigationSaveResponse>;
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
            if (params.ProjectName?.trim()) queryParams.append('ProjectName', params.ProjectName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${LitigationApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL LITIGATION:', error);

            if (error instanceof TokenExpiredException) {

                return  await this.pullLitigation(params);
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

            if (error instanceof TokenExpiredException) {

                return  await this.addUpadateLitigation(params);
            }
            throw error
        }
    }

    async UpadateLitigationReopen(params: UpdateLitigationReopenRequest): Promise<LitigationReopenSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                LitigationApi.UPDATE_REOPEN,
                params
            )
            return response

        } catch (error) {

            console.error('ERROR: LITIGATION REOPEN :', error)

            if (error instanceof TokenExpiredException) {

                return  await this.UpadateLitigationReopen(params);
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

            if (error instanceof TokenExpiredException) {

                return  await this.deleteLitigation(params);
            }

            throw error
        }
    }

}

