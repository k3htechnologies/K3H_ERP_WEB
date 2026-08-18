import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { VendorApi } from '@/features/vendor/api/VendorApi'
import type {
    FilterWithPaginationVendorRequest,
    DeleteVendorRequest,
    VendorListResponse,
    VendorSaveResponse,
    VendorDeleteResponse
} from '@/features/vendor/models/VendorModel'

export abstract class VendorDatasource {

    abstract pullVendor(params: FilterWithPaginationVendorRequest, signal?: AbortSignal): Promise<VendorListResponse>;
    abstract addUpdateVendor(data: FormData): Promise<VendorSaveResponse>;
    abstract deleteVendor(params: DeleteVendorRequest): Promise<VendorDeleteResponse>;
}

export class VendorDatasourceImpl implements VendorDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullVendor(params: FilterWithPaginationVendorRequest, signal?: AbortSignal): Promise<VendorListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.VendorId) queryParams.append('VendorId', params.VendorId.toString());
            if (params.SystemGeneratedCode?.trim()) queryParams.append('SystemGeneratedCode', params.SystemGeneratedCode.trim());
            if (params.VendorType?.trim()) queryParams.append('VendorType', params.VendorType.trim());
            if (params.VendorName?.trim()) queryParams.append('VendorName', params.VendorName.trim());
            if (params.CompanyName?.trim()) queryParams.append('CompanyName', params.CompanyName.trim());
            if (params.CompanyType?.trim()) queryParams.append('CompanyType', params.CompanyType.trim());
            if (params.MobileNumber?.trim()) queryParams.append('MobileNumber', params.MobileNumber.trim());
            if (params.CityName?.trim()) queryParams.append('CityName', params.CityName.trim());
            if (params.GSTNumber?.trim()) queryParams.append('GSTNumber', params.GSTNumber.trim());
            if (params.AadharCardNumber?.trim()) queryParams.append('AadharCardNumber', params.AadharCardNumber.trim());
            if (params.PanCardNumber?.trim()) queryParams.append('PanCardNumber', params.PanCardNumber.trim());

            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${VendorApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL VENDOR :', error);

            if (error instanceof TokenExpiredException) {
                return  await this.pullVendor(params);
            }

            throw error
        }
    }

    async addUpdateVendor(formData: FormData): Promise<VendorSaveResponse> {

        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                VendorApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE VENDOR :', error)

            if (error instanceof TokenExpiredException) {
                return   await this.addUpdateVendor(formData);
            }
            throw error
        }
    }

    async deleteVendor(params: DeleteVendorRequest): Promise<VendorDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                VendorId: (params.VendorId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${VendorApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE VENDOR :', error)

            if (error instanceof TokenExpiredException) {
                return await this.deleteVendor(params);

            }

            throw error
        }
    }
}
