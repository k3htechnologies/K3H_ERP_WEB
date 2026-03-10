export const BrokerageInvoiceApi = {

    PULL_BOOKING: '/Brokerage/PullBrokerageBooking',

    PULL: '/Brokerage/PullBrokerageInvoice',
    ADD_UPDATE: '/Brokerage/AddUpdateBrokerageInvoice',
    DELETE: '/Brokerage/DeleteBrokerageInvoice'

} as const

export type BrokerageInvoiceApiKeys = keyof typeof BrokerageInvoiceApi