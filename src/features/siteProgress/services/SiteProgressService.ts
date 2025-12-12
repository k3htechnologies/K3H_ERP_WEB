import type { Failure } from '@/core/api/FailureResponse';
import { SiteProgressDatasourceImpl } from '@/features/siteProgress/datasources/SiteProgressDatasource'

import type {
    FilterWithPaginationSiteProgressConstructionRequest,
    FilterWithPaginationSiteProgressSubConstructionRequest,
    FilterWithPaginationSiteProgressWingConstructionRequest,
    FilterWithPaginationSiteProgressFloorConstructionRequest,
    FilterWithPaginationSiteProgressFlatConstructionRequest,
    FilterWithPaginationSiteProgressConstructionActivityRequest,
    FilterWithPaginationSiteProgressConstructionSubActivityRequest,
    SiteProgressConstructionListResponse,
    SiteProgressSubConstructionListResponse,
    SiteProgressWingConstructionListResponse,
    SiteProgressFloorConstructionListResponse,
    SiteProgressFlatConstructionListResponse,
    SiteProgressConstructionActivityListResponse,
    SiteProgressConstructionSubActivityListResponse
} from '@/features/siteProgress/models/SiteProgressModel';

import * as E from 'fp-ts/Either';

// datasource instance
const siteProgressDatasource = new SiteProgressDatasourceImpl();

export const SiteProgressService = {

    apiCallPullSiteProgressConstruction: async (
        params: FilterWithPaginationSiteProgressConstructionRequest,
        options?: { signal?: AbortSignal }
    ): Promise<E.Either<Failure, SiteProgressConstructionListResponse>> => {
        try {

            return E.right(await siteProgressDatasource.pullSiteProgressConstruction(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },


    apiCallPullSiteProgressSubConstruction: async (
        params: FilterWithPaginationSiteProgressSubConstructionRequest,
        options?: { signal?: AbortSignal }
    ): Promise<E.Either<Failure, SiteProgressSubConstructionListResponse>> => {
        try {

            return E.right(await siteProgressDatasource.pullSiteProgressSubConstruction(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullSiteProgressWingConstruction: async (
        params: FilterWithPaginationSiteProgressWingConstructionRequest,
        options?: { signal?: AbortSignal }
    ): Promise<E.Either<Failure, SiteProgressWingConstructionListResponse>> => {
        try {

            return E.right(await siteProgressDatasource.pullSiteProgressWingConstruction(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullSiteProgressFloorConstruction: async (
        params: FilterWithPaginationSiteProgressFloorConstructionRequest,
        options?: { signal?: AbortSignal }
    ): Promise<E.Either<Failure, SiteProgressFloorConstructionListResponse>> => {
        try {

            return E.right(await siteProgressDatasource.pullSiteProgressFloorConstruction(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullSiteProgressFlatConstruction: async (
        params: FilterWithPaginationSiteProgressFlatConstructionRequest,
        options?: { signal?: AbortSignal }
    ): Promise<E.Either<Failure, SiteProgressFlatConstructionListResponse>> => {
        try {

            return E.right(await siteProgressDatasource.pullSiteProgressFlatConstruction(params, options?.signal));
            
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullSiteProgressConstructionActivity: async (
        params: FilterWithPaginationSiteProgressConstructionActivityRequest,
        options?: { signal?: AbortSignal }
    ): Promise<E.Either<Failure, SiteProgressConstructionActivityListResponse>> => {
        try {
            return E.right(await siteProgressDatasource.pullSiteProgressConstructionActivity(params, options?.signal));
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullSiteProgressConstructionSubActivity: async (
        params: FilterWithPaginationSiteProgressConstructionSubActivityRequest,
        options?: { signal?: AbortSignal }
    ): Promise<E.Either<Failure, SiteProgressConstructionSubActivityListResponse>> => {
        try {
            return E.right(await siteProgressDatasource.pullSiteProgressConstructionSubActivity(params, options?.signal));
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    }
}
