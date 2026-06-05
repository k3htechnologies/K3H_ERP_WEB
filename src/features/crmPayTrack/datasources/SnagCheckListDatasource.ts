import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { SnagCheckListApi } from "@/features/crmPayTrack/api/SnagCheckListApi";
import type { AddUpdateSnagChecklistRequest, FilterWithPaginationSnagChecklistRequset, SnagChecklistResponse, SnagChecklistSaveResponse } from "@/features/crmPayTrack/models/SnagCheckListModel";

export abstract class SnagChecklistDataSource {
    abstract pullSnagChecklist(params: FilterWithPaginationSnagChecklistRequset, signal?: AbortSignal): Promise<SnagChecklistResponse>
    abstract addUpdateSnagChecklist(data: AddUpdateSnagChecklistRequest): Promise<SnagChecklistSaveResponse>
}

export class SnagChecklistDataSourceImpl implements SnagChecklistDataSource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullSnagChecklist(params: FilterWithPaginationSnagChecklistRequset, signal?: AbortSignal): Promise<SnagChecklistResponse> {

        try {
            const queryParams = new URLSearchParams();

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BookingId) queryParams.append("BookingId", params.BookingId.toString());
            if (params.CategoryName) queryParams.append("CategoryName", params.CategoryName.trim());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${SnagCheckListApi.PULL}?${queryParams.toString()}`,
                { signal }
            )
            return response;

        } catch (error: any) {

            console.error("ERROR: PULL SNAG CHECK LIST:", error);

            if (error instanceof TokenExpiredException) {
                return await this.pullSnagChecklist(params);
            }
            throw error;
        }
    }

    async addUpdateSnagChecklist(data: AddUpdateSnagChecklistRequest): Promise<SnagChecklistSaveResponse> {

        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                SnagCheckListApi.ADD_UPDATE,
                data
            )
            return response;

        } catch (error: any) {

            console.log("ERROR: ADD UPDATE SNAG CHECK LIST:", error);

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateSnagChecklist(data);
            }
            throw error
        }

    }
}