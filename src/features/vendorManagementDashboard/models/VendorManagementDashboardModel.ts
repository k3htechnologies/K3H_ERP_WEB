import type { ApiResponse } from "@/core/api/ApiResponse"

export interface VendorManagementDataset {
    Table0: Table0[]
    Table1: Table1[]
    Table2: Table2[]
    Table3: Table3[]
    Table4: Table4[]
    Table5: Table5[]
    Table6: Table6[]
    Table7: Table7[]
}

export interface Table0 {
    TotalVendors: number
    VerifiedVendors: number
    PendingVerification: number
    VerifiedPercent: number
    ActiveEngagement: number
}

export interface Table1 {
    Label: string
    Percentage: number
    Total: number
}


export interface Table2 {
    CategoryType: string
    TotalCategories: number
    MultipleVendors: number
    SingleVendor: number
    NoVendor: number
}

export interface Table3 {
    VendorId: number
    VendorName: string
    CompanyName: string
    Activity: string
    RelatedItem: string
    Status: string
    ActivityDate: string
}

export interface Table4 {
    Label: string
    Total: number
    Percentage: number

}

export interface Table5 {
    OnTimeDelivery: number
    QualityAcceptance: number
    AverageResponseTime: number
    RepeatDeliveryDelays: number
    QualityIssuesTrendingUp: number
    VendorsNeedingAttention: number
}

export interface Table6 {
    AlertType: string
    Total: number
    Message: string
    Severity: string
}

export interface Table7 {
}

export type VendorManagementResponse = ApiResponse<VendorManagementDataset>;
export type VendorManagementMilestoneCollectionResponse = ApiResponse<string>;
