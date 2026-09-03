import type { Failure } from "@/core/api/FailureResponse";
import * as E from 'fp-ts/Either';
import type {
    DeleteMaterialRequisitionPayment,
    FilterWithPaginationMaterialRequisitionPayment,
    MaterialRequisitionPaymentDeleteResponse,
    MaterialRequisitionPaymentListResponse,
    MaterialRequisitionPaymentSaveResponse

} from "@/features/materialRequisition/models/MaterialRequisitionPaymentModel";
import { MaterialRequisitionPaymentDatasourceImpl } from "@/features/materialRequisition/datasources/MaterialRequisitionPaymentDataSource";

export const MaterialRequisitionPaymentDataSource = new MaterialRequisitionPaymentDatasourceImpl();

export const materialRequisitionPaymentService = {

    apiCallPullMaterialRequisitionPayment: async (params: FilterWithPaginationMaterialRequisitionPayment, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MaterialRequisitionPaymentListResponse>> => {

        try {

            return E.right(await MaterialRequisitionPaymentDataSource.pullMaterialRequisitionPayment(params, options?.signal));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateMaterialRequisitionPayment: async (formData: FormData): Promise<E.Either<Failure, MaterialRequisitionPaymentSaveResponse>> => {

        try {

            return E.right(await MaterialRequisitionPaymentDataSource.addUpdateMaterialRequisitionPayment(formData));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteMaterialRequisitionPayment: async (params: DeleteMaterialRequisitionPayment): Promise<E.Either<Failure, MaterialRequisitionPaymentDeleteResponse>> => {

        try {

            return E.right(await MaterialRequisitionPaymentDataSource.deleteMaterialRequisitionPayment(params));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },
}

