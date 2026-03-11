import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import { Button } from "@/ui/components/forms";
import Tabs from "@/ui/components/Tab/Tab";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";

interface InventoryHeaderProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
    onExportExcel: () => void;
    onExportPdf: () => void;
    onUploadExcel: () => void;
    onDownloadSampleExcel: () => void;
    canExport: boolean;
    canAction: boolean;
    exportLoading: boolean;
    onAddBuilding?: () => void;
    onAddWing?: () => void;
    onAddFloor?: () => void;
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    onClearSearch?: () => void;

    // NEW
    onApprovalLog?: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    approvalStatus?: string,
    showApprovalActions?: boolean;
}

const inventoryTabList = [
    { id: "Grid", label: "Grid" },
    { id: "Table", label: "Table" },
];

export const InventoryHeader = ({
    activeTab,
    onTabChange,
    onExportExcel,
    onExportPdf,
    onUploadExcel,
    onDownloadSampleExcel,
    canExport,
    canAction,
    exportLoading,
    onAddBuilding,
    onAddWing,
    onAddFloor,
    searchTerm = '',
    onSearchChange,
    onClearSearch,

    onApprovalLog,
    onApprove,
    onReject,
    approvalStatus,
    showApprovalActions,

}: InventoryHeaderProps) => {
    return (
        <div className="flex flex-col w-full h-[150px]  rounded-tr-[15px] rounded-tl-[15px]   border-[1px] border-gray-300 shadow-[0_1px_2px_1px_rgba(0,0,0,0.15)] bg-[#F9FAFB] px-4 py-1">
            <div className="flex justify-between items-center pt-5 pb-3">

                <Tabs
                    tabs={inventoryTabList}
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
                searchPlaceholder="Search By Unit Number"
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                onClearSearch={onClearSearch}
                isShowAddButton={canAction}
                onAdd={() => { }}
                showMoreAddOptions={
                    <div className="flex flex-col w-[150px] bg-white rounded-md border-[1px] border-gray-200 shadow-lg">
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onAddBuilding?.();
                            }}
                            disabled={false}
                            color="transparent"
                            fullWidth
                            isborderRadius
                            size="sm"
                            title="Add Building"
                            style={{ justifyContent: "left" }}
                        >
                            Add Building
                        </Button>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onAddWing?.();
                            }}
                            disabled={false}
                            color="transparent"
                            fullWidth
                            isborderRadius
                            size="sm"
                            title="Add Wing"
                            style={{ justifyContent: "left" }}
                        >
                            Add Wing
                        </Button>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onAddFloor?.();
                            }}
                            disabled={false}
                            color="transparent"
                            fullWidth
                            isborderRadius
                            size="sm"
                            title="Add Floor"
                            style={{ justifyContent: "left" }}
                        >
                            Add Floor
                        </Button>
                    </div>
                }
                isShowExportButton={canExport}
                onExportExcel={onExportExcel}
                onExportPdf={onExportPdf}
                isShowImportButton={canAction}
                onUploadExcel={onUploadExcel}
                onDownloadSampleExcel={onDownloadSampleExcel}
                exportLoading={exportLoading}
            />
        </div>
    );
};

