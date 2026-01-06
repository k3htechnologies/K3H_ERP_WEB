import type { Failure } from '@/core/api/FailureResponse';
import { OutDoorDataSourceImpl } from '../datasources/OutDoorDatasource';
import type {
    FilterWithPaginationOutDoor,
    OutDoorDataListResponse,
    OutDoorSaveResponse,
    PunchInOutRequest,
    OutDoorPunchInOutResponse,
    AddUpdateConclusionRequest,
    OutDoorConclusionResponse,
    DeleteOutDoorRequest,
    OutDoorDeleteResponse
} from '../models/OutDoorModel';

import * as E from 'fp-ts/Either';

const outDoorDataSource = new OutDoorDataSourceImpl();

export const OutDoorService = {

    apiCallPullOutDoorData: async (params: FilterWithPaginationOutDoor, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, OutDoorDataListResponse>> => {
        try {

            return E.right(await outDoorDataSource.pullOutDoor(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateOutDoor: async (formData: FormData): Promise<E.Either<Failure, OutDoorSaveResponse>> => {
        try {

            return E.right(await outDoorDataSource.addUpdateOutDoor(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPunchInOut: async (params: PunchInOutRequest): Promise<E.Either<Failure, OutDoorPunchInOutResponse>> => {
        try {

            return E.right(await outDoorDataSource.punchIn(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateConclusion: async (params: AddUpdateConclusionRequest): Promise<E.Either<Failure, OutDoorConclusionResponse>> => {
        try {

            return E.right(await outDoorDataSource.addUpdateConclusion(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteOutDoor: async (params: DeleteOutDoorRequest): Promise<E.Either<Failure, OutDoorDeleteResponse>> => {
        try {

            return E.right(await outDoorDataSource.deleteOutDoor(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
