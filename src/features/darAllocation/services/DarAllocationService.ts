import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { DarAllocationDatasourceImpl } from '@/features/darAllocation/datasources/DarAllocationDatasource';
import type { DarAllocationDeleteResponse, DarAllocationListResponse, DarAllocationSaveResponse, DeleteDarAllocationRequest, FilterWithPaginationDarAllocationRequest, AddUpdateDarAllocationRequest } from "@/features/darAllocation/models/DarAllocationModel";

const DarAllocationDatasource = new DarAllocationDatasourceImpl();

export const darAllocationService = {

    apiCallPullDarAllocation: async (params: FilterWithPaginationDarAllocationRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, DarAllocationListResponse>> => {

        try {
            return E.right(await DarAllocationDatasource.pullDarAllocation(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateDarAllocation: async (params: AddUpdateDarAllocationRequest): Promise<E.Either<Failure, DarAllocationSaveResponse>> => {
        try {

            return E.right(await DarAllocationDatasource.addUpdateDarAllocation(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteDarAllocation: async (params: DeleteDarAllocationRequest): Promise<E.Either<Failure, DarAllocationDeleteResponse>> => {
        try {

            return E.right(await DarAllocationDatasource.deleteDarAllocation(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}
