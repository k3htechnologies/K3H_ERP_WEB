import type { Failure } from "@/core/api/FailureResponse";

import * as E from 'fp-ts/Either';
import type {

    DeleteMaterialRequisitionPurchaseOrder,
    FilterWithPaginationMaterialRequisitionPurchaseOrder,
    GenerateMaterialRequisitionPurchaseOrderPdfData,
    GenerateMaterialRequisitionPurchaseOrderPdfSaveResponse,
    MaterialRequisitionPurchaseOrderDeleteResponse,
    MaterialRequisitionPurchaseOrderListResponse,
    MaterialRequisitionPurchaseOrderSaveResponse

} from "@/features/materialRequisition/models/MaterialRequisitionPurchaseOrderModel";

import { MaterialRequisitionPurchaseOrderDatasourceImpl } from "@/features/materialRequisition/datasources/MaterialRequisitionPurchaseOrderDataSource";

export const MaterialRequisitionPurchaseOrderDataSource = new MaterialRequisitionPurchaseOrderDatasourceImpl();

export const materialRequisitionPurchaseOrderService = {

    apiCallPullMaterialRequisitionPurchaseOrder: async (params: FilterWithPaginationMaterialRequisitionPurchaseOrder, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MaterialRequisitionPurchaseOrderListResponse>> => {

        try {

            return E.right(await MaterialRequisitionPurchaseOrderDataSource.pullMaterialRequisitionPurchaseOrder(params, options?.signal));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateMaterialRequisitionPurchaseOrder: async (formData: FormData): Promise<E.Either<Failure, MaterialRequisitionPurchaseOrderSaveResponse>> => {

        try {

            return E.right(await MaterialRequisitionPurchaseOrderDataSource.addUpdateMaterialRequisitionPurchaseOrder(formData));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteMaterialRequisitionPurchaseOrder: async (params: DeleteMaterialRequisitionPurchaseOrder): Promise<E.Either<Failure, MaterialRequisitionPurchaseOrderDeleteResponse>> => {

        try {

            return E.right(await MaterialRequisitionPurchaseOrderDataSource.deleteMaterialRequisitionPurchaseOrder(params));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallGenerateMaterialRequisitionPurchaseOrderPdf: async (params: GenerateMaterialRequisitionPurchaseOrderPdfData): Promise<E.Either<Failure, GenerateMaterialRequisitionPurchaseOrderPdfSaveResponse>> => {

        try {

            return E.right(await MaterialRequisitionPurchaseOrderDataSource.generateMaterialRequisitionPurchaseOrderPdf(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },
}
