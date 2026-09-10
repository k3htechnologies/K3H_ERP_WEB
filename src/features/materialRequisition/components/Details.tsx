import { runApiWithLoader } from "@/core/utils";
import {  useMemo, useState } from "react";
import type {  MaterialRequisitionData, MaterialRequisitionDetailData } from "@/features/materialRequisition/models/MaterialRequisitionModel";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { materialRequisitionService } from "@/features/materialRequisition/services/MaterialRequisitionService";
import { Loader } from "@/core/utils/loader";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { Modal } from "@/ui/components/Modal/Modal";
import Checkbox from "@/ui/components/forms/Checkbox";
import { Button } from "@/ui/components/forms";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";
import { DataTableWithHeaderRowDivider, type TableColumn } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";

interface OverviewProps {
    matrialRequisitionData: MaterialRequisitionData | null;
    matrialRequisitionDetailData: MaterialRequisitionDetailData[];
}

export const Details: React.FC<OverviewProps> = ({matrialRequisitionData, matrialRequisitionDetailData }) => {

    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [, setMaterialRequisitionList] = useState<MaterialRequisitionData[]>([]);
    const [active, setActive] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const { projectId } = useProject();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const currentUniquekey = listState.Uniquekey;
    const navigate = useNavigate();

    const PushSplitMaterialRequisitionFormData = (): FormData => {

        const fd = new FormData();

        fd.append("ProjectId", Number(projectId).toString());
        fd.append("MaterialRequisitionId", currentMaterialRequisitionId.toString());
        fd.append("Uniquekey", currentUniquekey);
        fd.append("Remarks", matrialRequisitionData?.Remarks ?? '');
        fd.append("IsSplit", "1");
        fd.append("IsCopy", "0");
        fd.append("MaterialRequisitionDetailJSON", JSON.stringify(matrialRequisitionDetailData
            .filter(item => selectedIds.includes(item.MaterialRequisitionDetailId))
            .map(item => ({
                MaterialRequisitionDetailId: item.MaterialRequisitionDetailId,
                MaterialMasterId: item.MaterialMasterId,
                MaterialQuantity: item.MaterialQuantity,
                UomMasterId: item.UomMasterId,
                RequiredDate: item.RequiredDate,
                SubMaterialMasterId: item.SubMaterialMasterId,
            }))
        ));
        return fd;
    };

    const handleSplitMaterialRequisition = async (e: React.FormEvent) => {
        e.preventDefault();

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushSplitMaterialRequisitionFormData();

                const response = await materialRequisitionService.apiCallToAddMaterialRequisition(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const newRecord = response.right.Data as MaterialRequisitionData;

                    setSelectedIds([]);

                    setActive(false);

                    setMaterialRequisitionList(prev => [newRecord, ...prev]);

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    navigate("/materialRequisition");

                } else {
                    addToast({ type: "error", title: response.left?.message });
                    setIsAddUpdateModalOpen(false)
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Split Material Requisition'
        );
    };

    const selectedMaterials = matrialRequisitionDetailData.filter(item =>selectedIds.includes(item.MaterialRequisitionDetailId) );

    const ShowSplitButton = matrialRequisitionData?.IsSplit && active !== true

    const MatrialRequisitionDetailColumns = useMemo<TableColumn[]>(() => {

        const isDirect = matrialRequisitionDetailData?.[0]?.MaterialRequisitionType?.toUpperCase() === "DIRECT";

        const columns: TableColumn[] = [];

        if (isDirect) {
            columns.push(
                {
                    key: "Level1Name",
                    label: "Category",
                    align: "left",
                    width: "30",
                    render: (value) => value || "-"
                },
                {
                    key: "Level2Name",
                    label: "Sub Category",
                    align: "left",
                    width: "30",
                    render: (value) => value || "-"
                },
                {
                    key: "Level3Name",
                    label: "Description",
                    align: "left",
                    width: "30",
                    render: (value) => (
                        <TooltipText
                            text={value || "-"}
                            maxWidth="250px"
                            tooltipThreshold={25}
                        />
                    )
                },
                {
                    key: "Level4Name",
                    label: "Sub Material",
                    align: "left",
                    width: "30",
                    render: (value) => (
                        <TooltipText
                            text={value || "-"}
                            maxWidth="250px"
                            tooltipThreshold={25}
                        />
                    )
                },

            );
        } else {
            columns.push(
                {
                    key: "MaterialName",
                    label: "Material",
                    align: "left",
                    width: "30",
                    render: (value) => (
                        <TooltipText
                            text={value || "-"}
                            maxWidth="250px"
                            tooltipThreshold={25}
                        />
                    )
                },
                {
                    key: "SubMaterialName",
                    label: "Sub Material",
                    align: "left",
                    width: "30",
                    render: (value) => (
                        <TooltipText
                            text={value || "-"}
                            maxWidth="250px"
                            tooltipThreshold={25}
                        />
                    )
                },

            );
        }

        columns.push(
            {
                key: "MaterialQuantity",
                label: "Quantity",
                align: "left",
                width: "30",
                render: (value, row) => {
                    return isDirect ? `${value ?? 0} ${row.Level4SubMaterialUomCode ?? ""}`.trim() : `${value ?? 0} ${row.UomCode ?? ""}`.trim() ?? 0;
                }
            },

            {
                key: "RequiredDate",
                label: "Required Date",
                align: "left",
                width: "30",
                render: (value) =>
                    value ? formatDate_dd_MonthName_yy(value) : "-"
            },
            {
                key: "Remark",
                label: "Remark",
                align: "left",
                width: "30",
                render: (value) => (
                    <FieldInfoTooltip value={value} />
                )
            },

        );

        return columns;
    }, [matrialRequisitionDetailData]);

    return (
        <div className="justify-center pt-5">
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>

            <div className="border border-[#33333321] rounded-xl overflow-hidden mb-4 mt-2">
                <div className="bg-[#E7F2FF] px-4 py-2 border-b border-[#D0D7DE]">
                    <h4 className="text-sm font-semibold text-[#1D4ED8]">
                        Basic Details
                    </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-b border-[#135bec2e]">
                    <FieldItem label="MR Code" value={matrialRequisitionData?.SystemGeneratedCode} />
                    <FieldItem label="Status" value={matrialRequisitionData?.MaterialRequisitionStatus} />
                    <FieldItem label="Stage" value={matrialRequisitionData?.MaterialRequisitionStage} />

                    <div>
                        <p className="text-gray-500">Attachment</p>
                        <MultiImageViewer
                            images={parseDocumentUrls(matrialRequisitionData?.AttachmentsURL ?? '')}
                            title="Attachment"
                            isIcon={false}
                            triggerLabel="-"
                        />
                    </div>

                </div>
            </div>

            <section className="border border-[#33333321] rounded-xl overflow-hidden mb-4">
                 <div className="bg-[#F3E8FF] px-4 py-2 border-b border-[#D0D7DE] flex items-center justify-between">

                    <h4 className="text-sm font-semibold text-[#7E22CE] flex items-center gap-2">
                        Material Details :
                        <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-[#7E22CE] text-white text-xs font-bold">
                            {matrialRequisitionDetailData.length}
                        </span>
                    </h4>

                    <div className="flex items-center gap-2">
                        {ShowSplitButton && !active && (
                            <Button
                                color="blue"
                                size="sm"
                                onClick={() => setActive(true)}
                            >
                                Split
                            </Button>
                        )}

                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#7E22CE] text-[#ffffff] text-xs font-medium">
                            {matrialRequisitionDetailData?.[0]?.MaterialRequisitionType || "-"}
                        </span>

                    </div>

                </div>


                <div className="overflow-y-auto thin-scroll">
                    <DataTableWithHeaderRowDivider
                        columns={MatrialRequisitionDetailColumns}
                        data={matrialRequisitionDetailData}
                        emptyMessage="No Material Requisition Details Found"
                        fixedHeight={true}
                        className="flex-1"
                    />
                </div>


                {active && (
                    <div className="flex justify-end items-center gap-2 px-3 py-2 border-t border-[#D0D7DE] bg-white">
                        <Button
                            color="transparent"
                            variant="transparent_border"
                            size="md"
                            onClick={() => {
                                setActive(false);
                                setSelectedIds([]);
                            }}
                        >
                            Cancel Split
                        </Button>

                        <Button
                            size="md"
                            color="blue"
                            style={{
                                padding: "4px 12px",
                            }}
                            onClick={() => {
                                if (selectedIds.length === 0) {
                                    addToast({ type: "error", title: "Please select at least one material", });
                                    return;
                                }
                                setIsAddUpdateModalOpen(true);
                            }}
                        >
                            Save Split
                        </Button>
                    </div>
                )}
            </section>

            <section className="border border-[#33333321] rounded-xl overflow-hidden mb-4">
                <div className="bg-[#E6FFE6] px-4 py-2 border-b border-[#D0D7DE]">
                    <h4 className="text-sm font-semibold text-[#00A800]">
                        Remarks
                    </h4>
                </div>

                <div className="p-4">
                    <span>{matrialRequisitionData?.Remarks || "-"}</span>
                </div>
            </section>

            <section className="border border-[#33333321] rounded-xl overflow-hidden mb-2">
                <div className="bg-[#E1E2E4] px-4 py-2 border-b border-[#D0D7DE]">
                    <h4 className="text-sm font-semibold text-[#333333]">
                        Action Details
                    </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-b border-[#135bec2e]">
                    <FieldItem label="Created By" value={matrialRequisitionData?.CreatedBy} />
                    <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy(matrialRequisitionData?.CreatedDate ?? '')} />
                    <FieldItem label="Modified By" value={matrialRequisitionData?.ModifiedBy} />
                    <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy(matrialRequisitionData?.ModifiedDate ?? '')} />
                </div>
            </section>



            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                }}
                title={'Split Material Entry'}
                onSubmit={handleSplitMaterialRequisition}
                saveText={'Move To New Entry'}
                loading={isLoading}
                cancelText="cancel"
                size="xl"
            >
                <div className="max-h-[400px] overflow-y-auto">
                    {selectedMaterials.map((item) => (
                        <div key={item.MaterialRequisitionDetailId} className="flex items-center gap-x-4">
                            <Checkbox checked={selectedIds.includes(item.MaterialRequisitionDetailId)} />
                            <p className="font-semibold">{item.SubMaterialName}</p>
                        </div>
                    ))}

                </div>
            </Modal>


        </div>
    )
}
export default Details;