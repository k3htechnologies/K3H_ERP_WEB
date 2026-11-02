import { formatDate_dd_MonthName_yy_hh_mm, formatTimeFromDateTime, isToday } from '@/core/utils/dateFormat';
import type { PurposeWiseVisitorData, Table0, VisitorAlertData, VisitorManagementDashboardFilterType, VisitorOverviewData, VisitorTimelineSlot } from '@/features/visitorManagementDashboard/models/VisitorManagementDashboardModel';

export const formatVisitorDateTime = (dateTime: string, filterType: VisitorManagementDashboardFilterType) =>
    filterType === 'TODAY' ? formatTimeFromDateTime(dateTime) : formatDate_dd_MonthName_yy_hh_mm(dateTime);

export const getVisitorOverviewData = (visitorData: Table0[], todaysVisitorData: Table0[]): VisitorOverviewData => {
    const now = new Date();

    return {
        TotalVisitors: visitorData.length,
        CurrentlyInside: visitorData.filter((row) => row.GatePassStatus === 'Currently Inside').length,
        ExpectedToday: todaysVisitorData.filter((row) => row.GatePassStatus !== 'Checked Out' && new Date(row.PassDateTime) > now).length,
        CheckedOut: visitorData.filter((row) => row.GatePassStatus === 'Checked Out' && isToday(new Date(row.OutDateTime))).length,
        Overstaying: visitorData.filter((row) => row.GatePassStatus === 'Not Checked Out').length,
    };
};

export const getPurposeWiseVisitorData = (visitorData: Table0[]): PurposeWiseVisitorData[] => {
    const purposeCountMap: Record<string, number> = {};

    visitorData.forEach((row) => {
        purposeCountMap[row.Purpose] = (purposeCountMap[row.Purpose] || 0) + 1;
    });

    return Object.entries(purposeCountMap).map(([Purpose, VisitorCount]) => ({ Purpose, VisitorCount }));
};

export const getVisitorAlertData = (visitorData: Table0[]): VisitorAlertData[] =>
    visitorData
        .filter((row) => row.GatePassStatus === 'Not Checked Out')
        .map((row) => ({
            AlertType: row.GatePassStatus,
            Message: `${row.FullName} has not checked out after the ${formatDate_dd_MonthName_yy_hh_mm(row.PassDateTime)} appointment with ${row.EmployeeName}`,
        }));

export const getVisitorTimelineData = (todaysVisitorData: Table0[]): VisitorTimelineSlot[] => {
    const sortedVisitorData = [...todaysVisitorData].sort(
        (a, b) => new Date(a.PassDateTime).getTime() - new Date(b.PassDateTime).getTime()
    );

    return sortedVisitorData.reduce<VisitorTimelineSlot[]>((slots, row) => {
        const timeLabel = formatTimeFromDateTime(row.PassDateTime);
        const entry = {
            FullName: row.FullName,
            NoOfParticipants: row.NoOfParticipants,
            Status: row.GatePassStatus,
        };

        const existingSlot = slots.find((slot) => slot.TimeLabel === timeLabel);

        if (existingSlot) {
            existingSlot.Entries.push(entry);
        } else {
            slots.push({ TimeLabel: timeLabel, Entries: [entry] });
        }

        return slots;
    }, []);
};