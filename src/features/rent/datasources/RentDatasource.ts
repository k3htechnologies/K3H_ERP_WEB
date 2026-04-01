import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { RentApi } from '@/features/rent/api/RentApi'
import type {
    FilterWithPaginationTenantApplicantChargesRequest,
    TenantApplicantChargesListResponse
} from '@/features/rent/models/RentModel'

export abstract class RentDatasource {

    abstract pullTenantApplicantCharges(params: FilterWithPaginationTenantApplicantChargesRequest, signal?: AbortSignal): Promise<TenantApplicantChargesListResponse>;

}

export class RentDatasourceImpl implements RentDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullTenantApplicantCharges(params: FilterWithPaginationTenantApplicantChargesRequest, signal?: AbortSignal): Promise<TenantApplicantChargesListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString()
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())

            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())

            if (params.TenantId) queryParams.append('TenantId', params.TenantId.toString())

            if (params.TenantApplicantChargesId) queryParams.append('TenantApplicantChargesId', params.TenantApplicantChargesId.toString())

            if (params.Tenure?.trim()) queryParams.append('Tenure', params.Tenure.trim())

            if (params.ChargeType?.trim()) queryParams.append('ChargeType', params.ChargeType.trim())

            if (params.ApplicantType?.trim()) queryParams.append('ApplicantType', params.ApplicantType.trim())

            if (params.ApplicantName?.trim()) queryParams.append('ApplicantName', params.ApplicantName.trim())

            if (params.FlatNumber?.trim()) queryParams.append('FlatNumber', params.FlatNumber.trim())

            if (params.FlatCarpetAreaSqFt !== undefined && params.FlatCarpetAreaSqFt !== null) queryParams.append('FlatCarpetAreaSqFt', params.FlatCarpetAreaSqFt.toString())

            if (params.FlatType?.trim()) queryParams.append('FlatType', params.FlatType.trim())

            if (params.FlatConfiguration?.trim()) queryParams.append('FlatConfiguration', params.FlatConfiguration.trim())

            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${RentApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL TENANT APPLICANT CHARGES (RENT) :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullTenantApplicantCharges(params);
            }

            throw error
        }
    }


}
