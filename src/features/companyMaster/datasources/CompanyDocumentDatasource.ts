import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { CompanyMasterApi } from '@/features/companyMaster/api/CompanyMasterApi'
import type {
    FilterWithPaginationCompanyDocumentRequest,
    CompanyDocumentListResponse,
    DeleteCompanyDocumentRequest,
    CompanyDocumentDeleteResponse,
    CompanyDocumentSaveResponse,
} from '@/features/companyMaster/models/CompanyDocumentModel'

export abstract class CompanyDocumentDatasource {


    abstract pullCompanyDocument(params: FilterWithPaginationCompanyDocumentRequest): Promise<CompanyDocumentListResponse>;
    abstract addUpdateCompanyDocument(params: FormData): Promise<CompanyDocumentSaveResponse>;
    abstract deleteCompanyDocument(params: DeleteCompanyDocumentRequest): Promise<CompanyDocumentDeleteResponse>;
}

export class CompanyDocumentDatasourceImpl implements CompanyDocumentDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullCompanyDocument(params: FilterWithPaginationCompanyDocumentRequest): Promise<CompanyDocumentListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.CompanyId) queryParams.append('CompanyId', params.CompanyId.toString());
            if (params.CompanyDocumentId) queryParams.append('CompanyDocumentId', params.CompanyDocumentId.toString());
            if (params.DocumentName?.trim()) queryParams.append('DocumentName', params.DocumentName.trim());
             if (params.FinancialYear?.trim()) queryParams.append('FinancialYear', params.FinancialYear.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${CompanyMasterApi.PULL_COMPANY_DOCUMENT}?${queryParams.toString()}`
            )

            return response
        } catch (error) {

            console.error('Error: Pull COMPANY DOCUMENT :', error);

            if (error instanceof TokenExpiredException) {

                return   await this.pullCompanyDocument(params);
            }

            throw error
        }
    }

    async addUpdateCompanyDocument(params: FormData): Promise<CompanyDocumentSaveResponse> {

        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                CompanyMasterApi.ADD_UPDATE_COMPANY_DOCUMENT,
                params
            )

            return response
        } catch (error) {
            console.error('Error: Add Update COMPANY DOCUMENT:', error)

            if (error instanceof TokenExpiredException) {

                return   await this.addUpdateCompanyDocument(params);
            }
            throw error
        }
    }
    async deleteCompanyDocument(params: DeleteCompanyDocumentRequest): Promise<CompanyDocumentDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                CompanyDocumentId: (params.CompanyDocumentId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
                CompanyId: (params.CompanyId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${CompanyMasterApi.DELETE_COMPANY_DOCUMENT}?${queryParams.toString()}`
            )

            return response;

        } catch (error) {

            console.error('ERRPR : DELETE COMPANY DOCUMENT:', error)

            if (error instanceof TokenExpiredException) {

                return   await this.deleteCompanyDocument(params);
            }

            throw error
        }
    }

}
