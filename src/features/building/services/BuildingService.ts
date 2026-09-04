import type { Failure } from '@/core/api/FailureResponse';
import { BuildingDatasourceImpl } from '@/features/building/datasources/BuildingDatasource'
import type {
    FilterWithPaginationBuildingRequest,
    BuildingListResponse,
    DeleteBuildingRequest,
    BuildingDeleteResponse,
    BuildingDetailsListResponse,
    FilterWithPaginationBuildingDetailsRequest,
    BuildingDetailsSaveResponse,
    AddUpdateBuildingDetailsRequest,
    BuildingDocumentListResponse,
    FilterWithPaginationBuildingDocumentRequest,
    BuildingDocumentSaveResponse,
    DeleteBuildingDocumentRequest,
    BuildingDocumentDeleteResponse
} from '@/features/building/models/BuildingModel'

import * as E from 'fp-ts/Either';

const buildingDatasource = new BuildingDatasourceImpl();

export const buildingService = {

    apiCallPullBuilding: async (params: FilterWithPaginationBuildingRequest): Promise<E.Either<Failure, BuildingListResponse>> => {
        try {

            return E.right(await buildingDatasource.pullBuilding(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateBuilding: async (formData: FormData): Promise<E.Either<Failure, BuildingListResponse>> => {
        try {

            return E.right(await buildingDatasource.addUpdateBuilding(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteBuilding: async (params: DeleteBuildingRequest): Promise<E.Either<Failure, BuildingDeleteResponse>> => {
        try {

            return E.right(await buildingDatasource.deleteBuilding(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    // BUILDING DETAILS

    apiCallPullBuildingDetails: async (params: FilterWithPaginationBuildingDetailsRequest): Promise<E.Either<Failure, BuildingDetailsListResponse>> => {
        try {

            return E.right(await buildingDatasource.pullBuildingDetails(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateBuildingDetails: async (params: AddUpdateBuildingDetailsRequest): Promise<E.Either<Failure, BuildingDetailsSaveResponse>> => {
        try {

            return E.right(await buildingDatasource.addUpdateBuildingDetails(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    // BUILDING DOCUMENT

    apiCallPullBuildingDocument: async (params: FilterWithPaginationBuildingDocumentRequest): Promise<E.Either<Failure, BuildingDocumentListResponse>> => {
        try {

            return E.right(await buildingDatasource.pullBuildingDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateBuildingDocument: async (params: FormData): Promise<E.Either<Failure, BuildingDocumentSaveResponse>> => {
        try {

            return E.right(await buildingDatasource.addUpdateBuildingDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteBuildingDocument: async (params: DeleteBuildingDocumentRequest): Promise<E.Either<Failure, BuildingDocumentDeleteResponse>> => {
        try {

            return E.right(await buildingDatasource.deleteBuildingDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}
