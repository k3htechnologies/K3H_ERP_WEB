import type { Failure } from "@/core/api/FailureResponse";
import * as E from 'fp-ts/Either';
import { MaterialRequisitionQuotationDatasourceImpl } from "@/features/materialRequisition/datasources/MaterialRequisitionQuotationDataSource";
import type { DeleteMaterialRequisitionQuotationRequest, DeletMaterialRequisitionQuotationResponse, FilterMaterialRequisitionQuotationRequest, FilterSelectedVendorForQuotationRequest, FilterWithMaterialRequisitionSummaryOfQuotationRequest, MaterialRequisitionQuotationListResponse, MaterialRequisitionQuotationSaveReponse, MaterialRequisitionSummaryOfQuotationListResponse, SelectedVendorForQuotationListResponse } from "../models/MaterialRequisitionQuotationModel";

const materialRequisitionQuotationDatasource = new MaterialRequisitionQuotationDatasourceImpl

export const materialRequisitionQuotationService = {

    apiCallPullMaterialRequisitionQuotation: async (params: FilterMaterialRequisitionQuotationRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MaterialRequisitionQuotationListResponse>> => {
        try {

            return E.right(await materialRequisitionQuotationDatasource.pullMaterialRequisitionQuotation(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullMaterialRequisitionSummaryOfQuotation: async (params: FilterWithMaterialRequisitionSummaryOfQuotationRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MaterialRequisitionSummaryOfQuotationListResponse>> => {
        try {

            return E.right(await materialRequisitionQuotationDatasource.pullMaterialRequisitionSummaryOfQuotation(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddMaterialRequisitionQuotation: async (FormData: FormData): Promise<E.Either<Failure, MaterialRequisitionQuotationSaveReponse>> => {
        try {

            return E.right(await materialRequisitionQuotationDatasource.addUpdateMaterialRequisitionQuotation(FormData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteMaterialRequisitionQuotation: async (params: DeleteMaterialRequisitionQuotationRequest): Promise<E.Either<Failure, DeletMaterialRequisitionQuotationResponse>> => {
        try {

            return E.right(await materialRequisitionQuotationDatasource.deleteMaterialRequisitionQuotation(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }

    },

    apiCallPullSelectedVendorForQuotation: async (params: FilterSelectedVendorForQuotationRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, SelectedVendorForQuotationListResponse>> => {
        try {

            return E.right(await materialRequisitionQuotationDatasource.pullSelectedVendorForQuotation(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}