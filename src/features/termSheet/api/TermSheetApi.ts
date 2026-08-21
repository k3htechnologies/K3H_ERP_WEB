export const TermSheetApi = {

    PULL: '/TermSheet/PullTermSheet',

    PULL_VIEW: '/TermSheet/PullTermSheetView',

    ADD_UPDATE:  '/TermSheet/AddUpdateTermSheet',

    DELETE: '/TermSheet/DeleteTermSheet',

    ADD_UPDATE_DISBURSED_AMOUNT: '/TermSheet/AddUpdateTermSheetDisbursedAmountDetails',

    DELETE_DISBURSED_AMOUNT: '/TermSheet/DeleteTermSheetDisbursedAmountDetails',

    ADD_UPDATE_SWEEP_RADIO: '/TermSheet/AddUpdateTermSheetSweepRatioDetails',

    DELETE_SWEEP_RADIO:  '/TermSheet/DeleteTermSheetSweepRatioDetails',

    ADD_UPDATE_DIRECT_SELLING_AGENT:  '/TermSheet/AddUpdateTermSheetDirectSellingAgent',

    DELETE_DIRECT_SELLING_AGENT: '/TermSheet/DeleteTermSheetDirectSellingAgent',

    ADD_UPDATE_REPAY_LEDGER:  '/TermSheet/AddUpdateTermSheetRepayLedger',

    DELETE_REPAY_LEDGER: '/TermSheet/DeleteTermSheetRepayLedger',

    ADD_UPDATE_DEBT_SERVICE_RESERVE_ACCOUNT:  '/TermSheet/AddUpdateTermSheetDebtServiceReserveAccount',

    DELETE_DEBT_SERVICE_RESERVE_ACCOUNT: '/TermSheet/DeleteTermSheetDebtServiceReserveAccount',

    FINALIZE_TERM_SHEET: '/TermSheet/FinalizeTermSheetDetails',

    PULL_TERM_SHEET_DOCUMENT: '/TermSheetDocument/PullTermSheetDocument',

    ADD_UPDATE_TERM_SHEET_DOCUMENT: '/TermSheetDocument/AddUpdateTermSheetDocument',
    
    DELETE_TERM_SHEET_DOCUMENT: '/TermSheetDocument/DeleteTermSheetDocument',


} as const

export type TermSheetApiKeys = keyof typeof TermSheetApi