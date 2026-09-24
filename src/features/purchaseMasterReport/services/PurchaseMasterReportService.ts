import type { Failure } from "@/core/api/FailureResponse";
import * as E from 'fp-ts/Either';
import type { FilterWithPaginationPurchaseMasterReport, PurchaseMasterReportListResponse } from "@/features/purchaseMasterReport/models/PurchaseMasterReportModel";
import { PurchaseMasterReportDatasourceImpl } from "@/features/purchaseMasterReport/datasources/PurchaseMasterReportDataSource";

const purchaseMasterReportDatasource = new PurchaseMasterReportDatasourceImpl

export const purchaseMasterReportService = {
   
    apiCallPullPurchaseMasterReport: async (params: FilterWithPaginationPurchaseMasterReport, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PurchaseMasterReportListResponse>> => {
        try {
    
            return E.right(await purchaseMasterReportDatasource.pullPurchaseMasterReport(params, options?.signal));
    
        } catch (error: any) {
    
            return E.left({ message: error.message, code: error.code });
    
        }
    },

}