import type { Failure } from "@/core/api/FailureResponse";
import type {

    FilterWithPaginationSaleTargetRequest,
    SaleTargetListResponse,
    SaleTargetSaveResponse,
    SaleTargetDeleteResponse,
    DeleteSaleTargetRequest,
    AddUpdateSaleTargetRequest,

} from '@/features/saleTarget/models/SaleTargetModel'
import * as E from 'fp-ts/Either';

import { SaleTargetDatasourceImpl } from "@/features/saleTarget/datasources/SaleTargetDatasource";

export const SaleTargetDataSource = new SaleTargetDatasourceImpl();

export const saleTargetService = {

    apiCallPullSaleTarget: async (params: FilterWithPaginationSaleTargetRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, SaleTargetListResponse>> => {

        try {

            return E.right(await SaleTargetDataSource.pullSaleTarget(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateSaleTarget: async (params: AddUpdateSaleTargetRequest): Promise<E.Either<Failure, SaleTargetSaveResponse>> => {

        try {

            return E.right(await SaleTargetDataSource.addUpadateSaleTarget(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },


    apiCallDeleteSaleTarget: async (params: DeleteSaleTargetRequest): Promise<E.Either<Failure, SaleTargetDeleteResponse>> => {

        try {

            return E.right(await SaleTargetDataSource.deleteSaleTarget(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

}

