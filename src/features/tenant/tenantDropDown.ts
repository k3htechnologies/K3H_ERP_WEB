import * as E from 'fp-ts/Either';
import { tenantService } from '@/features/tenant/services/TenantService';

export const fetchTenantBySystemGeneratedCode = async (systemGeneratedCode?: string,projectId?:number,tenantId?:number,BuildingId?:number) => {

    const responseEither = await tenantService.apiCallPullTenant({
        PageSize: 1,
        PageNumber: 1,
        ProjectId:projectId,
        IsCheckPermission: false,
        SystemGeneratedCode: systemGeneratedCode?.trim(),
        TenantId: tenantId,
        BuildingId: BuildingId,
    });

    if (E.isLeft(responseEither)) return null;

    return responseEither.right.Data?.[0] || null;

};
