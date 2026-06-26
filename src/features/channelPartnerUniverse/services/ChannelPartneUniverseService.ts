import type { Failure } from '@/core/api/FailureResponse';
import type { AddUpdateChannelPartnerUniverseAdditionalInformationRequest, ChannelPartnerUniverseAdditionalInformationListResponse, ChannelPartnerUniverseListResponse, ChannelPartnerUniverseAdditionalInformationSaveResponse, FilterWithPaginationChannelPartnerUniverseAdditionalInformation, FilterWithPaginationChannelPartnerUniverseRequest, ChannelPartnerUniverseAdditionalInformationDeleteResponse, DeleteChannelPartnerUniverseAdditionalInformationRequest } from '@/features/channelPartnerUniverse/models/ChannelPartnerUniverseModel'

import * as E from 'fp-ts/Either';
import { ChannelPartnerUniverseDatasourceImpl } from '@/features/channelPartnerUniverse/datasources/ChannelPartnerUniverseDatasource';

const channelPartnerUniverseDatasourcesource = new ChannelPartnerUniverseDatasourceImpl();

export const channelPartnerUniverseService = {

    apiCallPullChannelPartnerUniverse: async (params: FilterWithPaginationChannelPartnerUniverseRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ChannelPartnerUniverseListResponse>> => {
        try {

            return E.right(await channelPartnerUniverseDatasourcesource.pullChannelPartnerUniverse(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

     apiCallPullChannelPartnerUniverseAdditionalInformation: async (params: FilterWithPaginationChannelPartnerUniverseAdditionalInformation, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ChannelPartnerUniverseAdditionalInformationListResponse>> => {
        try {

            return E.right(await channelPartnerUniverseDatasourcesource.pullChannelPartnerUniverseAdditionalInformation(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateChannelPartnerUniverseAdditionalInformation: async (params: AddUpdateChannelPartnerUniverseAdditionalInformationRequest): Promise<E.Either<Failure, ChannelPartnerUniverseAdditionalInformationSaveResponse>> => {
        try {

            return E.right(await channelPartnerUniverseDatasourcesource.addUpdateChannelPartnerUniverseAdditionalInformation(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

     apiCallDeleteChannelPartnerUniverseAdditionalInformation: async (params: DeleteChannelPartnerUniverseAdditionalInformationRequest): Promise<E.Either<Failure, ChannelPartnerUniverseAdditionalInformationDeleteResponse>> => {
        try {

            return E.right(await channelPartnerUniverseDatasourcesource.deleteChannelPartnerUniverseAdditionalInformation(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}
