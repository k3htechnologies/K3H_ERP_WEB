import baseClient from "@/core/config/baseClient"
import { TokenExpiredException } from "@/core/config/baseClientexceptions"
import { ChannelPartnerMasterApi } from '@/features/ChannelPartnerMaster/api/ChannelPartnerMasterApi'
import type {
    FilterWithPaginationChannelPartnerMasterRequest,
    DeleteChannelPartnerMasterRequest,
    ChannelPartnerMasterListResponse,
    ChannelPartnerMasterSaveResponse,
} from '@/features/ChannelPartnerMaster/models/ChannelPartnerMasterModel'

export abstract class ChannelPartnerMasterDatasource {

    abstract pullChannelPartnerMaster(params: FilterWithPaginationChannelPartnerMasterRequest, signal?: AbortSignal): Promise<ChannelPartnerMasterListResponse>;
    abstract addUpdateChannelPartnerMaster(data: FormData): Promise<ChannelPartnerMasterSaveResponse>;
    abstract deleteChannelPartnerMasterRequest(params: DeleteChannelPartnerMasterRequest): Promise<ChannelPartnerMasterSaveResponse>;
}

export class ChannelPartnerMasterDatasourceImpl implements ChannelPartnerMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullChannelPartnerMaster(params: FilterWithPaginationChannelPartnerMasterRequest, signal?: AbortSignal): Promise<ChannelPartnerMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: (params.PageSize ?? 10).toString(),
                pageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ChannelPartnerId) queryParams.append('ChannelPartnerId', params.ChannelPartnerId.toString());
            if (params.Name?.trim()) queryParams.append('ChannelPartnerName', params.Name.trim());
            if (params.MobileNumber?.trim()) queryParams.append('MobileNumber', params.MobileNumber.trim());
            if (params.CompanyName?.trim()) queryParams.append('CompanyName', params.CompanyName.trim());
            if (params.Status?.trim()) queryParams.append('Status', params.Status.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ChannelPartnerMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {
            console.error('ERROR: PULL CHANNEL PARTNER MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullChannelPartnerMaster(params);
            }
            throw error
        }
    }

    async addUpdateChannelPartnerMaster(formData: FormData): Promise<ChannelPartnerMasterSaveResponse> {
        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                ChannelPartnerMasterApi.ADD_UPDATE,
                formData
            )
            return response;
        } catch (error) {

            console.error('ERROR: ADD UPDATE CHANNEL PARTNER MASTER :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateChannelPartnerMaster(formData);
            }
            throw error
        }
    }

    async deleteChannelPartnerMasterRequest(params: DeleteChannelPartnerMasterRequest): Promise<ChannelPartnerMasterSaveResponse> {
        try {
            const queryParams = new URLSearchParams({
                ChannelPartnerId: (params.ChannelPartnerId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ChannelPartnerMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE CHANNEL PARTNER MASTER :', error)
            
            if (error === TokenExpiredException) {

                await this.deleteChannelPartnerMasterRequest(params);

            }

            throw error
        }
    }
}