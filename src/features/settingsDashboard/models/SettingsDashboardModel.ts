import type { ApiResponse } from "@/core/api/ApiResponse";

export interface SettingsDashboardDataset {
    Table0: any[];
    Table1: any[];
    Table2: any[];
    Table3: any[];
    Table4: any[];
    Table5: any[];
    Table6: any[];
    ProjectId: number;

}

export interface SettingsDashboardRequest {
    ProjectId: number;
}


export type SettingsDashboardDatasetResponse = ApiResponse<SettingsDashboardDataset>;
export type SettingsDashboardRequestResponse = ApiResponse<SettingsDashboardRequest>;

