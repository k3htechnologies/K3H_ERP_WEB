import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { WeekOffMasterApi } from '@/features/weekOffMaster/api/WeekOffMasterApi'
import type {
    FilterWithPaginationWeekOffMasterRequest,
    AddUpdateWeekOffMasterRequest,
    DeleteWeekOffMasterRequest,
    WeekOffMasterListResponse,
    WeekOffMasterSaveResponse,
    WeekOffMasterDeleteResponse
} from '@/features/weekOffMaster/models/WeekOffMasterModel'

export abstract class WeekOffMasterDatasource {

    abstract pullWeekOffMaster(params: FilterWithPaginationWeekOffMasterRequest, signal?: AbortSignal): Promise<WeekOffMasterListResponse>;
    abstract addUpdateWeekOffMaster(data: AddUpdateWeekOffMasterRequest): Promise<WeekOffMasterSaveResponse>;
    abstract deleteWeekOffMaster(params: DeleteWeekOffMasterRequest): Promise<WeekOffMasterDeleteResponse>;
}

export class WeekOffMasterDatasourceImpl implements WeekOffMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullWeekOffMaster(params: FilterWithPaginationWeekOffMasterRequest, signal?: AbortSignal): Promise<WeekOffMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.WeekOffPolicyMasterId) queryParams.append('WeekOffPolicyMasterId', params.WeekOffPolicyMasterId.toString());
            if (params.WeekOffPolicyName?.trim()) queryParams.append('WeekOffPolicyName', params.WeekOffPolicyName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${WeekOffMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL WEEK OFF MASTER :', error);

            if (error instanceof TokenExpiredException) {
                return  await this.pullWeekOffMaster(params);
            }

            throw error
        }
    }

    async addUpdateWeekOffMaster(params: AddUpdateWeekOffMasterRequest): Promise<WeekOffMasterSaveResponse> {

        try {

            const payLoad: AddUpdateWeekOffMasterRequest = {
                WeekOffPolicyMasterId: params.WeekOffPolicyMasterId ?? 0,
                Uniquekey: params.Uniquekey ?? '',

                WeekOffPolicyCode: params.WeekOffPolicyCode?.trim() ?? '',
                WeekOffPolicyName: params.WeekOffPolicyName?.trim() ?? '',
                WeekDays: params.WeekDays ?? 0,
                WeekDaysStartsOn: params.WeekDaysStartsOn ?? '',
                WeeklyOff: params.WeeklyOff ?? '',
                WeeklyOff2: params.WeeklyOff2 ?? '',
                WeeklyOff2Type: params.WeeklyOff2Type ?? '',
                NotApplicableForMonths: params.NotApplicableForMonths ?? '',
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                WeekOffMasterApi.ADD_UPDATE,
                payLoad
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE WEEK OFF MASTER :', error)

            if (error instanceof TokenExpiredException) {
                return  await this.addUpdateWeekOffMaster(params);
            }
            throw error
        }
    }

    async deleteWeekOffMaster(params: DeleteWeekOffMasterRequest): Promise<WeekOffMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                WeekOffPolicyMasterId: (params.WeekOffPolicyMasterId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${WeekOffMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE WEEK OFF MASTER :', error)

            if (error instanceof TokenExpiredException) {
                return await this.deleteWeekOffMaster(params);

            }

            throw error
        }
    }
}
