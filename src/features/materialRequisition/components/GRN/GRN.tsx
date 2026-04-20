import { runApiWithLoader } from "@/core/utils";
import { useEffect, useMemo, useState } from "react";
import type { FilterWithPaginationMaterialRequisitionGRNSummary, MaterialRequisitionGRNSummaryData } from "../../models/MaterialRequisitionGRNModel";
import { useMaterialRequisitionListState } from "../../context/MaterialRequisitionListStateContext";
import { useParams } from "react-router-dom";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import type { TableColumn } from "@/ui/components/DataTable/DataTable";
import { materialRequisitionGRNService } from "../../services/MaterialRequisitionGRNService";
import * as E from "fp-ts/Either";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button } from "@/ui/components/forms";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";

export const GRN: React.FC = () => {

    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { projectId } = useProject();
    const { addToast } = useToast();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const currentUniquekey = listState.Uniquekey
    const [isViewGRNSummaryModalOpen, setIsViewGRNSummaryModalOpen] = useState(false);
    const [GRNSummaryDetailData, setGRNSummaryDetailData] = useState<MaterialRequisitionGRNSummaryData[]>([]);

    useEffect(() => {
        if (!projectId) return;
        loadGRNSummaryData();
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

                    setIsViewGRNSummaryModalOpen(false);

                    setGRNSummaryDetailData(response.right.Data);
                } else {
                    addToast({ type: "error", title: response.left.message });

                    setIsViewGRNSummaryModalOpen(false);
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

            <div className="flex justify-end">
                <Button
                    className="bg-blue-600 text-white font-bold py-1 px-4 rounded-md"
                    onClick={() => {
                        setIsViewGRNSummaryModalOpen(true);
                    }}
                >
                    View Summary
                </Button>
            </div>

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
                        <div
                            key={index}
                            className="bg-[#EFF6FF] rounded-lg shadow-sm border border-gray-300 p-4"
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

                            <div className="bg-white rounded-lg p-4 space-y-4 shadow-sm border border-gray-300">
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