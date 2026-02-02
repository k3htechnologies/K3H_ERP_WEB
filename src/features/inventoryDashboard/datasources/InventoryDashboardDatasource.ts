import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { InventoryDashboardApi } from '@/features/inventoryDashboard/api/InventoryDashboardApi';
import type { InventoryDashboardDatasetResponse } from '@/features/inventoryDashboard/models/InventoryDashboardModel';

export abstract class InventoryDashboardDatasource {

    abstract pullInventoryDashboard(ProjectId: number, signal?: AbortSignal): Promise<InventoryDashboardDatasetResponse>;
}

export class InventoryDashboardDatasourceImpl implements InventoryDashboardDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullInventoryDashboard(ProjectId: number, signal?: AbortSignal): Promise<InventoryDashboardDatasetResponse> {
        try {

            const queryParams = new URLSearchParams({
                ProjectId: ProjectId.toString()
            })


            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${InventoryDashboardApi.PULL}?${queryParams.toString()}`, { signal } )

            return response;

        } catch (error: any) {

            console.error('ERROR: PULL INVENTORY DASHBOARD :', error);

            if (error === TokenExpiredException) {
                await this.pullInventoryDashboard(ProjectId);
            }

            throw error
        }
    }

}
