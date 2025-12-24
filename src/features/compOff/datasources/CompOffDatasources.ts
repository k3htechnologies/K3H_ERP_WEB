import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { CompOffApi } from '@/features/compOff/api/CompOffApi'
import type {
    FilterWithPaginationCompOff,
    AddUpdateCompOff,
    DeleteCompOffRequest,
    CompOffListResponse,
    CompOffSaveResponse,
    CompOffDeleteResponse,
} from '@/features/compOff/models/compOff'

export abstract class CompOffDatasource {

    abstract pullCompOff(params: FilterWithPaginationCompOff, signal?: AbortSignal): Promise<CompOffListResponse>;
    abstract addUpdateCompOff(data: AddUpdateCompOff): Promise<CompOffSaveResponse>;
    abstract deleteCompOff(params: DeleteCompOffRequest): Promise<CompOffDeleteResponse>;
}

export class CompOffDatasourceImpl implements CompOffDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullCompOff(params: FilterWithPaginationCompOff, signal?: AbortSignal): Promise<CompOffListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                CompOffId: (params.CompOffId ?? 0).toString(),
            })

            if (params.StartDate?.trim()) queryParams.append('StartDate', params.StartDate.trim());
            if (params.EndDate?.trim()) queryParams.append('EndDate', params.EndDate.trim());
            if (params.Reason?.trim()) queryParams.append('Reason', params.Reason.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${CompOffApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL COMP OFF :', error);

            if (error === TokenExpiredException) {
                await this.pullCompOff(params);
            }

            throw error
        }
    }

    async addUpdateCompOff(params: AddUpdateCompOff): Promise<CompOffSaveResponse> {

        try {

            const payLoad: AddUpdateCompOff = {
                CompOffId: params.CompOffId ?? 0,
                Uniquekey: params.Uniquekey && params.Uniquekey.trim() !== '' 
                    ? params.Uniquekey.trim() 
                    : '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                CompOffDate: params.CompOffDate?.trim() || null,
                RequestDate: params.RequestDate?.trim() || null,
                Reason: params.Reason?.trim() || null,
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                CompOffApi.ADD_UPDATE,
                payLoad
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE COMP OFF :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateCompOff(params);
            }
            throw error
        }
    }

    async deleteCompOff(params: DeleteCompOffRequest): Promise<CompOffDeleteResponse> {

        try {

            const payLoad: DeleteCompOffRequest = {
                CompOffId: params.CompOffId ?? null,
                Uniquekey: params.Uniquekey && params.Uniquekey.trim() !== '' 
                    ? params.Uniquekey.trim() 
                    : '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                CompOffApi.DELETE,
                payLoad
            )

            return response
        } catch (error) {

            console.error('ERROR: DELETE COMP OFF :', error)

            if (error === TokenExpiredException) {
                await this.deleteCompOff(params);
            }
            throw error
        }
    }
}
