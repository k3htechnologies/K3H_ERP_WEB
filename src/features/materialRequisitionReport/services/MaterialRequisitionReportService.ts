import type { Failure } from "@/core/api/FailureResponse";
import { MaterialRequisitionReportDataSourceImpl } from "@/features/materialRequisitionReport/datasources/MaterialRequisitionReportDatasource";
import type { FilterWithPaginationMaterialAndVendorReport, FilterWithPaginationMaterialPurchaseReport, FilterWithPaginationMaterialRequisitionReport, FilterWithPaginationVendorWiseMaterialCountReport, MaterialAndVendorReportListResponse, MaterialPurchaseReportListResponse, MaterialRequisitionReportListResponse, VendorWiseMaterialCountReportListRespone } from "@/features/materialRequisitionReport/models/MaterialRequisitionReportModel";
import * as E from 'fp-ts/Either';

const materialRequisitionReportDataSource = new MaterialRequisitionReportDataSourceImpl();

export const materialRequisitionReportservice = {

    apiCallPullVendorWiseMaterialCountReport: async (params: FilterWithPaginationVendorWiseMaterialCountReport, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, VendorWiseMaterialCountReportListRespone>> => {

        try {
            return E.right(await materialRequisitionReportDataSource.pullVendorWiseMaterialCountReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullMaterialAndVendorReport: async (params: FilterWithPaginationMaterialAndVendorReport, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MaterialAndVendorReportListResponse>> => {

        try {
            return E.right(await materialRequisitionReportDataSource.pullMaterialAndVendorReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullMaterialRequisitionReport: async (params: FilterWithPaginationMaterialRequisitionReport, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MaterialRequisitionReportListResponse>> => {

        try {
            return E.right(await materialRequisitionReportDataSource.pullMaterialRequisitionReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullMaterialPurchaseReport: async (params: FilterWithPaginationMaterialPurchaseReport, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MaterialPurchaseReportListResponse>> => {

        try {
            return E.right(await materialRequisitionReportDataSource.pullMaterialPurchaseReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    }
}