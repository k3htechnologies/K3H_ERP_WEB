import { Loader } from "@/core/utils/loader";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { Tabs } from "@/ui/components/Tab/Tab";
import { TableActionToolbar } from "@/ui/components/TableAction/TableActionToolbar";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStockManagementListState } from "../context/StockManagementListStateContext";
import type { FilterWithPaginationStockManagementHistoryRequest } from "../models/StockManagementModel";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import { useToast } from "@/core/hooks/useToast";
import { handleExportFile } from "@/core/utils/exportFile";
import { stockManagementService } from "../services/StockManagementService";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import StocksHistory from "../components/StocksHistory";
import { MaterialOut } from "../components/Materialout";
import MaterialIn from "../components/Materialin";
import StockSummary from "../components/StockSummary";

export const ViewStockManagement: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();
    const { listState } = useStockManagementListState();
    const materialName = listState.MaterialName;
    const subMaterialName = listState.SubMaterialName;
    const { addToast } = useToast();
    const { projectId } = useProject();
    const { SubMaterialMasterId } = useParams<{ SubMaterialMasterId?: string }>();
    const currentSubMaterialMasterId = SubMaterialMasterId ? Number(SubMaterialMasterId) : listState.SubMaterialMasterId;
    const { canExport } = useMenuPermissions();

    const MaterialRequisitionTabList = [
        { id: 'Summary', label: 'Summary' },
        { id: 'History', label: 'History' },
        { id: 'Material In', label: 'Material In' },
        { id: 'Material Issued', label: 'Material Issued' },
    ];

    const [activeTab, setActiveTab] = useState<string>(MaterialRequisitionTabList[0].id);

    const handleBackToStockManagement = () => {
        navigate("/stock");
    };

    const handleExportStockManagementHistory = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationStockManagementHistoryRequest = {
                    PageNumber: 1,
                    PageSize: 1000,
                    ProjectId: Number(projectId),
                    SubMaterialMasterId: currentSubMaterialMasterId,
                    ExportType: exportType,
                };

                const response = await stockManagementService.apiCallPullStockManagementHistory(params);

                handleExportFile(response, exportType, "Stock Management", addToast);

                return response;
            },
            undefined,
            (error: any) =>
                addToast({ type: "error", title: error.message || "Export failed" }),
            undefined,
            "Preparing Export",
        );
    }

    const handleExportStockManagementHistoryExcel = () => handleExportStockManagementHistory("Excel");
    const handleExportStockManagementHistoryPdf = () => handleExportStockManagementHistory("PDF")

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> {" "} <div></div>{" "}</Loader>

            <div className="flex justify-between">
                <HeaderActionBar
                    subTitleText={materialName ?? ""}
                    subSubTitleText={subMaterialName ?? ""}
                    cancelText="Cancel"
                    EditText="Edit"
                    onCancel={() => handleBackToStockManagement()}
                />

                <TableActionToolbar
                    isShowSearchBar={false}
                    isShowExportButton={canExport}
                    onExportExcel={handleExportStockManagementHistoryExcel}
                    onExportPdf={handleExportStockManagementHistoryPdf}
                    exportLoading={isLoading}
                />
            </div>

            <div className="pt-0 pb-3">
                <Tabs
                    tabs={MaterialRequisitionTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            {activeTab === 'Summary' && <StockSummary />}
            {activeTab === 'History' && <StocksHistory />}
            {activeTab === 'Material In' && <MaterialIn />}
            {activeTab === 'Material Issued' && <MaterialOut />}

        </div>
    )
}

export default ViewStockManagement;
