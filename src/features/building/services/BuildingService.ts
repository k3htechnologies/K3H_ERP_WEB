import type { Failure } from '@/core/api/FailureResponse';
import { BuildingDatasourceImpl } from '@/features/building/datasources/BuildingDatasource'
import type {
    FilterWithPaginationBuildingRequest,
    AddUpdateBuildingRequest,
    BuildingListResponse,
    DeleteBuildingRequest,
    BuildingDeleteResponse
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

    apiCallAddUpdateBuilding: async (params: AddUpdateBuildingRequest): Promise<E.Either<Failure, BuildingListResponse>> => {
        try {

            return E.right(await buildingDatasource.addUpdateBuilding(params));

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
}
