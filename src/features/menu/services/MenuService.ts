import type { ApiResponse } from '../../../core/api/ApiResponse';
import type { Failure } from '../../../core/api/FailureResponse';
import { MenuDatasourceImpl } from '../datasources/MenuDatasource'
import type { ModuleData, PullMenuRequest } from '../models/MenuModel'

import * as E from 'fp-ts/Either';

const menuDatasource = new MenuDatasourceImpl();

export const menuService = {

    apiCallPullMenu: async (params: PullMenuRequest): Promise<E.Either<Failure, ApiResponse<ModuleData>>> => {
        try {

            return E.right(await menuDatasource.pullMenu(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
