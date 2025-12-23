import * as E from "fp-ts/Either";
import { InventoryDatasourceImpl } from "@/features/inventory/datasources/InventoryDatasource";
import type { DeleteInventoryFlatRequest, FilterInventoryRequest, InventoryFlatDeleteResponse, InventoryListReponse, UpdateFlatResponse, UpdateInventoryFlatRequest } from "@/features/inventory/models/InventoryMasterModel";
import type { Failure } from "@/core/api/FailureResponse";

const inventoryDatasource = new InventoryDatasourceImpl

export const inventoryService = {

    apiCallpullInventory: async (params: FilterInventoryRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, InventoryListReponse>> => {
        try {

            return E.right(await inventoryDatasource.pullInventory(params, options?.signal));

        } catch (error: any) {
            return E.left({ message: error.message })
        }
    },

    apiCallUpdateInventoryFlat: async (params: UpdateInventoryFlatRequest): Promise<E.Either<Failure, UpdateFlatResponse>> => {
        try {

            return E.right(await inventoryDatasource.updateInventoryFlat(params));

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


}