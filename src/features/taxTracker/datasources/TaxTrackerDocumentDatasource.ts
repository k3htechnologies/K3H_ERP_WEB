import baseClient from "@/core/config/baseClient";
import type { DeleteTaxTrackerDocumentRequest, FilterWithPaginationTaxTrackerDocumentRequest, TaxTrackerDocumentDeleteResponse, TaxTrackerDocumentListResponse, TaxTrackerDocumentSaveResponse } from "@/features/taxTracker/models/TaxTrackerDocumentModel";
import { TaxTrackerDocumentApi } from "@/features/taxTracker/api/TaxTrackerDocumentApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class TaxTrackerDocumentDatasource {

    abstract pullTaxTrackerDocument(params: FilterWithPaginationTaxTrackerDocumentRequest, signal?: AbortSignal): Promise<TaxTrackerDocumentListResponse>;
    abstract addUpdateTaxTrackerDocument(formData: FormData): Promise<TaxTrackerDocumentSaveResponse>;
    abstract deleteTaxTrackerDocument(params: DeleteTaxTrackerDocumentRequest): Promise<TaxTrackerDocumentDeleteResponse>;
}

export class TaxTrackerDocumentDatasourceImpl implements TaxTrackerDocumentDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullTaxTrackerDocument(params: FilterWithPaginationTaxTrackerDocumentRequest, signal?: AbortSignal): Promise<TaxTrackerDocumentListResponse> {

        try {

            const queryParams = new URLSearchParams();

            if (params.TaxTrackerId) queryParams.append('TaxTrackerId', params.TaxTrackerId.toString());
            if (params.TaxTrackerDocumentId) queryParams.append('TaxTrackerDocumentId', params.TaxTrackerDocumentId.toString());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TaxTrackerDocumentApi.PULL}?${queryParams.toString()}`,
                { signal }
            )

            return response

        } catch (error: any) {

            console.error('ERROR: PULL TAX TRACKER DOCUMENT :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullTaxTrackerDocument(params);
            }

            throw error
        }
    }

    async addUpdateTaxTrackerDocument(formData: FormData): Promise<TaxTrackerDocumentSaveResponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                TaxTrackerDocumentApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE TAX TRACKER DOCUMENT :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateTaxTrackerDocument(formData);
            }
            throw error
        }
    }

    async deleteTaxTrackerDocument(params: DeleteTaxTrackerDocumentRequest): Promise<TaxTrackerDocumentDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({

                TaxTrackerId: (params.TaxTrackerId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                TaxTrackerDocumentId: (params.TaxTrackerDocumentId ?? 0).toString(),

            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${TaxTrackerDocumentApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE TAX TRACKER DOCUMENT :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteTaxTrackerDocument(params);

            }

            throw error
        }
    }
}