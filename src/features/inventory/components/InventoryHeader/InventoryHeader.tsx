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
    exportLoading: boolean;
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
    exportLoading,
}: InventoryHeaderProps) => {
    return (
        <div className="flex flex-col w-full h-[150px]  rounded-tr-[15px] rounded-tl-[15px]   border-[1px] border-gray-300 shadow-[0_1px_2px_1px_rgba(0,0,0,0.15)] bg-[#F9FAFB] px-4 py-1">
            <div className="flex justify-between pt-5 pb-3">
                <Tabs
                    tabs={inventoryTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => onTabChange(t.id)}
                />
            </div>

            <TableActionToolbar
                isShowSearchBar={true}
                searchPlaceholder="Search By Unit Number"
                isShowAddButton
                onAdd={() => {}}
                showMoreAddOptions={
                    <div className="flex flex-col w-[150px] bg-white rounded-md border-[1px] border-gray-200 shadow-lg">
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            disabled={false}
                            color="transparent"
                            fullWidth
                            isborderRadius
                            size="sm"
                            title="Add Building"
                        >
                            Add Building
                        </Button>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            disabled={false}
                            color="transparent"
                            fullWidth
                            isborderRadius
                            size="sm"
                            title="Add Wing"
                        >
                            Add Wing
                        </Button>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            disabled={false}
                            color="transparent"
                            fullWidth
                            isborderRadius
                            size="sm"
                            title="Add Floor"
                        >
                            Add Floor
                        </Button>
                    </div>
                }
                isShowExportButton={canExport}
                onExportExcel={onExportExcel}
                onExportPdf={onExportPdf}
                isShowImportButton={true}
                onUploadExcel={onUploadExcel}
                onDownloadSampleExcel={onDownloadSampleExcel}
                exportLoading={exportLoading}
            />
        </div>
    );
};

