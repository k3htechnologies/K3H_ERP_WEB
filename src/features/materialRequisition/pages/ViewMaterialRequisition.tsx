import { useCallback, useEffect, useMemo, useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import Details from "@/features/materialRequisition/components/Details";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Invoice } from "@/features/materialRequisition/components/invoice/Invoice";
import Overview from "@/features/materialRequisition/components/Overview";
import PurchaseOrder from "@/features/materialRequisition/components/PurchaseOrder";
import GRN from "@/features/materialRequisition/components/GRN/GRN";
import type { CloseMaterialRequisitionRequest, FilterMaterialRequisitionOverview, MaterialRequisitionData, MaterialRequisitionDetailData } from "@/features/materialRequisition/models/MaterialRequisitionModel";
import { Input } from "@/ui/components/forms";
import { runApiWithLoader } from "@/core/utils";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { materialRequisitionService } from "@/features/materialRequisition/services/MaterialRequisitionService";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import { Modal } from "@/ui/components/Modal/Modal";
import { FinalizedVendor } from "@/features/materialRequisition/components/FinalizedVendor";
import DataTableEditable, { type EditableTableColumn } from "@/ui/components/DataTable/DataTableEditable";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy, isPreviousDate } from "@/core/utils/dateFormat";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { filterNumbers } from "@/core/utils/fileValidation";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { TextArea } from "@/ui/components/forms/Textarea";
import type { MaterialRequisitionInvoiceData } from "../models/MaterialRequisitionInvoiceModel";
import RadioPill from "@/ui/components/forms/RadioPill";

