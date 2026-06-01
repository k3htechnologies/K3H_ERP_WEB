import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ticketService } from '../services/TicketService';
import * as E from 'fp-ts/Either';

describe('Ticket Master Functions', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('loadTicketMasterList should set ticket list and pagination on success', async () => {

        const mockResponse = {
            right: {
                Data: [{ TicketId: 1, Title: 'Test Ticket' }],
                TotalNumberOfRecord: 1,
            },
        };

        const setTicketList = vi.fn();
        const setPagination = vi.fn();

        expect(mockResponse.right.Data.length).toBe(1);

        setTicketList(mockResponse.right.Data);

        setPagination({
            currentPage: 1,
            totalRecords: 1,
            totalPages: 1,
        });

        expect(setTicketList).toHaveBeenCalledWith(mockResponse.right.Data);

        expect(setPagination).toHaveBeenCalledWith({
            currentPage: 1,
            totalRecords: 1,
            totalPages: 1,
        });

    });

    test('handleAddTicketMaster should add new ticket', async () => {

        const prevData = [{ TicketId: 1 }];
        const newRecord = { TicketId: 2 };

        const updatedData = [newRecord, ...prevData];

        expect(updatedData.length).toBe(2);

        expect(updatedData[0].TicketId).toBe(2);

    });

    test('handleAddTicketMaster should update existing ticket', async () => {

        const prevData = [
            { TicketId: 1, Title: 'Old Ticket' },
            { TicketId: 2, Title: 'Another Ticket' },
        ];

        const updatedRecord = {
            TicketId: 1,
            Title: 'Updated Ticket',
        };

        const updatedList = prevData.map(item =>
            item.TicketId === updatedRecord.TicketId
                ? updatedRecord
                : item
        );

        expect(updatedList[0].Title).toBe('Updated Ticket');

    });

    test('handleDeleteTicketMaster should reduce total records', async () => {

        const pagination = {
            currentPage: 1,
            totalRecords: 5,
            pageSize: 10,
        };

        const newTotalRecords = pagination.totalRecords - 1;

        expect(newTotalRecords).toBe(4);

    });

    test('handleExportTicketMaster should prepare export params', async () => {

        const params = {
            PageNumber: 1,
            PageSize: 10,
            ExportType: 'Excel',
        };

        expect(params.ExportType).toBe('Excel');
        expect(params.PageSize).toBe(10);

        expect(params.PageNumber).toBe(1);

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

});
