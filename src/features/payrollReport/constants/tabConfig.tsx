import { getTodayDate_dd_mm_yyyy } from '@/core/utils/dateFormat';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';

// ─── Tab list ─────────────────────────────────────────────────────────────────

export type TabId =
    | 'Attendance'
    | 'Attendance Regularization'
    | 'Comp-Off'
    | 'Leave'
    | 'Outdoor'
    | 'Resignation';

export const TAB_LIST: Array<{ id: TabId; label: string }> = [
    { id: 'Attendance', label: 'Attendance' },
    { id: 'Attendance Regularization', label: 'Attendance Regularization' },
    { id: 'Comp-Off', label: 'Comp-Off' },
    { id: 'Leave', label: 'Leave' },
    { id: 'Outdoor', label: 'Outdoor' },
    { id: 'Resignation', label: 'Resignation' },
];

// ─── Week date helper─────────────────────────────

export const getCurrentWeekDates = (): { startDate: string; endDate: string } => {
    const today = new Date();
    const day = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() + (day === 0 ? -6 : 1 - day));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    // Reuse existing util format helper
    const fmt = (d: Date): string => {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return `${dd}-${mm}-${d.getFullYear()}`;
    };

    return { startDate: fmt(start), endDate: fmt(end) };
};

// ─── Default filters per tab ──────────

export const getDefaultFilters = (tab: TabId): FilterInfo => {
    const today = getTodayDate_dd_mm_yyyy();
    const defaults: Record<TabId, FilterInfo> = {
        'Attendance': (() => {
            const w = getCurrentWeekDates();
            return { StartDate: w.startDate, EndDate: w.endDate };
        })(),
        'Attendance Regularization': { StartDate: today, EndDate: today },
        'Comp-Off': { StartDate: today, EndDate: today },
        'Leave': { StartDate: today, EndDate: today },
        'Outdoor': { StartDate: today, EndDate: today },
        'Resignation': { ResignationDateFrom: today, ResignationDateTo: today },
    };
    return defaults[tab];
};

// ─── Display config ────────────────────────────────────────────────────────────

export const EMPTY_MESSAGES: Record<TabId, string> = {
    'Attendance': 'No Attendance found',
    'Attendance Regularization': 'No Attendance Regularization found',
    'Comp-Off': 'No Comp Off found',
    'Leave': 'No Leave found',
    'Outdoor': 'No Outdoor found',
    'Resignation': 'No Resignation found',
};

export const EXPORT_LABELS: Record<TabId, string> = {
    'Attendance': 'Attendance',
    'Attendance Regularization': 'Attendance Regularization',
    'Comp-Off': 'Comp Off',
    'Leave': 'Leave',
    'Outdoor': 'Outdoor',
    'Resignation': 'Resignation',
};