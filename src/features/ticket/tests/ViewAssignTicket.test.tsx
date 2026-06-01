import { describe, test, expect, vi } from 'vitest';
import { ticketService } from '../services/TicketService';
import * as E from 'fp-ts/Either';

vi.mock('@/features/ticket/services/TicketService', () => ({
    ticketService: {
        apiCallPullTicket: vi.fn(() =>
            Promise.resolve(
                E.right({
                    Data: [
                        {
                            TicketId: 1,
                            Uniquekey: '1',
                            SystemGeneratedCode: '1',
                            Platform: 'Website',
                            Module: 'Login',
                            TicketDescription: 'Login issue',
                            CreatedBy: 'Harshita Srivastava',
                            DepartmentName: 'Information Technology',
                            Priority: 'High',
                            TicketRemark: 'Urgent issue',
                            EmployeeName: 'John Doe',
                            AssignedBy: 'Manager',
                            CollaboratorsName: 'Alex,Rahul',
                            AssignedRemark: 'Please fix quickly',
                            AssignedStatus: 'Open',
                            CreatedDate: '2026-05-22',
                            ModifiedDate: '2026-05-22',
                        },
                    ],
                    SuccessMessage: ['Data fetched successfully'],
                    IsSuccess: true,
                    TotalNumberOfRecord: 1,
                    HttpStatusCode: 200,
                    ErrorMessage: [],
                    WarningMessage: []
                })
            )
        )
    }
}));

describe('TicketService Mock', () => {
    test('apiCallPullTicket returns expected data structure', async () => {
        const params = { PageNumber: 1, PageSize: 1, TicketId: 1 };

        const response = await ticketService.apiCallPullTicket(params);

        if (E.isRight(response)) {
            expect(response.right).toHaveProperty('Data');
            expect(response.right.Data).toHaveLength(1);

            const ticket = response.right.Data[0];
            expect(ticket).toMatchObject({
                TicketId: 1,
                Platform: 'Website',
                Module: 'Login',
                Priority: 'High',
                AssignedStatus: 'Open'
            });
        } else {
            expect.fail('Expected Right but got Left');
        }
    });

    test('apiCallPullTicket was called with correct parameters', async () => {
        const params = { PageNumber: 1, PageSize: 1, TicketId: 1 };

        vi.clearAllMocks();

        await ticketService.apiCallPullTicket(params);

        expect(ticketService.apiCallPullTicket).toHaveBeenCalledWith(params);
        expect(ticketService.apiCallPullTicket).toHaveBeenCalledTimes(1);
    });
});

describe('Check Empty Array Status', () => {
    test('returns empty data array', async () => {

        const mockParams = {
            PageNumber: 1,
            PageSize: 1,
            TicketId: 1
        }

        vi.mocked(ticketService.apiCallPullTicket).mockResolvedValueOnce(
            E.right({
                Data: [],
                SuccessMessage: [],
                IsSuccess: true,
                TotalNumberOfRecord: 0,
                HttpStatusCode: 200,
                ErrorMessage: [],
                WarningMessage: []
            })
        );

        const response = await ticketService.apiCallPullTicket(mockParams);
        console.log("response", response);

        if (E.isRight(response)) {
            expect(response.right.Data).toHaveLength(0);
        }

    });

})
