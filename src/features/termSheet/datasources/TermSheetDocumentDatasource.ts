import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { TermSheetApi } from '@/features/termSheet/api/TermSheetApi'

import type {
    FilterWithPaginationTermSheetDocumentRequest,
    DeleteTermSheetDocumentRequest,

    TermSheetDocumentListResponse,
    TermSheetDocumentSaveResponse,
    TermSheetDocumentDeleteResponse

} from '@/features/termSheet/models/TermSheetDocumentModel'


export abstract class TermSheetDocumentDatasource {

    abstract pullTermSheetDocument(params: FilterWithPaginationTermSheetDocumentRequest, signal?: AbortSignal): Promise<TermSheetDocumentListResponse>;

    abstract addUpdateTermSheetDocument(params: FormData): Promise<TermSheetDocumentSaveResponse>;

    abstract deleteTermSheetDocument(params: DeleteTermSheetDocumentRequest): Promise<TermSheetDocumentDeleteResponse>;

}

export class TermSheetDocumentDatasourceImpl
    implements TermSheetDocumentDatasource {

    private get k3hHttpClient() {
        return baseClient
    }


    async pullTermSheetDocument(
        params: FilterWithPaginationTermSheetDocumentRequest,
        signal?: AbortSignal
    ): Promise<TermSheetDocumentListResponse> {

        try {

            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ProjectId) { queryParams.append('ProjectId', params.ProjectId.toString()); }
            if (params.TermSheetId) { queryParams.append('TermSheetId', params.TermSheetId.toString()); }
            if (params.TermSheetDetailsId) { queryParams.append('TermSheetDetailsId', params.TermSheetDetailsId.toString()); }
            if (params.TermSheetDocumentId) { queryParams.append('TermSheetDocumentId', params.TermSheetDocumentId.toString()); }
            if (params.DocumentName?.trim()) queryParams.append('DocumentName', params.DocumentName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(`${TermSheetApi.PULL_TERM_SHEET_DOCUMENT}?${queryParams.toString()}`, { signal });


        } catch (error: any) {

            console.error('ERROR: PULL TERM SHEET DOCUMENT:', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullTermSheetDocument(params, signal);
            }

            throw error;
        }
    }


    async addUpdateTermSheetDocument(params: FormData): Promise<TermSheetDocumentSaveResponse> {

        try {

            return await this.k3hHttpClient.multipartRequestWithAuthentication(TermSheetApi.ADD_UPDATE_TERM_SHEET_DOCUMENT, params)

        } catch (error: any) {

            console.error('ERROR: ADD UPDATE TERM SHEET DOCUMENT:', error);

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateTermSheetDocument(params);
            }

            throw error;
        }
    }


    async deleteTermSheetDocument(params: DeleteTermSheetDocumentRequest): Promise<TermSheetDocumentDeleteResponse> {

        try {

            const queryParams = new URLSearchParams({

                TermSheetDocumentId: params.TermSheetDocumentId!.toString(),

                Uniquekey:   params.Uniquekey ?? '',

                ProjectId: params.ProjectId!.toString(),

                TermSheetId:  params.TermSheetId!.toString(),

                TermSheetDetailsId: params.TermSheetDetailsId!.toString()
            })

            return await this.k3hHttpClient.deleteRequestWithAuthentication(  `${TermSheetApi.DELETE_TERM_SHEET_DOCUMENT}?${queryParams.toString()}` );


        } catch (error: any) {

            console.error( 'ERROR: DELETE TERM SHEET DOCUMENT:',  error  );

            if (error instanceof TokenExpiredException) {

                return await this.deleteTermSheetDocument( params );
            }

            throw error;
        }
    }

}