import type { Failure } from '../../../core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { TechnicalDatasourceImpl } from '../datasources/TechnicalDatasource';
import type { TechnicalListResponse } from '../models/TechnicalModel';

const technicalDatasource = new TechnicalDatasourceImpl();

export const technicalService = {

    apiCallGetEnvironment: async (): Promise<E.Either<Failure, TechnicalListResponse>> => {
        try {

            return E.right(await technicalDatasource.getEnvironment());

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
