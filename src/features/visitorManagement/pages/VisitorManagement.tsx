import { Loader } from "@/core/utils/loader";
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { Button } from "@/ui/components/forms";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useNavigate } from "react-router-dom";
import type { FilterWithPaginationVisitorManagement } from "../models/VisitorManagementModel";
import usePagination from "@/core/hooks/usePagination";
import { runApiWithLoader } from "@/core/utils";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { handleExportFile } from "@/core/utils/exportFile";
import { visitorManagementService } from "../services/VisitorManagementService";

interface Props {
    fromDate: string | null;
    toDate: string | null;
}

const VisitorManagement: React.FC<Props> = ({ fromDate, toDate }) => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [openVisitorModal, setOpenVisitorModal] = useState<boolean>(false);
    // const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const { pagination, setPagination } = usePagination(20);

    const { canExport } = useMenuPermissions();



    const navigate = useNavigate();

    const handleAddVisitorModal = () => {
        navigate('/visitorManagement/add');
    };

    const handleAddVisitor = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Add Visitor');
    };

    const handleExportVisitor = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationVisitorManagement = {

                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    FromDate: fromDate ? fromDate || undefined : undefined,
                    ToDate: toDate ? toDate || undefined : undefined,
                    // SortBy: getSortByParam(sortInfo ?? null, visitorsTableColumns),
                    ExportType: exportType
                };

                const response = await visitorManagementService.apiCallPullVisitorManagement(params);

                // handleExportFile(response, exportType, 'Visitor Management', addToast);

                return response;
            },
            undefined,
            // (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            // 'Preparing Export'
        );
    };

    const visitorsTableColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'VisitorName',
                label: 'Visitor Name',
                width: '30',
                sortable: false,
                align: 'center',
                render: (value) => value || ''
            },
            {
                key: 'AppointmentWith',
                label: 'Appointment With',
                width: '30',
                sortable: false,
                align: 'center',
                render: (value) => value || ''
            },
            {
                key: 'AppointmentDate',
                label: 'Appointment Date',
                width: '30',
                sortable: false,
                align: 'center',
                render: (value) => value || ''
            },
            {
                key: 'AppointmentTime',
                label: 'Appointment Time',
                width: '30',
                sortable: false,
                align: 'center',
                render: (value) => value || ''
            },
            {
                key: 'ApprovalStatus',
                label: 'Status',
                width: '30',
                sortable: false,
                align: 'center',
                render: (value) => value || ''
            }
        ],
        []
    )

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <div className="flex items-center justify-between w-full">
                <TableActionToolbar
                    isShowSearchBar
                    searchPlaceholder="Search By Visitor's Name"
                    isShowFilterButton={false}
                    isShowCustomizeButton={false}
                    isShowExportButton={canExport}
                    // onExportExcel={handleVisitorExcel}
                    // onExportPdf={handleVisitorPdf}
                    exportLoading={isLoading}
                />
                <Button
                    color="blue"
                    size="mxs"
                    variant="solid"
                    colorMode="gradient_dark"
                    style={{ width: '180px' }}
                    onClick={handleAddVisitorModal}
                    leftIcon={<Plus className="h-6 w-6 pb-1 text-white" />}
                >
                    Add Visitor's
                </Button>
            </div>

            <DataTable
                data={[]}
                columns={visitorsTableColumns}
                // pagination={TicketMasterPaginationInfo}
                emptyMessage="No Visitor Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
            // sortInfo={sortInfo}
            // onSort={handleSortColumn}
            />

        </div>
    )
}

export default VisitorManagement;