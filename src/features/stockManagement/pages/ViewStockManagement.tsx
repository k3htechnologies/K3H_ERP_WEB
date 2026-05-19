// import useToast from "@/core/hooks/useToast";
// import { useProject } from "@/features/projectMaster/context/ProjectContext";
// import { useEffect, useMemo, useState } from "react";
// import type { FilterWithPaginationStockManagementHistoryRequest, StockManagementRequestHistoryData } from "@/features/stockManagement/models/StockManagementModel";
// import { stockManagementService } from "@/features/stockManagement/services/StockManagementService";
// import { runApiWithLoader } from "@/core/utils";
// import * as E from 'fp-ts/Either';
// import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
// import TooltipText from "@/ui/components/Tooltip/TooltipText";
// import { Loader } from "@/core/utils/loader";
// import { useStockManagementListState } from "@/features/stockManagement/context/StockManagementListStateContext";
// import { useNavigate, useParams } from "react-router-dom";
// import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
// import usePagination from "@/core/hooks/usePagination";
// import { getSortByParam } from "@/core/constants/sortingColumnDetails";
// import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
// import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
// import { handleExportFile } from "@/core/utils/exportFile";
// import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
// import Tabs from "@/ui/components/Tab/Tab";


// export const ViewStockManagement: React.FC = () => {
//     const [stockManagementHistoryList, setStockManagementHistoryList] = useState<StockManagementRequestHistoryData[]>([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [loadingMessage, setLoadingMessage] = useState('');
//     const { addToast } = useToast();
//     const { projectId } = useProject(); 
//     const { pagination, setPagination } = usePagination(20);
//     const { canExport } = useMenuPermissions();
//     const [sortInfo] = useState<SortInfo | undefined>(undefined);
//     const { SubMaterialMasterId } = useParams<{ SubMaterialMasterId?: string }>();
//     const { listState } = useStockManagementListState();
//     const currentSubMaterialMasterId = SubMaterialMasterId ? Number(SubMaterialMasterId) : listState.SubMaterialMasterId;
//     const navigate = useNavigate();
//     const materialName = listState.MaterialName;
//     const subMaterialName = listState.SubMaterialName;

//     const MaterialRequisitionTabList = [
//         { id: 'History', label: 'History' },
//         { id: 'Material In', label: 'Material In' },
//         { id: 'Material Out', label: 'Material Out' },
//     ];

//     const [activeTab, setActiveTab] = useState<string>(MaterialRequisitionTabList[0].id);

//     const handleBackToStockManagement = () => {
//         navigate("/stock");
//     };

//     useEffect(() => {
//         if (!projectId) return
//         loadStockManagementHistoryData()
//     }, [projectId])

//     const loadStockManagementHistoryData = async (page: number = pagination.currentPage, sort?: SortInfo,) => {
//         await runApiWithLoader(
//             setIsLoading,
//             setLoadingMessage,
//             async () => {
//                 const params: FilterWithPaginationStockManagementHistoryRequest = {
//                     PageNumber: page,
//                     PageSize: pagination.pageSize,
//                     ProjectId: Number(projectId),
//                     SubMaterialMasterId: currentSubMaterialMasterId,
//                     SortBy: getSortByParam(sort ?? null, StockManagementHistoryColumn)
//                 };

//                 const response = await stockManagementService.apiCallPullStockManagementHistory(params);

//                 if (E.isRight(response)) {

//                     setStockManagementHistoryList(response.right.Data);
//                     setPagination({
//                         currentPage: page,
//                         totalRecords: response.right.TotalNumberOfRecord,
//                         totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
//                     });
//                 } else {
//                     addToast({ type: 'error', title: response.left.message });
//                     return response;
//                 }
//             },
//             undefined,
//             (error: any) => addToast({ type: 'error', title: error.message }),
//             undefined,
//             'Loading Stocks History'
//         );
//     }

//     const StockManagementHistoryColumn = useMemo<TableColumn[]>(
//         () => [
//             // {
//             //     key: "MaterialName",
//             //     label: 'Material Name',
//             //     width: "20",
//             //     sortable: false,
//             //     fixed: "left",
//             //     align: "left",
//             //     render: (value) => (
//             //         <TooltipText
//             //             text={value || "-"}
//             //             maxWidth="250px"
//             //             tooltipThreshold={25}
//             //         />
//             //     ),
//             // },
//             // {
//             //     key: "SubMaterialName",
//             //     label: 'Sub Material',
//             //     width: "20",
//             //     sortable: false,
//             //     align: "left",
//             //     render: (value) => (
//             //         <TooltipText
//             //             text={value || "-"}
//             //             maxWidth="250px"
//             //             tooltipThreshold={25}
//             //         />
//             //     ),
//             // },
//             {
//                 key: "MaterialQuantityInwardOutward",
//                 label:
//                     activeTab === "Material In" ? "Material In"
//                         : activeTab === "Material Out" ? "Material Out"
//                             : "Material in / out",
//                 width: "20",
//                 sortable: false,
//                 align: "left",
//                 render: (value, row) => {
//                     if (!value) return "-";

