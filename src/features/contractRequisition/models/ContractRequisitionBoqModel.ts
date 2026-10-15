import type { ApiResponse } from "@/core/api/ApiResponse";

export interface ContractBoqData {
  BudgetId: number;
  UniqueKey: string;
  ProjectId: number;
  CategoryName: string;
  LevelType: string;
  LevelId1: number;
  Level1Name: string;
  LevelId2: number;
  Level2Name: string;
  LevelId3: number;
  Level3Name: string;
  IsSelected: boolean;
  LevelId4: number;
  Level4Name: string;
  Level4MaterialName: string | null;
  Level4SubMaterialUomCode: string | null;
  Level4SubMaterialUom: string | null;
  Level4LeadTimeInDays: number;
  Level4IsTolerant: boolean | null;
  ContractRequisitionId: number;
  Uom: string;
  InventoryFlatId: string;
  Flat: string;
  OrderBy: number;
  WBSCode: string;
  Quantity: number;
  LabourCost: number;
  MaterialCost: number;
  PMCost: number;
  TotalRate: number;
  BudgetAmount: number;
  Remark: string;
  IsAccessToDelete: boolean;
  CreatedById: number;
  CreatedBy: string;
  CreatedDate: string;
  ModifiedById: number;
  ModifiedBy: string;
  ModifiedDate: string | null;
  IsApproval: boolean;
  ApprovalStatus: string;
}

export interface FilterWithPaginationContractRequisitionBoq {
  PageSize: number;
  PageNumber: number;
  ProjectId: number;
  ContractRequisitionId: number;
  BudgetId?: number | 0;
  LevelType?: string | null;
  SelectedLevelId?: number | null;
  SortBy?: string;
}


export interface AddUpdateContractRequisitionBoqRequest {
  ContractRequisitionBOQId: number;
  UniqueKey: string;
  SelectedBOQId: string | null;
  ContractRequisitionId: number;
}

export type ContractRequisitionBoqListResponse = ApiResponse<ContractBoqData[]>;
export type ContractRequisitionBoqSaveReponse = ApiResponse<ContractBoqData>;
