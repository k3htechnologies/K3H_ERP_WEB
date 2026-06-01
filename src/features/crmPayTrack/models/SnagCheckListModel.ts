import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationSnagChecklistRequset {
    ProjectId?: number;
    BookingId?: number;
    CategoryName?: string
}

export interface SnagChecklistData {
    ProjectId: number | 0,
    BookingId: number | 0,
    SnagCheckListId: number | 0,
    UniqueKey: string | null,
    CategoryName: string | null,
    SubCategoryName: string | null,
    Title: string | null,
    Tags: string | null,
    CheckFor: string | null,
    IsCheck: boolean,
    CreatedById: number | 0,
    CreatedBy: string | null,
    CreatedDate: string | null,
    ModifiedById: number | 0,
    ModifiedBy: string | null,
    ModifiedDate: string | null,
}

export interface AddUpdateSnagChecklistRequest {
    ProjectId: number | 0,
    BookingId: number | 0,
    SnagCheckListJSON: string
}

export type SnagChecklistResponse = ApiResponse<SnagChecklistData[]>
export type SnagChecklistSaveResponse = ApiResponse<SnagChecklistData[]>

