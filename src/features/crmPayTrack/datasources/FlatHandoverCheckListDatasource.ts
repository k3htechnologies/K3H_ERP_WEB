import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { AddUpdateFlatHandoverChecklistRequest, FilterWithPaginationFlatHandoverChecklist, FlatHandoverChecklistResponse, FlatHandoverChecklistSaveResponse } from "@/features/crmPayTrack/models/FlatHandoverCheckListModel";
import { FlatHandoverCheckListApi } from "@/features/crmPayTrack/api/FlatHandoverCheckListApi";

export abstract class FlatHandoverChecklistDataSource {
    abstract pullFlatHandoverChecklist(params: FilterWithPaginationFlatHandoverChecklist, signal?: AbortSignal): Promise<FlatHandoverChecklistResponse>
    abstract addUpdateFlatHandoverChecklist(data: AddUpdateFlatHandoverChecklistRequest): Promise<FlatHandoverChecklistSaveResponse>
}

export class FlatHandoverChecklistDataSourceImpl implements FlatHandoverChecklistDataSource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullFlatHandoverChecklist(params: FilterWithPaginationFlatHandoverChecklist, signal?: AbortSignal): Promise<FlatHandoverChecklistResponse> {

        try {
            const queryParams = new URLSearchParams();

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BookingId) queryParams.append("BookingId", params.BookingId.toString());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${FlatHandoverCheckListApi.PULL}?${queryParams.toString()}`,
                { signal }
            )
            return response;

        } catch (error: any) {

            console.error("ERROR: PULL FLAT HANDOVER CHECK LIST:", error);

            if (error instanceof TokenExpiredException) {
                return await this.pullFlatHandoverChecklist(params);
            }
            throw error;
        }
    }

    async addUpdateFlatHandoverChecklist(data: AddUpdateFlatHandoverChecklistRequest): Promise<FlatHandoverChecklistSaveResponse> {

        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                FlatHandoverCheckListApi.ADD_UPDATE,
                data
            )
            return response;

        } catch (error: any) {

            console.log("ERROR: ADD UPDATE FLAT HANDOVER CHECK LIST:", error);

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateFlatHandoverChecklist(data);
            }
            throw error
        }

    }
}