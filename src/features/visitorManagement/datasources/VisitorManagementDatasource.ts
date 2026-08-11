import baseClient from "@/core/config/baseClient";
import type { DeleteVisitorRequest, FilterWithPaginationVisitorManagement, FilterWithPaginationVisitorsByMobileNoRequest, VisitorManagementDeleteResponse, VisitorManagementListResponse, VisitorManagementSaveReponse } from "@/features/visitorManagement/models/VisitorManagementModel";
import { VisitorManagementApi } from "@/features/visitorManagement/api/VisitorManagementApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class VisitorManagementDatasource {
    abstract pullVisitorManagement(params: FilterWithPaginationVisitorManagement, signal?: AbortSignal): Promise<VisitorManagementListResponse>;
    abstract addUpdateVisitorManagement(formData: FormData): Promise<VisitorManagementSaveReponse>;
    abstract deleteVisitorManagement(params: DeleteVisitorRequest): Promise<VisitorManagementDeleteResponse>;
}

export class VisitorManagementDatasourceImpl implements VisitorManagementDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullVisitorManagement(params: FilterWithPaginationVisitorManagement, signal?: AbortSignal): Promise<VisitorManagementListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.FromDate) queryParams.append('FromDate', params.FromDate);
            if (params.ToDate) queryParams.append('ToDate', params.ToDate);
            if (params.SortBy) queryParams.append('SortBy', params.SortBy);
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${VisitorManagementApi.PULL}?${queryParams.toString()}`, { signal }
            )

        } catch (error: any) {

            console.error('ERROR: PULL VISITOR MANAGEMENT :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullVisitorManagement(params);
            }

            throw error
        }
    }

    async addUpdateVisitorManagement(formData: FormData): Promise<VisitorManagementSaveReponse> {
        try {

            return await this.k3hHttpClient.multipartRequestWithAuthentication(
                VisitorManagementApi.ADD_UPDATE,
                formData
            )

        } catch (error) {

            console.error('ERROR: ADD UPDATE VISITOR MANAGEMENT :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateVisitorManagement(formData);
            }
            throw error
        }
    }

    async deleteVisitorManagement(params: DeleteVisitorRequest): Promise<VisitorManagementDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                VisitorId: (params.VisitorId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            return await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${VisitorManagementApi.DELETE}?${queryParams.toString()}`
            )

        } catch (error) {

            console.error('ERROR: DELETE VISITOR MANAGEMENT :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteVisitorManagement(params);

            }

            throw error
        }
    }


    async pullVisitorsByMobileNoData(params: FilterWithPaginationVisitorsByMobileNoRequest, signal?: AbortSignal): Promise<VisitorManagementListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: (params.PageSize ?? 10).toString(),
                pageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.MobileNumber?.trim()) queryParams.append('MobileNumber', params.MobileNumber.trim());
            return await this.k3hHttpClient.getRequestWithAuthentication(`${VisitorManagementApi.PULL_VISITOR_BY_MOBILE_NO}?${queryParams.toString()}`, { signal });

        } catch (error: any) {
            console.error('ERROR: PULL VISITOR BY MOBILE NO:', error);

            if (error === TokenExpiredException) {
                await this.pullVisitorsByMobileNoData(params);
            }
            throw error
        }
    }

}