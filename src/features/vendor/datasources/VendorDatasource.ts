import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { VendorApi } from '@/features/vendor/api/VendorApi'
import type {
    FilterWithPaginationVendorRequest,
    AddUpdateVendorRequest,
    DeleteVendorRequest,
    VendorListResponse,
    VendorSaveResponse,
    VendorDeleteResponse
} from '@/features/vendor/models/VendorModel'

export abstract class VendorDatasource {

    abstract pullVendor(params: FilterWithPaginationVendorRequest, signal?: AbortSignal): Promise<VendorListResponse>;
    abstract addUpdateVendor(data: AddUpdateVendorRequest): Promise<VendorSaveResponse>;
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
            if (params.VendorName?.trim()) queryParams.append('VendorName', params.VendorName.trim());
            if (params.CompanyName?.trim()) queryParams.append('CompanyName', params.CompanyName.trim());
            if (params.CompanyType?.trim()) queryParams.append('CompanyType', params.CompanyType.trim());
            if (params.MobileNumber?.trim()) queryParams.append('MobileNumber', params.MobileNumber.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${VendorApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL VENDOR :', error);

            if (error === TokenExpiredException) {
                await this.pullVendor(params);
            }

            throw error
        }
    }

    async addUpdateVendor(params: AddUpdateVendorRequest): Promise<VendorSaveResponse> {

        try {

            const payLoad: AddUpdateVendorRequest = {
                VendorId: params.VendorId ?? 0,
                Uniquekey: params.Uniquekey ?? '',

                CompanyName: params.CompanyName?.trim() ?? '',
                CompanyType: params.CompanyType?.trim() ?? '',
                VendorName: params.VendorName?.trim() ?? '',
                MobileNumber: params.MobileNumber?.trim() ?? '',
                EmailId: params.EmailId?.trim() ?? '',
                AadharCardNumber: params.AadharCardNumber?.trim() ?? '',

                AadharCardURL: params.AadharCardURL ?? null,
                RemoveAadharCardURL: params.RemoveAadharCardURL ?? '',

                PanCardNumber: params.PanCardNumber?.trim() ?? '',
                PanCardURL: params.PanCardURL ?? null,
                RemovePanCardURL: params.RemovePanCardURL ?? '',

                GSTNumber: params.GSTNumber?.trim() ?? '',
                GSTCertificateURL: params.GSTCertificateURL ?? null,
                RemoveGSTCertificateURL: params.RemoveGSTCertificateURL ?? '',

                Address: params.Address?.trim() ?? '',

                CountryMasterId: params.CountryMasterId ?? 0,
                StateMasterId: params.StateMasterId ?? 0,
                DistrictMasterId: params.DistrictMasterId ?? 0,
                CityMasterId: params.CityMasterId ?? 0,

                AvailableMaterialList: params.AvailableMaterialList ?? '',
                AvailableContractList: params.AvailableContractList ?? '',

                MagicLinkUniquekey: params.MagicLinkUniquekey ?? '',
                ClientRegistrationId: params.ClientRegistrationId ?? 0,
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                VendorApi.ADD_UPDATE,
                payLoad
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE VENDOR :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateVendor(params);
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

            if (error === TokenExpiredException) {

                await this.deleteVendor(params);

            }

            throw error
        }
    }
}
