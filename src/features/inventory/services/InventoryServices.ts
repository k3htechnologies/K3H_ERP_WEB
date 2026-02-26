import * as E from "fp-ts/Either";
import { InventoryDatasourceImpl } from "@/features/inventory/datasources/InventoryDatasource";
import type {
    FilterProjectInventoryExistsRequest,
    FilterInventoryRequest,
    FilterPaginatedFlatsRequest,
    AddInventoryRequest,
    DeleteInventoryRequest,
    UpdateInventoryFloorRequest,
    UpdateInventoryFlatRequest,
    UpdateInventoryWingRequest,
    DeleteInventoryBuildingRequest,
    DeleteInventoryWingRequest,
    DeleteInventoryFloorRequest,
    DeleteInventoryFlatRequest,
    AddInventoryBuildingRequest,
    AddInventoryWingRequest,
    AddInventoryFloorRequest,
    AddInventoryFlatRequest,
    AddUpdateInventoryFloorParkingCountRequest,
    ProjectInventoryExistsResponse,
    InventoryListReponse,
    AddInventoryResponse,
    InventoryDeleteResponse,
    UpdateInventoryFloorResponse,
    UpdateInventoryFlatResponse,
    UpdateInventoryWingResponse,
    InventoryBuildingDeleteResponse,
    InventoryWingDeleteResponse,
    InventoryFloorDeleteResponse,
    InventoryFlatDeleteResponse,
    AddInventoryBuildingResponse,
    AddInventoryWingResponse,
    AddInventoryFloorResponse,
    AddInventoryFlatResponse,
    AddUpdateInventoryFloorParkingCountResponse,
    FilterPaginatedFlatsResponse,
    FilterWithPaginationProjectInventoryStructureRequest,
    ProjectInventoryStructureListResponse,
} from "@/features/inventory/models/InventoryMasterModel";
import type { Failure } from "@/core/api/FailureResponse";

const inventoryDatasource = new InventoryDatasourceImpl();

export const inventoryService = {

    apiCallIsProjectInventoryExists: async (params: FilterProjectInventoryExistsRequest): Promise<E.Either<Failure, ProjectInventoryExistsResponse>> => {

        try {

            return E.right(await inventoryDatasource.isProjectInventoryExists(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallpullInventory: async (params: FilterInventoryRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, InventoryListReponse>> => {
        try {

            return E.right(await inventoryDatasource.pullInventory(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullPaginatedFlats: async (params: FilterPaginatedFlatsRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, FilterPaginatedFlatsResponse>> => {
        try {

            return E.right(await inventoryDatasource.pullPaginatedFlats(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddInventory: async (params: AddInventoryRequest): Promise<E.Either<Failure, AddInventoryResponse>> => {
        try {

            return E.right(await inventoryDatasource.addInventory(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteInventory: async (params: DeleteInventoryRequest): Promise<E.Either<Failure, InventoryDeleteResponse>> => {
        try {

            return E.right(await inventoryDatasource.deleteInventory(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallUpdateInventoryWing: async (params: UpdateInventoryWingRequest): Promise<E.Either<Failure, UpdateInventoryWingResponse>> => {
        try {

            return E.right(await inventoryDatasource.updateInventoryWing(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallUpdateInventoryFloor: async (params: UpdateInventoryFloorRequest): Promise<E.Either<Failure, UpdateInventoryFloorResponse>> => {
        try {

            return E.right(await inventoryDatasource.updateInventoryFloor(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallUpdateInventoryFlat: async (params: UpdateInventoryFlatRequest): Promise<E.Either<Failure, UpdateInventoryFlatResponse>> => {
        try {

            return E.right(await inventoryDatasource.updateInventoryFlat(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteInventoryBuilding: async (params: DeleteInventoryBuildingRequest): Promise<E.Either<Failure, InventoryBuildingDeleteResponse>> => {
        try {

            return E.right(await inventoryDatasource.deleteInventoryBuilding(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteInventoryWing: async (params: DeleteInventoryWingRequest): Promise<E.Either<Failure, InventoryWingDeleteResponse>> => {
        try {

            return E.right(await inventoryDatasource.deleteInventoryWing(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteInventoryFloor: async (params: DeleteInventoryFloorRequest): Promise<E.Either<Failure, InventoryFloorDeleteResponse>> => {
        try {

            return E.right(await inventoryDatasource.deleteInventoryFloor(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteInventoryFlat: async (params: DeleteInventoryFlatRequest): Promise<E.Either<Failure, InventoryFlatDeleteResponse>> => {
        try {

            return E.right(await inventoryDatasource.deleteInventoryFlat(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddInventoryBuilding: async (params: AddInventoryBuildingRequest): Promise<E.Either<Failure, AddInventoryBuildingResponse>> => {
        try {

            return E.right(await inventoryDatasource.addInventoryBuilding(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddInventoryWing: async (params: AddInventoryWingRequest): Promise<E.Either<Failure, AddInventoryWingResponse>> => {
        try {

            return E.right(await inventoryDatasource.addInventoryWing(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddInventoryFloor: async (params: AddInventoryFloorRequest): Promise<E.Either<Failure, AddInventoryFloorResponse>> => {
        try {

            return E.right(await inventoryDatasource.addInventoryFloor(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddInventoryFlat: async (params: AddInventoryFlatRequest): Promise<E.Either<Failure, AddInventoryFlatResponse>> => {
        try {

            return E.right(await inventoryDatasource.addInventoryFlat(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateInventoryFloorParkingCount: async (params: AddUpdateInventoryFloorParkingCountRequest): Promise<E.Either<Failure, AddUpdateInventoryFloorParkingCountResponse>> => {
        try {

            return E.right(await inventoryDatasource.addUpdateInventoryFloorParkingCount(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullInventoryFloorForPaymentSchedule: async (params: FilterInventoryRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, InventoryListReponse>> => {
        try {

            return E.right(await inventoryDatasource.pullInventoryFloorForPaymentSchedule(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullProjectInventoryStructure: async (params: FilterWithPaginationProjectInventoryStructureRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProjectInventoryStructureListResponse>> => {

        try {
            return E.right(await inventoryDatasource.pullProjectInventoryStructure(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },
};
