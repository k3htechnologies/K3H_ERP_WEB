import type { Failure } from '@/core/api/FailureResponse';
import { ClassificationParameterDatasourceImpl } from '@/features/classificationParameter/datasources/ClassificationParameterDatasource'
import type {
    FilterWithPaginationClassificationParameter,
    AddUpdateClassificationParameterRequest,
    DeleteClassificationParameterRequest,
    ClassificationParameterListResponse,
    ClassificationParameterSaveReponse,
    ClassificationParameterDeleteResponse
} from '@/features/classificationParameter/models/ClassificationParameterModel';

import * as E from 'fp-ts/Either';

const classificationParameterDatasource = new ClassificationParameterDatasourceImpl();

export const classificationParameterService = {

    apiCallPullClassificationParameter: async (params: FilterWithPaginationClassificationParameter, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ClassificationParameterListResponse>> => {
        try {

            return E.right(await classificationParameterDatasource.pullClassificationParameter(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateClassificationParameter: async (params: AddUpdateClassificationParameterRequest): Promise<E.Either<Failure, ClassificationParameterSaveReponse>> => {
        try {

            return E.right(await classificationParameterDatasource.addUpdateClassificationParameter(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteClassificationParameter: async (params: DeleteClassificationParameterRequest): Promise<E.Either<Failure, ClassificationParameterDeleteResponse>> => {
        try {

            return E.right(await classificationParameterDatasource.deleteClassificationParameter(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
