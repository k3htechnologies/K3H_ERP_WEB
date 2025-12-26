import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { OutDoorApi } from '../api/OutDoorApi'
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
} from '../models/OutDoorModel'

export abstract class OutDoorDatasource {
    abstract pullOutDoor(params: FilterWithPaginationOutDoor, signal?: AbortSignal): Promise<OutDoorDataListResponse>;
    abstract addUpdateOutDoor(data: FormData): Promise<OutDoorSaveResponse>;
    abstract deleteOutDoor(data: DeleteOutDoorRequest): Promise<OutDoorDeleteResponse>;
    abstract punchIn(data: PunchInOutRequest): Promise<OutDoorPunchInOutResponse>;
    abstract addUpdateConclusion(data: AddUpdateConclusionRequest): Promise<OutDoorConclusionResponse>;
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
                const start = typeof params.StartDate === "string"
                    ? params.StartDate
                    : new Date(params.StartDate).toISOString();
                queryParams.append("StartDate", start);
            }

            if (params.EndDate) {
                const end = typeof params.EndDate === "string"
                    ? params.EndDate
                    : new Date(params.EndDate).toISOString();
                queryParams.append("EndDate", end);
            }
            if (params.CompanyName?.trim()) queryParams.append('CompanyName', params.CompanyName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${OutDoorApi.PULL}?${queryParams.toString()}`, { signal })
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL OUTDOOR:', error);

            if (error === TokenExpiredException) {
                await this.pullOutDoor(params, signal);
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

            console.error('ERROR: ADD UPDATE OUTDOOR:', error)

            if (error === TokenExpiredException) {
                await this.addUpdateOutDoor(payload);
            }
            throw error
        }
    }

    async deleteOutDoor(payload: DeleteOutDoorRequest): Promise<OutDoorDeleteResponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                OutDoorApi.DELETE,
                payload
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE OUTDOOR:', error)

            if (error === TokenExpiredException) {
                await this.deleteOutDoor(payload);
            }

            throw error
        }
    }

    async punchIn(payload: PunchInOutRequest): Promise<OutDoorPunchInOutResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                OutDoorApi.PUNCH_IN,
                payload
            )

            return response
        } catch (error) {

            console.error('ERROR: PUNCH IN OUTDOOR:', error)

            if (error === TokenExpiredException) {
                await this.punchIn(payload);
            }
            throw error
        }
    }

    async punchOut(payload: PunchInOutRequest): Promise<OutDoorPunchInOutResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                OutDoorApi.PUNCH_IN,
                payload
            )

            return response
        } catch (error) {

            console.error('ERROR: PUNCH OUT OUTDOOR:', error)

            if (error === TokenExpiredException) {
                await this.punchOut(payload);
            }
            throw error
        }
    }

    async addUpdateConclusion(payload: AddUpdateConclusionRequest): Promise<OutDoorConclusionResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                OutDoorApi.ADD_UPDATE_CONCLUSION,
                payload
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE CONCLUSION:', error)

            if (error === TokenExpiredException) {
                await this.addUpdateConclusion(payload);
            }
            throw error
        }
    }


}