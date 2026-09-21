import type { Failure } from "@/core/api/FailureResponse";
import * as E from 'fp-ts/Either';
import type {
    DeleteMaterialRequisitionInvoice,
    FilterWithPaginationMaterialRequisitionInvoice,
    FilterWithPaginationMaterialRequisitionInvoiceSummary,
    MaterialRequisitionInvoiceDeleteResponse,
    MaterialRequisitionInvoiceListResponse,
    MaterialRequisitionInvoiceSaveResponse,
    MaterialRequisitionInvoiceSummaryListResponse

} from "@/features/materialRequisition/models/MaterialRequisitionInvoiceModel";
import { MaterialRequisitionInvoiceDatasourceImpl } from "@/features/materialRequisition/datasources/MaterialRequisitionInvoiceDataSource";

export const MaterialRequisitionInvoiceDataSource = new MaterialRequisitionInvoiceDatasourceImpl();

export const materialRequisitionInvoiceService = {

    apiCallPullMaterialRequisitionInvoice: async (params: FilterWithPaginationMaterialRequisitionInvoice, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MaterialRequisitionInvoiceListResponse>> => {

        try {

            return E.right(await MaterialRequisitionInvoiceDataSource.pullMaterialRequisitionInvoice(params, options?.signal));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateMaterialRequisitionInvoice: async (formData: FormData): Promise<E.Either<Failure, MaterialRequisitionInvoiceSaveResponse>> => {

        try {

            return E.right(await MaterialRequisitionInvoiceDataSource.addUpdateMaterialRequisitionInvoice(formData));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteMaterialRequisitionInvoice: async (params: DeleteMaterialRequisitionInvoice): Promise<E.Either<Failure, MaterialRequisitionInvoiceDeleteResponse>> => {

        try {

            return E.right(await MaterialRequisitionInvoiceDataSource.deleteMaterialRequisitionInvoice(params));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullMaterialRequisitionInvoiceSummary: async (params: FilterWithPaginationMaterialRequisitionInvoiceSummary, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MaterialRequisitionInvoiceSummaryListResponse>> => {

        try {

            return E.right(await MaterialRequisitionInvoiceDataSource.pullMaterialRequisitionInvoiceSummary(params, options?.signal));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}

