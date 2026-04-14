import type { ApiResponse } from "@/core/api/ApiResponse";

export interface InventoryDashboardDataset {
  Table0: Table0[];
  Table1: Table1[];
  Table2: Table2[];
  Table3: Table3[];
  Table4: Table4[];
}

export interface Table0 {
  AllotedFlats: number | 0
  AvailableFlats: number | 0
  BlockedFlats: number | 0
  BookedFlats: number | 0
  HoldFlats: number | 0
  ProjectName: string | null
  TotalBasement: number | 0
  TotalBuilding: number | 0
  TotalFlats: number | 0
  TotalFlats1: number | 0
  TotalFloors: number | 0
  TotalPodium: number | 0
  TotalWings: number | 0
}

export interface Table1 {
  FloorName: string | null
  AvailableParking: number | 0
  BookedParking: number | 0
  TotalParking: number | 0
}

export interface Table2 {
  Basement: number | 0
  Building: string | null
  Floors: number | 0
  Parking: number | 0
  Podiums: number | 0
  Units: number | 0
  Wings: number | 0
}

export interface Table3 {
  BuildingName: string | null
  Issue: string | null
}

export interface Table4 {
  Building: string | null
  Wing: string | null
  Floors: number | 0
  Units: number | 0
  AllotedFlats: number | 0
  AvailableFlats: number | 0
  BookedFlats: number | 0
  HoldFlats: number | 0
  BlockedFlats: number | 0
  TotalParking: number | 0
  AvailableParking: number | 0
  BookedParking: number | 0
  HoldParking: number | 0
  BlockedParking: number | 0
}

export interface Table4 {
  Building: string | null
  Wing: string | null
  Floors: number | 0
  Units: number | 0
  AllotedFlats: number | 0
  AvailableFlats: number | 0
  BookedFlats: number | 0
  HoldFlats: number | 0
  BlockedFlats: number | 0
  TotalParking: number | 0
  AvailableParking: number | 0
  BookedParking: number | 0
  HoldParking: number | 0
  BlockedParking: number | 0
}

export type InventoryDashboardDatasetResponse = ApiResponse<InventoryDashboardDataset>;
