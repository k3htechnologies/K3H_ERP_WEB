import { runApiWithLoader } from "@/core/utils";
import { useMemo, useState } from "react";
import type { MaterialRequisitionData, MaterialRequisitionDetailData } from "@/features/materialRequisition/models/MaterialRequisitionModel";
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

export const Details: React.FC<OverviewProps> = ({ matrialRequisitionData, matrialRequisitionDetailData }) => {

    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [, setMaterialRequisitionList] = useState<MaterialRequisitionData[]>([]);
    const [isSplit, setIsSplit] = useState(false);
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
                MaterialName: item.MaterialName,
                SubMaterialMasterId: item.SubMaterialMasterId,
                SubMaterialName: item.SubMaterialName,
                UomCode: item.UomCode,
                UomMasterId: item.UomMasterId,
                LevelId1: item.LevelId1,
                Level1Name: item.Level1Name,
                LevelId2: item.LevelId2,
                Level2Name: item.Level2Name,
                LevelId3: item.LevelId3,
                Level3Name: item.Level3Name,
                LevelId4: item.LevelId4,
                Level4Name: item.Level4Name,
                Level4SubMaterialUomCode: item.Level4SubMaterialUomCode,
                Level4SubMaterialUom: item.Level4SubMaterialUom,
                MaterialQuantity: item.MaterialQuantity,
                RequiredDate: item.RequiredDate,
                MaterialRequisitionType: item.MaterialRequisitionType,
                Remark: item.Remark
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

                    setIsSplit(false);

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

    const selectedMaterials = matrialRequisitionDetailData.filter(item => selectedIds.includes(item.MaterialRequisitionDetailId));

    const ShowSplitButton = matrialRequisitionData?.IsSplit && isSplit !== true

    const MatrialRequisitionDetailColumns = useMemo<TableColumn[]>(() => {

        const isDirect = matrialRequisitionDetailData?.[0]?.MaterialRequisitionType?.toUpperCase() === "DIRECT";

        const columns: TableColumn[] = [];

        if (isSplit) {
            columns.push({
                key: "select",
                label: "",
                align: "center",
                width: "5",
                render: (_value, row) => (
                    <Checkbox
                        size="sm"
                        checked={selectedIds.includes(row.MaterialRequisitionDetailId)}
                        onChange={() => {
                            const id = row.MaterialRequisitionDetailId;

                            setSelectedIds(prev =>
                                prev.includes(id)
                                    ? prev.filter(x => x !== id)
                                    : [...prev, id]
                            );
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                ),
            },
                {
                    key: "MaterialRequisitionType",
                    label: "Type",
                    align: "left",
                    width: "30",
                    render: (value) => value || "-"
                },);
        }


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
                            tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
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
                            tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
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
    }, [matrialRequisitionDetailData, isSplit, selectedIds]);

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
                <div className="bg-[#FCF1FF] px-4 py-2 border-b border-[#D0D7DE] flex items-center justify-between">

                    <h4 className="text-sm font-semibold text-[#7E22CE] flex items-center gap-2">
                        Material Details
                        <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-[#F3DEF9] text-[#561F64] text-xs font-semibold">
                            {matrialRequisitionDetailData.length}
                        </span>
                        :

                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#F3DEF9] text-[#561F64] text-xs font-semibold">
                            {matrialRequisitionDetailData?.[0]?.MaterialRequisitionType || "-"}
                        </span>
                    </h4>

                    <div className="flex items-center gap-2">
                        
                        {ShowSplitButton && !isSplit && (

                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setIsSplit(true)
                                }}
                                className="flex px-3 py-0.3 mr-2 border border-[#135BEC] text-[#135BEC] bg-white hover:bg-black-50 rounded-md gap-2">

                                <span>Split</span>
                            </button>

                        )}



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


                {isSplit && (
                    <div className="flex justify-end items-center gap-2 px-3 py-2 border-t border-[#D0D7DE] bg-white">
                        <Button
                            color="transparent"
                            variant="transparent_border"
                            size="sm"
                            onClick={() => {
                                setIsSplit(false);
                                setSelectedIds([]);
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            size="sm"
                            color="blue"
                            style={{
                                padding: "4px 12px",
                            }}
                            onClick={() => {
                                if (selectedIds.length === 0) {
                                    addToast({ type: "error", title: "Please select at least one material", });
                                    return;
                                }
                                if (selectedIds.length === matrialRequisitionDetailData.length) {
                                    addToast({ type: "error", title: "At least one material must remain in the current requisition." });
                                    return;
                                }

                                setIsAddUpdateModalOpen(true);
                            }} >
                            Split
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

                title={'Split Material Requisition'}
                onSubmit={handleSplitMaterialRequisition}
                saveText={'Move To New Requisition'}
                loading={isLoading}
                cancelText="cancel"
                size="xl"
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >
                        {selectedMaterials.map((item) => (
                            <div key={item.MaterialRequisitionDetailId} className="flex items-center gap-x-4">
                                <Checkbox checked={selectedIds.includes(item.MaterialRequisitionDetailId)} />
                                <p className="font-semibold">{item.SubMaterialName || item.Level4Name}</p>
                            </div>
                        ))}

                    </div>
                </div>
            </Modal>


        </div>
    )
}
export default Details;