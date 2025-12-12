import type { Failure } from '@/core/api/FailureResponse';
import { OutDoorDataSourceImpl } from '../datasources/OutDoorDatasource';
import * as E from 'fp-ts/Either';
import type { FilterWithPaginationOutDoor, OutDoorDataListResponse, OutDoorSaveResponse, PunchInOutRequest, OutDoorPunchInOutResponse, AddUpdateConclusionRequest, OutDoorConclusionResponse } from '../models/OutDoorModel';

const OutDoorDataSource = new OutDoorDataSourceImpl();

export const OutDoorDataService = {
    apiCallPullOutDoorData: async (params: FilterWithPaginationOutDoor, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, OutDoorDataListResponse>> => {
        try {
            return E.right(await OutDoorDataSource.pullOutDoor(params, options?.signal));
        } catch (error: unknown) {
            const err = error as { message?: string; code?: string };
            return E.left({
                message: err.message || 'An error occurred',
                code: err.code
            });
        }
    },

    apiCallAddUpdateOutDoor: async (formData: FormData): Promise<E.Either<Failure, OutDoorSaveResponse>> => {
        try {
            return E.right(await OutDoorDataSource.addUpdateOutDoor(formData));
        } catch (error: unknown) {
            const err = error as { message?: string; code?: string };
            return E.left({
                message: err.message || 'An error occurred',
                code: err.code
            });
        }
    },

    apiCallPunchInOut: async (params: PunchInOutRequest): Promise<E.Either<Failure, OutDoorPunchInOutResponse>> => {
        try {
            return E.right(await OutDoorDataSource.punchIn(params));
        } catch (error: unknown) {
            const err = error as { message?: string; code?: string };
            return E.left({
                message: err.message || 'An error occurred',
                code: err.code
            });
        }
    },

    apiCallAddUpdateConclusion: async (params: AddUpdateConclusionRequest): Promise<E.Either<Failure, OutDoorConclusionResponse>> => {
        try {
            return E.right(await OutDoorDataSource.addUpdateConclusion(params));
        } catch (error: unknown) {
            const err = error as { message?: string; code?: string };
            return E.left({
                message: err.message || 'An error occurred',
                code: err.code
            });
        }
    }
}
