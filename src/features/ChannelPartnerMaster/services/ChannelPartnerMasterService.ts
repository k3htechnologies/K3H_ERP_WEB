import type { Failure } from '@/core/api/FailureResponse';
import { ChannelPartnerMasterDatasourceImpl } from '@/features/ChannelPartnerMaster/datasources/ChannelPartnerMasterDatasource';
import type {
    FilterWithPaginationChannelPartnerMasterRequest,
    DeleteChannelPartnerMasterRequest,
    ChannelPartnerMasterListResponse,
    ChannelPartnerMasterSaveResponse,
} from '@/features/ChannelPartnerMaster/models/ChannelPartnerMasterModel';

import * as E from 'fp-ts/Either';

const channelPartnerMasterDatasource = new ChannelPartnerMasterDatasourceImpl();

export const ChannelPartnerMasterService ={

    apiCallPullChannelPartnerMaster : async (params: FilterWithPaginationChannelPartnerMasterRequest,options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ChannelPartnerMasterListResponse>> => {

        try {

            return E.right(await channelPartnerMasterDatasource.pullChannelPartnerMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

   apiCallAddUpdateChannelPartnerMaster: async (formData: FormData): Promise<E.Either<Failure, ChannelPartnerMasterSaveResponse>> => {
    try {
        return E.right(await channelPartnerMasterDatasource.addUpdateChannelPartnerMaster(formData));
    } catch (error: any) {
        return E.left({ message: error.message, code: error.code });
    }
},

apiCallDeleteChannelPartnerMaster: async (params: DeleteChannelPartnerMasterRequest): Promise<E.Either<Failure, ChannelPartnerMasterSaveResponse>> => {
    try {
        return E.right(await channelPartnerMasterDatasource.deleteChannelPartnerMasterRequest(params));
    } catch (error: any) {
        return E.left({ message: error.message, code: error.code });
    }
},

}


