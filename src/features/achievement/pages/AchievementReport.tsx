import { DateRangeWithActions } from '@/ui/components/DateRangeWithActions';
import Tabs from '@/ui/components/Tab/Tab';
import React, { useState } from 'react';
import AchievementByProject from '@/features/achievement/components/AchievementByProject';
import AchievementBySourcing from '@/features/achievement/components/AchievementBySourcing';
import AchievementByClosing from '@/features/achievement//components/AchievementByClosing';

export const AchievementReport: React.FC = () => {

    const [filterType, setFilterType] = useState<"TODAY" | "WEEKLY" | "MONTHLY" | "DATEWISE">("MONTHLY");
    const [fromDate, setFromDate] = useState<string | null>(null);
    const [toDate, setToDate] = useState<string | null>(null);

    const AchievementTabList = [
        { id: 'Project', label: 'Project' },
        { id: 'Closing', label: 'Closing' },
        { id: 'Sourcing', label: 'Sourcing' },
    ];
    const [achievementActiveTab, setAchievementActiveTab] = useState(AchievementTabList[0].id);
    
    const shouldLoadData = filterType !== "DATEWISE" || (fromDate && toDate);

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">

            <div className="flex flex-wrap items-center justify-between gap-3">

                <div className="flex gap-2">

                    {["Today", "Weekly", "Monthly", "Datewise", "Overall"].map((tab) => {

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
                                className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${filterType === tabValue ? "bg-blue-600 text-white shadow"  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                    }`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>


                {filterType.toUpperCase() === "DATEWISE" && (
                    <div className="flex items-center gap-2">
                        <DateRangeWithActions
                            fromDate={fromDate}
                            toDate={toDate}
                            onBothDatesChange={(f, t) => {
                                setFromDate(f);
                                setToDate(t);
                            }}
                            onFromDateChange={(f) => setFromDate(f)}
                            onToDateChange={(t) => setToDate(t)}
                            exportLoading={false}
                        />
                    </div>
                )}

            </div>

            <div className='pt-5'>

                <Tabs
                    tabs={AchievementTabList}
                    defaultActive={achievementActiveTab}
                    isChips
                    onTabChange={(t) => {
                        setAchievementActiveTab(t.id)
                    }}
                />
            </div>

            

            {achievementActiveTab.toUpperCase() === "PROJECT" && shouldLoadData  &&  (<AchievementByProject filterType={filterType} fromDate={fromDate} toDate={toDate} />)}
            {achievementActiveTab.toUpperCase() === "SOURCING" && shouldLoadData &&  (<AchievementBySourcing filterType={filterType} fromDate={fromDate} toDate={toDate} />)}
            {achievementActiveTab.toUpperCase() === "CLOSING" && shouldLoadData &&   (<AchievementByClosing filterType={filterType} fromDate={fromDate} toDate={toDate} />)}

        </div>
    )

}
export default AchievementReport;