export const ViewMaterialRequisition: React.FC = () => {

    const [matrialRequisitionData, setMaterialRequisitionData] = useState<MaterialRequisitionData | null>(null);
    const [matrialRequisitionDetailData, setMaterialRequisitionDetailData] = useState<MaterialRequisitionDetailData[]>([]);
    const [materialRequisitionInvoiceData, setMaterialRequisitionInvoiceData] = useState<MaterialRequisitionInvoiceData[]>([]);

    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { projectId } = useProject();
    const { setDetailData } = useMaterialRequisitionListState()
    const [editableDetails, setEditableDetails] = useState<MaterialRequisitionDetailData[]>([]);
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState, updateListState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const systemGeneratedCode = listState.SystemGeneratedCode;
    const materialRequisitionStatus = listState.MaterialRequisitionStatus;
    const [isEditModalOpen, setEditIsModalOpen] = useState(false);
    const location = useLocation();
    const [isCloseRequisitionDialogOpen, setIsCloseRequisitionDialogOpen] = useState(false);
    const [selectedMaterialRequisitionItem, setSelectedMaterialRequisitionItem] = useState<CloseMaterialRequisitionRequest | null>(null);
    const [closeCompletedRemarkError, setCloseCompletedRemarkError] = useState("");

    const { canAction: canMaterialRequisitionView } = useMenuPermissions('/materialRequisition');
    const { canView: canFinalizedVendorView } = useMenuPermissions('Finalized Vendor');
    const { canView: canGeneratePurchaseOrder } = useMenuPermissions('Generate Purchase Order');
    const { canView: canAddInvoice } = useMenuPermissions('Add Invoice');

    const currentUniquekey = listState.Uniquekey

    const MaterialRequisitionTabList: { id: string; label: string }[] = [

        { id: "Overview", label: "Overview" },
        { id: "Details", label: "Details" },
        canFinalizedVendorView ? { id: "Finalize Vendor", label: "Finalize Vendor" } : null,
        canGeneratePurchaseOrder ? { id: "Purchase Order", label: "Purchase Order" } : null,
        { id: "GRN", label: "GRN" },
        canAddInvoice ? { id: "Invoice", label: "Invoice" } : null

    ].filter(Boolean) as { id: string; label: string }[];

    const [activeTab, setActiveTab] = useState<string>(location.state?.activeTab || MaterialRequisitionTabList?.[0]?.id || '');



    useEffect(() => {
        if (!projectId || !currentMaterialRequisitionId || currentMaterialRequisitionId === 0) return;

        loadMaterialRequisitionOverview();

    }, [projectId, currentMaterialRequisitionId, addToast]);

    const loadMaterialRequisitionOverview = async (): Promise<void> => {
        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterMaterialRequisitionOverview = {

                    MaterialRequisitionId: Number(currentMaterialRequisitionId) || 0,
                    ProjectId: Number(projectId) || 0,
                };

                const response = await materialRequisitionService.apiCallPullMaterialRequisitionOverview(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    const item = Array.isArray(data) ? data[0] : data;

                    setMaterialRequisitionData(item ?? null);

                    setMaterialRequisitionDetailData(item?.MaterialRequisitionDetailData ?? []);

                    setMaterialRequisitionInvoiceData(item?.MaterialRequisitionInvoiceData ?? []);

                    setDetailData(item?.MaterialRequisitionDetailData);

                    updateListState({
                        MaterialRequisitionId: item.MaterialRequisitionId ?? 0,
                        MaterialRequisitionStage: item.MaterialRequisitionStage ?? "",
                        MaterialRequisitionStatus: item.MaterialRequisitionStatus ?? "",
                        SystemGeneratedCode: item.SystemGeneratedCode ?? "",
                        VendorFinalizationApprovalStatus: item.VendorFinalizationApprovalStatus,
                        VendorName: item.FinalVendor,
                        Uniquekey: item.Uniquekey ?? ""
                    });

                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
                return response;
            });
    }

    const CopyMaterialRequisitionFormData = (): FormData => {

        const fd = new FormData();

        fd.append("ProjectId", Number(projectId).toString());
        fd.append("MaterialRequisitionId", currentMaterialRequisitionId.toString());
        fd.append("Uniquekey", currentUniquekey);
        fd.append("Remarks", matrialRequisitionData?.Remarks ?? '');
        fd.append("IsCopy", "1");
        fd.append("IsSplit", "0");
        fd.append("MaterialRequisitionDetailJSON", JSON.stringify(
            editableDetails.map(item => ({
                MaterialRequisitionDetailId: 0,
                MaterialMasterId: item.MaterialMasterId,
                MaterialQuantity: item.MaterialQuantity,
                UomMasterId: item.UomMasterId,
                RequiredDate: item.RequiredDate
                    ? item.RequiredDate.split("T")[0] : null,
                SubMaterialMasterId: item.SubMaterialMasterId,
            }))
        ));
        return fd;
    };

    const handleCopyMaterialRequisition = async (e?: React.FormEvent) => {
        e?.preventDefault();

        const hasPastDate = editableDetails.some(item => {
            if (!item.RequiredDate) return false;

            const dateString = item.RequiredDate.split("T")[0];
            const date = new Date(dateString + "T00:00:00");

            return isPreviousDate(date);
        });

        if (hasPastDate) {
            addToast({ type: 'error', title: 'Required Date cannot be in the past.' });
            return;
        }

        const hasEmptyDate = editableDetails.some(item => !item.RequiredDate);

        if (hasEmptyDate) {
            addToast({ type: 'error', title: 'Required Date is required.' });
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

    const RemarkEditor = ({ value, onChange, }: {
        value?: string; onChange: (value: string) => void;
    }) => {

        const [showTextArea, setShowTextArea] = useState(false);

        return showTextArea ? (
            <TextArea
                className="w-full border rounded px-2 py-1"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                rows={3}
                autoResize={false}
                autoFocus
                placeholder="Enter Remark"
                onBlur={() => setShowTextArea(false)}
            />
        ) : (
            <Input
                className="w-full border rounded px-2 py-1"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter Remark"
                onClick={() => setShowTextArea(true)}
            />
        );
    };

    const columns: EditableTableColumn[] = useMemo(() => [
        {
            key: "MaterialName",
            label: "Material",
            width: "15",
            sortable: false,
            editable: false,
            align: "left",
            headerClassName: "bg-[#E4F0FF] text-sm font-medium leading-[1.4] tracking-normal border-b border-r border-gray-300",
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
            label: "Sub-Material",
            width: "15",
            editable: false,
            sortable: false,
            align: "left",
            headerClassName: "bg-[#E4F0FF] text-sm font-medium leading-[1.4] tracking-normal border-b border-r border-gray-300",
            render: (value?: string) => (
                <TooltipText
                    text={value || "-"}
                    maxWidth="200px"
                    tooltipThreshold={18}
                />
            ),
        },
        {
            key: "Uom",
            label: "UOM",
            width: "15",
            sortable: true,
            align: "left",
            headerClassName: "bg-[#E4F0FF] text-sm font-medium leading-[1.4] tracking-normal border-b border-r border-gray-300",
            render: (value?: string) => value || "-",
        },
        {
            key: "MaterialQuantity",
            label: "Quantity",
            width: "15",
            sortable: false,
            editable: true,
            align: "left",
            headerClassName: "bg-[#E4F0FF] text-sm font-medium leading-[1.4] tracking-normal border-b border-r border-gray-300",
            render: (value?: string) => value || "-",
            renderEditor: (value?: string, onChange?: any) => (
                <Input
                    className="w-full border rounded px-2 py-1"
                    value={value ?? ""}
                    onChange={(e) => onChange(filterNumbers(e.target.value))}
                    maxLength={10}
                />
            )
        },
        {
            key: "RequiredDate",
            label: "Required Date",
            width: "15",
            sortable: false,
            editable: true,
            align: "left",
            type: 'datetime',
            headerClassName: "bg-[#E4F0FF] text-sm font-medium leading-[1.4] tracking-normal border-b border-r border-gray-300",
            render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : "-",
            renderEditor: (value?: string, onChange?: any) => (
                <DatePickerInput
                    label=""
                    value={formatDate_dd_mm_yyyy(value)}
                    onChange={(val) => onChange(convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                />
            )
        },
        {
            key: "Remark",
            label: "Remark",
            width: "15",
            sortable: false,
            editable: true,
            align: "left",
            headerClassName: "bg-[#E4F0FF] text-sm font-medium leading-[1.4] tracking-normal border-b border-r border-gray-300",
            render: (value?: string) => value || "-",
            renderEditor: (value?: string, onChange?: any) => (
                <RemarkEditor
                    value={value}
                    onChange={onChange}
                />
            ),
        }
    ], [])

    const handleCloseRequisition = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!selectedMaterialRequisitionItem) return;

        const remark = selectedMaterialRequisitionItem.CloseCompletionRemark?.trim();

        if (!remark) {
            setCloseCompletedRemarkError("Remark is required.");
            return;
        }

        setCloseCompletedRemarkError("");

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload: CloseMaterialRequisitionRequest = {
                    MaterialRequisitionId: selectedMaterialRequisitionItem.MaterialRequisitionId,
                    Uniquekey: selectedMaterialRequisitionItem.Uniquekey,
                    ProjectId: Number(projectId),
                    Type: selectedMaterialRequisitionItem.Type,
                    CloseCompletionRemark: selectedMaterialRequisitionItem.CloseCompletionRemark,
                }

                const response = await materialRequisitionService.apiCallCloseMaterialRequisition(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0], });

                    navigate("/materialRequisition");

                    setIsCloseRequisitionDialogOpen(false);

                } else {
                    addToast({ type: "error", title: response.left.message });
                    setIsCloseRequisitionDialogOpen(false);
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            `${selectedMaterialRequisitionItem.Type} Requisition`,
        );
    };


    const handleMaterialRequisitionEdit = useCallback((row: MaterialRequisitionData) => {
        updateListState({ MaterialRequisitionId: row.MaterialRequisitionId });
        navigate(`/materialRequisition/add/${row.MaterialRequisitionId}`);
    }, [navigate, updateListState]);

    const handleEditRequisitionModal = () => {
        setEditIsModalOpen(false)
    }

    const handleOpenRequisitionModal = () => {
        setEditableDetails(matrialRequisitionDetailData);
        setEditIsModalOpen(true);
    }

    const handleBackToListMaterialRequisition = () => {
        navigate('/materialRequisition');
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>

            <div className="flex justify-between">
                <div className="flex-1">
                    <HeaderActionBar
                        subTitleText={systemGeneratedCode ?? "-"}
                        subSubTitleText={materialRequisitionStatus ?? ''}
                        subSubSubTitleText={listState.VendorName ?? ''}
                        cancelText="Cancel"
                        onCancel={() => handleBackToListMaterialRequisition()}
                        EditText="Edit"
                        canAction={activeTab === "Overview" &&
                            canMaterialRequisitionView &&
                            listState.VendorFinalizationApprovalStatus?.toUpperCase() !== "APPROVED" &&
                            !["COMPLETED", "CLOSED"].includes(
                                listState?.MaterialRequisitionStage?.toUpperCase() ?? ""
                            )}
                        onEdit={() => {

                            if (activeTab === "Overview") {

                                if (matrialRequisitionData) handleMaterialRequisitionEdit(matrialRequisitionData);
                            }
                        }}

                        ExtraButtontitleText="Action"
                        ExtraButtonText="Copy"
                        onExtraButton={() => handleOpenRequisitionModal()}
                        canActionExtraButtonText={canMaterialRequisitionView && matrialRequisitionData?.IsCopy && activeTab === 'Details' && !["COMPLETED", "CLOSED"].includes(listState.MaterialRequisitionStatus?.toUpperCase())}

                        ExtraExtraButtonText="Closed | Completed"
                        onExtraExtraButton={() => {
                            setSelectedMaterialRequisitionItem({
                                MaterialRequisitionId: matrialRequisitionData?.MaterialRequisitionId ?? 0,
                                Uniquekey: matrialRequisitionData?.Uniquekey ?? "",
                                ProjectId: Number(projectId),
                                Type: "Closed",
                                CloseCompletionRemark: ""
                            });

                            setIsCloseRequisitionDialogOpen(true);
                        }}
                        canActionExtraExtraButton={canMaterialRequisitionView && activeTab === 'Details' && !["COMPLETED", "CLOSED"].includes(listState.MaterialRequisitionStatus?.toUpperCase())}
                    />

                </div>
            </div>

            <div className="pt-5">
                <Tabs
                    tabs={MaterialRequisitionTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    tabWidth={16}
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            {activeTab === 'Overview' && (<Overview matrialRequisitionData={matrialRequisitionData} matrialRequisitionDetailData={matrialRequisitionDetailData} materialRequisitionInvoiceData={materialRequisitionInvoiceData} />)}
            {activeTab === 'Details' && <Details matrialRequisitionData={matrialRequisitionData} matrialRequisitionDetailData={matrialRequisitionDetailData} />}
            {activeTab === 'Finalize Vendor' && <FinalizedVendor onApprovalSuccess={loadMaterialRequisitionOverview} />}
            {activeTab === 'Purchase Order' && <PurchaseOrder />}
            {activeTab === 'GRN' && (<GRN matrialRequisitionDetailData={matrialRequisitionDetailData} />)}
            {activeTab === 'Invoice' && <Invoice />}



            <Modal
                isOpen={isEditModalOpen}
                title={" Material Requisition Details"}
                onClose={handleEditRequisitionModal}
                onSubmit={handleCopyMaterialRequisition}
                saveText={"Add"}
                loading={isLoading}
                size="large75"
            >
                <div className="space-y-4 bg-white rounded-xll shadow-sm border border-gray-200">
                    <DataTableEditable
                        columns={columns}
                        data={editableDetails}
                        onChange={(rows) => setEditableDetails(rows)}
                    />
                </div>
            </Modal>



            <Modal
                isOpen={isCloseRequisitionDialogOpen}
                onClose={() => {
                    setIsCloseRequisitionDialogOpen(false);
                    setSelectedMaterialRequisitionItem(null);
                }}
                title="Closed / Completed Requisition"
                onSubmit={handleCloseRequisition}
                saveText={selectedMaterialRequisitionItem?.Type === "Completed"
                    ? "Complete Requisition"
                    : "Close Requisition"}
                loading={isLoading}
                size="xl">

                <div className="space-y-4 p-6 bg-blue-100">
                    <div className="flex gap-3">
                        <RadioPill
                            name="CLOSED_COMPLETED"
                            label="Closed"
                            value="Closed"
                            checked={selectedMaterialRequisitionItem?.Type === "Closed"}
                            onChange={() => {

                                setSelectedMaterialRequisitionItem(prev =>
                                    prev
                                        ? { ...prev, Type: "Closed" }
                                        : prev
                                );
                            }}
                        />

                        <RadioPill
                            name="CLOSED_COMPLETED"
                            label="Completed"
                            value="Completed"
                            checked={selectedMaterialRequisitionItem?.Type === "Completed"}
                            onChange={() => {
                                setSelectedMaterialRequisitionItem(prev =>
                                    prev
                                        ? { ...prev, Type: "Completed" }
                                        : prev
                                );
                            }}
                        />

                    </div>

                    <TextArea
                        label="Remark"
                        placeholder="Enter Remark"
                        required
                        className="thin-scroll"
                        error={closeCompletedRemarkError}
                        value={
                            selectedMaterialRequisitionItem?.CloseCompletionRemark ?? ""
                        }
                        onChange={(e) =>
                            setSelectedMaterialRequisitionItem(prev =>
                                prev
                                    ? {
                                        ...prev,
                                        CloseCompletionRemark: e.target.value
                                    }
                                    : prev
                            )
                        }
                    />



                    {selectedMaterialRequisitionItem?.Type === "Completed" ? (
                        <div className="text-sm text-[#00000080] pt-2">
                            <p>
                                By selecting this option, the <b>Material Requisition</b> will be
                                marked as <b>Completed</b> and cannot be changed later.
                            </p>

                            <p className="mt-2 font-medium">
                                The following must be completed:
                            </p>

                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                <li>Vendor Finalization</li>
                                <li>Vendor Finalization Approval</li>
                                <li>Purchase Order</li>
                                <li>GRN (Goods Received Note)</li>
                                <li>Invoice</li>
                                <li>Invoice Payment – Fully Paid</li>
                            </ul>
                        </div>
                    ) : (
                        <p className="text-sm text-[#00000080] pt-2">
                            By selecting this option, the <b>Material Requisition</b> will be
                            marked as <b>Closed</b> and cannot be changed later.
                        </p>
                    )}


                </div>

            </Modal>
        </div>
    );
};

export default ViewMaterialRequisition;