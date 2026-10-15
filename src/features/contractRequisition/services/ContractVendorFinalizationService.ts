import * as E from 'fp-ts/Either';

import type { Failure } from "@/core/api/FailureResponse";
import type { VendorListResponse } from "@/features/vendor/models/VendorModel";
import type { AddVendorForContractRequisitionEnquiryRequest, FilterWithPaginationVendorForEnquiryRequest, FilterWithPaginationVendorForSelectedEnquiryRequest, RevokeFinalizationContractVendorRequest, SelectedVendorListResponse } from "@/features/contractRequisition/models/ContractVendorFinalizeModel";
import { ContractVendorFinalizationDatasourceImpl } from "@/features/contractRequisition/datasources/ContractVendorFinalizationDataSource";

const ContractVendorFinalizationDatasource = new ContractVendorFinalizationDatasourceImpl

export const contractVendorFinalizationService = {

    apiCallpullVendorsForEnquiry: async (params: FilterWithPaginationVendorForEnquiryRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, VendorListResponse>> => {
        try {

            return E.right(await ContractVendorFinalizationDatasource.pullVendorsForEnquiry(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallToAddVendorForEnquiry: async (payload: AddVendorForContractRequisitionEnquiryRequest): Promise<E.Either<Failure, VendorListResponse>> => {
        try {

            return E.right(await ContractVendorFinalizationDatasource.addVendorForEnquiry(payload));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullSelectedVendorForEnquiry: async (params: FilterWithPaginationVendorForSelectedEnquiryRequest): Promise<E.Either<Failure, SelectedVendorListResponse>> => {
        try {

            return E.right(await ContractVendorFinalizationDatasource.pullSelectedVendorForEnquiry(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }

    },

    apiCallAddFinalizedVendor: async (payload: AddVendorForContractRequisitionEnquiryRequest): Promise<E.Either<Failure, VendorListResponse>> => {
        try {

            return E.right(await ContractVendorFinalizationDatasource.addFinalizedVendor(payload));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });


        }
    },

    apiCallPullFinalizedVendor: async (params: FilterWithPaginationVendorForEnquiryRequest): Promise<E.Either<Failure, VendorListResponse>> => {
        try {

            return E.right(await ContractVendorFinalizationDatasource.pullFinalizedVendor(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallRevokeFinalizationVendor: async (params: RevokeFinalizationContractVendorRequest): Promise<E.Either<Failure, VendorListResponse>> => {
        try {

            return E.right(await ContractVendorFinalizationDatasource.revokeFinalizedVendor(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }
}