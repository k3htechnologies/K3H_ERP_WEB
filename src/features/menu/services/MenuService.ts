import type { Failure } from '@/core/api/FailureResponse';
import { MenuDatasourceImpl } from '@/features/menu/datasources/MenuDatasource'
import type { ModuleDataListResponse, PullMenuRequest } from '@/features/menu/models/MenuModel'

import * as E from 'fp-ts/Either';

const menuDatasource = new MenuDatasourceImpl();

export const menuService = {

    apiCallPullMenu: async (params: PullMenuRequest): Promise<E.Either<Failure, ModuleDataListResponse>> => {
        try {

            return E.right(await menuDatasource.pullMenu(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
