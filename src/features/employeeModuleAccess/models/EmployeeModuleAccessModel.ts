import type { ApiResponse } from "@/core/api/ApiResponse"
import type { ModuleData } from "@/features/menu/models/MenuModel";

export interface PullEmployeeModuleAccessRequest {
    DesignationMasterId: number | 0
}

export interface AddUpdateEmployeeModuleAccessRequest {
    DesignationMasterId?: number
    ModulesPermissionsJsonList?: string
}
export type EmployeeModuleAccessListResponse = ApiResponse<ModuleData[]>;
export type EmployeeModuleAccessSaveResponse = ApiResponse<ModuleData[]>;