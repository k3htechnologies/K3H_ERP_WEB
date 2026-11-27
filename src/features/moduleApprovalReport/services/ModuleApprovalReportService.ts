import type { Failure } from "@/core/api/FailureResponse";
import { ModuleApprovalReportDataSourceImpl } from "../dataSources/ModuleApprovalReportDataSource";
import type { FilterWithPaginationModuleApprovalReport, ModuleApprovalReportListResponse } from "../models/ModuleApprovalReportModel";
import * as E from 'fp-ts/Either';

const ModuleApprovalReportDataSource = new ModuleApprovalReportDataSourceImpl();

export const moduleApprovalReportService = {

    apiCallModuleApprovalReport: async (params: FilterWithPaginationModuleApprovalReport, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ModuleApprovalReportListResponse>> => {

        try {

            return E.right(await ModuleApprovalReportDataSource.pullModuleApprovalReport(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    }
}