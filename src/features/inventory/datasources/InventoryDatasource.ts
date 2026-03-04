import baseClient from "@/core/config/baseClient";
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
import { InventoryApis } from "@/features/inventory/api/InventoryApis";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class InventoryDatasource {
    abstract isProjectInventoryExists(params: FilterProjectInventoryExistsRequest): Promise<ProjectInventoryExistsResponse>;
    abstract pullInventory(params: FilterInventoryRequest, signal?: AbortSignal): Promise<InventoryListReponse>;
    abstract pullPaginatedFlats(params: FilterPaginatedFlatsRequest, signal?: AbortSignal): Promise<FilterPaginatedFlatsResponse>;
    abstract addInventory(params: AddInventoryRequest): Promise<AddInventoryResponse>;
    abstract deleteInventory(params: DeleteInventoryRequest): Promise<InventoryDeleteResponse>;
    abstract updateInventoryWing(params: UpdateInventoryWingRequest): Promise<UpdateInventoryWingResponse>;
    abstract updateInventoryFloor(params: UpdateInventoryFloorRequest): Promise<UpdateInventoryFloorResponse>;
    abstract updateInventoryFlat(params: UpdateInventoryFlatRequest): Promise<UpdateInventoryFlatResponse>;
    abstract deleteInventoryBuilding(params: DeleteInventoryBuildingRequest): Promise<InventoryBuildingDeleteResponse>;
    abstract deleteInventoryWing(params: DeleteInventoryWingRequest): Promise<InventoryWingDeleteResponse>;
    abstract deleteInventoryFloor(params: DeleteInventoryFloorRequest): Promise<InventoryFloorDeleteResponse>;
    abstract deleteInventoryFlat(params: DeleteInventoryFlatRequest): Promise<InventoryFlatDeleteResponse>;
    abstract addInventoryBuilding(params: AddInventoryBuildingRequest): Promise<AddInventoryBuildingResponse>;
    abstract addInventoryWing(params: AddInventoryWingRequest): Promise<AddInventoryWingResponse>;
    abstract addInventoryFloor(params: AddInventoryFloorRequest): Promise<AddInventoryFloorResponse>;
    abstract addInventoryFlat(params: AddInventoryFlatRequest): Promise<AddInventoryFlatResponse>;
    abstract addUpdateInventoryFloorParkingCount(params: AddUpdateInventoryFloorParkingCountRequest): Promise<AddUpdateInventoryFloorParkingCountResponse>;
    abstract pullInventoryFloorForPaymentSchedule(params: FilterInventoryRequest, signal?: AbortSignal): Promise<InventoryListReponse>;
    abstract pullProjectInventoryStructure(params: FilterWithPaginationProjectInventoryStructureRequest, signal?: AbortSignal): Promise<ProjectInventoryStructureListResponse>
}

