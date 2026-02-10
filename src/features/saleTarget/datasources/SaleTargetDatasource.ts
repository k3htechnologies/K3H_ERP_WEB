import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {
    FilterWithPaginationSaleTargetRequest,
    SaleTargetListResponse,
    SaleTargetSaveResponse,
    SaleTargetDeleteResponse,
    AddUpdateSaleTargetRequest,
    DeleteSaleTargetRequest,

} from '@/features/saleTarget/models/SaleTargetModel'
import { SaleTargetApi } from "@/features/saleTarget/api/SaleTargetApi";

export abstract class SaleTargetDatasource {
    abstract pullSaleTarget(params: FilterWithPaginationSaleTargetRequest, signal?: AbortSignal): Promise<SaleTargetListResponse>;
    abstract addUpadateSaleTarget(data: AddUpdateSaleTargetRequest): Promise<SaleTargetSaveResponse>;
    abstract deleteSaleTarget(params: DeleteSaleTargetRequest): Promise<SaleTargetDeleteResponse>;
}

export class SaleTargetDatasourceImpl implements SaleTargetDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullSaleTarget(params: FilterWithPaginationSaleTargetRequest, signal?: AbortSignal): Promise<SaleTargetListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.SaleTargetId) queryParams.append('SaleTargetId', params.SaleTargetId.toString());
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.EmployeeName?.trim()) queryParams.append('EmployeeName', params.EmployeeName.trim());
            if (params.TargetMonth?.trim()) queryParams.append('TargetMonth', params.TargetMonth.trim());
            if (params.MobileNumber) queryParams.append('MobileNumber', params.MobileNumber.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${SaleTargetApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL SALE TARGET:', error);

            if (error === TokenExpiredException) {
                await this.pullSaleTarget(params);
            }
            throw error
        }
    }
    async addUpadateSaleTarget(params: AddUpdateSaleTargetRequest): Promise<SaleTargetSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                SaleTargetApi.ADD_UPDATE,
                params
            )
            return response

        } catch (error) {

            console.error('ERROR: ADD UPDATE SALE TARGET :', error)

            if (error === TokenExpiredException) {
                await this.addUpadateSaleTarget(params);
            }
            throw error
        }
    }


    async deleteSaleTarget(params: DeleteSaleTargetRequest): Promise<SaleTargetDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                SaleTargetId: (params.SaleTargetId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${SaleTargetApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE  SALE TARGET :', error)

            if (error === TokenExpiredException) {

                await this.deleteSaleTarget(params);
            }

            throw error
        }
    }

}

