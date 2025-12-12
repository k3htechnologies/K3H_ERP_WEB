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

const employeeMasterDatasource = new BuildingDatasourceImpl();

export const employeeMasterService = {

    apiCallPullBuilding: async (params: FilterWithPaginationBuildingRequest): Promise<E.Either<Failure, BuildingListResponse>> => {
        try {

            return E.right(await employeeMasterDatasource.pullBuilding(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateBuilding: async (data: AddUpdateBuildingRequest): Promise<E.Either<Failure, BuildingListResponse>> => {
        try {

            return E.right(await employeeMasterDatasource.addUpdateBuilding(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteBuilding: async (data: DeleteBuildingRequest): Promise<E.Either<Failure, BuildingDeleteResponse>> => {
        try {

            return E.right(await employeeMasterDatasource.deleteBuilding(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
