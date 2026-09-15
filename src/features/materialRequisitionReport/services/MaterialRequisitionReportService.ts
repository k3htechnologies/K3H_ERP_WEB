import type { Failure } from "@/core/api/FailureResponse";
import { MaterialRequisitionReportDataSourceImpl } from "@/features/materialRequisitionReport/datasources/MaterialRequisitionReportDatasource";
import type { FilterWithPaginationMaterialRequisitionReport, MaterialRequisitionReportListResponse } from "@/features/materialRequisitionReport/models/MaterialRequisitionReportModel";
import * as E from 'fp-ts/Either';

const materialRequisitionReportDataSource = new MaterialRequisitionReportDataSourceImpl();

export const materialRequisitionReportservice = {

    apiCallPullMaterialRequisitionReport: async (params: FilterWithPaginationMaterialRequisitionReport, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, MaterialRequisitionReportListResponse>> => {

        try {
            return E.right(await materialRequisitionReportDataSource.pullMaterialRequisitionReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    }
}