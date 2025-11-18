import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { CompanyMasterApi } from '@/features/companyMaster/api/CompanyMasterApi'
import type {
    FilterWithPaginationCompanyMasterRequest,
    AddUpdateCompanyMasterRequest,
    DeleteCompanyMasterRequest,
    CompanyMasterListResponse,
    CompanyMasterSaveResponse,
    CompanyMasterDeleteResponse
} from '@/features/companyMaster/models/CompanyMasterModel'

export abstract class CompanyMasterDatasource {

    abstract pullCompanyMaster(params: FilterWithPaginationCompanyMasterRequest, signal?: AbortSignal): Promise<CompanyMasterListResponse>;
    abstract addUpdateCompanyMaster(data: AddUpdateCompanyMasterRequest): Promise<CompanyMasterSaveResponse>;
    abstract deleteCompanyMaster(params: DeleteCompanyMasterRequest): Promise<CompanyMasterDeleteResponse>;
}

export class CompanyMasterDatasourceImpl implements CompanyMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullCompanyMaster(params: FilterWithPaginationCompanyMasterRequest, signal?: AbortSignal): Promise<CompanyMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.CompanyId) queryParams.append('CompanyId', params.CompanyId.toString());
            if (params.CompanyName?.trim()) queryParams.append('CompanyName', params.CompanyName.trim());
            if (params.CompanyType?.trim()) queryParams.append('CompanyType', params.CompanyType.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${CompanyMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL Company MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullCompanyMaster(params);
            }

            throw error
        }
    }

    
    async addUpdateCompanyMaster(params: AddUpdateCompanyMasterRequest): Promise<CompanyMasterSaveResponse> {

        try {

            const payLoad: AddUpdateCompanyMasterRequest = {
                
                CompanyId: params.CompanyId ?? 0,
                Uniquekey: params.Uniquekey ?? null,

                CompanyName: params.CompanyName?.trim() ?? '',
                CompanyType: params.CompanyType?.trim() ?? '',
                ContactPerson: params.ContactPerson?.trim() ?? '',
                MobileNumber: params.MobileNumber?.trim() ?? '',
                EmailId: params.EmailId?.trim() ?? '',
                LandLineNumber: params.LandLineNumber?.trim() ?? '',
                GSTNumber: params.GSTNumber?.trim() ?? '',

                GSTCertificateURL: params.GSTCertificateURL ?? null,
                RemoveGSTCertificateURL: params.RemoveGSTCertificateURL?.trim() ?? '',

                CINNumber: params.CINNumber?.trim() ?? '',
                CINURL: params.CINURL ?? null,
                RemoveCINURL: params.RemoveCINURL?.trim() ?? '',

                PanNumber: params.PanNumber?.trim() ?? '',
                PanCardURL: params.PanCardURL ?? null,
                RemovePanCardURL: params.RemovePanCardURL?.trim() ?? '',

                RERANumber: params.RERANumber?.trim() ?? '',

                CountryMasterId: params.CountryMasterId ?? 0,
                StateMasterId: params.StateMasterId ?? 0,
                DistrictMasterId: params.DistrictMasterId ?? 0,
                CityMasterId: params.CityMasterId ?? 0,

                CompanyLetterheadHeaderURL: params.CompanyLetterheadHeaderURL ?? null,
                RemoveCompanyLetterheadHeaderURL: params.RemoveCompanyLetterheadHeaderURL?.trim() ?? '',

                CompanyLetterheadFooterURL: params.CompanyLetterheadFooterURL ?? null,
                RemoveCompanyLetterheadFooterURL: params.RemoveCompanyLetterheadFooterURL?.trim() ?? ''
            }


            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                CompanyMasterApi.ADD_UPDATE,
                payLoad
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE COMPANY MASTER :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateCompanyMaster(params);
            }
            throw error
        }
    }

    async deleteCompanyMaster(params: DeleteCompanyMasterRequest): Promise<CompanyMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                CompanyId: (params.CompanyId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${CompanyMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE COMPANY MASTER :', error)

            if (error === TokenExpiredException) {

                await this.deleteCompanyMaster(params);

            }

            throw error
        }
    }
}
