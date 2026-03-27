import type { ApiResponse } from '@/core/api/ApiResponse';
import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions';
import { TechnicalApi } from '@/features/technical/api/TechnicalApi'
import type { CountryStateCityDistrictVillageListResponse, FilterMagicLinkWithValidate, FilterPullExcelSample, FilterRefreshTokenRequest, FilterWithPaginationMaterialSubMaterialMasterUOM, FilterWithPaginationNotificationRequest, FilterWithPaginationVillageRequest, MaterialSubMaterialMasterUOMListResponse, NotificationListResponse, TechnicalListResponse, VillageListResponse } from '@/features/technical/models/TechnicalModel'

export abstract class TechnicalDatasource {

    abstract getEnvironment(): Promise<TechnicalListResponse>;
    abstract pullNotification(params: FilterWithPaginationNotificationRequest): Promise<NotificationListResponse>;
    abstract refreshToken(params: FilterRefreshTokenRequest): Promise<ApiResponse<string>>;
    abstract getCountryStateDistrictCityVillage(): Promise<CountryStateCityDistrictVillageListResponse>;
    abstract getMaterialSubMaterialMasterUOM(params: FilterWithPaginationMaterialSubMaterialMasterUOM): Promise<MaterialSubMaterialMasterUOMListResponse>;
    abstract pullMagicLinkWithValidate(params: FilterMagicLinkWithValidate): Promise<ApiResponse<string>>;
    abstract getDownloadURL(Url?: string, signal?: AbortSignal): Promise<ApiResponse<string>>;
}

export class TechnicalDatasourceImpl implements TechnicalDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async getEnvironment(): Promise<TechnicalListResponse> {
        try {

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TechnicalApi.GETENVIRONMENT}`);

            return response;

        } catch (error) {

            console.error('Error: GET ENVIRONMENT :', error);
            throw error
        }
    }

    async pullNotification(params: FilterWithPaginationNotificationRequest): Promise<NotificationListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 20).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TechnicalApi.PULL_NOTIFICATION}?${queryParams.toString()}`
            )

            return response;

        } catch (error) {

            console.error('ERROR: PULL NOTIFICATION :', error);

            if (error instanceof TokenExpiredException) {
                return   await this.pullNotification(params);
            }

            throw error
        }
    }

    async refreshToken(params: FilterRefreshTokenRequest): Promise<ApiResponse<string>> {
        try {
            const queryParams = new URLSearchParams({
                Uniquekey: (params.Uniquekey ?? '').toString()
            })

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TechnicalApi.REFRESH_TOKEN}?${queryParams.toString()}`
            )

            return response;
        } catch (error) {

            console.error('ERROR: REFRESH TOKEN :', error);
            throw error
        }
    }

    async getCountryStateDistrictCityVillage(): Promise<CountryStateCityDistrictVillageListResponse> {
        try {

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TechnicalApi.PULL_COUNTRY_STATE_CITY_DISTRICT_VILLAGE}`);


            return response;

        } catch (error) {

            console.error('Error: GET COUNTRY STATE DISTRICT CITY VILLAGE :', error);

            if (error instanceof TokenExpiredException) {
                return  await this.getCountryStateDistrictCityVillage();
            }

            throw error
        }
    }

    async getMaterialSubMaterialMasterUOM(params: FilterWithPaginationMaterialSubMaterialMasterUOM): Promise<MaterialSubMaterialMasterUOMListResponse> {
        try {

            const queryParams = new URLSearchParams({
                ProjectId: (params.ProjectId).toString(),
                ClientRegistrationId: (params.ClientRegistrationId).toString()
            })

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TechnicalApi.PULL_MATERIAL_SUBMATERIALUOM}?${queryParams.toString()}`);
            return response;

        } catch (error) {
            console.error('Error: GET MATERIAL SUBMATERIAL UOM:', error);

            if (error instanceof TokenExpiredException) {
                return  await this.getMaterialSubMaterialMasterUOM(params);
            }
            throw error
        }
    }

    async excelImport(formData: FormData): Promise<string> {

        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                TechnicalApi.EXCEL_IMPORT,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: EXCEL IMPORT :', error)

            if (error instanceof TokenExpiredException) {
                return  await this.excelImport(formData);
            }
            throw error
        }
    }

    async pullExcelSample(params: FilterPullExcelSample): Promise<string> {
        try {
            const queryParams = new URLSearchParams({
                TableName: (params.TableName ?? '').toString()
            })

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TechnicalApi.PULL_EXCEL_SAMPLE}?${queryParams.toString()}`
            )

            return response;

        } catch (error) {

            console.error('ERROR: PULL EXCEL SAMPLE :', error);

            if (error instanceof TokenExpiredException) {
                return   await this.pullExcelSample(params);
            }
            throw error
        }
    }

    async pullMagicLinkWithValidate(params: FilterMagicLinkWithValidate): Promise<ApiResponse<string>> {
        try {
            const queryParams = new URLSearchParams({
                MagicLinkType: (params.MagicLinkType ?? '').toString(),
                ClientRegistrationId: (params.ClientRegistrationId ?? '').toString()
            })

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TechnicalApi.PULL_MAGIC_LINK_WITH_VALIDATE}?${queryParams.toString()}`
            )

            return response;

        } catch (error) {

            console.error('ERROR: PULL MAGIC LINK WITH VALIDATE :', error);

            if (error instanceof TokenExpiredException) {
                return  await this.pullMagicLinkWithValidate(params);
            }
            throw error
        }
    }

    async pullVillage(params: FilterWithPaginationVillageRequest): Promise<VillageListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 20).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.VillageMasterId) queryParams.append('VillageMasterId', params.VillageMasterId.toString());

            if (params.VillageName?.trim()) queryParams.append('VillageName', params.VillageName.trim());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TechnicalApi.PULL_VILLAGE}?${queryParams.toString()}`
            )

            return response;

        } catch (error) {

            console.error('ERROR: PULL NOTIFICATION :', error);

            if (error instanceof TokenExpiredException) {
                return   await this.pullVillage(params);
            }

            throw error
        }
    }

    async getDownloadURL(Url?: string, signal?: AbortSignal): Promise<ApiResponse<string>> {
        try {
            const queryParams = new URLSearchParams({
                Url: (Url ?? "").toString()
            })
            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TechnicalApi.GET_DOWNLOAD_URL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: DOWNLOAD DOCUMENT:', error);

            if (error instanceof TokenExpiredException) {
                return   await this.getDownloadURL(Url);
            }

            throw error
        }
    }
}