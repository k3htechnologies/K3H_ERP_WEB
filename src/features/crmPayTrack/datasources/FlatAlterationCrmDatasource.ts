import baseClient from "@/core/config/baseClient";
import type { FilterWithPaginationFlatAlterationRequest, FlatAlterationRequestListResponse, FlatAlterationRequestSaveReponse, AddUpdateFlatAlterationRequest } from "@/features/crmPayTrack/models/FlatAlterationRequestModel";
import { FlatAlterationRequestApi } from "@/features/crmPayTrack/api/FlatAlterationRequestApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class FlatAlterationCrmDatasource {
    abstract pullFlatAlterationRequest(params: FilterWithPaginationFlatAlterationRequest, signal?: AbortSignal): Promise<FlatAlterationRequestListResponse>;
    abstract addUpdateFlatAlterationRequest(data: AddUpdateFlatAlterationRequest): Promise<FlatAlterationRequestSaveReponse>;
}

export class FlatAlterationCrmDatasourceImpl implements FlatAlterationCrmDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullFlatAlterationRequest(params: FilterWithPaginationFlatAlterationRequest, signal?: AbortSignal): Promise<FlatAlterationRequestListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.BookingId) queryParams.append('BookingId', params.BookingId.toString());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${FlatAlterationRequestApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL FLAT ALTERATION REQUEST :', error);

            if (error instanceof TokenExpiredException) {
                return await this.pullFlatAlterationRequest(params);
            }

            throw error
        }
    }

    async addUpdateFlatAlterationRequest(params: AddUpdateFlatAlterationRequest): Promise<FlatAlterationRequestSaveReponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                FlatAlterationRequestApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE FLAT ALTERATION REQUEST :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateFlatAlterationRequest(params);
            }
            throw error
        }
    }

} 