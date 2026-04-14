import baseClient from "@/core/config/baseClient"
import { TokenExpiredException } from "@/core/config/baseClientexceptions"
import { ChannelPartnerApi } from '@/features/ChannelPartner/api/ChannelPartnerApi'
import type {
    FilterWithPaginationChannelPartnerRequest,
    DeleteChannelPartnerRequest,
    ChannelPartnerListResponse,
    ChannelPartnerSaveResponse,
    FilterWithPaginationChannelPartnerCompanyRequest,
} from '@/features/ChannelPartner/models/ChannelPartnerModel'

export abstract class ChannelPartnerDatasource {

    abstract pullChannelPartner(params: FilterWithPaginationChannelPartnerRequest, signal?: AbortSignal): Promise<ChannelPartnerListResponse>;
    abstract addUpdateChannelPartner(data: FormData): Promise<ChannelPartnerSaveResponse>;
    abstract deleteChannelPartnerRequest(params: DeleteChannelPartnerRequest): Promise<ChannelPartnerSaveResponse>;
    abstract pullChannelPartnerCompany(params: FilterWithPaginationChannelPartnerCompanyRequest, signal?: AbortSignal): Promise<ChannelPartnerListResponse>;
}

export class ChannelPartnerDatasourceImpl implements ChannelPartnerDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullChannelPartner(params: FilterWithPaginationChannelPartnerRequest, signal?: AbortSignal): Promise<ChannelPartnerListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: (params.PageSize ?? 10).toString(),
                pageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ChannelPartnerId) queryParams.append('ChannelPartnerId', params.ChannelPartnerId.toString());
            if (params.ChannelPartnerName?.trim()) queryParams.append('ChannelPartnerName', params.ChannelPartnerName.trim());
            if (params.MobileNumber?.trim()) queryParams.append('MobileNumber', params.MobileNumber.trim());
            if (params.CompanyName?.trim()) queryParams.append('CompanyName', params.CompanyName.trim());
            if (params.Designation?.trim()) queryParams.append('Designation', params.Designation.trim());
            if (params.FirmsType?.trim()) queryParams.append('FirmsType', params.FirmsType.trim());
            if (params.Type?.trim()) queryParams.append('Type', params.Type.trim());
            if (params.OfficeAddress?.trim()) queryParams.append('OfficeAddress', params.OfficeAddress.trim());
            if (params.GSTNumber?.trim()) queryParams.append('GSTNumber', params.GSTNumber.trim());
            if (params.RERANumber?.trim()) queryParams.append('RERANumber', params.RERANumber.trim());
            if (params.PanNumber?.trim()) queryParams.append('PanNumber', params.PanNumber.trim());
            if (params.AadharCardNumber?.trim()) queryParams.append('AadharCardNumber', params.AadharCardNumber.trim());
            if (params.Speciality?.trim()) queryParams.append('Speciality', params.Speciality.trim());
            if (params.CityName?.trim()) queryParams.append('CityName', params.CityName.trim());
            if (params.VillageName?.trim()) queryParams.append('VillageName', params.VillageName.trim());
            if (params.Status?.trim()) queryParams.append('Status', params.Status.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(`${ChannelPartnerApi.PULL}?${queryParams.toString()}`, { signal });

        } catch (error: any) {
            console.error('ERROR: PULL CHANNEL PARTNER :', error);

            if (error instanceof TokenExpiredException) {

                return  await this.pullChannelPartner(params);
            }
            throw error
        }
    }

    async addUpdateChannelPartner(formData: FormData): Promise<ChannelPartnerSaveResponse> {
        try {

            return await this.k3hHttpClient.multipartRequestWithAuthentication(ChannelPartnerApi.ADD_UPDATE, formData);

        } catch (error) {

            console.error('ERROR: ADD UPDATE CHANNEL PARTNER :', error)

            if (error instanceof TokenExpiredException) {

                return   await this.addUpdateChannelPartner(formData);
            }
            throw error
        }
    }

    async deleteChannelPartnerRequest(params: DeleteChannelPartnerRequest): Promise<ChannelPartnerSaveResponse> {
        try {
            const queryParams = new URLSearchParams({
                ChannelPartnerId: (params.ChannelPartnerId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? '',
            })

            return await this.k3hHttpClient.deleteRequestWithAuthentication(`${ChannelPartnerApi.DELETE}?${queryParams.toString()}`)


        } catch (error) {

            console.error('ERROR: DELETE CHANNEL PARTNER :', error)

            if (error instanceof TokenExpiredException) {

                return   await this.deleteChannelPartnerRequest(params);

            }

            throw error
        }
    }

     async pullChannelPartnerCompany(params: FilterWithPaginationChannelPartnerCompanyRequest, signal?: AbortSignal): Promise<ChannelPartnerListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: (params.PageSize ?? 10).toString(),
                pageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.CompanyName?.trim()) queryParams.append('CompanyName', params.CompanyName.trim());
            
            return await this.k3hHttpClient.getRequestWithAuthentication(`${ChannelPartnerApi.PULL_CHANNELPARTNER_COMPANY}?${queryParams.toString()}`, { signal });

        } catch (error: any) {
            
            console.error('ERROR: PULL CHANNEL PARTNER COMPANY:', error);

            if (error instanceof TokenExpiredException) {

                return   await this.pullChannelPartner(params);
            }
            throw error
        }
    }
}