export class InventoryDatasourceImpl implements InventoryDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async isProjectInventoryExists(params: FilterProjectInventoryExistsRequest): Promise<ProjectInventoryExistsResponse> {
        try {

            const queryParams = new URLSearchParams({ ProjectId: (params.ProjectId ?? 0).toString(), });

            return await this.k3hHttpClient.getRequestWithAuthentication(`${InventoryApis.IS_PROJECT_INVENTORY_EXISTS}?${queryParams.toString()}`);

        } catch (error: any) {

            console.error('ERROR: IS PROJECT INVENTORY EXISTS:', error);

            if (error === TokenExpiredException) {
                return await this.isProjectInventoryExists(params);
            }
            throw error;
        }
    }

    async pullInventory(params: FilterInventoryRequest, signal?: AbortSignal): Promise<InventoryListReponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: (params.ProjectId ?? 0).toString(),
            });

            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(`${InventoryApis.PULL}?${queryParams.toString()}`, { signal });
        } catch (error: any) {

            console.error('ERROR: PULL INVENTORY:', error);

            if (error === TokenExpiredException) {
                return await this.pullInventory(params, signal);
            }
            throw error;
        }
    }

    async pullPaginatedFlats(params: FilterPaginatedFlatsRequest, signal?: AbortSignal): Promise<FilterPaginatedFlatsResponse> {
        try {

            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 0).toString(),
                PageNumber: (params.PageNumber ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                RERACarpetAreaSqFt: (params.RERACarpetAreaSqFt ?? 0).toString(),
            });

            if (params.BuildingNumber) queryParams.append('BuildingNumber', params.BuildingNumber);
            if (params.Wing) queryParams.append('Wing', params.Wing);
            if (params.Floor) queryParams.append('Floor', params.Floor);
            if (params.Flat) queryParams.append('Flat', params.Flat);
            if (params.FlatType) queryParams.append('FlatType', params.FlatType);
            if (params.FlatConfiguration) queryParams.append('FlatConfiguration', params.FlatConfiguration);
            if (params.FlatFacing) queryParams.append('FlatFacing', params.FlatFacing);

            return await this.k3hHttpClient.getRequestWithAuthentication(`${InventoryApis.PULL_PAGINATED_FLATS}?${queryParams.toString()}`, { signal });
        } catch (error: any) {

            console.error('ERROR: PULL PAGINATED FLATS:', error);

            if (error === TokenExpiredException) {
                return await this.pullPaginatedFlats(params, signal);
            }
            throw error;
        }
    }

    async addInventory(params: AddInventoryRequest): Promise<AddInventoryResponse> {
        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(InventoryApis.ADD, params);

        } catch (error: any) {

            console.error('ERROR: ADD INVENTORY:', error);

            if (error === TokenExpiredException) {
                return await this.addInventory(params);
            }
            throw error;
        }
    }

    async deleteInventory(params: DeleteInventoryRequest): Promise<InventoryDeleteResponse> {
        try {

            const queryParams = new URLSearchParams({
                ProjectId: (params.ProjectId ?? 0).toString(),
            });

            return await this.k3hHttpClient.deleteRequestWithAuthentication(`${InventoryApis.DELETE}?${queryParams.toString()}`);

        } catch (error: any) {

            console.error('ERROR: DELETE INVENTORY:', error);

            if (error === TokenExpiredException) {
                return await this.deleteInventory(params);
            }
            throw error;
        }
    }

    async updateInventoryWing(params: UpdateInventoryWingRequest): Promise<UpdateInventoryWingResponse> {
        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(InventoryApis.UPDATE_Inventory_WING, params);

        } catch (error: any) {

            console.error('ERROR: UPDATE INVENTORY WING:', error);

            if (error === TokenExpiredException) {

                return await this.updateInventoryWing(params);

            }
            throw error;
        }
    }

    async updateInventoryFloor(params: UpdateInventoryFloorRequest): Promise<UpdateInventoryFloorResponse> {
        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(InventoryApis.UPDATE_Inventory_FLOOR, params);

        } catch (error: any) {

            console.error('ERROR: UPDATE INVENTORY FLOOR:', error);

            if (error === TokenExpiredException) {

                return await this.updateInventoryFloor(params);
            }
            throw error;
        }
    }

    async updateInventoryFlat(params: UpdateInventoryFlatRequest): Promise<UpdateInventoryFlatResponse> {
        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(InventoryApis.UPDATE_Inventory_FLAT, params);

        } catch (error: any) {

            console.error('ERROR: UPDATE INVENTORY FLAT:', error);

            if (error === TokenExpiredException) {

                return await this.updateInventoryFlat(params);

            }
            throw error;
        }
    }

    async deleteInventoryBuilding(params: DeleteInventoryBuildingRequest): Promise<InventoryBuildingDeleteResponse> {
        try {

            const queryParams = new URLSearchParams({
                ProjectId: (params.ProjectId ?? 0).toString(),
                InventoryBuildingId: (params.InventoryBuildingId ?? 0).toString(),
            });

            return await this.k3hHttpClient.deleteRequestWithAuthentication(`${InventoryApis.DELETE_Inventory_BUILDING}?${queryParams.toString()}`);

        } catch (error: any) {

            console.error('ERROR: DELETE INVENTORY BUILDING:', error);

            if (error === TokenExpiredException) {
                return await this.deleteInventoryBuilding(params);
            }
            throw error;
        }
    }

    async deleteInventoryWing(params: DeleteInventoryWingRequest): Promise<InventoryWingDeleteResponse> {
        try {

            const queryParams = new URLSearchParams({
                ProjectId: (params.ProjectId ?? 0).toString(),
                InventoryBuildingId: (params.InventoryBuildingId ?? 0).toString(),
                InventoryFlatFloorBasementPodiumWingId: (params.InventoryFlatFloorBasementPodiumWingId ?? 0).toString(),
            });

            return await this.k3hHttpClient.deleteRequestWithAuthentication(`${InventoryApis.DELETE_Inventory_WING}?${queryParams.toString()}`);

        } catch (error: any) {

            console.error('ERROR: DELETE INVENTORY WING:', error);

            if (error === TokenExpiredException) {
                return await this.deleteInventoryWing(params);
            }
            throw error;
        }
    }

    async deleteInventoryFloor(params: DeleteInventoryFloorRequest): Promise<InventoryFloorDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: (params.ProjectId ?? 0).toString(),
                InventoryBuildingId: (params.InventoryBuildingId ?? 0).toString(),
                InventoryFlatFloorBasementPodiumWingId: (params.InventoryFlatFloorBasementPodiumWingId ?? 0).toString(),
                InventoryFloorId: (params.InventoryFloorId ?? 0).toString(),
            });

            return await this.k3hHttpClient.deleteRequestWithAuthentication(`${InventoryApis.DELETE_Inventory_FLOOR}?${queryParams.toString()}`);

        } catch (error: any) {

            console.error('ERROR: DELETE INVENTORY FLOOR:', error);

            if (error === TokenExpiredException) {
                return await this.deleteInventoryFloor(params);
            }
            throw error;
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
            });

            return await this.k3hHttpClient.deleteRequestWithAuthentication(`${InventoryApis.DELETE_Inventory_FLAT}?${queryParams.toString()}`);

        } catch (error: any) {

            console.error('ERROR: DELETE INVENTORY FLAT:', error);

            if (error === TokenExpiredException) {
                return await this.deleteInventoryFlat(params);
            }
            throw error;
        }
    }

    async addInventoryBuilding(params: AddInventoryBuildingRequest): Promise<AddInventoryBuildingResponse> {
        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(InventoryApis.Add_Inventory_BUILDING, params);

        } catch (error: any) {

            console.error('ERROR: ADD INVENTORY BUILDING:', error);

            if (error === TokenExpiredException) {
                return await this.addInventoryBuilding(params);
            }
            throw error;
        }
    }

    async addInventoryWing(params: AddInventoryWingRequest): Promise<AddInventoryWingResponse> {
        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(InventoryApis.ADD_Inventory_WING, params);

        } catch (error: any) {

            console.error('ERROR: ADD INVENTORY WING:', error);

            if (error === TokenExpiredException) {
                return await this.addInventoryWing(params);
            }
            throw error;
        }
    }

    async addInventoryFloor(params: AddInventoryFloorRequest): Promise<AddInventoryFloorResponse> {
        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(InventoryApis.ADD_Inventory_FLOOR, params);

        } catch (error: any) {

            console.error('ERROR: ADD INVENTORY FLOOR:', error);

            if (error === TokenExpiredException) {
                return await this.addInventoryFloor(params);
            }
            throw error;
        }
    }

    async addInventoryFlat(params: AddInventoryFlatRequest): Promise<AddInventoryFlatResponse> {
        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(InventoryApis.ADD_Inventory_FLAT, params);

        } catch (error: any) {

            console.error('ERROR: ADD INVENTORY FLAT:', error);

            if (error === TokenExpiredException) {
                return await this.addInventoryFlat(params);
            }
            throw error;
        }
    }

    async addUpdateInventoryFloorParkingCount(params: AddUpdateInventoryFloorParkingCountRequest): Promise<AddUpdateInventoryFloorParkingCountResponse> {
        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(InventoryApis.Add_Inventory_FLOOR_PARKING_COUNT, params);

        } catch (error: any) {

            console.error('ERROR: ADD UPDATE INVENTORY FLOOR PARKING COUNT:', error);

            if (error === TokenExpiredException) {
                return await this.addUpdateInventoryFloorParkingCount(params);
            }
            throw error;
        }
    }

    async pullInventoryFloorForPaymentSchedule(params: FilterInventoryRequest, signal?: AbortSignal): Promise<InventoryListReponse> {
        try {

            const queryParams = new URLSearchParams({
                ProjectId: (params.ProjectId ?? 0).toString(),
            });

            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(`${InventoryApis.Add_Inventory_FLOOR_PAYMENT_SCHEDULE}?${queryParams.toString()}`, { signal });

        } catch (error: any) {

            console.error('ERROR: PULL INVENTORY FLOOR FOR PAYMENT SCHEDULE:', error);

            if (error === TokenExpiredException) {

                return await this.pullInventoryFloorForPaymentSchedule(params, signal);
            }
            throw error;
        }
    }

    async pullProjectInventoryStructure(params: FilterWithPaginationProjectInventoryStructureRequest, signal?: AbortSignal): Promise<ProjectInventoryStructureListResponse> {
            try {
                const queryParams = new URLSearchParams({
                    ProjectId: String(params.ProjectId ?? 10),
                });
    
                if (params.InventoryBuildingId) queryParams.append("InventoryBuildingId", params.InventoryBuildingId.toString());
                if (params.Wing) queryParams.append('Wing', params.Wing.toString());
                if (params.FlatConfiguration) queryParams.append('FlatConfiguration', params.FlatConfiguration.toString());
                if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
                if (params.ExportType) queryParams.append("ExportType", params.ExportType);
    
                const response = await this.k3hHttpClient.getRequestWithAuthentication(
                    `${InventoryApis.PULL_INVENTORY_STRUCTURE}?${queryParams.toString()}`, { signal }
                )
                return response
    
            } catch (error: any) {
    
                console.error("ERROR: PULL PROJECT INVENTORY STRUCTURE :", error);
    
                if (error === TokenExpiredException) {
    
                    await this.pullProjectInventoryStructure(params);
                }
                throw error;
            }
        }
}
