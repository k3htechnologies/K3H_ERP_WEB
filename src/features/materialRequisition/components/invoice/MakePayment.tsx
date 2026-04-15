import { useEffect, useMemo, useState } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { useNavigate, useParams } from "react-router-dom";
import { useMaterialRequisitionListState } from "../../context/MaterialRequisitionListStateContext";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

import type { FilterWithPaginationMaterialRequisitionGRN, MaterialRequisitionGRNData } from "../../models/MaterialRequisitionGRNModel";
import { materialRequisitionGRNService } from "../../services/MaterialRequisitionGRNService";
import type { FilterWithPaginationMaterialRequisition, MaterialRequisitionDetailData } from "../../models/MaterialRequisitionModel";
import { materialRequisitionService } from "../../services/MaterialRequisitionService";
import type { TableColumn } from "@/ui/components/DataTable/DataTable";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { materialRequisitionInvoiceService } from "../../services/MaterialRequisitionInvoiceService";
import type { FilterWithPaginationMaterialRequisitionInvoice, MaterialRequisitionInvoiceData } from "../../models/MaterialRequisitionInvoiceModel";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { Button } from "@/ui/components/forms";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import TooltipText from "@/ui/components/Tooltip/TooltipText";

const MakePayment: React.FC = () => {
    const [gRNData, setRGNData] = useState<MaterialRequisitionGRNData | null>(null);
    const [matrialRequisitionDetailData, setMaterialRequisitionDetailData] = useState<MaterialRequisitionDetailData[]>([]);
    const [invoiceData, setInvoiceData] = useState<MaterialRequisitionInvoiceData | null>(null);

    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { projectId } = useProject();
    const { addToast } = useToast();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const currentUniquekey = listState.Uniquekey
    const navigate = useNavigate();


    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/materialRequisition/view');
    //#endregion

    useEffect(() => {
        if (!projectId) return;
        loadGRNData();
        fetchMaterialRequisitionDetailData();
        loadInvoiceData();
    }, [projectId, currentMaterialRequisitionId])

    const loadGRNData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionGRN = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: Number(projectId),
                    MaterialRequisitionId: currentMaterialRequisitionId,
                    Uniquekey: currentUniquekey
                };

                const response = await materialRequisitionGRNService.apiCallPullMaterialRequisitionGRN(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    setRGNData(Array.isArray(data) ? (data[0] ?? null) : data);
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
            "Loading GRN",
        );
    };

    const fetchMaterialRequisitionDetailData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisition = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: Number(projectId),
                    MaterialRequisitionId: currentMaterialRequisitionId,
                };

                const response = await materialRequisitionService.apiCallPullMaterialRequisition(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    const Item = Array.isArray(data) ? data[0] : data;

                    setMaterialRequisitionDetailData(Item?.MaterialRequisitionDetailData ?? []);
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
            "Loading Material Requisition",
        );
    };

    const loadInvoiceData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionInvoice = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: Number(projectId),
                    MaterialRequisitionId: currentMaterialRequisitionId,
                    Uniquekey: currentUniquekey
                };

                const response = await materialRequisitionInvoiceService.apiCallPullMaterialRequisitionInvoice(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    setInvoiceData(Array.isArray(data) ? (data[0] ?? null) : data);
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
            "Loading Invoice",
        );
    };

    const MaterialRequisitionDetailColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'MaterialName',
            label: 'Material Name',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => value || '-'
        },
        {
            key: 'SubMaterialName',
            label: 'Sub Material',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value?: string) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="180px"
                    tooltipThreshold={18}
                />
            )
        },
        {
            key: 'MaterialQuantity',
            label: 'Quantity',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => value || '-'
        },
    ], []);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

            {/* Loader */}
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>

            <div className="pb-2">
                <HeaderActionBar
                    titleText={'Make Payment'}
                    cancelText="Cancel"
                    onCancel={() => navigate(-1)}

                />
            </div>

            <div className="gap-x-4 bg-[#EFF6FF] rounded-lg shadow-sm border border-gray-300 p-4 mb-4">
                <div className="lg:col-span-5 pb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FieldItem label="Date" value={formatDate_dd_MonthName_yy(gRNData?.CreatedDate ?? '')} />
                        <FieldItem label="Challan No." value={gRNData?.ChallanNumber} />
                        <FieldItem label="Vehicle No." value={gRNData?.VehicleNumber} />
                        <FieldItem label="Total Requisition Amount" value={gRNData?.Remarks} />
                        <FieldItem label="Paid  Requisition Amount" value={gRNData?.VehicleNumber} />
                        <FieldItem label="Remaining Requisition Amount " value={gRNData?.VehicleNumber} />
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 space-y-4 h-[110px] shadow-sm border border-gray-300 ">
                    <DataTableWithOutBorder
                        columns={MaterialRequisitionDetailColumns}
                        data={matrialRequisitionDetailData}
                        emptyMessage="No Material Requisition Found"
                        fixedHeight={true}
                        className="flex-1"
                    />
                </div>
            </div>

            <div className="gap-x-4 rounded-lg shadow-sm border border-gray-300 p-4 mb-4">

                <div className="flex justify-between mb-2">
                    <FieldItem label="Invoice Number" value={invoiceData?.InvoiceNumber} />
                    <Button
                        size="sm"
                    >
                        Make Payment
                    </Button>
                </div>

                <div className="lg:col-span-5 pb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FieldItem label="Invoice Amount" value={invoiceData?.InvoiceAmount} />
                        <FieldItem label="Invoice Date" value={formatDate_dd_MonthName_yy(invoiceData?.InvoiceDate ?? '')} />
                        <FieldItem label="DuDate" value={formatDate_dd_MonthName_yy(invoiceData?.InvoiceDueDate ?? '')} />
                        <div>
                            <p className="text-gray-500">Invoice Document</p>
                             <MultiImageViewer
                                images={parseDocumentUrls(invoiceData?.UploadInvoiceURL)}
                                title="Attachment"
                                isIcon={false}
                                triggerLabel="-"
                            />
                        </div>
                        <div>
                            <p className="text-gray-500">Performance Report</p>
                            <MultiImageViewer
                                images={parseDocumentUrls(invoiceData?.PerformaInvoiceURL)}
                                title="Attachment"
                                isIcon={false}
                                triggerLabel="-"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 pt-2">
                        <FieldItem label="Remarks" value={invoiceData?.Remarks} />
                    </div>
                </div>
            </div>
        </div>

    )
}
export default MakePayment;