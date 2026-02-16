import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { ChannelPartnerSourcingApi } from "@/features/ChannelPartnerSourcing/api/ChannelPartnerSourcingApi";
import type {
  AddUpdateChannelPartnerSourcingRequest,
  ChannelPartnerSourcingDeleteResponse,
  ChannelPartnerSourcingListResponse,
  ChannelPartnerSourcingSaveResponse,
  DeleteChannelPartnerSourcingRequest,
  FilterWithPaginationChannelPartnerSourcingRequest
} from "@/features/ChannelPartnerSourcing/models/ChannelPartnerSourcingModel";

export abstract class ChannelPartnerSourcingDatasource {
  abstract pullChannelPartnerSourcing(
    params: FilterWithPaginationChannelPartnerSourcingRequest,
    signal?: AbortSignal
  ): Promise<ChannelPartnerSourcingListResponse>;

  abstract addUpdateChannelPartnerSourcing(
    data: AddUpdateChannelPartnerSourcingRequest
  ): Promise<ChannelPartnerSourcingSaveResponse>;

  abstract deleteChannelPartnerSourcing(
    params: DeleteChannelPartnerSourcingRequest
  ): Promise<ChannelPartnerSourcingDeleteResponse>;
}

export class ChannelPartnerSourcingDatasourceImpl implements ChannelPartnerSourcingDatasource {
  private get k3hHttpClient() {
    return baseClient;
  }

  async pullChannelPartnerSourcing(params: FilterWithPaginationChannelPartnerSourcingRequest,signal?: AbortSignal): Promise<ChannelPartnerSourcingListResponse> {
    try {
      const queryParams = new URLSearchParams({
        PageSize: (params.PageSize ?? 10).toString(),
        PageNumber: (params.PageNumber ?? 1).toString()
      });

      if (params.ChannelPartnerSourcingId) {
        queryParams.append('ChannelPartnerSourcingId', params.ChannelPartnerSourcingId.toString());
      }
      
      if (params.ChannelPartnerId) {
        queryParams.append('ChannelPartnerId', params.ChannelPartnerId.toString());
      }
      
      if (params.ProjectId) {
        queryParams.append('ProjectId', params.ProjectId.toString());
      }
      
      if (params.SortBy?.trim()) {
        queryParams.append('SortBy', params.SortBy.trim());
      }

      const response = await this.k3hHttpClient.getRequestWithAuthentication(
        `${ChannelPartnerSourcingApi.PULL}?${queryParams.toString()}`,
        { signal }
      );

      return response;
    } catch (error: any) {
      console.error('ERROR: PULL CHANNEL PARTNER SOURCING :', error);

      if (error === TokenExpiredException) {
        await this.pullChannelPartnerSourcing(params, signal);
      }

      throw error;
    }
  }

  async addUpdateChannelPartnerSourcing(params: AddUpdateChannelPartnerSourcingRequest): Promise<ChannelPartnerSourcingSaveResponse> {

    try {

      return await this.k3hHttpClient.postRequestWithAuthentication(ChannelPartnerSourcingApi.ADD_UPDATE, params);

    } catch (error: any) {

      console.error('ERROR: ADD UPDATE CHANNEL PARTNER SOURCING :', error);

      if (error === TokenExpiredException) {
        await this.addUpdateChannelPartnerSourcing(params);
      }

      throw error;
    }
  }

  async deleteChannelPartnerSourcing( params: DeleteChannelPartnerSourcingRequest): Promise<ChannelPartnerSourcingDeleteResponse> {
    
    try {
      const queryParams = new URLSearchParams({
        ChannelPartnerSourcingId: (params.ChannelPartnerSourcingId ?? 0).toString(),
        Uniquekey: params.Uniquekey ?? ''
      });

      const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
        `${ChannelPartnerSourcingApi.DELETE}?${queryParams.toString()}`
      );

      return response;
    } catch (error: any) {

      console.error('ERROR: DELETE CHANNEL PARTNER SOURCING :', error);

      if (error === TokenExpiredException) {
        await this.deleteChannelPartnerSourcing(params);
      }

      throw error;
    }
  }
}


