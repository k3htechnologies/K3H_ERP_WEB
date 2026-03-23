import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import Tabs from "@/ui/components/Tab/Tab";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";

interface ParkingHeaderProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
    onExportExcel: () => void;
    onExportPdf: () => void;
    onUploadExcel: () => void;
    onDownloadSampleExcel: () => void;
    canExport: boolean;
    exportLoading: boolean;
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    onClearSearch?: () => void;
    canAction?: boolean;

    // NEW
    onApprovalLog?: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    approvalStatus?: string,
    showApprovalActions?: boolean;
}

const parkingTabList = [
    { id: "Grid", label: "Grid" },
    { id: "Table", label: "Table" },
];

export const ParkingHeader = ({
    activeTab,
    onTabChange,
    onExportExcel,
    onExportPdf,
    onUploadExcel,
    onDownloadSampleExcel,
    canExport,
    exportLoading,
    searchTerm = '',
    onSearchChange,
    onClearSearch,
    canAction,

    onApprovalLog,
    onApprove,
    onReject,
    approvalStatus,
    showApprovalActions,
}: ParkingHeaderProps) => {
    return (
        <div className="flex flex-col w-full h-[150px]  rounded-tr-[15px] rounded-tl-[15px]   border-[1px] border-gray-300 shadow-[0_1px_2px_1px_rgba(0,0,0,0.15)] bg-[#F9FAFB] px-4 py-1">
            <div className="flex justify-between pt-5 pb-3">
                <Tabs
                    tabs={parkingTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => onTabChange(t.id)}
                />
                {approvalStatus && (
                    <div className="flex items-center gap-2">

                        <ApprovalActions
                            approvalStatus={approvalStatus}
                            showApproval={showApprovalActions}
                            onHistory={onApprovalLog}
                            onApprove={onApprove}
                            onReject={onReject}
                        />
                    </div>
                )}
            </div>

            <TableActionToolbar
                isShowSearchBar={true}
                searchPlaceholder="Search By Parking Number"
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                onClearSearch={onClearSearch}
                isShowAddButton={false}
                isShowExportButton={canExport}
                onExportExcel={onExportExcel}
                onExportPdf={onExportPdf}
                isShowImportButton={canAction && approvalStatus==="Pending" ? true :false}
                onUploadExcel={onUploadExcel}
                onDownloadSampleExcel={onDownloadSampleExcel}
                exportLoading={exportLoading}
            />
        </div>
    );
};

