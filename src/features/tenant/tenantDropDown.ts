import * as E from 'fp-ts/Either';
import { tenantService } from '@/features/tenant/services/TenantService';

export const fetchTenantBySystemGeneratedCode = async (systemGeneratedCode?: string,projectId?:number,tenantId?:number,BuildingId?:number) => {

    const responseEither = await tenantService.apiCallPullTenantById({
        ProjectId:projectId,
        SystemGeneratedCode: systemGeneratedCode?.trim(),
        TenantId: tenantId,
        BuildingId: BuildingId,
    });

    if (E.isLeft(responseEither)) return null;

    return responseEither.right.Data?.[0] || null;

};
