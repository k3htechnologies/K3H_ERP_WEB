import type { Failure } from '@/core/api/FailureResponse';
import { ChannelPartnerSourcingDatasourceImpl } from '@/features/ChannelPartnerSourcing/datasources/ChannelPartnerSourcingDatasource';
import type {
  AddUpdateChannelPartnerSourcingRequest,
  ChannelPartnerSourcingDeleteResponse,
  ChannelPartnerSourcingListResponse,
  ChannelPartnerSourcingSaveResponse,
  DeleteChannelPartnerSourcingRequest,
  FilterWithPaginationChannelPartnerSourcingRequest
} from '@/features/ChannelPartnerSourcing/models/ChannelPartnerSourcingModel';

import * as E from 'fp-ts/Either';

const channelPartnerSourcingDatasource = new ChannelPartnerSourcingDatasourceImpl();

export const ChannelPartnerSourcingService = {

  apiCallPullChannelPartnerSourcing: async (params: FilterWithPaginationChannelPartnerSourcingRequest,options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ChannelPartnerSourcingListResponse>> => {
   
    try {

      return E.right(await channelPartnerSourcingDatasource.pullChannelPartnerSourcing(params, options?.signal));

    } catch (error: any) {

      return E.left({ message: error.message, code: error.code });
    }
  },

  apiCallAddUpdateChannelPartnerSourcing: async (params: AddUpdateChannelPartnerSourcingRequest): Promise<E.Either<Failure, ChannelPartnerSourcingSaveResponse>> => {
    
    try {

      return E.right(await channelPartnerSourcingDatasource.addUpdateChannelPartnerSourcing(params));

    } catch (error: any) {

      return E.left({ message: error.message, code: error.code });
    }
  },

  apiCallDeleteChannelPartnerSourcing: async (params: DeleteChannelPartnerSourcingRequest): Promise<E.Either<Failure, ChannelPartnerSourcingDeleteResponse>> => {
   
    try {

      return E.right(await channelPartnerSourcingDatasource.deleteChannelPartnerSourcing(params));

    } catch (error: any) {

      return E.left({ message: error.message, code: error.code });
      
    }
  }
};


