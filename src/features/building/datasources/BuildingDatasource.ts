import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { BuildingApi } from '@/features/building/api/BuildingApi'
import type {
    FilterWithPaginationBuildingRequest,
    AddUpdateBuildingRequest,
    BuildingListResponse,
    DeleteBuildingRequest,
    BuildingDeleteResponse,
    FilterWithPaginationBuildingDetailsRequest,
    BuildingDetailsListResponse,
    AddUpdateBuildingDetailsRequest,
    BuildingDetailsSaveResponse,
    BuildingSaveResponse,
    FilterWithPaginationBuildingDocumentRequest,
    BuildingDocumentListResponse,
    DeleteBuildingDocumentRequest,
    BuildingDocumentDeleteResponse,
    BuildingDocumentSaveResponse,
} from '@/features/building/models/BuildingModel'

export abstract class BuildingDatasource {

    abstract pullBuilding(params: FilterWithPaginationBuildingRequest): Promise<BuildingListResponse>;
    abstract addUpdateBuilding(data: AddUpdateBuildingRequest): Promise<BuildingSaveResponse>;
    abstract deleteBuilding(params: DeleteBuildingRequest): Promise<BuildingDeleteResponse>;
   
    abstract pullBuildingDetails(params: FilterWithPaginationBuildingDetailsRequest): Promise<BuildingDetailsListResponse>;
    abstract addUpdateBuildingDetails(params: AddUpdateBuildingDetailsRequest): Promise<BuildingDetailsSaveResponse>;
    
    abstract pullBuildingDocument(params: FilterWithPaginationBuildingDocumentRequest): Promise<BuildingDocumentListResponse>;
    abstract addUpdateBuildingDocument(params: FormData): Promise<BuildingDocumentSaveResponse>;
    abstract deleteBuildingDocument(params: DeleteBuildingDocumentRequest): Promise<BuildingDocumentDeleteResponse>;
}


export class BuildingDatasourceImpl implements BuildingDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullBuilding(params: FilterWithPaginationBuildingRequest): Promise<BuildingListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString());
            if (params.BuildingName?.trim()) queryParams.append('BuildingName', params.BuildingName.trim());
            if (params.CTSNumber?.trim()) queryParams.append('CTSNumber', params.CTSNumber.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${BuildingApi.PULL}?${queryParams.toString()}`
            )

            return response
        } catch (error) {

            console.error('Error: Pull BUILDING:', error);

            if (error === TokenExpiredException) {
                await this.pullBuilding(params);
            }

            throw error
        }
    }

    async addUpdateBuilding(params: AddUpdateBuildingRequest): Promise<BuildingSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                BuildingApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {
            console.error('Error: Add Update BUILDING:', error)

            if (error === TokenExpiredException) {
                await this.addUpdateBuilding(params);
            }

            throw error
        }
    }

    async deleteBuilding(params: DeleteBuildingRequest): Promise<BuildingDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                BuildingId: (params.BuildingId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${BuildingApi.DELETE}?${queryParams.toString()}`
            )

            return response;

        } catch (error) {

            console.error('ERRPR : DELETE BUILDING:', error)

            if (error === TokenExpiredException) {
                await this.deleteBuilding(params);
            }

            throw error
        }
    }

    //BUILDING DETAILS

    async pullBuildingDetails(params: FilterWithPaginationBuildingDetailsRequest): Promise<BuildingDetailsListResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: (params.ProjectId ?? 0).toString(),
                BuildingId: (params.BuildingId ?? 0).toString(),
            })


            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${BuildingApi.PULL_BUILDING_DETAILS}?${queryParams.toString()}`
            )

            return response
        } catch (error) {

            console.error('Error: Pull BUILDING DETAILS :', error);

            if (error === TokenExpiredException) {
                await this.pullBuildingDetails(params);
            }

            throw error
        }
    }

    async addUpdateBuildingDetails(params: AddUpdateBuildingDetailsRequest): Promise<BuildingDetailsSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                BuildingApi.ADD_UPDATE_BUILDING_DETAILS,
                params
            )

            return response
        } catch (error) {
            console.error('Error: Add Update BUILDING DETAILS :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateBuildingDetails(params);
            }

            throw error
        }
    }

    //BUILDING DOCUMENT

    async pullBuildingDocument(params: FilterWithPaginationBuildingDocumentRequest): Promise<BuildingDocumentListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString());
            if (params.BuildingDocumentId) queryParams.append('BuildingDocumentId', params.BuildingDocumentId.toString());
            if (params.DocumentName?.trim()) queryParams.append('DocumentName', params.DocumentName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${BuildingApi.PULL_BUILDING_DOCUMENT}?${queryParams.toString()}`
            )

            return response
        } catch (error) {

            console.error('Error: Pull BUILDING DOCUMENT :', error);

            if (error === TokenExpiredException) {
                await this.pullBuildingDocument(params);
            }

            throw error
        }
    }

    async addUpdateBuildingDocument(params: FormData): Promise<BuildingDocumentSaveResponse> {

        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                BuildingApi.ADD_UPDATE_BUILDING_DOCUMENT,
                params
            )

            return response
        } catch (error) {
            console.error('Error: Add Update BUILDING DOCUMENT:', error)

            if (error === TokenExpiredException) {

                await this.addUpdateBuildingDocument(params);
            }
            throw error
        }
    }
    async deleteBuildingDocument(params: DeleteBuildingDocumentRequest): Promise<BuildingDocumentDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                BuildingDocumentId: (params.BuildingDocumentId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString(),
                BuildingId: (params.BuildingId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${BuildingApi.DELETE_BUILDING_DOCUMENT}?${queryParams.toString()}`
            )

            return response;

        } catch (error) {

            console.error('ERRPR : DELETE BUILDING DOCUMENT:', error)

            if (error === TokenExpiredException) {
                await this.deleteBuildingDocument(params);
            }

            throw error
        }
    }

}
