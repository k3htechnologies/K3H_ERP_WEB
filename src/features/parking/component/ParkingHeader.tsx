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
    approvalStatus?: string,
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
    approvalStatus,
}: ParkingHeaderProps) => {
    return (
        <div className="w-full pt-3 pb-3 rounded-tr-[15px] rounded-tl-[15px] border border-gray-300 shadow-[0_1px_2px_1px_rgba(0,0,0,0.15)] bg-[#F9FAFB] px-4 py-2">
            <div className="flex items-center justify-between gap-4">
                <Tabs
                    tabs={parkingTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    istoggleTab={true}
                    onTabChange={(t) => onTabChange(t.id)}
                />

                 <div className="flex items-center gap-3 pt-5 h-[40px]">

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
                        isShowImportButton={canAction && approvalStatus === "Pending" ? true : false}
                        onUploadExcel={onUploadExcel}
                        onDownloadSampleExcel={onDownloadSampleExcel}
                        exportLoading={exportLoading}
                    />
                </div>
            </div>
        </div>
    );
};

