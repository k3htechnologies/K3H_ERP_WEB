import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { AddUpdateContractRequisitionBoqRequest, ContractRequisitionBoqListResponse, ContractRequisitionBoqSaveReponse, FilterWithPaginationContractRequisitionBoq } from "../models/ContractRequisitionBoqModel";
import { ContractRequisitionBoqApi } from "@/features/contractRequisition/api/ContractRequisitionBoqApi";

export abstract class ContractRequisitionBoqDatasource {
  abstract pullContractRequisitionBoq(
    params: FilterWithPaginationContractRequisitionBoq,
    signal?: AbortSignal,
  ): Promise<ContractRequisitionBoqListResponse>;
  abstract addUpdateContractRequisitionBoq(request: AddUpdateContractRequisitionBoqRequest): Promise<ContractRequisitionBoqSaveReponse>;
}

export class ContractRequisitionBoqDatasourceImpl implements ContractRequisitionBoqDatasource {
  private get k3hHttpClient() {
    return baseClient;
  }

  async pullContractRequisitionBoq(
    params: FilterWithPaginationContractRequisitionBoq,
    signal?: AbortSignal,
  ): Promise<ContractRequisitionBoqListResponse> {
    try {
      const queryParams = new URLSearchParams({
        PageSize: (params.PageSize ?? 10).toString(),
        PageNumber: (params.PageNumber ?? 1).toString(),
        ProjectId: (params.ProjectId ?? 0).toString(),
        ContractRequisitionId: (params.ContractRequisitionId ?? 0).toString(),
      });

      const response = await this.k3hHttpClient.getRequestWithAuthentication(`${ContractRequisitionBoqApi.PULL}?${queryParams.toString()}`, {
        signal,
      });

      return response;
    } catch (error: any) {
      console.error("ERROR: PULL Contract REQUISITION :", error);

      if (error instanceof TokenExpiredException) {
        return await this.pullContractRequisitionBoq(params);
      }

      throw error;
    }
  }

  async addUpdateContractRequisitionBoq(request: AddUpdateContractRequisitionBoqRequest): Promise<ContractRequisitionBoqSaveReponse> {
    try {
      const response = await this.k3hHttpClient.postRequestWithAuthentication(ContractRequisitionBoqApi.ADD_UPDATE, request);

      return response;
    } catch (error) {
      console.error("ERROR: ADD UPDATE Contract REQUISITION :", error);

      if (error instanceof TokenExpiredException) {
        return await this.addUpdateContractRequisitionBoq(request);
      }

      throw error;
    }
  }
}
