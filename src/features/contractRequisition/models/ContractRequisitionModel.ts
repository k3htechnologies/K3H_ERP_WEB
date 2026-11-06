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

export interface IndirectContractData {
  SpecificationMasterId: number;
  UniqueKey: string;
  CategoryName: string;
  LevelType: string;
  CreatedById: number;
  CreatedBy: string;
  CreatedDate: string;
  ModifiedById: number;
  ModifiedBy: string;
  ModifiedDate: string | null;
}

export interface BudgetWithQuantityData {
  BudgetId: number | 0
  UniqueKey: string | null
  ProjectId: number | 0
  InventoryFlatFloorBasementPodiumWingId: number | 0;
  Wing: string | null
  CategoryName: string | null
  UomMasterId: number | 0
  Uom: string | null
  LevelType: string | null
  LevelId1: number | 0
  Level1Name: string | null
  LevelId2: number | 0
  Level2Name: string | null
  LevelId3: number | 0
  Level3Name: string | null
  LevelId4: number | 0
  Level4Name: string | null

  Level4MaterialName: string | null;
  Level4SubMaterialUomCode: string | null;
  Level4SubMaterialUom: string | null;
  Level4LeadTimeInDays: number | 0,
  Level4IsTolerant?: boolean,

  Floor: string | null
  InventoryFlatId: string | null
  Flat: string | null
  OrderBy: number | 0
  WBSCode: string | null
  Quantity: number | 0
  ReceivedQuantity: number | 0
  OrderQuantity: number | 0
  L3Quantity: number | 0
  LabourCost: number | 0
  MaterialCost: number | 0
  PMCost: number | 0
  TotalRate: number | 0
  BudgetAmount: number | 0
  Remark: string | null
  IsAccessToDelete: boolean
  IsSubmitBudgetForApproval: boolean
  IsApproval: boolean
  ApprovalStatus: string
  CreatedById: number | 0
  CreatedBy: string | ''
  CreatedDate: string | null
  ModifiedById: number | 0
  ModifiedBy: string | ''
  ModifiedDate: string | null
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
  ContractRequisitionStage: string;
  ContractStatus: string;
  IsLockAndKey: boolean;
  VendorFinalizationApprovalStatus?: string;
  IsVendorFinalizationApproved?: boolean;
  IsWorkOrderAvailable?: boolean;
  WorkOrderCreatedDate?: string;
  ContractRequisitionWorkOrderURL: String;
  CloseCompletionRemark?: string;
  FinalVendor: string;
  FinalVendorCompanyName: string;
  WorkOrderAmount: number;
  InvoiceAmount: number;
  TotalPaidAmount: number;
  CompanyName: string;
  CompanyGSTNumber: string;
  IsBOQCreated: boolean;
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

export interface ContractRequisitionOverview {
  ContractRequisitionId: number;
  UniqueKey: string;
  SystemGeneratedCode: string;
  ProjectId: number;
  ContractName: string;
  ContractType: string;
  ContractRemark: string;
  CloseCompletionRemark: string;
  EstimatedDate: string;
  AttachmentsURL: string;
  ContractRequisitionStage: string;
  ContractRequisitionStatus: string;
  IsLockAndKey: boolean;
  FinalizedVendor: string;
  VendorCode: string;
  FinalizedAmount: number;
  ProjectName: string;
  ProjectLocation: string;
  TotalFinalizedAmount: number;
  TotalInvoiceAmount: number;
  OutstandingAmount: number;
  InvoicePaidAmount: number;
  TotalInvoiceCount: number;
  LastInvoiceNumber: string;
  LastInvoiceDate: string | null;
  LastInvoiceAmount: number;
  LastInvoiceDocumentURL: string;
  LastInvoiceApprovalStatus: string;
  ClientRegistrationId: number;
  CompanyName: string;
  CompanyGSTNumber: string;
  CompanyPANNumber: string;
  ContractRequisitionWorkOrderURL: string;
  WorkOrderCreatedDate: string | null;
  FinalVendorCompanyName: string;
  FinalVendorMobileNumber: string;
  FinalVendorEmailId: string;
  FinalVendorGSTNumber: string;
  FinalVendorPANNumber: string;
  IsCopy: boolean;
  IsRequisitionAction: boolean;
  VendorFinalizationApprovalStatus: string;
  InvoiceApprovalStatus: string;
  CreatedById: number;
  CreatedBy: string;
  CreatedDate: string;
  ModifiedById: number;
  ModifiedBy: string;
  ModifiedDate: string;
}

export interface PullProjectLockAndKeyContractStatusRequest {
  ProjectId: number | 0;
}

export interface FilterWithPaginationIndirectContract {
  PageSize: number;
  PageNumber: number;
  ProjectId?: number;
  InventoryFlatFloorBasementPodiumWingId?: number;
  SortBy?: string
}

export interface FilterWithPaginationBudgetWithQuantityRequest {
  PageSize: number;
  PageNumber: number;
  ProjectId?: number;
  InventoryFlatFloorBasementPodiumWingId?: number;
  BudgetId?: number
  LevelType?: string;
  CategoryName?: string;
  Uom?: string;
  Flat?: string;
  ApprovalStatus?: string;
  SortBy?: string
  ExportType?: "PDF" | "Excel"
}

export interface FilterWithPaginationContractRequisition {
  PageSize: number;
  PageNumber: number;
  ProjectId: number;
  ContractRequisitionId?: number | 0;
  SystemGeneratedCode?: string | null;
  FromDate?: string | null;
  ToDate?: string | null;
  ContractType?: string | null;
  FinalVendor?: string | null;
  FinalVendorCompanyName?: string | null;
  ContractRequisitionStage?: string | null;
  ContractRequisitionStatus?: string | null;
  SortBy?: string;
  ExportType?: "PDF" | "Excel";
}

export interface PullContractOverviewRequest {
  ProjectId: number;
  ContractRequisitionId?: number | 0;
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

export type IndirectContractListResponse = ApiResponse<IndirectContractData[]>;
export type BudgetWithQuantityListResponse = ApiResponse<BudgetWithQuantityData[]>;
export type ContractRequisitionListResponse = ApiResponse<ContractRequisitionData[]>;
export type ContractRequisitionSaveReponse = ApiResponse<ContractRequisitionData>;
export type ContractRequisitionOverviewResponse = ApiResponse<ContractRequisitionOverview[]>
export type ContractRequisitionDeleteResponse = ApiResponse<number>;
export type ContractRequisitionLockAndKeyStatusResponse = ApiResponse<[{
  IsLockAndKeyContractCreated: boolean;
  IsLockAndKey: boolean;
}]>;