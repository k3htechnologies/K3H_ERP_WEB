import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { NoticeSectionMasterApi } from '@/features/noticeSectionMaster/api/NoticeSectionMasterApi'
import type {
    FilterWithPaginationNoticeSectionMasterRequest,
    AddUpdateNoticeSectionMasterRequest,
    DeleteNoticeSectionMasterRequest,
    NoticeSectionMasterSaveResponse,
    NoticeSectionMasterDeleteResponse,
    NoticeSectionMasterListResponse
} from '@/features/noticeSectionMaster/models/NoticeSectionMasterModel'

export abstract class NoticeSectionMasterDatasource {
    abstract pullNoticeSectionMaster(params: FilterWithPaginationNoticeSectionMasterRequest, signal?: AbortSignal): Promise<NoticeSectionMasterListResponse>;
    abstract addUpdateNoticeSectionMaster(params: AddUpdateNoticeSectionMasterRequest): Promise<NoticeSectionMasterSaveResponse>;
    abstract deleteNoticeSectionMaster(params: DeleteNoticeSectionMasterRequest): Promise<NoticeSectionMasterDeleteResponse>;
}

export class NoticeSectionMasterDatasourceImpl implements NoticeSectionMasterDatasource {

    private get k3hHttpClient() {
        return baseClient
    }

    async pullNoticeSectionMaster(params: FilterWithPaginationNoticeSectionMasterRequest, signal?: AbortSignal): Promise<NoticeSectionMasterListResponse> {
        try {

            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.NoticeSectionMasterId) queryParams.append('NoticeSectionMasterId', params.NoticeSectionMasterId.toString());
            if (params.NoticeSection?.trim()) queryParams.append('NoticeSection', params.NoticeSection.trim());
            if (params.GovernmentCompliance?.trim()) queryParams.append('GovernmentCompliance', params.GovernmentCompliance.trim());

            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${NoticeSectionMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
        } catch (error: any) {

            console.error('ERROR: PULL NOTICE SECTION MASTER :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullNoticeSectionMaster(params);
            }

            throw error
        }
    }

    async addUpdateNoticeSectionMaster(params: AddUpdateNoticeSectionMasterRequest): Promise<NoticeSectionMasterSaveResponse> {

        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(NoticeSectionMasterApi.ADD_UPDATE, params);

        } catch (error) {

            console.error('ERROR: ADD UPDATE NOTICE SECTION MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateNoticeSectionMaster(params);
            }
            throw error
        }
    }

    async deleteNoticeSectionMaster(params: DeleteNoticeSectionMasterRequest): Promise<NoticeSectionMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                NoticeSectionMasterId: (params.NoticeSectionMasterId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            return await this.k3hHttpClient.deleteRequestWithAuthentication(`${NoticeSectionMasterApi.DELETE}?${queryParams.toString()}`);

        } catch (error) {

            console.error('ERROR: DELETE NOTICE SECTION MASTER :', error);

            if (error instanceof TokenExpiredException) {

                return await this.deleteNoticeSectionMaster(params);

            }

            throw error
        }
    }
}