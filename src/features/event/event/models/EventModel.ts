import type { ApiResponse } from "@/core/api/ApiResponse";

export interface AddUpdateEventRequest {
    EventId?: number;
    Uniquekey?: string;
    Type?: string;
    Title?: string;
    ProjectId?: string;
    DepartmentId?: string;
    EmployeeId?: string;
    Date?: string;
    DeadlineDate?: string;
    StartTime?: string;
    EndTime?: string;
    Room?: string;
    Priority?: string;
    Description?: string;
    DocumentURL?: (File | string)[] | null;
    RemoveDocumentURL?: string;
}

export interface EventData {
    EventId: number;
    Uniquekey?: string;
    Type?: string;
    Title?: string;
    ProjectId?: string;
    DepartmentId?: string;
    DepartmentName?: string;
    EmployeeId?: string;
    Date?: string;
    DeadlineDate?: string;
    StartTime?: string;
    EndTime?: string;
    Room?: string;
    Priority?: string;
    Description?: string;
    ProjectName?: string;
    FullName?: string;
    DocumentURL?: string | null;
    CreatedById?: number;
    CreatedBy?: string;
    CreatedDate?: string | null;
    ModifiedById?: number;
    ModifiedBy?: string;
    ModifiedDate?: string | null;
    LastModifiedBy?: string;
    LastModifiedDate?: string | null;
}

export interface FilterWithPaginationEventRequest {
    EventId: number;
    Title?: string;
    FromDate?: string;
    ToDate?: string;
    Type?: string;
    SortBy?: string;
    ExportType?: 'Excel' | 'PDF';
}

export interface DeleteEventRequest {
    EventId: number;
    UniqueKey: string;
}

export type EventListResponse = ApiResponse<EventData[]>;
export type EventSaveResponse = ApiResponse<EventData[]>;
export type EventDeleteResponse = ApiResponse<number>;