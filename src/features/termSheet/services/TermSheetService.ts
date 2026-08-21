import type { Failure } from '@/core/api/FailureResponse'

import { TermSheetDatasourceImpl } from '@/features/termSheet/datasources/TermSheetDatasource'

import type {
    FilterWithPaginationTermSheetRequest,
    DeleteTermSheetRequest,

    AddUpdateTermSheetDisbursedAmountDetailsRequest,
    DeleteTermSheetDisbursedAmountDetailsRequest,

    AddUpdateTermSheetSweepRatioDetailsRequest,
    DeleteTermSheetSweepRatioDetailsRequest,

    AddUpdateTermSheetDirectSellingAgentRequest,
    DeleteTermSheetDirectSellingAgentRequest,

    FinalizeTermSheetDetails,

    TermSheetListResponse,
    TermSheetViewResponse,
    TermSheetSaveResponse,
    TermSheetDeleteResponse,

    TermSheetDisbursedAmountSaveResponse,
    TermSheetSweepRatioSaveResponse,
    TermSheetDirectSellingAgentSaveResponse,
    TermSheetFinalApprovalResponse,
    TermSheetRepayLedgerSaveResponse,
    AddUpdateTermSheetRepayLedgerRequest,
    DeleteTermSheetRepayLedgerRequest,
    DeleteTermSheetDebtServiceReserveAccountRequest,
    TermSheetDebtServiceReserveAccountSaveResponse,
    AddUpdateTermSheetDebtServiceReserveAccountRequest

} from '@/features/termSheet/models/TermSheetModel'

import * as E from 'fp-ts/Either'


const termSheetDatasource = new TermSheetDatasourceImpl()

export const termSheetService = {

    apiCallPullTermSheet: async (params: FilterWithPaginationTermSheetRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TermSheetListResponse>> => {

        try {

            return E.right(await termSheetDatasource.pullTermSheet(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },


    apiCallPullTermSheetView: async (params: { ProjectId?: number, TermSheetId?: number }, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TermSheetViewResponse>> => {

        try {

            return E.right(await termSheetDatasource.pullTermSheetView(params, options?.signal))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },


    apiCallAddUpdateTermSheet: async (data: FormData): Promise< E.Either<Failure, TermSheetSaveResponse>> => {

        try {

            return E.right(await termSheetDatasource.addUpdateTermSheet(data))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallDeleteTermSheet: async (params: DeleteTermSheetRequest): Promise< E.Either<Failure, TermSheetDeleteResponse>> => {

        try {

            return E.right( await termSheetDatasource.deleteTermSheet(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },


    apiCallAddUpdateTermSheetDisbursedAmountDetails: async (params: AddUpdateTermSheetDisbursedAmountDetailsRequest): Promise< E.Either< Failure,TermSheetDisbursedAmountSaveResponse>> => {

        try {

            return E.right(await termSheetDatasource .addUpdateTermSheetDisbursedAmountDetails( params))


        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },


    apiCallDeleteTermSheetDisbursedAmountDetails: async (params: DeleteTermSheetDisbursedAmountDetailsRequest): Promise< E.Either<Failure, TermSheetDeleteResponse>> => {

        try {

            return E.right(await termSheetDatasource  .deleteTermSheetDisbursedAmountDetails(params ))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },


    apiCallAddUpdateTermSheetSweepRatioDetails: async ( params: AddUpdateTermSheetSweepRatioDetailsRequest): Promise<E.Either<Failure,TermSheetSweepRatioSaveResponse>> => {

        try {

            return E.right(await termSheetDatasource.addUpdateTermSheetSweepRatioDetails( params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallDeleteTermSheetSweepRatioDetails: async (params: DeleteTermSheetSweepRatioDetailsRequest): Promise<E.Either<Failure, TermSheetDeleteResponse>> => {

        try {

            return E.right(await termSheetDatasource.deleteTermSheetSweepRatioDetails(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },


    apiCallAddUpdateTermSheetDirectSellingAgent: async (params: AddUpdateTermSheetDirectSellingAgentRequest): Promise<E.Either<Failure, TermSheetDirectSellingAgentSaveResponse>> => {

        try {

            return E.right(await termSheetDatasource.addUpdateTermSheetDirectSellingAgent(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },


    apiCallDeleteTermSheetDirectSellingAgent: async (params: DeleteTermSheetDirectSellingAgentRequest): Promise<E.Either<Failure, TermSheetDeleteResponse>> => {

        try {

            return E.right(await termSheetDatasource.deleteTermSheetDirectSellingAgent(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddUpdateTermSheetRepayLedger: async (params: AddUpdateTermSheetRepayLedgerRequest): Promise<E.Either<Failure, TermSheetRepayLedgerSaveResponse>> => {

        try {

            return E.right(await termSheetDatasource.addUpdateTermSheetRepayLedger(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallDeleteTermSheetRepayLedger: async (params: DeleteTermSheetRepayLedgerRequest): Promise<E.Either<Failure, TermSheetDeleteResponse>> => {

        try {

            return E.right(await termSheetDatasource.deleteTermSheetRepayLedger(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },
    apiCallAddUpdateTermSheetDebtServiceReserveAccount: async (params: AddUpdateTermSheetDebtServiceReserveAccountRequest): Promise<E.Either<Failure, TermSheetDebtServiceReserveAccountSaveResponse>> => {

        try {

            return E.right(await termSheetDatasource.addUpdateTermSheetDebtServiceReserveAccount(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallDeleteTermSheetDebtServiceReserveAccount: async (params: DeleteTermSheetDebtServiceReserveAccountRequest): Promise<E.Either<Failure, TermSheetDeleteResponse>> => {

        try {

            return E.right(await termSheetDatasource.deleteTermSheetDebtServiceReserveAccount(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallFinalizeTermSheetDetails: async (params: FinalizeTermSheetDetails): Promise<E.Either<Failure, TermSheetFinalApprovalResponse>> => {

        try {

            return E.right(await termSheetDatasource.finalizeTermSheetDetails(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    }
}