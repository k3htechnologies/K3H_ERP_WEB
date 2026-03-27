import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { TenantApi } from '@/features/tenant/api/TenantApi'
import type {
    FilterWithPaginationTenantRequest,
    TenantListResponse,
    DeleteTenantRequest,
    TenantDeleteResponse,
    TenantDocumentListResponse,
    FilterWithPaginationTenantDocumentRequest,
    DeleteTenantDocumentRequest,
    TenantDocumentDeleteResponse,
    TenantDocumentSaveResponse,
    TenantSaveResponse,
} from '@/features/tenant/models/TenantModel'

export abstract class TenantDatasource {

    abstract pullTenant(params: FilterWithPaginationTenantRequest): Promise<TenantListResponse>;
    abstract addUpdateTenant(data: FormData): Promise<TenantSaveResponse>;
    abstract deleteTenant(params: DeleteTenantRequest): Promise<TenantDeleteResponse>;

    abstract pullTenantDocument(params: FilterWithPaginationTenantDocumentRequest): Promise<TenantDocumentListResponse>;
    abstract addUpdateTenantDocument(formData: FormData): Promise<TenantDocumentSaveResponse>;
    abstract deleteTenantDocument(params: DeleteTenantDocumentRequest): Promise<TenantDocumentDeleteResponse>;
}

export class TenantDatasourceImpl implements TenantDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullTenant(params: FilterWithPaginationTenantRequest): Promise<TenantListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString());
            if (params.TenantId) queryParams.append('TenantId', params.TenantId.toString());
            if (params.FlatNumber?.trim()) queryParams.append('FlatNumber', params.FlatNumber.trim());
            if (params.ApplicantName?.trim()) queryParams.append('ApplicantName', params.ApplicantName.trim());
            if (params.FlatType?.trim()) queryParams.append('FlatType', params.FlatType.trim());
            if (params.FlatConfiguration?.trim()) queryParams.append('FlatConfiguration', params.FlatConfiguration.trim());
            if (params.FlatCarpetAreaSqFt?.trim()) queryParams.append('FlatCarpetAreaSqFt', params.FlatCarpetAreaSqFt.trim());
            if (params.BuildingNumber?.trim()) queryParams.append('BuildingNumber', params.BuildingNumber.trim());
            if (params.Wing?.trim()) queryParams.append('Wing', params.Wing.trim());
            if (params.Flat?.trim()) queryParams.append('Flat', params.Flat.trim());
            if (params.ParkingNumber?.trim()) queryParams.append('ParkingNumber', params.ParkingNumber.trim());

            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TenantApi.PULL}?${queryParams.toString()}`
            )

            return response
        } catch (error) {

            console.error('Error: Pull TENANT:', error);

            if (error instanceof TokenExpiredException) {
                return await this.pullTenant(params);
            }
            throw error
        }
    }

    async addUpdateTenant(params: FormData): Promise<TenantSaveResponse> {

        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                TenantApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {
            console.error('Error: Add Update TENANT:', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateTenant(params);
            }
            throw error
        }
    }

    async deleteTenant(params: DeleteTenantRequest): Promise<TenantDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                TenantId: (params.TenantId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
                BuildingId: (params.BuildingId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${TenantApi.DELETE}?${queryParams.toString()}`
            )

            return response;

        } catch (error) {

            console.error('ERRPR : DELETE TENANT:', error)

            if (error instanceof TokenExpiredException) {
                return await this.deleteTenant(params);
            }

            throw error
        }
    }

    async pullTenantDocument(params: FilterWithPaginationTenantDocumentRequest): Promise<TenantDocumentListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString());
            if (params.TenantId) queryParams.append('TenantId', params.TenantId.toString());
            if (params.TenantDocumentId) queryParams.append('TenantDocumentId', params.TenantDocumentId.toString());
            if (params.DocumentName?.trim()) queryParams.append('DocumentName', params.DocumentName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TenantApi.PULL_TENANT_DOCUMENT}?${queryParams.toString()}`
            )

            return response
        } catch (error) {

            console.error('Error: Pull TENANT DOCUMENT:', error);

            if (error instanceof TokenExpiredException) {
                return await this.pullTenantDocument(params);
            }

            throw error
        }
    }

    async addUpdateTenantDocument(formData: FormData): Promise<TenantDocumentSaveResponse> {

        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                TenantApi.ADD_UPDATE_TENANT_DOCUMENT,
                formData
            )

            return response
        } catch (error) {
            console.error('Error: Add Update TENANT DOCUMENT:', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateTenantDocument(formData);
            }

            throw error
        }
    }

    async deleteTenantDocument(params: DeleteTenantDocumentRequest): Promise<TenantDocumentDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                TenantDocumentId: (params.TenantDocumentId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                TenantId: (params.TenantId ?? 0).toString(),
                BuildingId: (params.BuildingId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${TenantApi.DELETE_TENANT_DOCUMENT}?${queryParams.toString()}`
            )

            return response;

        } catch (error) {

            console.error('ERRPR : DELETE TENANT DOCUMENT :', error)

            if (error instanceof TokenExpiredException) {
                return await this.deleteTenantDocument(params);
            }

            throw error
        }
    }

}
