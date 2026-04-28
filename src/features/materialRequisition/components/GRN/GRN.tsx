import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type MaterialRequisitionGRNData, type FilterWithPaginationMaterialRequisitionGRN, type FilterWithPaginationMaterialRequisitionGRNSummary, type MaterialRequisitionGRNSummaryData, type MaterialRequisitionDetailGRNData } from "../../models/MaterialRequisitionGRNModel";
import { useMaterialRequisitionListState } from "../../context/MaterialRequisitionListStateContext";
import { useNavigate, useParams } from "react-router-dom";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { type TableColumn } from "@/ui/components/DataTable/DataTable";
import { materialRequisitionGRNService } from "../../services/MaterialRequisitionGRNService";
import * as E from "fp-ts/Either";
import { Modal } from "@/ui/components/Modal/Modal";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import DataTableExpandable, { type DataTableExpandableRef } from "@/ui/components/DataTable/DataTableExpandable";
import { PencilLine } from "lucide-react";
import { Loader } from "@/core/utils/loader";
import { Button } from "@/ui/components/forms";


export const GRN: React.FC = () => {

    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { projectId } = useProject();
    const { addToast } = useToast();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const currentUniquekey = listState.Uniquekey
    const GRNTableRef = useRef<DataTableExpandableRef>(null);
    const [GRNData, SetGRNData] = useState<MaterialRequisitionDetailGRNData[]>([]);
    const [GRN, SetGRN] = useState<MaterialRequisitionGRNData[]>([]);
    const [isViewGRNSummaryModalOpen, setIsViewGRNSummaryModalOpen] = useState(false);
    const [GRNSummaryDetailData, setGRNSummaryDetailData] = useState<MaterialRequisitionGRNSummaryData[]>([]);
    const { canAction } = useMenuPermissions();
    const navigate = useNavigate();

    useEffect(() => {
        if (!projectId) return;
        loadGRNData()
    }, [projectId, currentMaterialRequisitionId])

    const loadGRNSummaryData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionGRNSummary = {
                    PageNumber: 1,
                    PageSize: 100,
                    MaterialRequisitionId: currentMaterialRequisitionId,
                    Uniquekey: currentUniquekey,
                };

                const response = await materialRequisitionGRNService.apiCallPullMaterialRequisitionGRNSummary(params);

                if (E.isRight(response)) {

                    setGRNSummaryDetailData(response.right.Data);
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
            "Loading GRN Summary",
        );
    };
    const handleAddGRN = useCallback(() => {
        navigate('/finalizeVendor/add');
    }, [navigate]);


    const loadGRNData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionGRN = {

                    MaterialRequisitionId: currentMaterialRequisitionId,
                    Uniquekey: currentUniquekey,
                    ProjectId: Number(projectId)

                };

                const response = await materialRequisitionGRNService.apiCallPullMaterialRequisitionGRN(params);

                if (E.isRight(response)) {
                    const data = response.right.Data;
                    SetGRNData(
                        data?.[0]?.MaterialRequisitionDetailGRNData ?? []
                    );
                    SetGRN(data)
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

    const MaterialRequisitionGRNColumns = useMemo<TableColumn[]>(() =>
        [
            {
                key: 'MaterialName',
                label: 'Material Name',
                width: '20',
                sortable: false,
                align: 'left',
                render: (value?: string) => value || '-'
            },
            {
                key: 'SubMaterialName',
                label: 'Sub Material',
                width: '20',
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
                key: 'Uom',
                label: 'UOM',
                width: '20',
                sortable: false,
                align: 'left',
                render: (value?: string) => value || '-'
            },
            {
                key: 'MaterialQuantity',
                label: 'Quantity',
                width: '20',
                sortable: false,
                align: 'left',
                render: (value?: string) => value || '-'
            },

            {
                key: 'TotalReceivedMaterialQuantity',
                label: 'Received Quantity',
                width: '20',
                sortable: false,
                align: 'left',
                render: (value?: string) => value || '-'
            },
            {
                key: 'PendingQuantity',
                label: 'Pending Quantity',
                width: '20',
                sortable: false,
                align: 'left',
                render: (_: any, row: MaterialRequisitionDetailGRNData) =>
                    (row.MaterialQuantity || 0) -
                    (row.TotalReceivedMaterialQuantity || 0)
            }


        ], [])

    const MaterialRequisitionDetailColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'MaterialName',
            label: 'Material Name',
            width: '20',
            sortable: false,
            align: 'left',
            render: (value?: string) => value || '-'
        },
        {
            key: 'SubMaterialName',
            label: 'Sub Material',
            width: '20',
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
            width: '20',
            sortable: false,
            align: 'left',
            render: (value?: string) => value || '-'
        },
    ], []);

    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}> {" "}<div></div>{" "} </Loader>

            <div className="flex justify-end gap-4">
                <TableActionToolbar
                    isShowSearchBar={false}
                    isShowAddButton={canAction}
                    addTitle="Add GRN"
                    onAdd={handleAddGRN}
                />

                <Button
                    size="md"
                    color="transparent"
                    style={{
                        color: '#FFFFFF',
                        padding: '4px 8px',
                        backgroundColor: '#135BEC'
                    }}
                    onClick={() => {
                        setIsViewGRNSummaryModalOpen(true);
                        loadGRNSummaryData()
                    }}
                >
                    View Summary
                </Button>
            </div>

            <DataTableExpandable
                ref={GRNTableRef}
                data={GRNData}
                columns={MaterialRequisitionGRNColumns}
                emptyMessage={'No GRN Found'}
                expandable={{
                    keyField: 'MaterialRequisitionDetailGRNId',
                    alwaysFetchOnOpen: false,

                    fetchRow: async (row) => row,
                    renderRow: (row) => {
                        return (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex justify-between items-end">

                                    <div className="grid grid-cols-4 gap-6 text-sm w-full">
                                        <FieldItem label="Date" value={formatDate_dd_MonthName_yy(row.CreatedDate)} />
                                        <FieldItem label="Challan No." value={row.ChallanNumber || '-'} />
                                        <FieldItem label="Vehicle No." value={row.VehicleNumber || '-'} />
                                        <FieldItem label="Quantity" value={row.MaterialQuantity || '-'} />
                                    </div>

                                    <div className="ml-4 bg-gray-200 p-1 rounded-md cursor-pointer mb-1">
                                        <PencilLine className="h-4 w-4" />
                                    </div>

                                </div>
                            </div>
                        );
                    },

                    expandButton: { openText: 'Hide', closeText: 'Show' }
                }}
            />
            {/* <DataTableExpandable data={GRNData} columns={MaterialRequisitionGRNColumns} /> */}
            <Modal
                isOpen={isViewGRNSummaryModalOpen}
                onClose={() => {
                    setIsViewGRNSummaryModalOpen(false);
                }}
                onCancel={() => {
                    setIsViewGRNSummaryModalOpen(false);
                }}
                title={'GRN Summary'}
                loading={isLoading}
                cancelText="cancel"
                size="xl"
            >
                <div className="space-y-4">
                    {GRNSummaryDetailData?.map((item, index) => (
                        <div key={index} className="bg-[#EFF6FF] rounded-lg shadow-sm border border-gray-300 p-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-3">
                                <FieldItem label="Date" value={formatDate_dd_MonthName_yy(item?.CreatedDate ?? '')} />
                                <FieldItem label="Challan No." value={item?.ChallanNumber || '-'} />
                                <FieldItem label="Vehicle No." value={item?.VehicleNumber || '-'} />

                                <div>
                                    <p className="text-gray-500">Document</p>
                                    <MultiImageViewer
                                        images={parseDocumentUrls(item?.UploadChallanURL)}
                                        title="Attachment"
                                        isIcon={false}
                                        triggerLabel="-"
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 space-y-4 shadow-sm border border-gray-300 h-[220px]">
                                <DataTableWithOutBorder
                                    columns={MaterialRequisitionDetailColumns}
                                    data={GRNSummaryDetailData}
                                    emptyMessage="No Material Requisition Found"
                                    fixedHeight={true}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    )
}
export default GRN