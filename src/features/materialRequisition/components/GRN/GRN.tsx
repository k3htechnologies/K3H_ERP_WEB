import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type MaterialRequisitionGRNData, type FilterWithPaginationMaterialRequisitionGRN, type MaterialRequisitionDetailGRNData, type DeleteMaterialRequisitionGRN } from "@/features/materialRequisition/models/MaterialRequisitionGRNModel";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import { useNavigate, useParams } from "react-router-dom";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { type TableColumn } from "@/ui/components/DataTable/DataTable";
import { materialRequisitionGRNService } from "@/features/materialRequisition/services/MaterialRequisitionGRNService";
import * as E from "fp-ts/Either";
import { Modal } from "@/ui/components/Modal/Modal";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import DataTableExpandable from "@/ui/components/DataTable/DataTableExpandable";
import { Edit, Trash2 } from "lucide-react";
import { Loader } from "@/core/utils/loader";
import { Button } from "@/ui/components/forms";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { MaterialRequisitionDetailData } from "../../models/MaterialRequisitionModel";
import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";

interface GRNProps {
    matrialRequisitionDetailData: MaterialRequisitionDetailData[];
    onAddGRN?: () => Promise<void>;
}

export const GRN: React.FC<GRNProps> = ({ matrialRequisitionDetailData, onAddGRN }) => {

    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { projectId } = useProject();
    const { addToast } = useToast();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const isVendorFinalizationApproved =listState.VendorFinalizationApprovalStatus?.trim().toUpperCase() === "APPROVED";
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const currentUniquekey = listState.Uniquekey

    const materialRequisitionStatus = ["COMPLETED", "CLOSED"].includes(listState.MaterialRequisitionStatus?.toUpperCase())

    const [, SetGRNData] = useState<MaterialRequisitionDetailGRNData[]>([]);
    const [GRN, SetGRN] = useState<MaterialRequisitionGRNData[]>([]);
    const [isViewGRNSummaryModalOpen, setIsViewGRNSummaryModalOpen] = useState(false);
    const { canAction } = useMenuPermissions();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteMaterialRequisitionDetailGRNData, setDeleteMaterialRequisitionDetailGRNData] = useState<MaterialRequisitionGRNData | null>(null)

    useEffect(() => {
        if (!projectId) return;
        loadGRNData()
    }, [projectId, currentMaterialRequisitionId]);

    const handleAddGRN = useCallback(async () => {
        await onAddGRN?.();

        navigate('/materialRequisition/grn/add', {
            state: {
                matrialRequisitionDetailData,
            },
        });
    }, [navigate, matrialRequisitionDetailData, onAddGRN]);

    const filteredGRN = useMemo(() => {
        if (!searchTerm.trim()) return GRN;

        return GRN.filter(item =>
            item.ChallanNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [GRN, searchTerm]);

    const clearSearchGRN = () => {
        setSearchTerm('');
    };

    const handleGRNEdit = useCallback((row: MaterialRequisitionGRNData) => {
        navigate(
            `/materialRequisition/grn/add/${row.MaterialRequisitionId}/${row.MaterialRequisitionGRNId}`,
            {
                state: {
                    matrialRequisitionDetailData: row.MaterialRequisitionDetailGRNData ?? [],
                },
            }
        );
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

                    SetGRN(data)

                    SetGRNData(data?.[0]?.MaterialRequisitionDetailGRNData ?? []);

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



    const MaterialRequisitionGRNColumns = useMemo<TableColumn[]>(() => {

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
                key: "RequiredDate",
                label: "Required Date",
                align: "center",
                width: "30",
                render: (value) =>
                    value ? formatDate_dd_MonthName_yy(value) : "-"
            },
            {
                key: "MaterialQuantity",
                label: "Quantity",
                align: "right",
                width: "30",
                render: (value, row) => {
                    return isDirect ? `${value ?? 0} ${row.Level4SubMaterialUomCode ?? ""}`.trim() : `${value ?? 0} ${row.UomCode ?? ""}`.trim() ?? 0;
                }
            },
            {
                key: 'TotalReceivedMaterialQuantity',
                label: 'Received Quantity',
                width: '10',
                sortable: false,
                align: 'right',
                render: (value?: string) => value || '-'
            },
        );

        return columns;
    }, [GRN]);

    const firstGRNId = useMemo(() => {
        const id = GRN[0]?.MaterialRequisitionGRNId;
        return id != null ? String(id) : undefined;
    }, [GRN]);

    const handleConfirmationDialogBoxOpen = useCallback((row: MaterialRequisitionGRNData) => {
        setDeleteMaterialRequisitionDetailGRNData(row);
        setIsConfirmationDialogBoxOpen(true);
    }, []);

    const GRNColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'ChallanNumber',
            label: 'Challan Number',
            width: '25',
            render: (value?: string) => value || '-'
        },
        {
            key: 'UploadChallanURL',
            label: 'Challan',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value: string, row: any) => {
                return (
                    <div className="flex items-center justify-between w-full">
                        <MultiImageViewer
                            images={parseDocumentUrls(row.UploadChallanURL)}
                            title="Challan Document"
                            isIcon={false}
                            triggerLabel={value === '' || 'Challan'}
                        />

                    </div>
                );
            }
        },

        {
            key: 'VehicleNumber',
            label: 'Vehicle Number',
            width: '35',
            render: (value?: string) => value || '-'
        },
        {
            key: "Remarks",
            label: "Remark",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => (
                <FieldInfoTooltip value={value} />
            )
        },
        {
            key: "ModifiedBy",
            label: "Last Modified By",
            width: "15",
            sortable: false,
            align: "left",
            render: (value, row) => <TooltipText text={value || row.CreatedBy || "-"} maxWidth="180px" tooltipThreshold={18} />,
        },
        {
            key: "ModifiedDate",
            label: "Last Modified Date",
            width: "15",
            sortable: false,
            align: "left",
            render: (value, row) =>
                value ? formatDate_dd_MonthName_yy_hh_mm(value) : row.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(row.CreatedDate) : "-",
        },
        {
            key: 'actions',
            label: 'Actions',
            width: '10',
            align: 'center',
            render: (_: any, row: MaterialRequisitionGRNData) => {


                const isFirstRow = String(row.MaterialRequisitionGRNId) === firstGRNId;

                const approvalStatus = row.InvoiceStatus?.trim().toUpperCase();

                const canEditDelete =
                    canAction &&
                    !materialRequisitionStatus &&
                    isFirstRow &&
                    approvalStatus !== "APPROVED";

                return (
                    <div className="flex items-center justify-center gap-1">

                        {canEditDelete && (
                            <>
                                <Button
                                    type="button"
                                    color="transparent"
                                    size="sm"
                                    style={{
                                        color: '#2563eb'
                                    }}
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        await onAddGRN?.();

                                        handleGRNEdit(row);
                                    }}
                                    leftIcon={<Edit className="h-4 w-4" />}
                                />

                                <Button
                                    type="button"
                                    color="transparent"
                                    size="sm"
                                    style={{
                                        color: '#dc2626'
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleConfirmationDialogBoxOpen(row);
                                    }}
                                    leftIcon={<Trash2 className="h-4 w-4" />}
                                />
                            </>
                        )}
                    </div>
                );
            }
        }
    ], [canAction, materialRequisitionStatus, firstGRNId, handleConfirmationDialogBoxOpen, handleGRNEdit]);

    const handleDeleteMaterialRequisitionDetailGRNRequest = async () => {

        if (!deleteMaterialRequisitionDetailGRNData) return;

        setIsConfirmationDialogBoxOpen(false);

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload: DeleteMaterialRequisitionGRN = {
                    MaterialRequisitionGRNId: deleteMaterialRequisitionDetailGRNData.MaterialRequisitionGRNId,
                    Uniquekey: deleteMaterialRequisitionDetailGRNData.Uniquekey ?? "",
                    MaterialRequisitionId: currentMaterialRequisitionId,
                    ProjectId: Number(projectId)
                };

                const response = await materialRequisitionGRNService.apiCallDeleteMaterialRequisitionGRN(payload);

                if (E.isRight(response)) {


                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteMaterialRequisitionDetailGRNData(null);

                    await loadGRNData();

                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Deleting Requisition GRN'
        );
    };

      const isAllQuantityReceived = useMemo(() => {

        if (!matrialRequisitionDetailData?.length) return false;

        return matrialRequisitionDetailData.every((item) => {
            const requiredQuantity = Number(item.MaterialQuantity ?? 0);
            const receivedQuantity = Number(item.MaterialReceivedQuantityTillDate ?? 0);

            return receivedQuantity >= requiredQuantity;
        });
    }, [matrialRequisitionDetailData]);


    
    return (
        <div className="pt-5">
            <Loader loading={isLoading} title={loadingMessage}> {" "}<div></div>{" "} </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Challan Number"
                onSearchChange={v => {
                    setSearchTerm(v);
                }}
                onClearSearch={clearSearchGRN}
                isShowAddButton={canAction  && isVendorFinalizationApproved && !materialRequisitionStatus && !isAllQuantityReceived }
                addTitle="Add"
                onAdd={handleAddGRN}
                isShowAddExtraButton={true}
                addExtraTitle='Summary'
                onAddExtra={() => {
                    setIsViewGRNSummaryModalOpen(true);
                    loadGRNData();
                }}

            />

            <DataTableExpandable
                data={filteredGRN}
                columns={GRNColumns}
                expandable={{
                    keyField: "MaterialRequisitionGRNId",
                    fetchRow: async (row: MaterialRequisitionGRNData) => {
                        return row?.MaterialRequisitionDetailGRNData ?? [];
                    },

                    renderRow: (fetchedData) => {
                        const materials = Array.isArray(fetchedData) ? fetchedData : [];

                        if (!materials.length) {
                            return <div className="p-2 text-center text-gray-500">No Materials</div>;
                        }

                        return (
                            <DataTableWithOutBorder
                                data={materials}
                                columns={MaterialRequisitionGRNColumns}
                                fixedHeight={true}
                            />
                        );
                    },
                    expandButton: { openText: "Hide", closeText: "Show" }
                }}
            />

            <Modal
                isOpen={isViewGRNSummaryModalOpen}
                onClose={() => {
                    setIsViewGRNSummaryModalOpen(false);
                }}
                onCancel={() => {
                    setIsViewGRNSummaryModalOpen(false);
                }}
                title={'Good Received Notes (GRN) Summary'}
                loading={isLoading}
                cancelText="cancel"
                size="xxl"
            >
                <div className="space-y-4">
                    {GRN.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-full">
                            <NoDataView message="No Data Available" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {GRN?.map((item, index) => (
                                <div key={index} className="bg-[#EFF6FF] rounded-lg border border-gray-300 p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Challan Number" value={item?.ChallanNumber || '-'} />
                                        <FieldItem label="Challan" urls={item?.UploadChallanURL} isIcon isSetValue={false} />
                                        <FieldItem label="Vehicle Number" value={item?.VehicleNumber || '-'} />
                                        <FieldInfoTooltip label="Remarks" value={item?.Remarks || '-'} />
                                        <FieldItem label="Created By / Date" value={item.CreatedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(item.CreatedDate || '-')} />

                                        {item.ModifiedBy !== '' ?
                                            <FieldItem label="Modified By / Date" value={item.ModifiedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(item.ModifiedDate || '-')} />
                                            :
                                            ''}

                                    </div>

                                    <div className="bg-white space-y-4 border border-gray-300 mt-5">
                                        <DataTableWithHeaderRowDivider
                                            columns={MaterialRequisitionGRNColumns}
                                            data={item?.MaterialRequisitionDetailGRNData ?? []}
                                            emptyMessage="No Material Requisition Found"
                                            fixedHeight={true}
                                            recordsPerPage={3}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>

                            ))}
                        </div>
                    )}

                </div>
            </Modal>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false)
                    setDeleteMaterialRequisitionDetailGRNData(null)
                }}
                onConfirm={handleDeleteMaterialRequisitionDetailGRNRequest}
                loading={isLoading}
                pageName='Material Requisition GRN'
            />


        </div>
    )
}
export default GRN