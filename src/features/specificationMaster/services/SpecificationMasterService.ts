
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { SpecificationMasterDatasourceImpl } from '@/features/specificationMaster/datasources/SpecificationMasterDataSource';
import type { AddUpdateSpecificationMaster, DeleteSpecificationMasterRequest, DeleteSpecificationMasterResponse, filterwithPaginationSpecificationMasterRequest, SpecificationMasterListResponse, SpecificationMasterSaveResponse } from '@/features/specificationMaster/models/SpecificationMasterModel';

const SpecificationMasterDatasource = new SpecificationMasterDatasourceImpl();

export const specificationMasterService = {

    apiCallPullSpecificationMaster: async (params: filterwithPaginationSpecificationMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, SpecificationMasterListResponse>> => {

        try {

            return E.right(await SpecificationMasterDatasource.pullSpecificationMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateSpecificationMaster: async (data: AddUpdateSpecificationMaster): Promise<E.Either<Failure, SpecificationMasterSaveResponse>> => {

        try {

            return E.right(await SpecificationMasterDatasource.addUpdateSpecificationMaster(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteSpecificationMaster: async (params: DeleteSpecificationMasterRequest): Promise<E.Either<Failure, DeleteSpecificationMasterResponse>> => {

        try {
            return E.right(await SpecificationMasterDatasource.deleteSpecificationMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    }
}