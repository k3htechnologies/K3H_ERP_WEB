import baseClient from "@/core/config/baseClient";
import type { DeleteInventoryFlatRequest, FilterInventoryRequest, InventoryFlatDeleteResponse, InventoryListReponse, UpdateFlatResponse, UpdateInventoryFlatRequest, } from "@/features/inventory/models/InventoryMasterModel";
import { InventoryApis } from "@/features/inventory/api/InventoryApis";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class InventoryDatasource {

    abstract pullInventory(parms: FilterInventoryRequest, signal?: AbortSignal): Promise<InventoryListReponse>;

    abstract updateInventoryFlat(params: UpdateInventoryFlatRequest): Promise<UpdateFlatResponse>;

    abstract deleteInventoryFlat(params: DeleteInventoryFlatRequest): Promise<InventoryFlatDeleteResponse>;
}

export class InventoryDatasourceImpl implements InventoryDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullInventory(params: FilterInventoryRequest, signal?: AbortSignal): Promise<InventoryListReponse> {
        try {

            const queryParams = new URLSearchParams({
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${InventoryApis.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;

        } catch (error: any) {

            console.error('ERROR: PULL INVENTORY:', error)

            if (error === TokenExpiredException) {

                this.pullInventory(params)

            }
            throw error;
        }
    }

    async updateInventoryFlat(params: UpdateInventoryFlatRequest): Promise<UpdateFlatResponse> {
        try {
            return await this.k3hHttpClient.postRequestWithAuthentication(
                InventoryApis.UPDATE_Inventory_FLAT,
                params
            )
        } catch (error) {

            console.error('ERROR: ADD UPDATE INVENTORY:', error)

            if (error === TokenExpiredException) {

                await this.updateInventoryFlat(params)
            }

            throw error
        }
    }

    async deleteInventoryFlat(params: DeleteInventoryFlatRequest): Promise<InventoryFlatDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: (params.ProjectId ?? 0).toString(),
                InventoryBuildingId: (params.InventoryBuildingId ?? 0).toString(),
                InventoryFlatFloorBasementPodiumWingId: (params.InventoryFlatFloorBasementPodiumWingId ?? 0).toString(),
                InventoryFloorId: (params.InventoryFloorId ?? 0).toString(),
                InventoryFlatId: (params.InventoryFlatId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${InventoryApis.DELETE_Inventory_FLAT}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE INVENTORY FLAT :', error)

            if (error === TokenExpiredException) {

                await this.deleteInventoryFlat(params);

            }

            throw error
        }
    }

}


