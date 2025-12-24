import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationEventRequest {
    EventId: number
    Title?: string
    FromDate?: string
    ToDate?: string
    Type?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface EventData {
    EventId: number;
    Uniquekey?: string;

    Type?: string;
    Title?: string;

    ProjectName?: string;
    ProjectId?: string;

    DepartmentName?: string;
    DepartmentId?: string;

    FullName?: string;
    EmployeeId?: string;

    Date?: string;
    DeadlineDate?: string;

    StartTime?: string;
    EndTime?: string;

    EmployeeFullName?: string;
    Room?: string;
    Priority?: string;

    DocumentURL?: string;
    Description?: string;
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

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

export interface DeleteEventRequest {
    EventId: number
    UniqueKey: string
}

export type EventListResponse = ApiResponse<EventData[]>;
export type EventSaveResponse = ApiResponse<EventData[]>;
export type EventDeleteResponse = ApiResponse<number>;
