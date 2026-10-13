import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { ConstructionAreaComparativeApi } from '@/features/constructionArea/api/ConstructionAreaComparativeApi'
import type {
    FilterWithConstructionAreaComparativeRequest,
    ConstructionAreaComparativeListResponse,
    ConstructionAreaComparativeSaveResponse,
} from '@/features/constructionArea/models/ConstructionAreaComparativeModel'

export abstract class ConstructionAreaComparativeDatasource {

    abstract pullConstructionAreaComparative(params: FilterWithConstructionAreaComparativeRequest, signal?: AbortSignal): Promise<ConstructionAreaComparativeListResponse>;
    abstract addUpdateConstructionAreaComparative(data: FormData): Promise<ConstructionAreaComparativeSaveResponse>;
    
}

export class ConstructionAreaComparativeDatasourceImpl implements ConstructionAreaComparativeDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullConstructionAreaComparative(params: FilterWithConstructionAreaComparativeRequest, signal?: AbortSignal): Promise<ConstructionAreaComparativeListResponse> {
        try {
            const queryParams = new URLSearchParams({
                 ProjectId: (params.ProjectId ?? 0).toString(),
                 IsCheckPermission: (params.IsCheckPermission ?? false).toString(),
            })

            if (params.ConstructionAreaComparativeId) queryParams.append('ConstructionAreaComparativeId', params.ConstructionAreaComparativeId.toString());
            if (params.Type?.trim()) queryParams.append('Type', params.Type.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ConstructionAreaComparativeApi.PULL}?${queryParams.toString()}`, { signal }
            );
        } catch (error: any) {

            console.error('ERROR: PULL CONSTRUCTION AREA COMPARATIVE :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullConstructionAreaComparative(params);
            }

            throw error
        }
    }

    async addUpdateConstructionAreaComparative(formData: FormData): Promise<ConstructionAreaComparativeSaveResponse> {

        try {

            return await this.k3hHttpClient.multipartRequestWithAuthentication(
                ConstructionAreaComparativeApi.ADD_UPDATE,
                formData
            )

        } catch (error) {

            console.error('ERROR: ADD UPDATE CONSTRUCTION AREA COMPARATIVE :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateConstructionAreaComparative(formData);
            }
            throw error
        }
    }

   
}
