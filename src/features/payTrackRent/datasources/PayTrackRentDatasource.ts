import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { PayTrackRentApi } from '@/features/payTrackRent/api/PayTrackRentApi'
import type {
    FilterWithPaginationPayTrackRentRequest,
    PayTrackRentLedgerListResponse,
    DeletePayTrackRentRequest,
    PayTrackRentDeleteResponse,
    PayTrackRentSaveResponse,
} from '@/features/payTrackRent/models/PayTrackRentModel'

export abstract class PayTrackRentDatasource {

    abstract pullPayTrackRentLedger(params: FilterWithPaginationPayTrackRentRequest, signal?: AbortSignal): Promise<PayTrackRentLedgerListResponse>;
    abstract addUpdatePayTrackRent(data: FormData): Promise<PayTrackRentSaveResponse>;
    abstract deletePayTrackRent(params: DeletePayTrackRentRequest): Promise<PayTrackRentDeleteResponse>;
}

export class PayTrackRentDatasourceImpl implements PayTrackRentDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullPayTrackRentLedger(params: FilterWithPaginationPayTrackRentRequest, signal?: AbortSignal): Promise<PayTrackRentLedgerListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString());
            if (params.TenantId) queryParams.append('TenantId', params.TenantId.toString());
            if (params.TenantApplicantId) queryParams.append('TenantApplicantId', params.TenantApplicantId.toString());
            if (params.PayTrackRentId) queryParams.append('PayTrackRentId', params.PayTrackRentId.toString());
            if (params.FlatNumber?.trim()) queryParams.append('FlatNumber', params.FlatNumber.trim());
            if (params.ApplicantName?.trim()) queryParams.append('ApplicantName', params.ApplicantName.trim());
            if (params.ChargeType?.trim()) queryParams.append('ChargeType', params.ChargeType.trim());
            if (params.Tenure?.trim()) queryParams.append('Tenure', params.Tenure.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PayTrackRentApi.PULL}?${queryParams.toString()}`,
                {signal}
            )

            return response
        } catch (error) {

            console.error('Error: Pull PayTrackRent Ledger:', error);

            if (error === TokenExpiredException) {
                await this.pullPayTrackRentLedger(params, signal);
            }
            throw error
        }
    }

    async addUpdatePayTrackRent(data: FormData): Promise<PayTrackRentSaveResponse> {

        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                PayTrackRentApi.ADD_UPDATE,
                data
            )

            return response
        } catch (error) {
            console.error('Error: Add Update PayTrackRent:', error)

            if (error === TokenExpiredException) {
                await this.addUpdatePayTrackRent(data);
            }
            throw error
        }
    }

    async deletePayTrackRent(params: DeletePayTrackRentRequest): Promise<PayTrackRentDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                PayTrackRentId: (params.PayTrackRentId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString(),
                TenantId: (params.TenantId ?? 0).toString(),
                TenantApplicantId: (params.TenantApplicantId ?? 0).toString(),
                BuildingId: (params.BuildingId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${PayTrackRentApi.DELETE}?${queryParams.toString()}`
            )

            return response;

        } catch (error) {

            console.error('ERROR : DELETE PayTrackRent:', error)

            if (error === TokenExpiredException) {
                await this.deletePayTrackRent(params);
            }

            throw error
        }
    }

}

