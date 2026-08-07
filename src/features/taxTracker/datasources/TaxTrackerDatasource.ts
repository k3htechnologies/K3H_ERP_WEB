import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {
    FilterWithPaginationTaxTrackerRequest,
    TaxTrackerListResponse,
    TaxTrackerSaveResponse,
    TaxTrackerDeleteResponse,
    DeleteTaxTrackerRequest,


} from '@/features/taxTracker/models/TaxTrackerModel';
import { TaxTrackerApi } from "@/features/taxTracker/api/TaxTrackerApi";

export abstract class TaxTrackerDatasource {
    abstract pullTaxTracker(params: FilterWithPaginationTaxTrackerRequest, signal?: AbortSignal): Promise<TaxTrackerListResponse>;
    abstract addUpadateTaxTracker(formData: FormData): Promise<TaxTrackerSaveResponse>;
    abstract deleteTaxTracker(params: DeleteTaxTrackerRequest): Promise<TaxTrackerDeleteResponse>;
}

export class TaxTrackerDatasourceImpl implements TaxTrackerDatasource {

    private get k3hHttpClient() {
        return baseClient
    }

    async pullTaxTracker(params: FilterWithPaginationTaxTrackerRequest, signal?: AbortSignal): Promise<TaxTrackerListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })
            if (params.TaxTrackerId) queryParams.append('TaxTrackerId', params.TaxTrackerId.toString());
            if (params.GovernmentCompliance) queryParams.append('GovernmentCompliance', params.GovernmentCompliance);
            if (params.CompanyId) queryParams.append('CompanyId', params.CompanyId.toString());
            if (params.CompanyName) queryParams.append('CompanyName', params.CompanyName);
            if (params.NoticeSection) queryParams.append('NoticeSection', params.NoticeSection);
            if (params.FinancialYear) queryParams.append('FinancialYear', params.FinancialYear);
            if (params.NoticeStatus) queryParams.append('NoticeStatus', params.NoticeStatus);
            if (params.FromNoticeDate) queryParams.append('FromNoticeDate', params.FromNoticeDate.toString());
            if (params.ToNoticeDate) queryParams.append('ToNoticeDate', params.ToNoticeDate.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TaxTrackerApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL TAX TRACKER:', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullTaxTracker(params);
            }
            throw error
        }
    }

    async addUpadateTaxTracker(formData: FormData): Promise<TaxTrackerSaveResponse> {

        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                TaxTrackerApi.ADD_UPDATE,
                formData
            )
            return response

        } catch (error) {

            console.error('ERROR:ADD UPDATE TAX TRACKER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpadateTaxTracker(formData);
            }
            throw error
        }
    }

    async deleteTaxTracker(params: DeleteTaxTrackerRequest): Promise<TaxTrackerDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                TaxTrackerId: (params.TaxTrackerId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? '',

            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${TaxTrackerApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE TAX TRACKER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteTaxTracker(params);
            }

            throw error
        }
    }
}


