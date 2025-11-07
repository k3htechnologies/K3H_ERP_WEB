import baseClient from '@/core/config/baseClient'
import { MenuApi } from '@/features/menu/api/MenuApi'
import type { ModuleDataListResponse, PullMenuRequest } from '@/features/menu/models/MenuModel'

export abstract class MenuDatasource {

    abstract pullMenu(params: PullMenuRequest): Promise<ModuleDataListResponse>;
}

export class MenuDatasourceImpl implements MenuDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullMenu(params: PullMenuRequest): Promise<ModuleDataListResponse> {
        try {

            const queryParams = new URLSearchParams({
                EmployeeId: (params.EmployeeId).toString(),
            });

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${MenuApi.PULL}?${queryParams.toString()}`
            );

            return response;

        } catch (error) {

            console.error('ERROR :PULL MENU:', error);
            throw error
        }
    }
}
