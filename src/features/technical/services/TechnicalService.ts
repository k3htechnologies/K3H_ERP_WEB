import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { TechnicalDatasourceImpl } from '@/features/technical/datasources/TechnicalDatasource';
import type { CountryStateCityDistrictVillageListResponse, FilterMagicLinkWithValidate, FilterPullExcelSample, FilterRefreshTokenRequest, FilterWithPaginationMaterialSubMaterialMasterUOM, FilterWithPaginationNotificationRequest, FilterWithPaginationVillageRequest, MaterialSubMaterialMasterUOMListResponse, NotificationListResponse, TechnicalListResponse, VillageListResponse } from '@/features/technical/models/TechnicalModel';
import type { ApiResponse } from '@/core/api/ApiResponse';

const technicalDatasource = new TechnicalDatasourceImpl();

export const technicalService = {

    apiCallGetEnvironment: async (): Promise<E.Either<Failure, TechnicalListResponse>> => {
        try {

            return E.right(await technicalDatasource.getEnvironment());

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullNotification: async (params: FilterWithPaginationNotificationRequest): Promise<E.Either<Failure, NotificationListResponse>> => {
        try {

            return E.right(await technicalDatasource.pullNotification(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallRefreshToken: async (params: FilterRefreshTokenRequest): Promise<E.Either<Failure, ApiResponse<string>>> => {
        try {

            return E.right(await technicalDatasource.refreshToken(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallCountryStateDistrictCityVillage: async (): Promise<E.Either<Failure, CountryStateCityDistrictVillageListResponse>> => {
        try {

            return E.right(await technicalDatasource.getCountryStateDistrictCityVillage());

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
       apiCallMaterialSubMaterialMasterUOMList: async (params: FilterWithPaginationMaterialSubMaterialMasterUOM): Promise<E.Either<Failure, MaterialSubMaterialMasterUOMListResponse>> => {
        try {

            return E.right(await technicalDatasource.getMaterialSubMaterialMasterUOM(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullExcelSample: async (params: FilterPullExcelSample): Promise<E.Either<Failure, string>> => {
        try {

            return E.right(await technicalDatasource.pullExcelSample(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallExcelImport: async (formData: FormData): Promise<E.Either<Failure, string>> => {
        try {

            return E.right(await technicalDatasource.excelImport(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullMagicLinkWithValidate: async (params: FilterMagicLinkWithValidate): Promise<E.Either<Failure, ApiResponse<string>>> => {
        try {

            return E.right(await technicalDatasource.pullMagicLinkWithValidate(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullVillage: async (params: FilterWithPaginationVillageRequest): Promise<E.Either<Failure, VillageListResponse>> => {
        try {

            return E.right(await technicalDatasource.pullVillage(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallGetDownloadURL: async (Url?: string): Promise<E.Either<Failure, ApiResponse<string>>> => {
        try {

            return E.right(await technicalDatasource.getDownloadURL(Url));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}