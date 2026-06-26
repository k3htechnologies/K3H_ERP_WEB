import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { ChannelPartnerUniverseApi } from '@/features/channelPartnerUniverse/api/ChannelPartnerUniverseApi'
import type { AddUpdateChannelPartnerUniverseAdditionalInformationRequest, ChannelPartnerUniverseAdditionalInformationDeleteResponse, ChannelPartnerUniverseAdditionalInformationListResponse, ChannelPartnerUniverseAdditionalInformationSaveResponse, ChannelPartnerUniverseListResponse, DeleteChannelPartnerUniverseAdditionalInformationRequest, FilterWithPaginationChannelPartnerUniverseAdditionalInformation, FilterWithPaginationChannelPartnerUniverseRequest } from '@/features/channelPartnerUniverse/models/ChannelPartnerUniverseModel'

export abstract class ChannelPartnerUniverseDatasource {

    abstract pullChannelPartnerUniverse(params: FilterWithPaginationChannelPartnerUniverseRequest, signal?: AbortSignal): Promise<ChannelPartnerUniverseListResponse>;
    abstract pullChannelPartnerUniverseAdditionalInformation(params: FilterWithPaginationChannelPartnerUniverseAdditionalInformation, signal?: AbortSignal): Promise<ChannelPartnerUniverseAdditionalInformationListResponse>;
    abstract addUpdateChannelPartnerUniverseAdditionalInformation(data: AddUpdateChannelPartnerUniverseAdditionalInformationRequest): Promise<ChannelPartnerUniverseAdditionalInformationSaveResponse>;
    abstract deleteChannelPartnerUniverseAdditionalInformation(params: DeleteChannelPartnerUniverseAdditionalInformationRequest): Promise<ChannelPartnerUniverseAdditionalInformationDeleteResponse>;
}

export class ChannelPartnerUniverseDatasourceImpl implements ChannelPartnerUniverseDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullChannelPartnerUniverse(params: FilterWithPaginationChannelPartnerUniverseRequest, signal?: AbortSignal): Promise<ChannelPartnerUniverseListResponse> {
        try {

            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
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
            if (params.RERANumber?.trim()) queryParams.append('RERANumber', params.RERANumber.trim());
            if (params.Status?.trim()) queryParams.append('Status', params.Status.trim());
            if (params.ActiveDays) queryParams.append('ActiveDays', params.ActiveDays.toString());
            if (params.SystemGeneratedCode?.trim()) queryParams.append('SystemGeneratedCode', params.SystemGeneratedCode.trim());
            if (params.ChannelPartnerCategory?.trim()) queryParams.append('ChannelPartnerCategory', params.ChannelPartnerCategory.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${ChannelPartnerUniverseApi.PULL}?${queryParams.toString()}`, { signal })
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL CHANNEL PARTNER UNIVERSE :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullChannelPartnerUniverse(params);
            }

            throw error
        }
    }

    async pullChannelPartnerUniverseAdditionalInformation(params: FilterWithPaginationChannelPartnerUniverseAdditionalInformation, signal?: AbortSignal): Promise<ChannelPartnerUniverseAdditionalInformationListResponse> {
        try {

            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ChannelPartnerUniverseAdditionalInformationId) queryParams.append('ChannelPartnerUniverseAdditionalInformationId', params.ChannelPartnerUniverseAdditionalInformationId.toString());
            if (params.ChannelPartnerId) queryParams.append('ChannelPartnerId', params.ChannelPartnerId.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${ChannelPartnerUniverseApi.PULL_UNIVERSE_ADDITIONAL_INFORMATION}?${queryParams.toString()}`, { signal });
            return response;
        
        } catch (error: any) {

            console.error('ERROR: PULL CHANNEL PARTNER UNIVERSE ADDITIONAL INFORMATION :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullChannelPartnerUniverseAdditionalInformation(params);
            }

            throw error
        }
    }

    async addUpdateChannelPartnerUniverseAdditionalInformation(params: AddUpdateChannelPartnerUniverseAdditionalInformationRequest): Promise<ChannelPartnerUniverseAdditionalInformationSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(ChannelPartnerUniverseApi.ADD_UPDATE_UNIVERSE_ADDITIONAL_INFORMATION, params);

            return response;

        } catch (error) {

            console.error('ERROR: ADD UPDATE CHANNEL PARTNER UNIVERSE ADDITIONAL INFORMATION :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateChannelPartnerUniverseAdditionalInformation(params);
            }
            throw error
        }
    }

    async deleteChannelPartnerUniverseAdditionalInformation(params: DeleteChannelPartnerUniverseAdditionalInformationRequest): Promise<ChannelPartnerUniverseAdditionalInformationDeleteResponse> {

        try {
            const queryParams = new URLSearchParams({
                ChannelPartnerUniverseAdditionalInformationId: (params.ChannelPartnerUniverseAdditionalInformationId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? ''
            });

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(`${ChannelPartnerUniverseApi.DELETE_UNIVERSE_ADDITIONAL_INFORMATION}?${queryParams.toString()}`);

            return response;

        } catch (error: any) {
            console.error('ERROR: DELETE CHANNEL PARTNER UNIVERSE ADDITION INFORMATION :', error);

            if (error instanceof TokenExpiredException) {

                return await this.deleteChannelPartnerUniverseAdditionalInformation(params);
            }
            throw error;
        }
    }

}
