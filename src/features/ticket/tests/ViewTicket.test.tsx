import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import ViewTicket from '../pages/ViewTicket';

vi.mock('@/features/ticket/services/TicketService', () => ({
    ticketService: {
        apiCallPullTicket: vi.fn(() =>
            Promise.resolve({
                _tag: 'Right',
                right: {
                    Data: [
                        {
                            TicketId: 1,
                            Platform: 'Website',
                            Module: '',
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
                },
            })
        ),
    },
}));

vi.mock('@/features/ticket/context/TicketListStateContext', () => ({
    useTicketListState: () => ({
        listState: {
            TicketId: 1,
            SystemGeneratedCode: 'nikklk',
            Platform: 'Web',
        },
    }),
}));

vi.mock('@/core/hooks/useToast', () => ({
    useToast: () => ({
        addToast: vi.fn(),
    }),
}));

vi.mock('react-router', () => ({
    useNavigate: () => vi.fn(),
}));

vi.mock('@/core/utils', () => ({
    runApiWithLoader: async (
        setIsLoading: any,
        setLoadingMessage: any,
        callback: any
    ) => {
        setIsLoading(true);
        setLoadingMessage('Loading');
        await callback();
        setIsLoading(false);
    },
}));

vi.mock('fp-ts/Either', () => ({
    isRight: (value: any) => value._tag === 'Right',
}));

describe('ViewTicket Component', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders ticket details correctly', async () => {

        render(<ViewTicket />);

        expect(await screen.findByText('Ticketing Details'))
            .toBeInTheDocument();

        expect(screen.getByText('Request Information'))
            .toBeInTheDocument();

    });

    test('renders assignee details section', async () => {

        render(<ViewTicket />);

        await waitFor(() => {

            expect(screen.getByText('Assignee Details')).toBeInTheDocument();

            expect(screen.getByText('John Doe')).toBeInTheDocument();

            expect(screen.getByText('Alex')).toBeInTheDocument();

            expect(screen.getByText('Rahul')).toBeInTheDocument();

        });

    });

    test('renders tracking history status', async () => {

        render(<ViewTicket />);

        await waitFor(() => {

            expect(screen.getByText('Open')).toBeInTheDocument();

        });

    });

});