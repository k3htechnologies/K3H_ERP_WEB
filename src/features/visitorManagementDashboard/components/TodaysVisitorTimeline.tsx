import NoDataView from '@/ui/components/NoDataView/NoDataView';
import type { VisitorTimelineSlot } from '@/features/visitorManagementDashboard/models/VisitorManagementDashboardModel';
import { getGatePassStatusColor } from '@/features/visitorManagementDashboard/utils/visitorManagementDashboardUtils'; 
import TooltipText from '@/ui/components/Tooltip/TooltipText';

interface Props {
    timelineData: VisitorTimelineSlot[];
}

const getSlotDotColor = (entries: { Status: string }[]) => {
    if (!entries || entries.length === 0) return "#6B7280";
    return getGatePassStatusColor(entries[0]?.Status).text;
};

export default function TodaysVisitorTimeline({ timelineData }: Props) {
    return (
        <div className="space-y-3 pt-4">
            <div
                className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col"
                style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
            >
                <p className="text-sm text-gray-500 font-medium uppercase mb-6">
                    Today&apos;s Visitor Timeline
                </p>

                {timelineData.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500 min-h-[160px]">
                        <NoDataView />
                    </div>
                ) : (
                    <div className="overflow-x-auto thin-scroll pb-2">
                        <div className="relative w-max min-w-full px-2">
                            <div className="absolute left-6 right-6 top-[34px] h-[2px] bg-gray-200 rounded" />

                            <div className="flex justify-between gap-3">
                                {timelineData.map((slot, slotIndex) => {
                                    const dotColor = getSlotDotColor(slot.Entries);

                                    return (
                                        <div
                                            key={slotIndex}
                                            className="relative z-10 flex flex-col items-center flex-1 min-w-[108px] max-w-[140px]"
                                        >
                                            <p className="text-md text-gray-500 font-medium whitespace-nowrap mb-3">
                                                {slot.TimeLabel}
                                            </p>

                                            <span
                                                className="w-2.5 h-2.5 rounded-full mb-4 ring-2 ring-white"
                                                style={{ backgroundColor: dotColor }}
                                            />

                                            <div className="w-full space-y-2 max-h-[140px] overflow-y-auto thin-scroll">
                                                {slot.Entries.map((entry, entryIndex) => {
                                                    const statusColor = getGatePassStatusColor(entry.Status);
                                                    return (
                                                        <div
                                                            key={entryIndex}
                                                            className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-center"
                                                        >
                                                            <TooltipText
                                                                text={`${entry.VisitorName} +${entry.NoOfParticipants}`}
                                                                maxWidth="100%"
                                                                tooltipThreshold={10}
                                                                isApplyBgTextColor={true}
                                                                tooltipClassName="text-sm font-medium text-gray-800 text-center"
                                                            />
                                                            <p
                                                                className="text-sm font-semibold mt-1"
                                                                style={{ color: statusColor.text }}
                                                            >
                                                                {entry.Status}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
