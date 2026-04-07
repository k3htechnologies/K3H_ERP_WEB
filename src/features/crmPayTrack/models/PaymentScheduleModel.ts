import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationPaymentSchedule {
    ProjectId?: number;
    BookingId?: number;
    IsCheckPermission?: boolean;
    ExportType?: 'Excel' | 'PDF';
}

export interface PaymentScheduleModelData {
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
}

export type PaymentScheduleListResponse = ApiResponse<PaymentScheduleModelData[]>;



