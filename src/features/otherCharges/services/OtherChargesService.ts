
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { OtherChargesDatasourceImpl } from '@/features/otherCharges/datasources/OtherChargesDatasource';
import type { OtherChargesDeleteResponse, OtherChargesListResponse, OtherChargesSaveResponse, DeleteOtherChargesRequest, FilterWithPaginationOtherChargesRequest, AddUpdateOtherChargesRequest } from "@/features/otherCharges/models/OtherChargesModel";

const OtherChargesDatasource = new OtherChargesDatasourceImpl();

export const otherChargesService = {

    apiCallPullOtherCharges: async (params: FilterWithPaginationOtherChargesRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, OtherChargesListResponse>> => {

        try {
            return E.right(await OtherChargesDatasource.pullOtherCharges(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateOtherCharges: async (params: AddUpdateOtherChargesRequest): Promise<E.Either<Failure, OtherChargesSaveResponse>> => {
        try {

            return E.right(await OtherChargesDatasource.addUpdateOtherCharges(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },


    apiCallDeleteOtherCharges: async (params: DeleteOtherChargesRequest): Promise<E.Either<Failure, OtherChargesDeleteResponse>> => {
        try {

            return E.right(await OtherChargesDatasource.deleteOtherCharges(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}