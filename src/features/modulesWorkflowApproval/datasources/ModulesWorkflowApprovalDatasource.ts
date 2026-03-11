import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {
  AddUpdateModulesWorkflowApprovalRequest,
  DeleteModulesWorkflowApprovalRequest,
  FilterModulesWorkflowApprovalRequest,
  ModulesApprovalStatusListResponse,
  ModulesApprovalStatusRequest,
  ModulesWorkflowApprovalDeleteResponse,
  ModulesWorkflowApprovalListResponse,
  ModulesWorkflowApprovalSummaryListResponse,
  ModulesWorkflowApprovalSummaryRequest,
  UpdateModulesWorkflowApprovalRequest,
  UpdateModulesWorkflowApprovalResponse,
} from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import { ModulesWorkflowApprovalApi } from "@/features/modulesWorkflowApproval/api/ModulesWorkflowApprovalApi";

export abstract class ModulesWorkflowApprovalDatasource {
  abstract pullModulesWorkflowApproval(
    params: FilterModulesWorkflowApprovalRequest,
    signal?: AbortSignal,
  ): Promise<ModulesWorkflowApprovalListResponse>;
  
  abstract addUpdateModulesWorkflowApproval(data: AddUpdateModulesWorkflowApprovalRequest): Promise<ModulesWorkflowApprovalListResponse>;

  abstract deleteModulesWorkflowApproval(params: DeleteModulesWorkflowApprovalRequest): Promise<ModulesWorkflowApprovalDeleteResponse>;

  abstract updateModulesWorkflowApproval(data: UpdateModulesWorkflowApprovalRequest): Promise<UpdateModulesWorkflowApprovalResponse>;

  abstract pullModuleApprovalStatus(
    params: ModulesApprovalStatusRequest,
    signal?: AbortSignal,
  ): Promise<ModulesApprovalStatusListResponse>;
  
  abstract pullModulesWorkflowApprovalSummary(
    params: ModulesWorkflowApprovalSummaryRequest,
    signal?: AbortSignal,
  ): Promise<ModulesWorkflowApprovalSummaryListResponse>;
}

export class ModulesWorkflowApprovalDatasourceImpl implements ModulesWorkflowApprovalDatasource {
  private get k3hHttpClient() {
    return baseClient;
  }

  async pullModulesWorkflowApproval(
    params: FilterModulesWorkflowApprovalRequest,
    signal?: AbortSignal,
  ): Promise<ModulesWorkflowApprovalListResponse> {
    try {
      const queryParams = new URLSearchParams({
        EmployeeId: String(params.EmployeeId ?? 0),
        ProjectId: String(params.ProjectId ?? 0),
      });

      if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
      if (params.ExportType) queryParams.append("ExportType", params.ExportType);

      const response = await this.k3hHttpClient.getRequestWithAuthentication(
        `${ModulesWorkflowApprovalApi.PULL}?${queryParams.toString()}`,
        { signal },
      );
      return response;
    } catch (error: any) {
      console.error("ERROR: PULL MODULES WORKFLOW APPROVAL :", error);

      if (error === TokenExpiredException) {
        await this.pullModulesWorkflowApproval(params);
      }
      throw error;
    }
  }

  async addUpdateModulesWorkflowApproval(params: AddUpdateModulesWorkflowApprovalRequest): Promise<ModulesWorkflowApprovalListResponse> {
    try {
      const response = await this.k3hHttpClient.postRequestWithAuthentication(ModulesWorkflowApprovalApi.ADD_UPDATE, params);

      return response;
    } catch (error) {
      console.error("ERROR: ADD MODULES WORKFLOW APPROVAL:", error);

      if (error === TokenExpiredException) {
        await this.addUpdateModulesWorkflowApproval(params);
      }
      throw error;
    }
  }

  async deleteModulesWorkflowApproval(params: DeleteModulesWorkflowApprovalRequest): Promise<ModulesWorkflowApprovalDeleteResponse> {
    try {
      const queryParams = new URLSearchParams({
        EmployeeId: (params.EmployeeId ?? 0).toString(),
        ProjectId: (params.ProjectId ?? 0).toString(),
        ModulesMasterId: (params.ModulesMasterId ?? 0).toString(),
        SubModulesMasterId: (params.SubModulesMasterId ?? 0).toString(),
        SubSubModulesMasterId: (params.SubSubModulesMasterId ?? 0).toString(),
      });

      const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
        `${ModulesWorkflowApprovalApi.DELETE}?${queryParams.toString()}`,
      );

      return response;
    } catch (error) {
      if (error === TokenExpiredException) {
        console.error("ERROR: DELETE MODULES WORKFLOW APPROVAL:", error);

        await this.deleteModulesWorkflowApproval(params);
      }
      throw error;
    }
  }

  async updateModulesWorkflowApproval(params: UpdateModulesWorkflowApprovalRequest): Promise<UpdateModulesWorkflowApprovalResponse> {
    try {
      const response = await this.k3hHttpClient.postRequestWithAuthentication(ModulesWorkflowApprovalApi.UPDATE_MODULES_WORKFLOW, params);

      return response;
    } catch (error) {
      if (error === TokenExpiredException) {
        console.error("ERROR: UPDATE MODULES WORKFLOW APPROVAL:", error);

        await this.updateModulesWorkflowApproval(params);
      }
      throw error;
    }
  }

  async pullModuleApprovalStatus(
    params: ModulesApprovalStatusRequest,
    signal?: AbortSignal,
  ): Promise<ModulesApprovalStatusListResponse> {

    try {
      const queryParams = new URLSearchParams({
        Id: String(params.Id ?? 0),
        SubId: String(params.SubId ?? 0),
        SubSubId: String(params.SubSubId ?? 0),
        SubSubSubId: String(params.SubSubSubId ?? 0),
        ProjectId: String(params.ProjectId ?? 0),
      });

      if (params.ModuleName?.trim()) queryParams.append("ModuleName", params.ModuleName.trim());

      const response = await this.k3hHttpClient.getRequestWithAuthentication(
        `${ModulesWorkflowApprovalApi.PULL_MODULE_APPROVAL_STATUS}?${queryParams.toString()}`,
        { signal },
      );
      return response;
    } catch (error: any) {
      console.error("ERROR: PULL MODULES APPROVAL STATUS :", error);

      if (error === TokenExpiredException) {
        await this.pullModuleApprovalStatus(params);
      }
      throw error;
    }
  }

  async pullModulesWorkflowApprovalSummary(params: ModulesWorkflowApprovalSummaryRequest, signal?: AbortSignal): Promise<ModulesWorkflowApprovalSummaryListResponse> {
    try {
      const queryParams = new URLSearchParams({
         Id: String(params.Id ?? 0),
      });

      if (params.ModuleName?.trim()) queryParams.append("ModuleName", params.ModuleName.trim());

      const response = await this.k3hHttpClient.getRequestWithAuthentication(
        `${ModulesWorkflowApprovalApi.PULL_SUMMARY}?${queryParams.toString()}`,
        { signal },
      );
      return response;
    } catch (error: any) {
      console.error("ERROR: PULL MODULES WORKFLOW APPROVAL :", error);

      if (error === TokenExpiredException) {
        await this.pullModulesWorkflowApprovalSummary(params);
      }
      throw error;
    }
  }
}
