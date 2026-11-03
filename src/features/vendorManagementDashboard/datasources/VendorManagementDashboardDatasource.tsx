import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type { VendorManagementResponse } from '@/features/vendorManagementDashboard/models/VendorManagementDashboardModel'
import { VendorManagementDashboardApi } from '@/features/vendorManagementDashboard/api/VendorManagementDashboardApi'

export abstract class VendorManagementDashboardDatasource {
    abstract pullVendorManagementDashboard(signal?: AbortSignal): Promise<VendorManagementResponse>;
}

export class VendorManagementDashboardDatasourceImpl implements VendorManagementDashboardDatasource {

    private get k3hHttpClient() {
        return baseClient
    }

    async pullVendorManagementDashboard(signal?: AbortSignal): Promise<VendorManagementResponse> {
        try {

            return await this.k3hHttpClient.getRequestWithAuthentication(`${VendorManagementDashboardApi.PULL}`, { signal })

        } catch (error: any) {

            console.error('ERROR: PULL VENDOR MANAGEMENT DASHBOARD :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullVendorManagementDashboard(signal);
            }
            throw error
        }
    }
} 
