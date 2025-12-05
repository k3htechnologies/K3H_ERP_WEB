import baseClient from "@/core/config/baseClient";
import type { DeleteOutDoorRequest, FilterWithPaginationOutDoor, OutDoorDataListResponse, OutDoorDeleteResponse, OutDoorSaveResponse } from "../models/OutDoorModel";
import { OutDoorApi } from "../api/OutDoorApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class OutDoorDatasource {
    abstract pullOutDoor(params: FilterWithPaginationOutDoor, signal?: AbortSignal): Promise<OutDoorDataListResponse>;
    abstract addUpdateOutDoor(data: FormData): Promise<OutDoorSaveResponse>;
    abstract deleteOutDoor(data: DeleteOutDoorRequest): Promise<OutDoorDeleteResponse>;
}

export class OutDoorDataSourceImpl implements OutDoorDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullOutDoor(params: FilterWithPaginationOutDoor, signal?: AbortSignal): Promise<OutDoorDataListResponse> {
        try {
            const queryparams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            });

            if (params.StartDate) {
                const start = typeof params.StartDate === "string"
                    ? params.StartDate
                    : new Date(params.StartDate).toISOString();
                queryparams.append("StartDate", start);
            }

            if (params.EndDate) {
                const end = typeof params.EndDate === "string"
                    ? params.EndDate
                    : new Date(params.EndDate).toISOString();
                queryparams.append("EndDate", end);
            }

            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${OutDoorApi.PULL}?${queryparams.toString()}`, { signal });
            return response;
        } catch (error: unknown) {
            console.error('ERROR: PULL OUTDOOR:', error);
            if (error === TokenExpiredException) {
                await this.pullOutDoor(params, signal);
            }
            throw error;
        }
    }
    async addUpdateOutDoor(payload: FormData): Promise<OutDoorSaveResponse> {
        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(`${OutDoorApi.ADD_UPDATE}`, payload);
            return response;
        } catch (error: any) {
            console.error('ERROR: ADD UPDATE OUTDOOR:', error);
            if (error === TokenExpiredException) {
                await this.addUpdateOutDoor(payload);
            }
            throw error;
        }
    }

    async deleteOutDoor(payload: DeleteOutDoorRequest): Promise<OutDoorDeleteResponse> {
        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(`${OutDoorApi.DELETE}`, payload);
            return response;
        } catch (error: unknown) {
            console.error('ERROR: DELETE OUTDOOR:', error);
            if (error === TokenExpiredException) {
                await this.deleteOutDoor(payload);
            }
            throw error;
        }
    }
}