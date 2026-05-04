import { useEffect, useMemo, useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import Details from "../components/Details";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMaterialRequisitionListState } from "../context/MaterialRequisitionListStateContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Invoice } from "../components/invoice/Invoice";
import Overview from "../components/Overview";
import PurchaseOrder from "../components/PurchaseOrder";
import GRN from "../components/GRN/GRN";
import type { DeleteMaterialRequisitionRequest, FilterWithPaginationMaterialRequisition, MaterialRequisitionData, MaterialRequisitionDetailData } from "../models/MaterialRequisitionModel";
import { Button } from "@/ui/components/forms";
import { runApiWithLoader } from "@/core/utils";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { materialRequisitionService } from "../services/MaterialRequisitionService";
import * as E from "fp-ts/Either";
import { Copy, X } from "lucide-react";
import { Loader } from "@/core/utils/loader";
import { Modal } from "@/ui/components/Modal/Modal";
import { FinalizedVendor } from "../components/FinalizedVendor";
import DataTableEditable, { type EditableTableColumn } from "@/ui/components/DataTable/DataTableEditable";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy, isPreviousDate } from "@/core/utils/dateFormat";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { DateInput } from "@/ui/components/forms/DateInput";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";

export const ViewMaterialRequisition: React.FC = () => {

    const [matrialRequisitionData, setMaterialRequisitionData] = useState<MaterialRequisitionData | null>(null);
    const [matrialRequisitionDetailData, setMaterialRequisitionDetailData] = useState<MaterialRequisitionDetailData[]>([]);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { projectId } = useProject();
    const { setDetailData } = useMaterialRequisitionListState()
    const [editableDetails, setEditableDetails] = useState<MaterialRequisitionDetailData[]>([]);
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const systemGeneratedCode = listState.SystemGeneratedCode;
    const materialRequisitionStatus = listState.MaterialRequisitionStatus;
    const [isEditModalOpen, setEditIsModalOpen] = useState(false);
    const location = useLocation();
    const [isCloseRequisitionDialogOpen, setIsCloseRequisitionDialogOpen] = useState(false);
    const [selectedMaterialRequisitionItem, setSelectedMaterialRequisitionItem] = useState<DeleteMaterialRequisitionRequest | null>(null);

    const MaterialRequisitionTabList = [
        { id: 'Overview', label: 'Overview' },
        { id: 'Details', label: 'Details' },
        { id: 'Finalize Vendor', label: 'Finalize Vendor' },
        { id: 'Purchase Order', label: 'Purchase Order' },
        { id: 'GRN', label: 'GRN' },
        { id: 'Invoice', label: 'Invoice' },
    ];

    const [activeTab, setActiveTab] = useState(location.state?.activeTab || MaterialRequisitionTabList[0].id);

    const handleBackToListMaterialRequisition = () => {
        navigate('/materialRequisition');
    };

    useEffect(() => {
        if (!projectId || !currentMaterialRequisitionId || currentMaterialRequisitionId === 0) return;
        loadMaterialRequisition()
    }, [projectId, currentMaterialRequisitionId, addToast]);

    const CopyMaterialRequisitionFormData = (): FormData => {
        const fd = new FormData();

        fd.append("ProjectId", Number(projectId).toString());
        fd.append("MaterialRequisitionId", "0");
        fd.append("Uniquekey", matrialRequisitionData?.Uniquekey ?? '');
        fd.append("Remarks", matrialRequisitionData?.Remarks ?? '');
        fd.append("IsSplit", "false");
        fd.append("IsCopy", "true");
        fd.append(
            "MaterialRequisitionDetailJSON",
            JSON.stringify(
                editableDetails.map(item => ({
                    MaterialRequisitionDetailId: 0,
                    MaterialMasterId: item.MaterialMasterId,
                    MaterialQuantity: item.MaterialQuantity,
                    UomMasterId: item.UomMasterId,
                    RequiredDate: item.RequiredDate
                        ? item.RequiredDate.split("T")[0]
                        : null,
                    SubMaterialMasterId: item.SubMaterialMasterId,
                }))
            )
        );

        return fd;
    };

    const loadMaterialRequisition = async () => {
        runApiWithLoader(
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

                    const item = Array.isArray(data) ? data[0] : data;

                    setMaterialRequisitionData(item ?? null);
                    setDetailData(item?.MaterialRequisitionDetailData);

                    setMaterialRequisitionDetailData(item?.MaterialRequisitionDetailData ?? []);

                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
                return response;
            });
    }

    const handleCopyMaterialRequisition = async (e?: React.FormEvent) => {
        e?.preventDefault();

        const hasPastDate = editableDetails.some(item => {
            if (!item.RequiredDate) return false;

            const dateString = item.RequiredDate.split("T")[0];
            const date = new Date(dateString + "T00:00:00");

            return isPreviousDate(date);
        });

        if (hasPastDate) {
            addToast({ type: 'error', title: 'Required date cannot be in the past.' });
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = CopyMaterialRequisitionFormData();

                const response = await materialRequisitionService.apiCallToAddMaterialRequisition(payload);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    navigate("/materialRequisition");

                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Copy Material Requisition'
        );
    };

    const handleEditRequisitionModal = () => {
        setEditIsModalOpen(false)
    }

    const handleOpenRequisitionModal = () => {
        setEditableDetails(matrialRequisitionDetailData);
        setEditIsModalOpen(true);
    }

    const columns: EditableTableColumn[] = useMemo(() => [
        {
            key: "MaterialName",
            label: "Material Name",
            width: "15",
            sortable: false,
            editable: false,
            align: "left",
            headerClassName: "bg-[#1E3A5F] text-white tracking-[1px]",
            render: (value?: string) => (
                <TooltipText
                    text={value || "-"}
                    maxWidth="200px"
                    tooltipThreshold={18}
                />
            ),
        },
        {
            key: "SubMaterialName",
            label: "Sub-Material Name",
            width: "15",
            editable: false,
            sortable: false,
            align: "left",
            headerClassName: "bg-[#1E3A5F] text-white tracking-[1px]",
            render: (value?: string) => (
                <TooltipText
                    text={value || "-"}
                    maxWidth="200px"
                    tooltipThreshold={18}
                />
            ),
        },
        {
            key: "MaterialQuantity",
            label: "Quantity",
            width: "15",
            sortable: false,
            editable: true,
            align: "left",
            headerClassName: "bg-[#1E3A5F] text-white tracking-[1px]",
        },
        {
            key: "Uom",
            label: "UOM",
            width: "15",
            sortable: true,
            align: "left",
            headerClassName: "bg-[#1E3A5F] text-white tracking-[1px]",
            render: (value?: string) => value || "-",
        },
        {
            key: "RequiredDate",
            label: "Required Date",
            width: "15",
            sortable: false,
            editable: true,
            align: "left",
            type: 'datetime',
            headerClassName: "bg-[#1E3A5F] text-white tracking-[1px]",
            render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : "-",
            renderEditor: (value?: string, onChange?: any) => (
                <DateInput
                    label=""
                    value={formatDate_dd_mm_yyyy(value)}
                    onChange={(val) => onChange(convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                />
            )
        },
    ], [])

    const handleCloseRequisition = async () => {
        if (!selectedMaterialRequisitionItem) return;
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload: DeleteMaterialRequisitionRequest = {
                    MaterialRequisitionId: selectedMaterialRequisitionItem.MaterialRequisitionId,
                    Uniquekey: selectedMaterialRequisitionItem.Uniquekey,
                    ProjectId: Number(projectId),
                }

                const response = await materialRequisitionService.apiCallCloseMaterialRequisition(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0], });

                    setIsCloseRequisitionDialogOpen(false);
                    loadMaterialRequisition();

                } else {
                    addToast({ type: "error", title: response.left.message });
                    setIsCloseRequisitionDialogOpen(false)
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Closing Requisition",
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>

            <div className="flex justify-between">
                <HeaderActionBar
                    subTitleText={systemGeneratedCode ?? "-"}
                    subSubTitleText={materialRequisitionStatus ?? ''}
                    cancelText="Cancel"
                    EditText="Edit"
                    onCancel={() => handleBackToListMaterialRequisition()}
                />

                <div className="flex justify-end gap-4">
                    {matrialRequisitionData?.IsCopy && activeTab === 'Details' && (
                        <Button
                            size="mxs"
                            color="transparent"
                            style={{
                                color: '#135BEC',
                                padding: '4px 8px',
                                backgroundColor: '#DBEAFE'
                            }}
                            onClick={() => {
                                handleOpenRequisitionModal();
                            }}
                        >
                            <Copy className="h-4 w-4" color="blue" />
                            Copy Entry
                        </Button>
                    )}

                    {matrialRequisitionData?.MaterialRequisitionStatus !== 'Completed' && activeTab === 'Details' && (
                        <div className="flex justify-end pb-2">
                            <Button
                                size="mxs"
                                color="transparent"
                                style={{
                                    color: '#E92C2C',
                                    padding: '4px 8px',
                                    backgroundColor: '#FFF2F2'
                                }}
                                onClick={() => {
                                    setSelectedMaterialRequisitionItem(matrialRequisitionData);
                                    setIsCloseRequisitionDialogOpen(true);
                                }}
                            >
                                <X className="h-4 w-4" color="red" />
                                Close Requisition
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-3 pb-2">
                <Tabs
                    tabs={MaterialRequisitionTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            {activeTab === 'Details' && <Details />}
            {activeTab === 'Overview' && <Overview />}
            {activeTab === 'Finalize Vendor' && <FinalizedVendor />}
            {activeTab === 'Invoice' && <Invoice />}
            {activeTab === 'Purchase Order' && <PurchaseOrder />}
            {activeTab === 'GRN' && <GRN />}

            <Modal
                isOpen={isEditModalOpen}
                title={" Material Requisition Details"}
                onClose={handleEditRequisitionModal}
                onSubmit={handleCopyMaterialRequisition}
                saveText={"save"}
                loading={isLoading}
                size="large-half"
            >
                <div className="space-y-4 bg-white rounded-xll shadow-sm border border-gray-200">
                    <DataTableEditable
                        columns={columns}
                        data={editableDetails}
                        onChange={(rows) => setEditableDetails(rows)}
                    />
                </div>
            </Modal>

            <ConfirmationDialogBox
                isOpen={isCloseRequisitionDialogOpen}
                onClose={() => {
                    setIsCloseRequisitionDialogOpen(false);
                    setSelectedMaterialRequisitionItem(null);
                }}
                onConfirm={handleCloseRequisition}
                title="Close Requisition"
                message={`Are you sure you want to Close this Material Requisition?`}
                confirmText="Close"
                cancelText="Cancel"
                loading={isLoading}
            />
        </div>
    );
};

export default ViewMaterialRequisition;