import { DateRangeWithActions } from '@/ui/components/DateRangeWithActions';
import { useState } from 'react';
import DailyCollectionReportComponent from '@/features/dailyCollectionReport/components/DailyCollectionReportComponent';

export const DailyCollectionReport: React.FC = () => {

    const [filterType, setFilterType] = useState<"TODAY" | "WEEKLY" | "MONTHLY" | "DATEWISE" | "OVERALL">("MONTHLY");
    const [fromDate, setFromDate] = useState<string | null>(null);
    const [toDate, setToDate] = useState<string | null>(null);

    const shouldLoadData =
        filterType !== "DATEWISE" || (fromDate && toDate);

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">

            <div className="flex flex-wrap items-center justify-between gap-3">

                <div className="flex gap-2 flex-wrap">

                    {["Today", "Weekly", "Monthly", "Datewise", "Overall"].map(
                        (tab) => {
                            const tabValue = tab.toUpperCase();

                            return (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setFilterType(tabValue as any);

                                        if (tabValue !== "DATEWISE") {
                                            setFromDate(null);
                                            setToDate(null);
                                        }
                                    }}
                                    className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${filterType === tabValue
                                        ? "bg-blue-600 text-white shadow"
                                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                        }`}
                                >
                                    {tab}
                                </button>
                            );
                        }
                    )}

                </div>

                {filterType === "DATEWISE" && (
                    <DateRangeWithActions
                        fromDate={fromDate}
                        toDate={toDate}
                        onBothDatesChange={(f, t) => {
                            setFromDate(f);
                            setToDate(t);
                        }}
                        onFromDateChange={setFromDate}
                        onToDateChange={setToDate}
                        exportLoading={false}
                    />
                )}

            </div>

            <div className="pt-5">

                {shouldLoadData && (
                    <DailyCollectionReportComponent
                        filterType={filterType}
                        fromDate={fromDate}
                        toDate={toDate}
                    />
                )}

            </div>

        </div>
    );
};

export default DailyCollectionReport;