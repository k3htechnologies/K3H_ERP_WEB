import type { Failure } from '@/core/api/FailureResponse';
import { EmployeeMasterDatasourceImpl } from '@/features/employeeMaster/datasources/EmployeeMasterDatasource'
import type {
    FilterWithPaginationEmployeeMasterRequest,
    AddUpdateEmployeeMasterRequest,
    EmployeeMasterListResponse,

    LocationResponse,
    EmployeeMPINRequestResponse,
    SetEmployeeMPINRequest,
    UpdateEmployeeMasterRequest,
    EmployeeMasterUpdateResponse,
    UpdateEmployeeProfilePhoto,
    UpdateEmployeeProfilePhotoSaveResponse
} from '@/features/employeeMaster/models/EmployeeMasterModel';

import * as E from 'fp-ts/Either';

const employeeMasterDatasource = new EmployeeMasterDatasourceImpl();

export const employeeMasterService = {

    apiCallPullLocationHierarchy: async (): Promise<E.Either<Failure, LocationResponse>> => {
        debugger
        try {
            const response = await employeeMasterDatasource.pullLocationHierarchy();
            return E.right(response);
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    },
    apiCallPullEmployeeMaster: async (params: FilterWithPaginationEmployeeMasterRequest): Promise<E.Either<Failure, EmployeeMasterListResponse>> => {
        try {

            return E.right(await employeeMasterDatasource.pullEmployeeMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateEmployeeMaster: async (data: AddUpdateEmployeeMasterRequest): Promise<E.Either<Failure, EmployeeMasterListResponse>> => {
        try {

            return E.right(await employeeMasterDatasource.addUpdateEmployeeMaster(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
    apiCallUpdateEmployeeMaster: async (data: UpdateEmployeeMasterRequest): Promise<E.Either<Failure, EmployeeMasterUpdateResponse>> => {
        try {

            return E.right(await employeeMasterDatasource.updateEmployeeMaster(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },


    apiCallSetEmployeeMPIN: async (data: SetEmployeeMPINRequest): Promise<E.Either<Failure, EmployeeMPINRequestResponse>> => {
        try {

            return E.right(await employeeMasterDatasource.setEmployeeMPIN(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallUpdateEmployeeProfilePhoto: async (data: FormData): Promise<E.Either<Failure, UpdateEmployeeProfilePhotoSaveResponse>> => {
        try {

            return E.right(await employeeMasterDatasource.updateEmployeeProfilePhoto(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
