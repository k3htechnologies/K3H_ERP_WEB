import { Loader } from "@/core/utils/loader"
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { FilterWithPaginationPerformanceReportRequest, PerformanceReportData } from "@/features/performanceReport/models/PerformanceReportModel";
import { performanceReportService } from "@/features/performanceReport/services/PerformanceReportService";
import { runApiWithLoader } from "@/core/utils";
import useToast from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import * as E from 'fp-ts/Either';
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import TooltipText from "@/ui/components/Tooltip/TooltipText";

const ViewPerformanceReport: React.FC = () => {

    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [performanceReportData, setPerformanceReportData] = useState<PerformanceReportData | null>(null);

    // NAVIGATE
    const navigate = useNavigate();

    // TOAST0
    const { addToast } = useToast();

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject();
    //#endregion

    //#region BACK PERFORMANCE REPORT
    const handleBackToListPerformanceReport = () => {
        navigate("/performance");
    };
    //#endregion

    const { EmployeeId } = useParams<{ EmployeeId?: string }>();
    const currentEmployeeId = Number(EmployeeId);

    const fetchPerformanceReportDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationPerformanceReportRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    EmployeeId: currentEmployeeId,
                    ProjectId: Number(projectId),
                };
                const response = await performanceReportService.apiCallPullPerformanceReport(params);

                if (E.isRight(response)) {
                    const data = response.right.Data;

                    if (Array.isArray(data)) {
                        const employee = data.find((item) => item.EmployeeId === currentEmployeeId);
                        setPerformanceReportData(employee ?? null);
                    } else {
                        setPerformanceReportData(data);
                    }
                } else {
                    addToast({ type: "error", title: response.left.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Loading Performance Report",
        );
    };
    //#endregion

    //#region INIT
    useEffect(() => {
        if (!projectId || !currentEmployeeId || currentEmployeeId === 0) return;

        fetchPerformanceReportDetails();
    }, [projectId, currentEmployeeId, addToast]);
    //#endregion

    //#region PERFORMANCE REPORT TABLE COLUMNS
    const PerformanceReportColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'Metrics',
            label: 'Metrics',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: (value) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                />
            )
        },
        {
            key: 'Target',
            label: 'Target',
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'Achieved',
            label: 'Achieved',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'Ratio',
            label: 'Performance Ratio',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value ? `${value}%` : '-'
        },
    ], []);
    //#endregion

    const walkinsTableData = useMemo(() => performanceReportData?.PerformanceWalkinsData ?? [], [performanceReportData]);

    const bookingTableData = useMemo(() => performanceReportData?.PerformanceBookingData ?? [], [performanceReportData]);

    const ratioTableData = useMemo(() => performanceReportData?.PerformanceRatioData ?? [], [performanceReportData]);
    //#endregion

    //#region
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 ">
            <Loader loading={isLoading} title={loadingMessage}><div></div></Loader>

            <HeaderActionBar
                titleText={performanceReportData?.EmployeeName || ''}
                onCancel={() => handleBackToListPerformanceReport()}
            />

            <div className="border-b border-gray-300 mt-3 mb-4"></div>

            <div className="grid grid-cols-3 gap-6">

                {/* Overall Target */}
                <div className=" rounded-lg p-4 flex justify-between items-center shadow-sm border-white-300">
                    <span className="text-gray-700 font-medium">Overall Target</span>
                    <span className="text-xl font-bold text-gray-800">{performanceReportData?.OverallTarget}</span>
                </div>

                {/* Overall Achieved */}
                <div className=" rounded-lg p-4 flex justify-between items-center shadow-sm border-white-300">
                    <span className="text-gray-700 font-medium">Overall Achieved</span>
                    <span className="text-xl font-bold text-gray-800">{performanceReportData?.OverallAchieved}</span>
                </div>

                {/* Overall Performance*/}
                <div className=" rounded-lg p-4 flex justify-between items-center shadow-sm border-white-300">
                    <span className="text-gray-700 font-medium">Overall Performance</span>
                    <span className="text-xl font-bold text-gray-800">{performanceReportData?.OverallPerformance}</span>
                </div>

            </div>

            <h3 className="mt-4 font-semibold">Walkins</h3>

            <DataTable
                data={walkinsTableData}
                columns={PerformanceReportColumns}
                emptyMessage="No Walkins Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1 mt-4"
            />

            <h3 className="mt-4 font-semibold">Booking</h3>

            <DataTable
                data={bookingTableData}
                columns={PerformanceReportColumns}
                emptyMessage="No Booking Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1 mt-4"
            />

            <h3 className="mt-4 font-semibold">Ratio</h3>

            <DataTable
                data={ratioTableData}
                columns={PerformanceReportColumns}
                emptyMessage="No Ratio Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1 mt-4"
            />
        </div>
    )
}
export default ViewPerformanceReport