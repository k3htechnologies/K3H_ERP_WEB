import type { Failure } from "@/core/api/FailureResponse";
import * as E from 'fp-ts/Either';
import type { DeleteMaterialRequisitionGRN, FilterWithPaginationMaterialRequisitionGRN, FilterWithPaginationMaterialRequisitionGRNSummary, MaterialRequisitionGRNDeleteResponse, MaterialRequisitionGRNListResponse, MaterialRequisitionGRNSaveResponse, MaterialRequisitionGRNSummaryListResponse } from "@/features/materialRequisition/models/MaterialRequisitionGRNModel";
import { MaterialRequisitionGRNGRNDatasourceImpl } from "@/features/materialRequisition/datasources/MaterialRequisitionGRNDataSource";

const materialRequisitionGRNDatasource = new MaterialRequisitionGRNGRNDatasourceImpl();

export const materialRequisitionGRNService = {

    apiCallPullMaterialRequisitionGRN: async (params: FilterWithPaginationMaterialRequisitionGRN, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MaterialRequisitionGRNListResponse>> => {
        try {

            return E.right(await materialRequisitionGRNDatasource.pullMaterialRequisitionGRN(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallToAddMaterialRequisitionGRN: async (FormData: FormData): Promise<E.Either<Failure, MaterialRequisitionGRNSaveResponse>> => {
        try {

            return E.right(await materialRequisitionGRNDatasource.addUpdateMaterialRequisitionGRN(FormData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteMaterialRequisitionGRN: async (params: DeleteMaterialRequisitionGRN): Promise<E.Either<Failure, MaterialRequisitionGRNDeleteResponse>> => {
        try {

            return E.right(await materialRequisitionGRNDatasource.deleteMaterialRequisitionGRN(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }

    },

     apiCallPullMaterialRequisitionGRNSummary: async (params: FilterWithPaginationMaterialRequisitionGRNSummary, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MaterialRequisitionGRNSummaryListResponse>> => {
        try {

            return E.right(await materialRequisitionGRNDatasource.pullMaterialRequisitionGRNSummary(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}