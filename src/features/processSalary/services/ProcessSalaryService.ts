import type { Failure } from "@/core/api/FailureResponse";
import { ProcessSalaryDataSourceImpl } from "@/features/processSalary/datasources/ProcessSalaryDataSource";
import type { AddUpdateProcessSalary, DeleteProcessSalary, FilterWithPaginationProcessSalaryDetails, FilterWithPaginationProcessSalaryRequest, ProcessSalaryDeleteResponse, ProcessSalaryDetailsListResponse, ProcessSalaryDetailsSaveResponse, ProcessSalaryListResponse, ProcessSalarySaveResponse, AddUpdateProcessSalaryDetails } from "@/features/processSalary/models/ProcessSalaryModel";
import * as E from 'fp-ts/Either';

const ProcessSalaryDataSource = new ProcessSalaryDataSourceImpl();

export const processSalaryService = {

    apiCallPullProcessSalary: async (params: FilterWithPaginationProcessSalaryRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProcessSalaryListResponse>> => {

        try {
            return E.right(await ProcessSalaryDataSource.pullProcessSalary(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateProcessSalary: async (data: AddUpdateProcessSalary): Promise<E.Either<Failure, ProcessSalarySaveResponse>> => {

        try {

            return E.right(await ProcessSalaryDataSource.addUpdateProcessSalary(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteProcessSalary: async (params: DeleteProcessSalary): Promise<E.Either<Failure, ProcessSalaryDeleteResponse>> => {

        try {

            return E.right(await ProcessSalaryDataSource.deleteProcessSalary(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullProcessSalaryDetails: async (params: FilterWithPaginationProcessSalaryDetails, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProcessSalaryDetailsListResponse>> => {

        try {

            return E.right(await ProcessSalaryDataSource.pullProcessSalaryDetails(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateProcessSalaryDetails: async (data: AddUpdateProcessSalaryDetails): Promise<E.Either<Failure, ProcessSalaryDetailsSaveResponse>> => {

        try {

            return E.right(await ProcessSalaryDataSource.addUpdateProcessSalaryDetails(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

}