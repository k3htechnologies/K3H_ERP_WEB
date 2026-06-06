import { DataTableWithOutBorder, type TableColumn } from '@/ui/components/DataTable/DataTableWithoutBorder';
import { useEffect, useState } from 'react';
import type { ProjectAchievementData } from '@/features/achievement/models/AchievementReportModel';
import { Modal } from '@/ui/components/Modal/Modal';
import AchievementBookingReport from '@/features/achievement/components/AchievementBookingReport';
import AchievementWalkinsRevisitReport from '@/features/achievement/components/AchievementWalkinsRevisitReport';

interface Props {
    projectAchievementData: ProjectAchievementData[];
    filterType: "TODAY" | "WEEKLY" | "MONTHLY" | "DATEWISE";
    fromDate: string | null;
    toDate: string | null;
}

export default function ProjectAchievement({ projectAchievementData, filterType, fromDate, toDate }: Props) {
    const [selectedColumnClickBooking, setSelectedColumnClickBooking] = useState<any>(null);
    const [selectedColumnClickWalkingRevisit, setSelectedColumnClickWalkingRevisit] = useState<any>(null);
    const [tableData, setTableData] = useState<any[]>([]);

    useEffect(() => {
        setTableData(projectAchievementData || []);
    }, [projectAchievementData]);


    const handleColumnClickBooking = (row: ProjectAchievementData, tabName: string, columnKey: string,) => {
        setSelectedColumnClickBooking({
            projectId: row.ProjectId,
            project: row.ProjectName,
            tabName: tabName,
            columnKey: columnKey
        });
    };

    const handleColumnClickWalkingRevisit = (row: ProjectAchievementData, tabName: string, columnKey: string,) => {
        setSelectedColumnClickWalkingRevisit({
            projectId: row.ProjectId,
            project: row.ProjectName,
            tabName: tabName,
            columnKey: columnKey
        });
    };

    const columns: TableColumn[] = [
        {
            key: 'ProjectName',
            label: 'Project Name',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: (value) => value || "-",
        },
        {
            key: 'TotalWalkins',
            label: 'Walkins',
            width: '15',
            sortable: false,
            align: 'center',
             render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickWalkingRevisit(row, 'PROJECT', 'TOTAL WALKINS')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },
        {
            key: 'Revisits',
            label: 'Revisits',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickWalkingRevisit(row, 'PROJECT', 'REVISITS')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },
        {
            key: 'TotalBooking',
            label: 'Booking',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value, row) => {

                const isClickable = (value ?? 0) > 0;

                return (
                    <span
                        className={
                            isClickable
                                ? "cursor-pointer text-blue-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                        }
                        onClick={() => {
                            if (!isClickable) return;
                            handleColumnClickBooking(row, 'PROJECT', 'TOTAL BOOKING')
                        }}
                    >
                        {value ?? "0"}
                    </span>
                );
            }
        },
        {
            key: 'TotalRevenue',
            label: 'Revenue (₹)',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => value || "0",
        }
    ]
    //#endregion

    //#region
    return (
        <div className="space-y-3 pt-4">

            <h2 className="text-lg font-semibold text-gray-800">Project Achievement</h2>

            <div className="flex-1 bg-white rounded-xl p-5 h-[310px] border border-gray-100 min-w-0 overflow-hidden flex flex-col">

                <DataTableWithOutBorder
                    columns={columns}
                    data={tableData}
                    emptyMessage="No records Found"
                    fixedHeight={true}
                />
            </div>

            {selectedColumnClickWalkingRevisit && (
                <Modal
                    isOpen={!!selectedColumnClickWalkingRevisit}
                    onClose={() => setSelectedColumnClickWalkingRevisit(null)}
                    title={
                        <div className="flex flex-col">

                            <span className="font-semibold text-base">
                                {selectedColumnClickWalkingRevisit.project || ""}
                            </span>
                            <span className="text-sm text-gray-500">
                                {selectedColumnClickWalkingRevisit.tabName ? `  Tab: ${selectedColumnClickWalkingRevisit.tabName}` : ""}
                                {selectedColumnClickWalkingRevisit.columnKey ? ` | Column: ${selectedColumnClickWalkingRevisit.columnKey}` : ""}
                            </span>

                        </div>
                    }
                    size="large-half"
                >
                    <AchievementWalkinsRevisitReport filterType={filterType} fromDate={fromDate} toDate={toDate} projectId={selectedColumnClickWalkingRevisit?.projectId} tabName={selectedColumnClickWalkingRevisit?.tabName} columnKey={selectedColumnClickWalkingRevisit?.columnKey} />
                </Modal>
            )}


            {selectedColumnClickBooking && (
                <Modal
                    isOpen={!!selectedColumnClickBooking}
                    onClose={() => setSelectedColumnClickBooking(null)}
                    title={
                        <div className="flex flex-col">

                            <span className="font-semibold text-base">
                                {selectedColumnClickBooking.project || ""}
                            </span>
                            <span className="text-sm text-gray-500">
                                {selectedColumnClickBooking.tabName ? `  Tab: ${selectedColumnClickBooking.tabName}` : ""}
                                {selectedColumnClickBooking.columnKey ? ` | Column: ${selectedColumnClickBooking.columnKey}` : ""}
                            </span>

                        </div>
                    }
                    size="large-half"
                >
                    <AchievementBookingReport filterType={filterType} fromDate={fromDate} toDate={toDate} projectId={selectedColumnClickBooking?.projectId} tabName={selectedColumnClickBooking?.tabName} columnKey={selectedColumnClickBooking?.columnKey} />
                </Modal>
            )}
        </div>
    );
}