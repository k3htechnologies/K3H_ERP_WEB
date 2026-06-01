import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import SettingsDashboard from '../pages/SettingsDashboard';
import * as E from 'fp-ts/Either';

import { settingsDashboardService } from '@/features/settingsDashboard/services/SettingsDashboardServices';

vi.mock('@/features/settingsDashboard/services/SettingsDashboardServices',
    () => ({
        settingsDashboardService: {
            apiCallPullSettingsDashboard: vi.fn(),
        },
    })
);

vi.mock('@/core/hooks/useToast', () => ({
    useToast: () => ({
        addToast: vi.fn(),
    }),
}));

vi.mock('@/features/settingsDashboard/components/OverviewCards', () => ({
    default: () => <div>OverviewCards Component</div>,
}));

describe('SettingsDashboard', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders settings dashboard component', async () => {

        vi.mocked(settingsDashboardService.apiCallPullSettingsDashboard)
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
                        Table7: [{}],
                        IsSuccess: true,
                        HttpStatusCode: 200,
                        SuccessMessage: ["Data fetched successfully"],
                        ErrorMessage: [],
                        WarningMessage: [],
                    },
                }) as any
            );

        render(<SettingsDashboard />);

        await waitFor(() => {

            expect(settingsDashboardService.apiCallPullSettingsDashboard).toHaveBeenCalled();

        });

        expect(screen.getByText('OverviewCards Component')).toBeInTheDocument();
        expect(screen.getByText('Procurement Master')).toBeInTheDocument();
        expect(screen.getByText('Company Master')).toBeInTheDocument();
    });


    describe('testing no data scenario in dashboard', () => {

        test('renders empty data dashboard', async () => {

            vi.mocked(settingsDashboardService.apiCallPullSettingsDashboard)
                .mockResolvedValueOnce(
                    E.right({
                        Data: {
                            Table0: [],
                            Table1: [],
                            Table2: [],
                            Table3: [],
                            Table4: [],
                            Table5: [],
                            Table6: [],
                            Table7: [],
                            IsSuccess: true,
                            HttpStatusCode: 200,
                            SuccessMessage: ["Data fetched successfully"],
                            ErrorMessage: [],
                            WarningMessage: [],
                        },
                    }) as any
                );

            render(<SettingsDashboard />);

            await waitFor(() => {

                expect(settingsDashboardService.apiCallPullSettingsDashboard).toHaveBeenCalled();

            });

            expect(screen.getByText('OverviewCards Component')).toBeInTheDocument();

        });

    })

    describe('Partial Data Testing', () => {
        test('Partial data testing', async () => {
            vi.mocked(settingsDashboardService.apiCallPullSettingsDashboard)
                .mockResolvedValueOnce(
                    E.right({
                        Data: {
                            Table0: [{}],
                            Table1: [{}],
                            Table2: [],
                            Table3: [],
                            Table4: [],
                            Table5: [],
                            Table6: [],
                            Table7: [],
                            IsSuccess: true,
                            HttpStatusCode: 200,
                            SuccessMessage: ["Data fetched successfully"],
                            ErrorMessage: [],
                            WarningMessage: [],
                        },
                    }) as any
                );

            render(<SettingsDashboard />);

            await waitFor(() => {

                expect(settingsDashboardService.apiCallPullSettingsDashboard).toHaveBeenCalled();

            });

            expect(screen.getByText('OverviewCards Component')).toBeInTheDocument();

        })

    })

});