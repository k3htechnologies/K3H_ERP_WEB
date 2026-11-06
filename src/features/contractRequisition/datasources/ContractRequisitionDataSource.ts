import baseClient from "@/core/config/baseClient";
import type {
  BudgetWithQuantityListResponse,
  CloseContractRequisitionRequest,
  ContractRequisitionDeleteResponse, ContractRequisitionListResponse, ContractRequisitionLockAndKeyStatusResponse, ContractRequisitionOverviewResponse, ContractRequisitionSaveReponse, DeleteContractRequisitionRequest, FilterWithPaginationBudgetWithQuantityRequest, FilterWithPaginationContractRequisition, FilterWithPaginationIndirectContract, IndirectContractListResponse, PullContractOverviewRequest, PullProjectLockAndKeyContractStatusRequest,
} from "@/features/contractRequisition/models/ContractRequisitionModel";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { ContractRequisitionApi } from "@/features/contractRequisition/api/ContractRequisitionApi";

export abstract class ContractRequisitionDatasource {
  abstract pullContractRequisition(params: FilterWithPaginationContractRequisition, signal?: AbortSignal): Promise<ContractRequisitionListResponse>;
  abstract pullIndirectContractRequisition(params: FilterWithPaginationIndirectContract): Promise<IndirectContractListResponse>;
  abstract pullContractRequisitionOverview(params: PullContractOverviewRequest, signal?: AbortSignal): Promise<ContractRequisitionOverviewResponse>;
  abstract addUpdateContractRequisition(data: FormData): Promise<ContractRequisitionSaveReponse>;
  abstract deleteContractRequisition(params: DeleteContractRequisitionRequest): Promise<ContractRequisitionDeleteResponse>;
  abstract closeContractRequisition(payload: CloseContractRequisitionRequest): Promise<ContractRequisitionDeleteResponse>;
  abstract pullBudgetWithQuantity(params: FilterWithPaginationBudgetWithQuantityRequest, signal?: AbortSignal): Promise<BudgetWithQuantityListResponse>;
}

export class ContractRequisitionDatasourceImpl implements ContractRequisitionDatasource {
  private get k3hHttpClient() {
    return baseClient;
  }

  async pullContractRequisition(
    params: FilterWithPaginationContractRequisition,
    signal?: AbortSignal,
  ): Promise<ContractRequisitionListResponse> {
    try {
      const queryParams = new URLSearchParams({
        PageSize: (params.PageSize ?? 10).toString(),
        PageNumber: (params.PageNumber ?? 1).toString(),
        ProjectId: (params.ProjectId ?? 0).toString(),
      });
      if (params.ContractRequisitionId) queryParams.append("ContractRequisitionId", params.ContractRequisitionId.toString());
      if (params.SystemGeneratedCode?.trim()) queryParams.append("SystemGeneratedCode", params.SystemGeneratedCode.trim());
      if (params.FromDate) queryParams.append("FromDate", params.FromDate);
      if (params.ToDate) queryParams.append("ToDate", params.ToDate);
      if (params.ContractType?.trim()) queryParams.append("ContractType", params.ContractType.trim());
      if (params.ContractRequisitionStage?.trim()) queryParams.append("ContractRequisitionStage", params.ContractRequisitionStage.trim());
      if (params.ContractRequisitionStatus?.trim()) queryParams.append("ContractRequisitionStatus", params.ContractRequisitionStatus.trim());
      if (params.FinalVendor?.trim()) queryParams.append("FinalVendor", params.FinalVendor.trim());
      if (params.FinalVendorCompanyName?.trim()) queryParams.append("FinalVendorCompanyName", params.FinalVendorCompanyName.trim());
      if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
      if (params.ExportType) queryParams.append("ExportType", params.ExportType);

      const response = await this.k3hHttpClient.getRequestWithAuthentication(`${ContractRequisitionApi.PULL}?${queryParams.toString()}`, {
        signal,
      });

      return response;
    } catch (error: any) {
      console.error("ERROR: PULL CONTRACT REQUISITION :", error);

      if (error instanceof TokenExpiredException) {
        return await this.pullContractRequisition(params);
      }

      throw error;
    }
  }

  async pullIndirectContractRequisition(
    params: FilterWithPaginationIndirectContract,
    signal?: AbortSignal,
  ): Promise<IndirectContractListResponse> {
    try {
      const queryParams = new URLSearchParams({
        PageSize: (params.PageSize ?? 10).toString(),
        PageNumber: (params.PageNumber ?? 1).toString(),
        ProjectId: (params.ProjectId ?? 0).toString(),
      });

      const response = await this.k3hHttpClient.getRequestWithAuthentication(`${ContractRequisitionApi.PULL_INDIRECT_CONTRACT}?${queryParams.toString()}`, {
        signal,
      });

      return response;
    } catch (error: any) {
      console.error("ERROR: PULL INDIRECT CONTRACT REQUISITION:", error);

      if (error instanceof TokenExpiredException) {
        return await this.pullIndirectContractRequisition(params);
      }

      throw error;
    }
  }

