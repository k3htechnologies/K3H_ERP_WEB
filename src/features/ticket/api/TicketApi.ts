export const TicketApi = {
    PULL: "/Ticket/PullTicket",
    ADD_UPDATE: "/Ticket/AddUpdateTicket",
    DELETE: "/Ticket/DeleteTicket",
    ASSIGN_TICKETS: "/Ticket/AssignTicket",
    PULL_ACTIVE_TICKETS: "/Ticket/PullEmployeeActiveTickets"
} as const

export type TicketApiKeys = keyof typeof TicketApi