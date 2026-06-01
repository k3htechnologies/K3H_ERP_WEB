import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import SalesDashboard from '../pages/SalesDashboard';
import * as E from 'fp-ts/Either';

import { salesDashboardService } from '../services/SalesDashboardServices';

vi.mock('@/features/salesDashboard/services/SalesDashboardServices',
    () => ({
        salesDashboardService: {
            apiCallPullSalesDashboard: vi.fn(),
        }
    })

);

vi.mock('@/core/hooks/useToast', () => ({
    useToast: () => ({
        addToast: vi.fn(),
    }),
}));

vi.mock('@/features/projectMaster/context/ProjectContext', () => ({
    ProjectContext: {
        Provider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    },
    useProject: () => ({ projectId: 1 }),
}));


vi.mock('@/features/salesDashboard/components/Enquiries', () => ({
    default: () => <div>Enquiries Component</div>,
}))

describe('Testing no data scenario in dashboard', () => {
    test('renders empty data dashboard', async () => {

        vi.mocked(salesDashboardService.apiCallPullSalesDashboard)
            .mockResolvedValueOnce(
                E.right({
                    Data: {
                        Table0: [],
                        Table1: [],
                        Table2: [],
                        Table3: [],
                        IsSuccess: true,
                        HttpStatusCode: 200,
                        SuccessMessage: ["Data fetched successfully"],
                        ErrorMessage: [],
                        WarningMessage: [],
                    },
                }) as any
            );
        render(<SalesDashboard />);

        await waitFor(() => {

            expect(salesDashboardService.apiCallPullSalesDashboard).toHaveBeenCalled();

        });

        expect(screen.getByText('Enquiries Component')).toBeInTheDocument();
        expect(screen.getByText('Closing Target')).toBeInTheDocument();
        expect(screen.getByText('Sourcing Target')).toBeInTheDocument();

    })


})
