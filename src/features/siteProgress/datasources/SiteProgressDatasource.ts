import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { SiteProgressApi } from '@/features/siteProgress/api/SiteProgressApi'

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
} from '@/features/siteProgress/models/SiteProgressModel'

export abstract class SiteProgressDatasource {
    abstract pullSiteProgressConstruction(
        params: FilterWithPaginationSiteProgressConstructionRequest,
        signal?: AbortSignal
    ): Promise<SiteProgressConstructionListResponse>;

    abstract pullSiteProgressSubConstruction(
        params: FilterWithPaginationSiteProgressSubConstructionRequest,
        signal?: AbortSignal
    ): Promise<SiteProgressSubConstructionListResponse>;

    abstract pullSiteProgressWingConstruction(
        params: FilterWithPaginationSiteProgressWingConstructionRequest,
        signal?: AbortSignal
    ): Promise<SiteProgressWingConstructionListResponse>;

    abstract pullSiteProgressFloorConstruction(
        params: FilterWithPaginationSiteProgressFloorConstructionRequest,
        signal?: AbortSignal
    ): Promise<SiteProgressFloorConstructionListResponse>;

    abstract pullSiteProgressFlatConstruction(
        params: FilterWithPaginationSiteProgressFlatConstructionRequest,
        signal?: AbortSignal
    ): Promise<SiteProgressFlatConstructionListResponse>;

    abstract pullSiteProgressConstructionActivity(
        params: FilterWithPaginationSiteProgressConstructionActivityRequest,
        signal?: AbortSignal
    ): Promise<SiteProgressConstructionActivityListResponse>;

    abstract pullSiteProgressConstructionSubActivity(
        params: FilterWithPaginationSiteProgressConstructionSubActivityRequest,
        signal?: AbortSignal
    ): Promise<SiteProgressConstructionSubActivityListResponse>;
}

