import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationTicket {
    PageSize: number
    PageNumber: number
    TicketId: number | 0;
    SystemGeneratedCode?: string | null;
    Platform?: string | null;
    Module?: string | null;
    Priority?: string | null;
    DepartmentName?: string | null;
    TicketStatus?: string | null;
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface FilterWithPaginationPullActiveTicket {
    PageSize: number
    PageNumber: number
    EmployeeId: number | 0
    EmployeeName?: string | null
    SortBy?: string

}

export interface TicketData {
    TicketId: number | 0;
    Uniquekey: string | null;
    SystemGeneratedCode: string | null;
    Platform: string | null;
    Module: string | null;
    AttachmentURL: string | null;
    Priority: string | null;
    TicketStatus: string | null;
    TicketDescription: string | null;
    TicketRemark: string | null;
    EmployeeId: number | null;
    EmployeeName: string | null;
    CollaboratorsEmployeeId: string | null;
    CollaboratorsName: string | null;
    AssignedStatus: string | null;
    AssignedBy: string | null;
    AssignedRemark: string | null;
    ResolvedTillDate: string | null;
    DepartmentName: string | null;
    AssignTicketHistory: AssignTicketHistoryData[] | null;
    CreatedById: number | 0;
    CreatedBy: string | '';
    CreatedDate: string | null;
    ModifiedById: number | 0;
    ModifiedBy: string | '';
    ModifiedDate: string | null
}

export interface PullActiveTicketData {
    EmployeeId: number | 0;
    EmployeeName: string | null;
    ActiveTickets: number | 0;
}

export interface AssignTicketHistoryData {
    AssignedStatus: string | null;
    AssignedRemark: string | null;
    CreatedDate: string | null;
}

export interface AddUpdateTicketRequest {
    TicketId: number | 0;
    Uniquekey: string | '';
    SystemGeneratedCode?: string | null;
    Platform: string | '';
    Module: string | '';
    AttachmentURL: File[] | null;
    Priority: string | '';
    TicketStatus: string | '';
    TicketDescription: string | '';
    TicketRemark: string | null;
    RemoveAttachmentURL: string | ''
}

export interface AddUpdateAssignedTicketsRequest {
    TicketId: number | 0;
    AssignToEmployeeId: number | 0;
    CollaboratorsEmployeeId?: string | '';
    AssignedStatus: string | '';
    TicketRemark: string | null;
    ResolvedTillDate: string | null;
}

export interface DeleteTicketModelRequest {
    TicketId: number;
    Uniquekey: string,
}

export type TicketListResponse = ApiResponse<TicketData[]>;
export type TicketPullActiveTicketListResponse = ApiResponse<PullActiveTicketData[]>;
export type TicketSaveResponse = ApiResponse<TicketData[]>;
export type TicketAssignSaveResponse = ApiResponse<TicketData[]>;
export type TicketDeleteResponse = ApiResponse<number>;