//                     const isInward = row.InwardOutwardType === "INWARD";
//                     return (
//                         <span className={isInward ? "text-green-600" : "text-red-600"}>
//                             {isInward ? "+" : "-"}{value} {row.UomCode}
//                         </span>
//                     );
//                 }
//             },
//             // {
//             //     key: "VendorName",
//             //     label:
//             //         activeTab === "Material In" ? "Vendor Name" : "Vendor Name",
//             //     width: "20",
//             //     sortable: false,
//             //     fixed: "left",
//             //     align: "left",
//             //     render: (value) => (
//             //         <TooltipText
//             //             text={value || "-"}
//             //             maxWidth="250px"
//             //             tooltipThreshold={25}
//             //         />
//             //     ),
//             // },
//             // {
//             //     key: "PoNo",
//             //     label: 'Po No',
//             //     width: "20",
//             //     sortable: false,
//             //     fixed: "left",
//             //     align: "left",
//             //     render: (value) => (
//             //         <TooltipText
//             //             text={value || "-"}
//             //             maxWidth="250px"
//             //             tooltipThreshold={25}
//             //         />
//             //     ),
//             // },
//             {
//                 key: "Reason",
//                 label: 'Remark',
//                 width: "20",
//                 sortable: false,
//                 fixed: "left",
//                 align: "left",
//                 render: (value) => (
//                     <TooltipText
//                         text={value || "-"}
//                         maxWidth="250px"
//                         tooltipThreshold={25}
//                     />
//                 ),
//             },
//             {
//                 key: "CreatedBy",
//                 label: 'Created By',
//                 width: "20",
//                 sortable: false,
//                 align: "left",
//                 render: (value) => value || "-"
//             },
//             {
//                 key: "CreatedDate",
//                 label: 'Created Date',
//                 width: "20",
//                 sortable: false,
//                 align: "left",
//                 render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : "-"
//             },
//         ], [activeTab])

//     const handlePageChange = (page: number) => {
//         setPagination({ currentPage: page });
//         loadStockManagementHistoryData(page);
//     };

//     const StockManagementHistoryPaginationInfo: PaginationInfo = useMemo(
//         () => ({
//             currentPage: pagination.currentPage,
//             totalPages: pagination.totalPages,
//             totalRecords: pagination.totalRecords,
//             pageSize: pagination.pageSize,
//             onPageChange: handlePageChange,
//         }),
//         [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize],
//     );

//     const StockManagementHistoryForTable = useMemo(() => {
//         if (activeTab === 'History') return stockManagementHistoryList;

//         const typeMap: Record<string, string> = {
//             'Material In': 'INWARD',
//             'Material Out': 'OUTWARD',
//         };

//         return stockManagementHistoryList.filter(
//             (item) => item.InwardOutwardType === typeMap[activeTab]
//         );
//     }, [stockManagementHistoryList, activeTab]);

//     // const StockManagementHistoryPaginationInfo: PaginationInfo = useMemo(
//     //     () => ({
//     //         currentPage: pagination.currentPage,
//     //         totalPages: Math.ceil(StockManagementHistoryForTable.length / pagination.pageSize),
//     //         totalRecords: StockManagementHistoryForTable.length,
//     //         pageSize: pagination.pageSize,
//     //         onPageChange: handlePageChange,
//     //     }),
//     //     [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize],
//     // );

//     // const StockManagementHistoryForTable = useMemo(() => stockManagementHistoryList, [stockManagementHistoryList]);

//     const handleExportStockManagementHistory = async (exportType: 'Excel' | 'PDF') => {
//         await runApiWithLoader(
//             setIsLoading,
//             setLoadingMessage,
//             async () => {
//                 const params: FilterWithPaginationStockManagementHistoryRequest = {
//                     PageNumber: 1,
//                     PageSize: pagination.totalRecords,
//                     ProjectId: Number(projectId),
//                     SubMaterialMasterId: currentSubMaterialMasterId,
//                     SortBy: getSortByParam(sortInfo ?? null, StockManagementHistoryColumn),
//                     ExportType: exportType,
//                 };

//                 const response = await stockManagementService.apiCallPullStockManagementHistory(params);

//                 handleExportFile(response, exportType, "Stock Management", addToast);

//                 return response;
//             },
//             undefined,
//             (error: any) =>
//                 addToast({ type: "error", title: error.message || "Export failed" }),
//             undefined,
//             "Preparing Export",
//         );
//     }

//     const handleExportStockManagementHistoryExcel = () => handleExportStockManagementHistory("Excel");
//     const handleExportStockManagementHistoryPdf = () => handleExportStockManagementHistory("PDF")

//     return (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
//             <Loader loading={isLoading} title={loadingMessage}> {" "} <div></div>{" "}</Loader>

//             <div className="flex justify-between">
//                 <HeaderActionBar
//                     subTitleText={materialName ?? ""}
//                     subSubTitleText={subMaterialName ?? ""}
//                     cancelText="Cancel"
//                     EditText="Edit"
//                     onCancel={() => handleBackToStockManagement()}
//                 />

//                 <TableActionToolbar
//                     isShowSearchBar={false}
//                     isShowExportButton={canExport && StockManagementHistoryForTable.length > 0}
//                     onExportExcel={handleExportStockManagementHistoryExcel}
//                     onExportPdf={handleExportStockManagementHistoryPdf}
//                     exportLoading={isLoading}
//                 />
//             </div>

//             <div className="pt-0 pb-3">
//                 <Tabs
//                     tabs={MaterialRequisitionTabList}
//                     defaultActive={activeTab}
//                     islarge
//                     onTabChange={(t) => setActiveTab(t.id)}
//                 />
//             </div>

//             <DataTable
//                 data={StockManagementHistoryForTable}
//                 columns={StockManagementHistoryColumn}
//                 pagination={StockManagementHistoryPaginationInfo}
//                 emptyMessage="No Stock History Data found"
//                 fixedHeight
//                 recordsPerPage={20}
//                 className="flex-1"
//             />
//         </div>
//     )
// }
// export default ViewStockManagement





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
