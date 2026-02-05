import type { Failure } from '@/core/api/FailureResponse';
import { ChannelPartnerDatasourceImpl } from '@/features/ChannelPartner/datasources/ChannelPartnerDatasource';
import type {
    FilterWithPaginationChannelPartnerRequest,
    DeleteChannelPartnerRequest,
    ChannelPartnerListResponse,
    ChannelPartnerSaveResponse,
} from '@/features/ChannelPartner/models/ChannelPartnerModel';

import * as E from 'fp-ts/Either';

const channelPartnerDatasource = new ChannelPartnerDatasourceImpl();

export const ChannelPartnerService ={

    apiCallPullChannelPartner : async (params: FilterWithPaginationChannelPartnerRequest,options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ChannelPartnerListResponse>> => {

        try {

            return E.right(await channelPartnerDatasource.pullChannelPartner(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
            
        }
    },

   apiCallAddUpdateChannelPartner: async (formData: FormData): Promise<E.Either<Failure, ChannelPartnerSaveResponse>> => {
    try {

        return E.right(await channelPartnerDatasource.addUpdateChannelPartner(formData));

    } catch (error: any) {

        return E.left({ message: error.message, code: error.code });

    }
},

apiCallDeleteChannelPartner: async (params: DeleteChannelPartnerRequest): Promise<E.Either<Failure, ChannelPartnerSaveResponse>> => {
    try {

        return E.right(await channelPartnerDatasource.deleteChannelPartnerRequest(params));

    } catch (error: any) {

        return E.left({ message: error.message, code: error.code });

    }
},

}


