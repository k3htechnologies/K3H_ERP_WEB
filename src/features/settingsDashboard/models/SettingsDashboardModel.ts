import type { ApiResponse } from "@/core/api/ApiResponse";

export interface SettingsDashboardDataset {
    Table0: Table0[];
    Table1: Table1[];
    Table2: Table2[];
    Table3: Table3[];
    Table4: Table4[];
    Table5: Table5[];
    Table6: Table6[];
    Table7: Table7[];
    ProjectId: number;
}

export interface Table0 {
    TotalCompanies: number | null;
    CompaniesAddedThisMonth: number | null;
    TotalEmployees: number | null;
    ActiveProjects: number | null;
    RegisteredVendors: number | null;
    PayrollConfiguredPercent: number | null;
    EmployeesAddedThisMonth: number | null;
    OnHoldProjects: number | null;
    VendorsAddedThisMonth: number | null;
}

export interface Table1 {
    Departments: number | null;
    Designations: number | null;
    Employees: number | null;
    Branches: number | null;
    BanksListed: number | null;
    TNC: number | null;
}

export interface Table2 {
    TotalMaterial: number | null;
    TotalSubMaterial: number | null;
    PendingMaterialSetupCount: number | null;
    UOM: number | null;
}

export interface Table3 {
    TotalVendors: number | null;
    MissingDetails: number | null;
    RecentlyAddedVendors: number | null;
    TotalRequisitions: number | null;
    ContractCount: number | null;
}

export interface Table4 {
    TotalProjects: number | null;
    Redevelopment: number | null;
    RERARegistered: number | null;
}

export interface Table5 {
    CompanyType: string | null;
    VendorCount: number | null;
}

export interface Table6 {
    VendorCount: number | null;
}

export interface Table7 {
    OngoingProjects: number | null;
    OnHoldProjects: number | null;
    CompletedProjects: number | null;
    CancelledProjects: number | null;
    PlanningProjects: number | null;
}

export interface SettingsDashboardRequest {
    ProjectId: number;
}


export type SettingsDashboardDatasetResponse = ApiResponse<SettingsDashboardDataset>;
export type SettingsDashboardRequestResponse = ApiResponse<SettingsDashboardRequest>;

