import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationFlatHandoverChecklist {
    ProjectId?: number;
    BookingId?: number;
}

export interface FlatHandoverChecklistData {
    ProjectId: number | 0;
    BookingId: number | 0;
    FlatHandOverCheckListId: number | 0;
    UniqueKey: string | null,
    Section: string | null,
    Items: string | null,
    Status: string | null,
    Remark: string | null,
    CreatedById: number | 0;
    CreatedBy: string | null,
    CreatedDate: string | null,
    ModifiedById: number | 0;
    ModifiedBy: string | null,
    ModifiedDate: string | null,
}

export interface AddUpdateFlatHandoverChecklistRequest {
    ProjectId: number | 0;
    BookingId: number | 0;
    FlatHandoverCheckListJSON: string
}

export type FlatHandoverChecklistResponse = ApiResponse<FlatHandoverChecklistData[]>;
export type FlatHandoverChecklistSaveResponse = ApiResponse<FlatHandoverChecklistData[]>