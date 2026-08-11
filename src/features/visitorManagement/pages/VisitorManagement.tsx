import { Loader } from "@/core/utils/loader";
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { Button } from "@/ui/components/forms";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const VisitorManagement: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [openVisitorModal, setOpenVisitorModal] = useState<boolean>(false);
    // const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const navigate = useNavigate();

    const handleAddVisitorModal = () => {
        navigate('/visitorManagement/add');
    };

    const handleAddVisitor = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Add Visitor');
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
                    isShowExportButton={false}
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