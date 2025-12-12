import type { ApiResponse } from "@/core/api/ApiResponse";

export interface InventoryModel {
    InventoryBuildingId:                      number;
    Uniquekey:                                string;
    ProjectId:                                number;
    BuildingNumber:                           string;
    NoOfBasement:                             number;
    NoOfPodium:                               number;
    NoOfWings:                                number;
    CreatedById:                              number;
    CreatedBy:                                string;
    CreatedDate:                              Date;
    ModifiedById:                             number;
    ModifiedBy:                               string;
    ModifiedDate:                             null;
    InventoryFlatFloorBasementPodiumWingData: InventoryFlatFloorBasementPodiumWingDatum[];
}

export interface InventoryFlatFloorBasementPodiumWingDatum {
    InventoryFlatFloorBasementPodiumWingId: number;
    Uniquekey:                              string;
    InventoryBuildingId:                    number;
    MaxNoOfFlatPerFloor:                    number;
    NoOfFloorExcludingPodium:               number;
    Wing:                                   string;
    IsApproval:                             boolean;
    ApprovalStatus:                         string;
    InventoryFloorData:                     InventoryFloorDatum[];
}

export interface InventoryFloorDatum {
    InventoryFloorId:                       number;
    Uniquekey:                              string;
    InventoryBuildingId:                    number;
    InventoryFlatFloorBasementPodiumWingId: number;
    Floor:                                  string;
    SlabHeight:                             number;
    ParkingCount:                           number;
    InventoryFlatData:                      InventoryFlatData[];
}

export interface InventoryFlatData {
    InventoryFlatId:                        number;
    Uniquekey:                              string;
    InventoryBuildingId:                    number;
    BuildingNumber:                         string;
    InventoryFlatFloorBasementPodiumWingId: number;
    Wing:                                   string;
    InventoryFloorId:                       number;
    Floor:                                  string;
    Flat:                                   string;
    RERACarpetAreaSqFt:                     number;
    FlatType:                               string;
    FlatConfiguration:                      string;
    FlatStatus:                             'Sale' | "Available" | "Member" | "Blocked" | "Hold";
    FlatFacing:                             string;
    InventoryFlatSpecificationData:         InventoryFlatSpecificationDatum[];
    OwnerName:                              string;
    BookingId:                              number;
    BookingCreatedById:                     number;
    BookingCreatedBy:                       string;
    BookingCreatedDate:                     Date | null;
}


export interface InventoryFlatSpecificationDatum {
    InventoryFlatSpecificationId:           number;
    Uniquekey:                              string;
    InventoryBuildingId:                    number;
    InventoryFlatFloorBasementPodiumWingId: number;
    InventoryFloorId:                       number;
    InventoryFlatId:                        number;
    FlatLayout:                             string;
    FlatLayoutAreaSqFt:                     number;
    FlatLayoutLengthSqFt:                   number;
    FlatLayoutWidthSqFt:                    number;
    Note:                                   string;
}

export type InventoryApiPullReponse = ApiResponse<InventoryModel[]>
export type UpdateFlatApiResponse = ApiResponse<InventoryFlatData[]>

