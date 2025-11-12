import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type { AddUpdateEmployeeModuleAccessRequest, EmployeeModuleAccessListResponse, EmployeeModuleAccessSaveResponse, PullEmployeeModuleAccessRequest } from '@/features/employeeModuleAccess/models/EmployeeModuleAccessModel';
import { EmployeeModuleAccessApi } from '../api/EmployeeModuleAccessApi';

export abstract class EmployeeModuleAccessDatasource {

    abstract pullEmployeeModuleAccess(params: PullEmployeeModuleAccessRequest): Promise<EmployeeModuleAccessListResponse>;
    abstract addUpdateEmployeeModuleAccess(data: AddUpdateEmployeeModuleAccessRequest): Promise<EmployeeModuleAccessSaveResponse>;
}

export class EmployeeModuleAccessDatasourceImpl implements EmployeeModuleAccessDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullEmployeeModuleAccess(params: PullEmployeeModuleAccessRequest): Promise<EmployeeModuleAccessListResponse> {
        try {
            const queryParams = new URLSearchParams({
                DesignationMasterId: (params.DesignationMasterId ?? 0).toString()
            })


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${EmployeeModuleAccessApi.PULL}?${queryParams.toString()}`
            )
            return response;
        } catch (error) {

            console.error('ERROR: PULL EMPLOYEE ACCESS MODULE :', error);

            if (error === TokenExpiredException) {
                await this.pullEmployeeModuleAccess(params);
            }
            throw error
        }
    }

    async addUpdateEmployeeModuleAccess(params: AddUpdateEmployeeModuleAccessRequest): Promise<EmployeeModuleAccessSaveResponse> {

        try {

            const payLoad: AddUpdateEmployeeModuleAccessRequest = {
                DesignationMasterId: params.DesignationMasterId ?? 0,
                ModulesPermissionsJsonList: params.ModulesPermissionsJsonList?.trim() ?? '',
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                EmployeeModuleAccessApi.ADD_UPDATE,
                payLoad
            )

            return response;

        } catch (error) {
            console.error('ERROR: ADD UPDATE EMPLOYEE ACCESS MODULE:', error)

            if (error === TokenExpiredException) {
                await this.addUpdateEmployeeModuleAccess(params);
            }
            throw error
        }
    }

}
