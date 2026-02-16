import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationChannelPartnerSourcingRequest {
  PageSize: number;
  PageNumber: number;
  ChannelPartnerSourcingId?: number;
  ChannelPartnerId?: number;
  ProjectId?: number;
  SortBy?: string;
}

export interface ChannelPartnerSourcingData {

  ChannelPartnerSourcingId: number;
  Uniquekey: string;
  ChannelPartnerId: number;
  ProjectId?: number;
  IBM_OBM?: string;
  SourcingRemark: string;
  Support: string;
  SourcingLocation: string;
  CreatedById: number | null;
  CreatedBy: string;
  CreatedDate: string | null;
  ModifiedById: number | null;
  ModifiedBy: string;
  ModifiedDate: string | null;
  Message: string;
  TotalRecords: number;
}

export interface AddUpdateChannelPartnerSourcingRequest {
  ChannelPartnerSourcingId: number;
  Uniquekey: string | null;
  ChannelPartnerId: number;
  ProjectId?: number;
  SourcingRemark: string;
  Support: string;
  IBM_OBM?: string;
}

export interface DeleteChannelPartnerSourcingRequest {
  ChannelPartnerSourcingId: number;
  Uniquekey: string;
}

export type ChannelPartnerSourcingListResponse = ApiResponse<ChannelPartnerSourcingData[]>;
export type ChannelPartnerSourcingSaveResponse = ApiResponse<ChannelPartnerSourcingData[]>;
export type ChannelPartnerSourcingDeleteResponse = ApiResponse<string>;


