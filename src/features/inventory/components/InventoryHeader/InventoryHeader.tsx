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
    canImport: boolean;
    exportLoading: boolean;
    onAddBuilding?: () => void;
    onAddWing?: () => void;
    onAddFloor?: () => void;
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    onClearSearch?: () => void;
    approvalStatus?: string,
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
    canImport,
    exportLoading,
    onAddBuilding,
    onAddWing,
    onAddFloor,
    searchTerm = '',
    onSearchChange,
    onClearSearch,
    approvalStatus,

}: InventoryHeaderProps) => {
    return (
        <div className="w-full rounded-tr-[15px] rounded-tl-[15px] border border-gray-300 shadow-[0_1px_2px_1px_rgba(0,0,0,0.15)] bg-[#F9FAFB] px-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">

                <Tabs
                    tabs={inventoryTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => onTabChange(t.id)}
                    istoggleTab={true}
                />
                
                <div className="flex items-center gap-3 flex-wrap pt-2">
                    
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
                        isShowImportButton={canImport && approvalStatus === "Pending" ? true : false}
                        onUploadExcel={onUploadExcel}
                        onDownloadSampleExcel={onDownloadSampleExcel}
                        exportLoading={exportLoading}
                    />
                </div>
            </div>
        </div>
    );
};

