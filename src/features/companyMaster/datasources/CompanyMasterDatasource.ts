import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { CompanyMasterApi } from '@/features/companyMaster/api/CompanyMasterApi'
import type {
    FilterWithPaginationCompanyMasterRequest,
    DeleteCompanyMasterRequest,
    CompanyMasterListResponse,
    CompanyMasterSaveResponse,
    CompanyMasterDeleteResponse,
    FilterWithPaginationCompanyMasterWithBankDetails,
    CompanyMasterWithBankDetailsListResponse,
    CompanyMasterWithBankDetailsSaveResponse,
    DeleteCompanyMasterWithBankDetailsRequest,
    CompanyMasterWithBankDetailsDeleteResponse
} from '@/features/companyMaster/models/CompanyMasterModel'

export abstract class CompanyMasterDatasource {

    abstract pullCompanyMaster(params: FilterWithPaginationCompanyMasterRequest, signal?: AbortSignal): Promise<CompanyMasterListResponse>;
    abstract addUpdateCompanyMaster(formData: FormData): Promise<CompanyMasterSaveResponse>;
    abstract deleteCompanyMaster(params: DeleteCompanyMasterRequest): Promise<CompanyMasterDeleteResponse>;

    abstract pullCompanyMasterWithBankDetails(params: FilterWithPaginationCompanyMasterWithBankDetails, signal?: AbortSignal): Promise<CompanyMasterWithBankDetailsListResponse>;
    abstract addUpdateCompanyMasterWithBankDetails(formData: FormData): Promise<CompanyMasterWithBankDetailsSaveResponse>;
    abstract deleteCompanyMasterWithBankDetails(params: DeleteCompanyMasterWithBankDetailsRequest): Promise<CompanyMasterWithBankDetailsDeleteResponse>;

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
            if (params.FirmsType?.trim()) queryParams.append('FirmsType', params.FirmsType.trim());
            if (params.ContactPerson?.trim()) queryParams.append('ContactPerson', params.ContactPerson.trim());
            if (params.MobileNumber?.trim()) queryParams.append('MobileNumber', params.MobileNumber.trim());
            if (params.CityName?.trim()) queryParams.append('CityName', params.CityName.trim());
            if (params.GSTNumber?.trim()) queryParams.append('GSTNumber', params.GSTNumber.trim());
            if (params.CINNumber?.trim()) queryParams.append('CINNumber', params.CINNumber.trim());
            if (params.PANNumber?.trim()) queryParams.append('PANNumber', params.PANNumber.trim());
            if (params.TANNumber?.trim()) queryParams.append('TANNumber', params.TANNumber.trim());

            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${CompanyMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL Company MASTER :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullCompanyMaster(params);
            }

            throw error
        }
    }

    async addUpdateCompanyMaster(formData: FormData): Promise<CompanyMasterSaveResponse> {

        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                CompanyMasterApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE COMPANY MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateCompanyMaster(formData);
            }
            throw error
        }
    }

    async deleteCompanyMaster(params: DeleteCompanyMasterRequest): Promise<CompanyMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                CompanyId: (params.CompanyId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${CompanyMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE COMPANY MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteCompanyMaster(params);

            }

            throw error
        }
    }

    async pullCompanyMasterWithBankDetails(params: FilterWithPaginationCompanyMasterWithBankDetails, signal?: AbortSignal): Promise<CompanyMasterWithBankDetailsListResponse> {
        try {
            const queryParams = new URLSearchParams({
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.CompanyId) queryParams.append('CompanyId', params.CompanyId.toString());
            if (params.CompanyWithBankDetailsId) queryParams.append('CompanyWithBankDetailsId', params.CompanyWithBankDetailsId.toString());
            if (params.BeneficiaryAccountHolderName?.trim()) queryParams.append('BeneficiaryAccountHolderName', params.BeneficiaryAccountHolderName.trim());
            if (params.AccountNumber?.trim()) queryParams.append('AccountNumber', params.AccountNumber.trim());
            if (params.BankName?.trim()) queryParams.append('BankName', params.BankName.trim());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${CompanyMasterApi.PULL_COMPANY_WITH_BANK_DETAILS}?${queryParams.toString()}`, { signal }
            )
            return response;

        } catch (error: any) {

            console.error('ERROR: PULL Company MASTER WITH BANK :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullCompanyMasterWithBankDetails(params);
            }

            throw error
        }
    }

    async addUpdateCompanyMasterWithBankDetails(formData: FormData): Promise<CompanyMasterWithBankDetailsSaveResponse> {
        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                CompanyMasterApi.ADD_UPDATE_COMPANY_WITH_BANK_DETAILS,
                formData
            )
            return response;

        } catch (error: any) {

            console.error('ERROR: ADD UPDATE Company MASTER WITH BANK:', error);

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateCompanyMasterWithBankDetails(formData);
            }
            throw error
        }
    }

    async deleteCompanyMasterWithBankDetails(params: DeleteCompanyMasterWithBankDetailsRequest): Promise<CompanyMasterWithBankDetailsDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                CompanyId: (params.CompanyId ?? 0).toString(),
                CompanyWithBankDetailsId: (params.CompanyWithBankDetailsId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${CompanyMasterApi.DELETE_COMPANY_WITH_BANK_DETAILS}?${queryParams.toString()}`
            )

            return response;

        } catch (error: any) {

            console.error('ERROR: DELETE Company MASTER WITH BANK:', error);

            if (error instanceof TokenExpiredException) {

                return await this.deleteCompanyMasterWithBankDetails(params);
            }
            throw error
        }
    }
}