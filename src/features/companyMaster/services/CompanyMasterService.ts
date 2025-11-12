import type { Failure } from "../../../core/api/FailureResponse";
import { CompanyMasterDatasourceImpl } from "../datasources/CompanyMasterDatasource";

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

import * as E from "fp-ts/Either";

const companyMasterDatasource = new CompanyMasterDatasourceImpl();

export const companyMasterService = {
  // ===========================
  // 📄 Get All (with Filter + Pagination)
  // ===========================
  apiCallPullCompanyMaster: async (
    params: FilterWithPaginationCompanyMasterRequest
  ): Promise<E.Either<Failure, CompanyMasterListResponse>> => {
    try {
      return E.right(await companyMasterDatasource.pullCompanyMaster(params));
    } catch (error: any) {
      return E.left({ message: error.message, code: error.code });
    }
  },

  // ===========================
  // ✏️ Add / Update Company Master
  // ===========================
  apiCallAddUpdateCompanyMaster: async (
    data: AddUpdateCompanyMasterRequest
  ): Promise<E.Either<Failure, CompanyMasterSaveResponse>> => {
    try {
      return E.right(await companyMasterDatasource.addUpdateCompanyMaster(data));
    } catch (error: any) {
      return E.left({ message: error.message, code: error.code });
    }
  },

  // ===========================
  // 🗑️ Delete Company Master
  // ===========================
  apiCallDeleteCompanyMaster: async (
    params: DeleteCompanyMasterRequest
  ): Promise<E.Either<Failure, CompanyMasterDeleteResponse>> => {
    try {
      return E.right(await companyMasterDatasource.deleteCompanyMaster(params));
    } catch (error: any) {
      return E.left({ message: error.message, code: error.code });
    }
  },

  // ===========================
  // 👥 Company Partners — CRUD
  // ===========================

  apiCallPullCompanyPartners: async (
    companyMasterId: number
  ): Promise<E.Either<Failure, CompanyPartnerListResponse>> => {
    try {
      return E.right(await companyMasterDatasource.pullCompanyPartners(companyMasterId));
    } catch (error: any) {
      return E.left({ message: error.message, code: error.code });
    }
  },

  apiCallAddUpdateCompanyPartner: async (
    data: AddUpdateCompanyPartnerRequest
  ): Promise<E.Either<Failure, CompanyPartnerSaveResponse>> => {
    try {
      return E.right(await companyMasterDatasource.addUpdateCompanyPartner(data));
    } catch (error: any) {
      return E.left({ message: error.message, code: error.code });
    }
  },

  apiCallDeleteCompanyPartner: async (
    params: DeleteCompanyPartnerRequest
  ): Promise<E.Either<Failure, CompanyPartnerDeleteResponse>> => {
    try {
      return E.right(await companyMasterDatasource.deleteCompanyPartner(params));
    } catch (error: any) {
      return E.left({ message: error.message, code: error.code });
    }
  },
};