  async pullContractRequisitionOverview(
    params: PullContractOverviewRequest,
    signal?: AbortSignal,
  ): Promise<ContractRequisitionOverviewResponse> {
    try {
      const queryParams = new URLSearchParams({
        ProjectId: (params.ProjectId ?? 0).toString(),
      });

      if (params.ContractRequisitionId) queryParams.append("ContractRequisitionId", params.ContractRequisitionId.toString());

      const response = await this.k3hHttpClient.getRequestWithAuthentication(`${ContractRequisitionApi.PULL_OVERVIEW}?${queryParams.toString()}`, {
        signal,
      });

      return response;
    } catch (error: any) {
      console.error("ERROR: PULL Contract REQUISITION OVERVIEW:", error);

      if (error instanceof TokenExpiredException) {
        return await this.pullContractRequisitionOverview(params);
      }

      throw error;
    }
  }

  async addUpdateContractRequisition(formData: FormData): Promise<ContractRequisitionSaveReponse> {
    try {
      const response = await this.k3hHttpClient.multipartRequestWithAuthentication(ContractRequisitionApi.ADD_UPDATE, formData);

      return response;
    } catch (error) {
      console.error("ERROR: ADD UPDATE Contract REQUISITION :", error);

      if (error instanceof TokenExpiredException) {
        return await this.addUpdateContractRequisition(formData);
      }

      throw error;
    }
  }

  async deleteContractRequisition(params: DeleteContractRequisitionRequest): Promise<ContractRequisitionDeleteResponse> {
    try {
      const queryParams = new URLSearchParams({
        ContractRequisitionId: (params.ContractRequisitionId ?? 0).toString(),
        Uniquekey: params.UniqueKey ?? "",
        ProjectId: params.ProjectId ?? ""
      });

      const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
        `${ContractRequisitionApi.DELETE}?${queryParams.toString()}`,
      );

      return response;
    } catch (error) {
      console.error("ERROR: DELETE Contract REQUISITION :", error);

      if (error instanceof TokenExpiredException) {
        return await this.deleteContractRequisition(params);
      }

      throw error;
    }
  }

  async closeContractRequisition(payload: CloseContractRequisitionRequest): Promise<ContractRequisitionDeleteResponse> {
    try {
      const response = await this.k3hHttpClient.postRequestWithAuthentication(
        `${ContractRequisitionApi.CLOSE_REQUISITION}`,
        payload,
      );

      return response;
    } catch (error) {
      console.error("ERROR: CLOSE Contract REQUISITION :", error);

      if (error instanceof TokenExpiredException) {
        return await this.closeContractRequisition(payload);
      }

      throw error;
    }
  }
  async pullProjectLockAndKeyContractStatus(
    params: PullProjectLockAndKeyContractStatusRequest,
    signal?: AbortSignal,
  ): Promise<ContractRequisitionLockAndKeyStatusResponse> {
    try {
      const queryParams = new URLSearchParams({
        ProjectId: (params.ProjectId ?? 0).toString(),
      });

      const response = await this.k3hHttpClient.getRequestWithAuthentication(`${ContractRequisitionApi.PULL_LOCK_AND_KEY_STATUS}?${queryParams.toString()}`, {
        signal,
      });

      return response;
    } catch (error: any) {
      console.error("ERROR: PULL Contract REQUISITION LOCK AND KEY STATUS :", error);

      if (error instanceof TokenExpiredException) {
        return await this.pullProjectLockAndKeyContractStatus(params);
      }

      throw error;
    }
  }

  async pullBudgetWithQuantity(
    params: FilterWithPaginationBudgetWithQuantityRequest,
    signal?: AbortSignal,
  ): Promise<BudgetWithQuantityListResponse> {
    try {
      const queryParams = new URLSearchParams({
        PageSize: (params.PageSize ?? 20).toString(),
        PageNumber: (params.PageNumber ?? 1).toString(),
      });

      if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
      if (params.InventoryFlatFloorBasementPodiumWingId) queryParams.append("InventoryFlatFloorBasementPodiumWingId", params.InventoryFlatFloorBasementPodiumWingId.toString());
      if (params.BudgetId) queryParams.append("BudgetId", params.BudgetId.toString());
      if (params.CategoryName) queryParams.append("CategoryName", params.CategoryName.trim());
      if (params.LevelType) queryParams.append("LevelType", params.LevelType.trim());
      if (params.Uom) queryParams.append("Uom", params.Uom.trim());
      if (params.Flat) queryParams.append("Flat", params.Flat.trim());
      if (params.ApprovalStatus) queryParams.append("ApprovalStatus", params.ApprovalStatus.trim());
      if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
      if (params.ExportType) queryParams.append("ExportType", params.ExportType);

      const response = await this.k3hHttpClient.getRequestWithAuthentication(`${ContractRequisitionApi.PULL_BUDGET_WITH_QUANTITY}?${queryParams.toString()}`, {
        signal,
      });

      return response;
    } catch (error: any) {
      console.error("ERROR: PULL BUDGET WITH QUANTITY:", error);

      if (error instanceof TokenExpiredException) {
        return await this.pullBudgetWithQuantity(params);
      }

      throw error;
    }
  }
}
