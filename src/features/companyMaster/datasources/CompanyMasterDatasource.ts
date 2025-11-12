import baseClient from "../../../core/config/baseClient";
import { CompanyMasterApi } from "../api/CompanyMasterApi";
import type {
  FilterWithPaginationCompanyMasterRequest,
  AddUpdateCompanyMasterRequest,
  DeleteCompanyMasterRequest,
  CompanyMasterListResponse,
  CompanyMasterSaveResponse,
  CompanyMasterDeleteResponse,
  AddUpdateCompanyPartnerRequest,
  DeleteCompanyPartnerRequest,
  CompanyPartnerListResponse,
  CompanyPartnerSaveResponse,
  CompanyPartnerDeleteResponse
} from "../models/CompanyMasterModel";

// =======================================================
// 🔹 Abstract Class — Interface Definition
// =======================================================
export abstract class CompanyMasterDatasource {
  abstract pullCompanyMaster(
    params: FilterWithPaginationCompanyMasterRequest
  ): Promise<CompanyMasterListResponse>;

  abstract addUpdateCompanyMaster(
    data: AddUpdateCompanyMasterRequest
  ): Promise<CompanyMasterSaveResponse>;

  abstract deleteCompanyMaster(
    params: DeleteCompanyMasterRequest
  ): Promise<CompanyMasterDeleteResponse>;

  abstract pullCompanyPartners(
    companyMasterId: number
  ): Promise<CompanyPartnerListResponse>;

  abstract addUpdateCompanyPartner(
    data: AddUpdateCompanyPartnerRequest
  ): Promise<CompanyPartnerSaveResponse>;

  abstract deleteCompanyPartner(
    params: DeleteCompanyPartnerRequest
  ): Promise<CompanyPartnerDeleteResponse>;
}

// =======================================================
// 🔸 Implementation Class
// =======================================================
export class CompanyMasterDatasourceImpl implements CompanyMasterDatasource {
  private get k3hHttpClient() {
    return baseClient;
  }

  // ===========================
  // 📄 Get All Companies (with Pagination)
  // ===========================
  async pullCompanyMaster(
    params: FilterWithPaginationCompanyMasterRequest
  ): Promise<CompanyMasterListResponse> {
    try {
      const queryParams = new URLSearchParams({
        PageSize: (params.PageSize ?? 10).toString(),
        PageNumber: (params.PageNumber ?? 1).toString(),
        IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
      });

      if (params.CompanyMasterId)
        queryParams.append("CompanyMasterId", params.CompanyMasterId.toString());
      if (params.CompanyName?.trim())
        queryParams.append("CompanyName", params.CompanyName.trim());
      if (params.SortBy?.trim())
        queryParams.append("SortBy", params.SortBy.trim());
      if (params.ExportType) queryParams.append("ExportType", params.ExportType);

      const response = await this.k3hHttpClient.getRequestWithAuthentication(
        `${CompanyMasterApi.PULL}?${queryParams.toString()}`
      );

      return response;
    } catch (error) {
      console.error("❌ Error: Pull Company Master:", error);
      throw error;
    }
  }

  // ===========================
  // ✏️ Add / Update Company
  // ===========================
  async addUpdateCompanyMaster(
    data: AddUpdateCompanyMasterRequest
  ): Promise<CompanyMasterSaveResponse> {
    try {
      const payLoad: AddUpdateCompanyMasterRequest = {
        CompanyMasterId: data.CompanyMasterId ?? 0,
        UniqueKey: data.UniqueKey ?? "",
        CompanyName: data.CompanyName?.trim() ?? "",
        CompanyType: data.CompanyType?.trim() ?? "",
        ContactPerson: data.ContactPerson?.trim() ?? "",
        MobileNumber: data.MobileNumber?.trim() ?? "",
        EmailId: data.EmailId?.trim() ?? "",
        LandlineNumber: data.LandlineNumber?.trim() ?? "",
        GSTNumber: data.GSTNumber?.trim() ?? "",
        GSTCertificateUrl: data.GSTCertificateUrl ?? "",
        PANNumber: data.PANNumber?.trim() ?? "",
        PANUrl: data.PANUrl ?? "",
        CINNumber: data.CINNumber?.trim() ?? "",
        CINUrl: data.CINUrl ?? "",
        RERANumber: data.RERANumber?.trim() ?? "",
        State: data.State?.trim() ?? "",
        District: data.District?.trim() ?? "",
        City: data.City?.trim() ?? "",
        CompanyLetterheadHeaderType: data.CompanyLetterheadHeaderType ?? "",
        CompanyLetterheadHeaderValue: data.CompanyLetterheadHeaderValue ?? "",
        CompanyLetterheadFooterType: data.CompanyLetterheadFooterType ?? "",
        CompanyLetterheadFooterValue: data.CompanyLetterheadFooterValue ?? "",
        Partners: data.Partners ?? [],
      };

      const response = await this.k3hHttpClient.postRequestWithAuthentication(
        CompanyMasterApi.ADD_UPDATE,
        payLoad
      );

      return response;
    } catch (error) {
      console.error("❌ Error: Add/Update Company Master:", error);
      throw error;
    }
  }

  // ===========================
  // 🗑️ Delete Company
  // ===========================
  async deleteCompanyMaster(
    params: DeleteCompanyMasterRequest
  ): Promise<CompanyMasterDeleteResponse> {
    try {
      const queryParams = new URLSearchParams({
        CompanyMasterId: (params.CompanyMasterId ?? 0).toString(),
        UniqueKey: params.UniqueKey ?? "",
      });

      const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
        `${CompanyMasterApi.DELETE}?${queryParams.toString()}`
      );

      return response;
    } catch (error) {
      console.error("❌ Error: Delete Company Master:", error);
      throw error;
    }
  }

  // ===========================
  // 👥 Get Company Partners
  // ===========================
  async pullCompanyPartners(
    companyMasterId: number
  ): Promise<CompanyPartnerListResponse> {
    try {
      const response = await this.k3hHttpClient.getRequestWithAuthentication(
        `${CompanyMasterApi.PARTNER_PULL}?CompanyMasterId=${companyMasterId}`
      );

      return response;
    } catch (error) {
      console.error("❌ Error: Pull Company Partners:", error);
      throw error;
    }
  }

  // ===========================
  // ✏️ Add / Update Partner
  // ===========================
  async addUpdateCompanyPartner(
    data: AddUpdateCompanyPartnerRequest
  ): Promise<CompanyPartnerSaveResponse> {
    try {
      const response = await this.k3hHttpClient.postRequestWithAuthentication(
        CompanyMasterApi.PARTNER_ADD_UPDATE,
        data
      );

      return response;
    } catch (error) {
      console.error("❌ Error: Add/Update Company Partner:", error);
      throw error;
    }
  }

  // ===========================
  // 🗑️ Delete Partner
  // ===========================
  async deleteCompanyPartner(
    params: DeleteCompanyPartnerRequest
  ): Promise<CompanyPartnerDeleteResponse> {
    try {
      const queryParams = new URLSearchParams({
        CompanyPartnerId: (params.CompanyPartnerId ?? 0).toString(),
        CompanyMasterId: (params.CompanyMasterId ?? 0).toString(),
      });

      const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
        `${CompanyMasterApi.PARTNER_DELETE}?${queryParams.toString()}`
      );

      return response;
    } catch (error) {
      console.error("❌ Error: Delete Company Partner:", error);
      throw error;
    }
  }
}