export class SiteProgressDatasourceImpl implements SiteProgressDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    // ======================== CONSTRUCTION ========================
    async pullSiteProgressConstruction(
        params: FilterWithPaginationSiteProgressConstructionRequest,
        signal?: AbortSignal
    ): Promise<SiteProgressConstructionListResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: params.ProjectId.toString(),
            })

            if (params.ExportType) {
                queryParams.append('ExportType', params.ExportType)
            }

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${SiteProgressApi.PULL_SITE_PROGRESS_CONSTRUCTION}?${queryParams.toString()}`,
                { signal }
            )

            return response
        } catch (error: any) {
            console.error('ERROR: PULL SITE PROGRESS CONSTRUCTION :', error)

            if (error instanceof TokenExpiredException) {

                return await this.pullSiteProgressConstruction(params, signal)
            }

            throw error
        }
    }

    // ======================== SUB CONSTRUCTION ========================
    async pullSiteProgressSubConstruction(
        params: FilterWithPaginationSiteProgressSubConstructionRequest,
        signal?: AbortSignal
    ): Promise<SiteProgressSubConstructionListResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: params.ProjectId.toString(),
                InventoryBuildingId: params.InventoryBuildingId.toString(),
                ConstructionId: params.ConstructionId.toString()
            })

            if (params.ExportType) {
                queryParams.append('ExportType', params.ExportType)
            }

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${SiteProgressApi.PULL_SITE_PROGRESS_SUB_CONSTRUCTION}?${queryParams.toString()}`,
                { signal }
            )

            return response
        } catch (error: any) {
            console.error('ERROR: PULL SITE PROGRESS SUB CONSTRUCTION :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullSiteProgressSubConstruction(params, signal)
            }

            throw error
        }
    }

    // ======================== WING CONSTRUCTION ========================
    async pullSiteProgressWingConstruction(
        params: FilterWithPaginationSiteProgressWingConstructionRequest,
        signal?: AbortSignal
    ): Promise<SiteProgressWingConstructionListResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: params.ProjectId.toString(),
                InventoryBuildingId: params.InventoryBuildingId.toString(),
                ConstructionId: params.ConstructionId.toString(),
                SubConstructionId: params.SubConstructionId.toString()
            })

            if (params.ExportType) {
                queryParams.append('ExportType', params.ExportType)
            }

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${SiteProgressApi.PULL_SITE_PROGRESS_WING_CONSTRUCTION}?${queryParams.toString()}`,
                { signal }
            )

            return response
        } catch (error: any) {
            console.error('ERROR: PULL SITE PROGRESS WING CONSTRUCTION :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullSiteProgressWingConstruction(params, signal)
            }

            throw error
        }
    }

    // ======================== FLOOR CONSTRUCTION ========================
    async pullSiteProgressFloorConstruction(
        params: FilterWithPaginationSiteProgressFloorConstructionRequest,
        signal?: AbortSignal
    ): Promise<SiteProgressFloorConstructionListResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: params.ProjectId.toString(),
                InventoryBuildingId: params.InventoryBuildingId.toString(),
                ConstructionId: params.ConstructionId.toString(),
                SubConstructionId: params.SubConstructionId.toString(),
                InventoryFlatFloorBasementPodiumWingId: params.InventoryFlatFloorBasementPodiumWingId.toString()
            })

            if (params.ExportType) {
                queryParams.append('ExportType', params.ExportType)
            }

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${SiteProgressApi.PULL_SITE_PROGRESS_FLOOR_CONSTRUCTION}?${queryParams.toString()}`,
                { signal }
            )

            return response
        } catch (error: any) {
            console.error('ERROR: PULL SITE PROGRESS FLOOR CONSTRUCTION :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullSiteProgressFloorConstruction(params, signal)
            }

            throw error
        }
    }

    // ======================== FLAT CONSTRUCTION ========================
    async pullSiteProgressFlatConstruction(
        params: FilterWithPaginationSiteProgressFlatConstructionRequest,
        signal?: AbortSignal
    ): Promise<SiteProgressFlatConstructionListResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: params.ProjectId.toString(),
                InventoryBuildingId: params.InventoryBuildingId.toString(),
                ConstructionId: params.ConstructionId.toString(),
                SubConstructionId: params.SubConstructionId.toString(),
                InventoryFlatFloorBasementPodiumWingId: params.InventoryFlatFloorBasementPodiumWingId.toString(),
                InventoryFloorId: params.InventoryFloorId.toString()
            })

            if (params.ExportType) {
                queryParams.append('ExportType', params.ExportType)
            }

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${SiteProgressApi.PULL_SITE_PROGRESS_FLAT_CONSTRUCTION}?${queryParams.toString()}`,
                { signal }
            )

            return response
        } catch (error: any) {
            console.error('ERROR: PULL SITE PROGRESS FLAT CONSTRUCTION :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullSiteProgressFlatConstruction(params, signal)
            }

            throw error
        }
    }

    // ======================== CONSTRUCTION ACTIVITY ========================
    async pullSiteProgressConstructionActivity(
        params: FilterWithPaginationSiteProgressConstructionActivityRequest,
        signal?: AbortSignal
    ): Promise<SiteProgressConstructionActivityListResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: params.ProjectId.toString(),
                InventoryBuildingId: params.InventoryBuildingId.toString(),
                ConstructionId: params.ConstructionId.toString(),
                SubConstructionId: params.SubConstructionId.toString(),
                InventoryFlatFloorBasementPodiumWingId: params.InventoryFlatFloorBasementPodiumWingId.toString(),
                InventoryFloorId: params.InventoryFloorId.toString(),
                InventoryFlatId: params.InventoryFlatId.toString()
            })

            if (params.ExportType) {
                queryParams.append('ExportType', params.ExportType)
            }

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${SiteProgressApi.PULL_SITE_PROGRESS_CONSTRUCTION_ACTIVITY}?${queryParams.toString()}`,
                { signal }
            )

            return response
        } catch (error: any) {
            console.error('ERROR: PULL SITE PROGRESS CONSTRUCTION ACTIVITY :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullSiteProgressConstructionActivity(params, signal)
            }

            throw error
        }
    }

    // ======================== CONSTRUCTION SUB ACTIVITY ========================
    async pullSiteProgressConstructionSubActivity(
        params: FilterWithPaginationSiteProgressConstructionSubActivityRequest,
        signal?: AbortSignal
    ): Promise<SiteProgressConstructionSubActivityListResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: params.ProjectId.toString(),
                ConstructionActivityId: params.ConstructionActivityId.toString()
            })

            if (params.ExportType) {
                queryParams.append('ExportType', params.ExportType)
            }

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${SiteProgressApi.PULL_SITE_PROGRESS_CONSTRUCTION_SUB_ACTIVITY}?${queryParams.toString()}`,
                { signal }
            )

            return response
        } catch (error: any) {
            console.error('ERROR: PULL SITE PROGRESS CONSTRUCTION SUB ACTIVITY :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullSiteProgressConstructionSubActivity(params, signal)
            }

            throw error
        }
    }
}
