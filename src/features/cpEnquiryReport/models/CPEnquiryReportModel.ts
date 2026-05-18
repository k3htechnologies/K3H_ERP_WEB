import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationCPEnquiryReportRequest {
  PageSize: number;
  PageNumber: number;
  ProjectId?: number;
  ChannelPartnerName?: string;
  Stage?: string;
  Year?: number;
  FromDate?: string;
  ToDate?: string;
}

export interface ChannelPartnerList {
  ChannelPartnerId?: number;
  Name?: string;
  SystemGeneratedCode?: string;
  ChannelPartnerEnquiryStagesData?: ChannelPartnerEnquiryStagesData[];
  Message?: string;
  TotalRecords?: number;
}

export interface ChannelPartnerEnquiryStagesData {
  ChannelPartnerId?: number;
  Name?: string;
  MonthNumber?: number;
  MonthName?: string;
  Date?: string;
  Stages?: string;
  StagesCount?: number;
}
export type CPEnquiryReportResponse = ApiResponse<ChannelPartnerList[]>;
