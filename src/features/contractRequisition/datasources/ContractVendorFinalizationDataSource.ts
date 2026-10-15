import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { VendorListResponse } from "@/features/vendor/models/VendorModel";
import type {
  AddVendorForContractRequisitionEnquiryRequest, FilterWithPaginationVendorForEnquiryRequest, FilterWithPaginationVendorForSelectedEnquiryRequest, RevokeFinalizationContractVendorRequest, SelectedVendorListResponse,
} from "@/features/contractRequisition/models/ContractVendorFinalizeModel";
import { ContractRequisitionVendorFinalizationApi } from "@/features/contractRequisition/api/ContractRequisitionVendorFinalizationApi";

export abstract class ContractVendorFinalizationDatasource {
  abstract pullVendorsForEnquiry(params: FilterWithPaginationVendorForEnquiryRequest, signal?: AbortSignal): Promise<VendorListResponse>;
  abstract addVendorForEnquiry(payload: AddVendorForContractRequisitionEnquiryRequest): Promise<VendorListResponse>;
  abstract pullSelectedVendorForEnquiry(
    params: FilterWithPaginationVendorForSelectedEnquiryRequest,
    signal?: AbortSignal,
  ): Promise<SelectedVendorListResponse>;
  abstract addFinalizedVendor(payload: AddVendorForContractRequisitionEnquiryRequest): Promise<VendorListResponse>;
  abstract pullFinalizedVendor(params: FilterWithPaginationVendorForEnquiryRequest, signal?: AbortSignal): Promise<VendorListResponse>;
}

export class ContractVendorFinalizationDatasourceImpl implements ContractVendorFinalizationDatasource {
  private get k3hHttpClient() {
    return baseClient;
  }

  async pullVendorsForEnquiry(params: FilterWithPaginationVendorForEnquiryRequest, signal?: AbortSignal): Promise<VendorListResponse> {
    try {
      const queryParams = new URLSearchParams({
        ContractRequisitionId: (params.ContractRequisitionId ?? 0).toString(),
        Uniquekey: (params.UniqueKey ?? null)?.toString() || "",
        ProjectId: (params.ProjectId ?? 0).toString(),
      });

      const response = await this.k3hHttpClient.getRequestWithAuthentication(`${ContractRequisitionVendorFinalizationApi.PULL}?${queryParams.toString()}`, {
        signal,
      });

      return response;
    } catch (error: any) {
      console.error("ERROR: PULL VENDORS FOR ENQUIRY :", error);

      if (error instanceof TokenExpiredException) {
        return await this.pullVendorsForEnquiry(params);
      }

      throw error;
    }
  }
  async addVendorForEnquiry(payload: AddVendorForContractRequisitionEnquiryRequest): Promise<VendorListResponse> {
    try {
      const response = await this.k3hHttpClient.postRequestWithAuthentication(ContractRequisitionVendorFinalizationApi.ADD, payload);

      return response;
    } catch (error) {
      console.error("ERROR: ADD VENDOR FOR ENQUIRY :", error);

      if (error instanceof TokenExpiredException) {
        return await this.addVendorForEnquiry(payload);
      }

      throw error;
    }
  }

  async pullSelectedVendorForEnquiry(
    params: FilterWithPaginationVendorForSelectedEnquiryRequest,
    signal?: AbortSignal,
  ): Promise<SelectedVendorListResponse> {
    try {
      const queryParams = new URLSearchParams({
        ContractRequisitionId: (params.ContractRequisitionId ?? 0).toString(),
        Uniquekey: (params.UniqueKey ?? null)?.toString() || "",
        ProjectId: (params.ProjectId ?? 0).toString(),
      });
      if (params.ExportType) queryParams.append("ExportType", params.ExportType);
      if (params.VendorId) queryParams.append("VendorId", params.VendorId.toString());
      
      const response = await this.k3hHttpClient.getRequestWithAuthentication(
        `${ContractRequisitionVendorFinalizationApi.PULL_SELECTED_VENDOR}?${queryParams.toString()}`,
        { signal },
      );

      return response;
    } catch (error) {
      console.error("ERROR: PULL SELECTED VENDOR FOR ENQUIRY  :", error);

      if (error instanceof TokenExpiredException) {
        return await this.pullSelectedVendorForEnquiry(params);
      }

      throw error;
    }
  }

  async addFinalizedVendor(payload: AddVendorForContractRequisitionEnquiryRequest): Promise<VendorListResponse> {
    try {
      const response = await this.k3hHttpClient.postRequestWithAuthentication(`${ContractRequisitionVendorFinalizationApi.ADD_FINALIZED_VENDOR}`, payload);

      return response;
    } catch (error) {
      console.error("ERROR: ADD FINALIZED VENDOR :", error);

      if (error instanceof TokenExpiredException) {
        return await this.addFinalizedVendor(payload);
      }

      throw error;
    }
  }

  async pullFinalizedVendor(params: FilterWithPaginationVendorForEnquiryRequest, signal?: AbortSignal): Promise<VendorListResponse> {
    try {
      const queryParams = new URLSearchParams({
        MaterialRequisitionId: (params.ContractRequisitionId ?? 0).toString(),
        Uniquekey: (params.UniqueKey ?? null)?.toString() || "",
        ProjectId: (params.ProjectId ?? 0).toString(),
      });

      const response = await this.k3hHttpClient.getRequestWithAuthentication(
        `${ContractRequisitionVendorFinalizationApi.PULL_FINALIZED_VENDOR}?${queryParams.toString()}`,
        { signal },
      );

      return response;
    } catch (error: any) {
      console.error("ERROR: PULL FINALIZED VENDOR :", error);

      if (error instanceof TokenExpiredException) {
        return await this.pullFinalizedVendor(params, signal);
      }

      throw error;
    }
  }

  async revokeFinalizedVendor(payload: RevokeFinalizationContractVendorRequest): Promise<VendorListResponse> {
    try {
      const response = await this.k3hHttpClient.postRequestWithAuthentication(`${ContractRequisitionVendorFinalizationApi.REVOKE_FINALIZATION_VENDOR}`, payload);

      return response;
    } catch (error) {
      console.error("ERROR: REVOKE FINALIZED VENDOR :", error);

      if (error instanceof TokenExpiredException) {
        return await this.revokeFinalizedVendor(payload);
      }

      throw error;
    }
  }
}
