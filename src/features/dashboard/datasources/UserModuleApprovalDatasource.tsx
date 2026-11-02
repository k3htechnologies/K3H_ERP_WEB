import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type { FilterWithPaginationUserApprovalRequest, UserApprovalDashboardListResponse } from '@/features/dashboard/models/UserApprovalModel';
import { UserDashboardApi } from '@/features/dashboard/api/userDashboardApi';


export abstract class UserModuleApprovalDatasource {
    abstract pullUserApproval(params?: FilterWithPaginationUserApprovalRequest, signal?: AbortSignal): Promise<UserApprovalDashboardListResponse>;
}

export class UserModuleApprovalDatasourceImpl implements UserModuleApprovalDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullUserApproval(params?: FilterWithPaginationUserApprovalRequest, signal?: AbortSignal): Promise<UserApprovalDashboardListResponse> {
        try {

            const queryParams = new URLSearchParams();

            if (params?.ExportType) queryParams.append("ExportType", params.ExportType);

            const queryString = queryParams.toString();
            const url = queryString
                ? `${UserDashboardApi.PULL_MODULE_APPROVAL}?${queryString}`
                : UserDashboardApi.PULL_MODULE_APPROVAL;

            return await this.k3hHttpClient.getRequestWithAuthentication(url, { signal })

        } catch (error: any) {

            console.error('ERROR: PULL USER MODULE APPROVAL :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullUserApproval(params, signal);
            }
            throw error
        }
    }
}