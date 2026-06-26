import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationPaymentScheduleCrm {
    ProjectId?: number;
    BookingId?: number;
    Name?:string;
    IsCheckPermission?: boolean;
    ExportType?: 'Excel' | 'PDF';
}

export interface PaymentScheduleModelData {

    BookingPaymentScheduleId: number;
    BookingId: number;
    ProjectId: number;
    Type: string;
    Name: string;
    Date: string;
    PaymentSchedulePercentage: number;
    PaymentScheduleAmount: number;
    PaymentScheduleReceivedAmount: number;
    PaymentScheduleGSTAmount: number;
    PaymentScheduleReceivedGSTAmount: number;
    PaymentScheduleTDSAmount: number;
    PaymentScheduleReceivedTDSAmount: number;

    DemandType: string;
}

export interface FilterWithPaginationPaymentScheduleDemandSummary {
    ProjectId?: number;
    BookingId?: number;
    BookingPaymentScheduleId?: number;
    Name?:string;
    IsCheckPermission?: boolean;
    ExportType?: 'Excel' | 'PDF';
}

export interface PaymentScheduleDemandSummaryModelData {
    PayTrackPaymentScheduleDemandSummaryId: number;
    Uniquekey: string | null
    BookingPaymentScheduleId: number;
    BookingId: number;
    ProjectId: number;
    PaymentScheduleDemandType: string;
    PaymentScheduleDemandSummaryURL: string;
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdatePayTrackPaymentScheduleDemandRequest
{
    BookingPaymentScheduleId : number;
    BookingId : number;
    ProjectId : number;
    PaymentScheduleDemandType : string | null
}

export type PaymentScheduleListResponse = ApiResponse<PaymentScheduleModelData[]>;
export type PaymentScheduleDemandSummaryListResponse = ApiResponse<PaymentScheduleDemandSummaryModelData[]>;
export type PaymentScheduleDemandResponse = ApiResponse<string>;



