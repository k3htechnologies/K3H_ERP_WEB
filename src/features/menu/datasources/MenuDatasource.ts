import type { ApiResponse } from '../../../core/api/ApiResponse'
import baseClient from '../../../core/config/baseClient'
import { MenuApi } from '../api/MenuApi'
import type { ModuleData, PullMenuRequest } from '../models/MenuModel'

export abstract class MenuDatasource {

    abstract pullMenu(params: PullMenuRequest): Promise<ApiResponse<ModuleData>>;
}

export class MenuDatasourceImpl implements MenuDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullMenu(params: PullMenuRequest): Promise<ApiResponse<ModuleData>> {
        try {
            
            const queryParams = new URLSearchParams({
                EmployeeId: (params.EmployeeId).toString(),
            });

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${MenuApi.PULL}?${queryParams.toString()}`
            );

            return response as ApiResponse<ModuleData>;

        } catch (error) {

            console.error('ERROR :PULL MENU:', error);
            throw error
        }
    }
}
