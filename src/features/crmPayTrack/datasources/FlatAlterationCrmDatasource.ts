import baseClient from "@/core/config/baseClient";
import type { DeleteFlatAlterationRequest, FilterWithPaginationFlatAlterationRequest, FlatAlterationRequestDeleteReponse, FlatAlterationRequestListResponse, FlatAlterationRequestSaveReponse } from "@/features/crmPayTrack/models/FlatAlterationRequestModel";
import { FlatAlterationRequestApi } from "@/features/crmPayTrack/api/FlatAlterationRequestApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class FlatAlterationCrmDatasource {
    abstract pullFlatAlterationRequest(params: FilterWithPaginationFlatAlterationRequest, signal?: AbortSignal): Promise<FlatAlterationRequestListResponse>;
    abstract addUpdateFlatAlterationRequest(formData: FormData): Promise<FlatAlterationRequestSaveReponse>;
    abstract deleteFlatAlterationRequest(params: DeleteFlatAlterationRequest): Promise<FlatAlterationRequestDeleteReponse>;
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
            if (params.TabName) queryParams.append('TabName', params.TabName);

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

    async addUpdateFlatAlterationRequest(formData: FormData): Promise<FlatAlterationRequestSaveReponse> {
        try {


            return await this.k3hHttpClient.multipartRequestWithAuthentication(
                FlatAlterationRequestApi.ADD_UPDATE,
                formData
            )


        } catch (error) {

            console.error('ERROR: ADD UPDATE FLAT ALTERATION REQUEST :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateFlatAlterationRequest(formData);
            }
            throw error
        }
    }

    async deleteFlatAlterationRequest(params: DeleteFlatAlterationRequest): Promise<FlatAlterationRequestDeleteReponse> {
        try {
            const queryParams = new URLSearchParams({
                FlatAlterationRequestId: (params.FlatAlterationRequestId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                BookingId: (params.BookingId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${FlatAlterationRequestApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE FLAT ALTERATION REQUEST :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteFlatAlterationRequest(params);

            }

            throw error
        }
    }

} 