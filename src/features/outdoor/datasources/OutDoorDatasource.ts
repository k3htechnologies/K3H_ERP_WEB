import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { OutDoorApi } from '@/features/outdoor/api/OutDoorApi'
import type {
    DeleteOutDoorRequest,
    FilterWithPaginationOutDoor,
    OutDoorDataListResponse,
    OutDoorDeleteResponse,
    OutDoorSaveResponse,
    PunchInOutRequest,
    OutDoorPunchInOutResponse,
    AddUpdateConclusionRequest,
    OutDoorConclusionResponse
} from '@/features/outdoor/models/OutDoorModel'

export abstract class OutDoorDatasource {
    abstract pullOutDoor(params: FilterWithPaginationOutDoor, signal?: AbortSignal): Promise<OutDoorDataListResponse>;
    abstract addUpdateOutDoor(data: FormData): Promise<OutDoorSaveResponse>;
    abstract deleteOutDoor(params: DeleteOutDoorRequest): Promise<OutDoorDeleteResponse>;
    abstract punchIn(params: PunchInOutRequest): Promise<OutDoorPunchInOutResponse>;
    abstract addUpdateConclusion(params: AddUpdateConclusionRequest): Promise<OutDoorConclusionResponse>;
}

export class OutDoorDataSourceImpl implements OutDoorDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullOutDoor(params: FilterWithPaginationOutDoor, signal?: AbortSignal): Promise<OutDoorDataListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.StartDate) {
                // Convert YYYY-MM-DD to ISO format if needed (already ISO if contains 'T')
                const start = params.StartDate.includes('T') 
                    ? params.StartDate 
                    : `${params.StartDate}T00:00:00Z`;
                queryParams.append("StartDate", start);
            }

            if (params.EndDate) {
                // Convert YYYY-MM-DD to ISO format if needed (already ISO if contains 'T')
                const end = params.EndDate.includes('T') 
                    ? params.EndDate 
                    : `${params.EndDate}T00:00:00Z`;
                queryParams.append("EndDate", end);
            }
            if (params.CompanyName?.trim()) queryParams.append('CompanyName', params.CompanyName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${OutDoorApi.PULL}?${queryParams.toString()}`, { signal })
            return response;
        } catch (error: any) {

            console.error('Error: Pull OUTDOOR:', error);

            if (error === TokenExpiredException) {

                await this.pullOutDoor(params);
            }

            throw error
        }
    }

    async addUpdateOutDoor(payload: FormData): Promise<OutDoorSaveResponse> {

        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                OutDoorApi.ADD_UPDATE,
                payload
            );

            return response
        } catch (error) {

            console.error('Error: Add Update OUTDOOR:', error)

            if (error === TokenExpiredException) {

                await this.addUpdateOutDoor(payload);
            }
            throw error
        }
    }

    async deleteOutDoor(params: DeleteOutDoorRequest): Promise<OutDoorDeleteResponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                OutDoorApi.DELETE,
                params
            )

            return response

        } catch (error) {

            console.error('ERRPR : DELETE OUTDOOR:', error)

            if (error === TokenExpiredException) {
                await this.deleteOutDoor(params);
            }

            throw error
        }
    }

    async punchIn(params: PunchInOutRequest): Promise<OutDoorPunchInOutResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                OutDoorApi.PUNCH_IN,
                params
            )

            return response
        } catch (error) {

            console.error('Error: PUNCH IN OUTDOOR:', error)

            if (error === TokenExpiredException) {
                await this.punchIn(params);
            }
            throw error
        }
    }

    async addUpdateConclusion(params: AddUpdateConclusionRequest): Promise<OutDoorConclusionResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                OutDoorApi.ADD_UPDATE_CONCLUSION,
                params
            )

            return response
        } catch (error) {

            console.error('Error: Add Update CONCLUSION:', error)

            if (error === TokenExpiredException) {
                await this.addUpdateConclusion(params);
            }
            throw error
        }
    }


}