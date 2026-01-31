import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {

    FilterWithPaginationLitigationClosureRequest,
    LitigationClosureListResponse,
    LitigationClosureSaveResponse
    
} from "@/features/litigation/models/LitigationClosureModel";

import { LitigationClosureApi } from "@/features/litigation/api/LitigationClosureApi";

export abstract class LitigationClosureDatasource {
    abstract pullLitigationClosure(params: FilterWithPaginationLitigationClosureRequest, signal?: AbortSignal): Promise<LitigationClosureListResponse>;
    abstract addUpadateLitigationClosure(data: FormData): Promise<LitigationClosureSaveResponse>;
}

export class LitigationClosureDatasourceImpl implements LitigationClosureDatasource {
    private get k3hHttpClient() {
        return baseClient
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
                `${LitigationClosureApi.PULL_CLOSURE}?${queryParams.toString()}`, { signal }
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
            
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                LitigationClosureApi.ADD_UPDATE_CLOSURE,
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

}

