import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import * as E from "fp-ts/Either";
import PayrollDashboard from "../pages/PayrollDashboard";
import { payrollDashboardService } from "../services/PayrollDashboardServices";

vi.mock('@/features/payrollDashboard/services/PayrollDashboardServices',
    () => ({
        payrollDashboardService: {
            apiCallPullPayrollDashboard: vi.fn(),
        }
    })
)

vi.mock('@/core/hooks/useToast', () => ({
    useToast: () => ({
        addToast: vi.fn(),
    }),
}));

vi.mock('@/features/payrollDashboard/components/OverviewCards', () => ({
    default: () => <div>OverviewCards Component</div>

}))

describe('Payroll Dashboard ', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    })

    test('rendering payroll dashboard data', async () => {
        vi.mocked(payrollDashboardService.apiCallPullPayrollDashboard)
            .mockResolvedValueOnce(
                E.right({
                    Data: {
                        Table0: [{}],
                        Table1: [{}],
                        Table2: [{}],
                        Table3: [{}],
                        Table4: [{}],
                        Table5: [{}],
                        Table6: [{}],
                        IsSuccess: true,
                        HttpStatusCode: 200,
                        SuccessMessage: ["Data fetched successfully"],
                        ErrorMessage: [],
                        WarningMessage: [],
                    },
                }) as any
            );

        render(<PayrollDashboard />);

        await waitFor(() => {
            expect(payrollDashboardService.apiCallPullPayrollDashboard).toHaveBeenCalled();
        })

        expect(screen.getByText('Overview')).toBeInTheDocument();
    })

})




