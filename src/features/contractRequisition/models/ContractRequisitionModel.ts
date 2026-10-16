import type { ApiResponse } from "@/core/api/ApiResponse";

export interface DirectContractDetails {
  ContractLevel1Id: number;
  ContractLevel2Id: number;
  ContractLevel1Name: string;
  ContractLevel2Name: string;
  Remark: string;
}

export interface IndirectContractDetails {
  ContractId: number;
  ContractName: string;
  Remark: string;
}

export interface ContractRequisitionData {
  ContractRequisitionId: number;
  UniqueKey: string;
  SystemGeneratedCode: string;
  ProjectId: number;
  AttachmentsURL: string;
  EnquirySentToContractId?: string;
  ContractMasterId: number;
  ContractName: string;
  ContractType: "direct" | "indirect" | "lock and key";
  Remark: string;
  DirectContractRequisition: DirectContractDetails[];
  InDirectContractRequisition: IndirectContractDetails[];
  EstimatedDate: string;
  FinalContractId: number;
  ContractStatus: string;
  IsLockAndKey: boolean;
  VendorFinalizationApprovalStatus?: string;
  IsVendorFinalizationApproved?: boolean;
  IsWorkOrderAvailable?: boolean;
  CloseCompletionRemark?: string;
  FinalVendor: string;
  CreatedById: number;
  CreatedBy: string;
  CreatedDate: string;
  ModifiedById: number;
  ModifiedBy: string;
  ModifiedDate: string;
}

export interface ContractRequisitionDetailData {
  ContractRequisitionDetailId: number;
  Uniquekey: string;
  ContractMasterId: number;
  ContractCode: string;
  ContractName: string;
  UomMasterId: number;
  UomCode: string;
  Uom: string;
  RequiredDate: string;
  Remark: string | null;
  CreatedById: number;
  CreatedBy: string;
  CreatedDate: Date;
  ModifiedById: number;
  ModifiedBy: string;
  ModifiedDate: null;
}

export interface PullProjectLockAndKeyContractStatusRequest {
  ProjectId: number | 0;
}

export interface FilterWithPaginationContractRequisition {
  PageSize: number;
  PageNumber: number;
  ProjectId: number;
  ContractRequisitionId?: number | 0;
  SystemGeneratedCode?: string | null;
  FromDate?: string | null;
  ToDate?: string | null;
  ContractRequisitionStage?: string | null;
  ContractRequisitionStatus?: string | null;
  SortBy?: string;
  ExportType?: "PDF" | "Excel";
}

export interface AddUpdateContractRequisitionRequest {
  ContractRequisitionId: number;
  UniqueKey: string;
  ProjectId: number;
  AttachmentsURL: string | null;
  Remark: string;
  DirectContractRequisitionDetailJSON?: string;
  IndirectContractRequisitionDetailJSON?: string;
  EstimatedDate: string;
  ContractStatus?: string;
  ContractType: "direct" | "indirect" | "lock and key";
  RemoveAttachmentURL?: string | null;
  IsLockAndKey?: boolean;
}

export interface AddUpdateContractLevelRequest {
  ContractMasterId: number;
  ContractMasterName: string;
  SubLevelId?: string | null;
  LevelRemark: string;
}

export interface DeleteContractRequisitionRequest {
  ContractRequisitionId: number;
  UniqueKey: string | null;
  ProjectId: string;
}

export interface CloseContractRequisitionRequest {
  ContractRequisitionId: number,
  UniqueKey: string | null,
  ProjectId: number | 0,
  Type: string | null,
  CloseCompletionRemark: string | null,
}

export type ContractRequisitionListResponse = ApiResponse<ContractRequisitionData[]>;
export type ContractRequisitionSaveReponse = ApiResponse<ContractRequisitionData>;
export type ContractRequisitionDeleteResponse = ApiResponse<number>;
export type ContractRequisitionLockAndKeyStatusResponse = ApiResponse<[{
  IsLockAndKeyContractCreated: boolean;
  IsLockAndKey: boolean;
}]>;