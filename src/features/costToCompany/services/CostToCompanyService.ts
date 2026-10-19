
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import type { AddUpdateCostToCompanyData, CostToCompanyByIdListResponse, CostToCompanyDeleteResponse, CostToCompanyListResponse, CostToCompanySaveResponse, DeleteCostToCompany, FilterWithPaginationCostToCompanyById, FilterWithPaginationCostToCompanyRequest } from '../models/CostToCompanyModel';
import { CostToCompanyDatasourceImpl } from '../datasources/CostToCompanyDataSource';

const CostToCompanyDatasource = new CostToCompanyDatasourceImpl();

export const CostToCompanyService = {

    apiCallPullCostToCompany: async (params: FilterWithPaginationCostToCompanyRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CostToCompanyListResponse>> => {

        try {

            return E.right(await CostToCompanyDatasource.pullCostToCompany(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullCostToCompanyById: async (params: FilterWithPaginationCostToCompanyById, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CostToCompanyByIdListResponse>> => {

        try {

            return E.right(await CostToCompanyDatasource.pullCostToCompanyById(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateCostToCompany: async (data: AddUpdateCostToCompanyData): Promise<E.Either<Failure, CostToCompanySaveResponse>> => {

        try {

            return E.right(await CostToCompanyDatasource.addUpdateCostToCompany(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteCostToCompany: async (params: DeleteCostToCompany): Promise<E.Either<Failure, CostToCompanyDeleteResponse>> => {

        try {
            return E.right(await CostToCompanyDatasource.deleteCostToCompany(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    }
}