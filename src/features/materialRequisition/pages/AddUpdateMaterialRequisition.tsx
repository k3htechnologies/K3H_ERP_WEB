import { Loader } from "@/core/utils/loader"
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { Button } from "@/ui/components/forms/Button";
import { Modal } from "@/ui/components/Modal/Modal";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/core/hooks/useToast";
import * as E from "fp-ts/Either";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import type { AddUpdateMaterialRequisitionDetailRequest, AddUpdateMaterialRequisitionRequest, FilterMaterialRequisitionDetails, FilterWithPaginationMaterialRequisition } from "@/features/materialRequisition/models/MaterialRequisitionModel";
import { TextArea } from "@/ui/components/forms/Textarea";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useNavigate, useParams } from "react-router-dom";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import { Input } from "@/ui/components/forms/Input";
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { materialRequisitionService } from "@/features/materialRequisition/services/MaterialRequisitionService";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";
import Tabs from "@/ui/components/Tab/Tab";
import type { BudgetData } from "@/features/budget/models/BudgetModel";
import {
    fetchProjectBudget,
    getBudgetL1Dropdown,
    getBudgetL2Dropdown,
    getBudgetL3Dropdown,
    getBudgetL4Dropdown,
} from "@/features/budget/budgetDropdown";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatCurrency } from "@/core/utils/comman";
import type { SubMaterialMasterData } from "@/features/subMaterialMaster/models/SubMaterialMasterModel";
import { fetchSubMaterialMasterById, fetchSubMaterialMasterDropdown } from "@/features/subMaterialMaster/subMaterialMasterDropdown";
import { calculateRequiredDate } from "../utils/materialRequisitionUtils";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { fetchMaterialMasterDropdown } from "@/features/materialMaster/materialMasterDropdown";

const initialFormStateMaterialRequisition = (): AddUpdateMaterialRequisitionRequest => ({
    MaterialRequisitionId: 0,
    AttachmentsURL: '',
    Remarks: '',
    MaterialRequisitionDetailJSON: '',
    Uniquekey: "",
    IsCopy: false,
    ProjectId: 0,
    IsSplit: false,
    RemoveAttachmentsURL: null
})

const initialFormState = (): AddUpdateMaterialRequisitionDetailRequest => ({
    MaterialRequisitionDetailId: 0,
    MaterialMasterId: 0,
    MaterialName: "",
    SubMaterialMasterId: 0,
    UomMasterId: 0,
    SubMaterialName: "",
    UomCode: "",
    LevelId1: 0,
    Level1Name: "",
    LevelId2: 0,
    Level2Name: "",
    LevelId3: 0,
    Level3Name: "",
    LevelId4: 0,
    Level4Name: "",
    Level4SubMaterialUomCode: "",
    Level4SubMaterialUom: "",
    MaterialQuantity: 0,
    RequiredDate: "",
    MaterialRequisitionType: "",
    Remark: ""
})


export const AddUpdateMaterialRequisition = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [projectBudgetList, setProjectBudgetList] = useState<BudgetData[]>([]);
    const [addMaterialPopUp, setAddMaterialPopUp] = useState(false);
    const { addToast } = useToast();
    const [materialList, setMaterialList] = useState<AddUpdateMaterialRequisitionDetailRequest[]>([]);
    const [materialData, setMaterialData] = useState<AddUpdateMaterialRequisitionDetailRequest>(() => initialFormState());
    const [formData, setFormData] = useState<AddUpdateMaterialRequisitionRequest>(() => initialFormStateMaterialRequisition())
    const [documentFiles, setdocumentFiles] = useState<(File | string)[]>([]);
    const [removeddocumentFilesURLs, setRemoveddocumentFilesURLs] = useState<string[]>([]);
    const [documentURL, setDocumentURL] = useState<string>("");
    const { canAction } = useMenuPermissions("/materialRequisition");
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const [dropdownLabels, setDropdownLabels] = useState({ materialName: "", uom: "", level1Name: "", level2Name: "", level3Name: "", level4Name: "" });

    const [editIndex, setEditIndex] = useState<number | null>(null);
    const navigate = useNavigate();
    const { projectId } = useProject();
    const { MaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();

    const hasDirect = materialList.some(item => item.MaterialRequisitionType?.toUpperCase() === "DIRECT");

    const hasInDirect = materialList.some(item => item.MaterialRequisitionType?.toUpperCase() === "IN - DIRECT");

    const MaterialRequisitionTab = [
        ...(hasInDirect
            ? [{ id: "In - Direct", label: "In - Direct" }]
            : hasDirect
                ? [{ id: "Direct", label: "Direct" }]
                : [
                    { id: "Direct", label: "Direct" },
                    { id: "In - Direct", label: "In - Direct" }
                ])
    ];


    const [active, setActive] = useState<string>(MaterialRequisitionTab[0].id);

    const [subMaterialDetails, setSubMaterialDetails] = useState<{
        MaterialName: string;
        SubMaterialName: string;
        Uom: string;
        UomCode: string;
        MaterialRate: number;
        LeadTimeInDays: number;
        IsTolerant: boolean;
        RequiredDate: string;
        Quantity: number;
    } | null>(null);

    const [inDirectSubMaterialDetails, setInDirectSubMaterialDetails] = useState<SubMaterialMasterData | null>(null);

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [deleteMaterialDetailsData, setDeleteMaterialDetailsData] = useState<{ row: AddUpdateMaterialRequisitionDetailRequest; index: number } | null>(null);


    useEffect(() => {
        if (!MaterialRequisitionId) return;
        loadDetailsdata();
    }, [MaterialRequisitionId]);

    const loadDetailsdata = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterMaterialRequisitionDetails = {
                    ProjectId: Number(projectId),
                    MaterialRequisitionId: Number(MaterialRequisitionId)
                };

                const response = await materialRequisitionService.apiCallPullMaterialRequisitionDetails(params);

                if (E.isRight(response)) {

                    const e = response.right.Data?.[0];

                    if (e) {
                        setFormData(prev => ({
                            ...prev,
                            MaterialRequisitionId: e.MaterialRequisitionId ?? prev.MaterialRequisitionId,
                            Uniquekey: e.Uniquekey ?? prev.Uniquekey,
                            ProjectId: e.ProjectId ?? prev.ProjectId,
                            Remarks: e.Remarks ?? prev.Remarks
                        }));

                        if (e.MaterialRequisitionDetailData) {
                            setMaterialList(
                                e.MaterialRequisitionDetailData.map((item: any) => ({
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
                            );
                        }
                        if (e.AttachmentsURL) {
                            setdocumentFiles([]);
                            setDocumentURL(e.AttachmentsURL || "");
                            setRemoveddocumentFilesURLs([]);
                        }
                    }
                } else {
                    addToast({ type: 'error', title: response.left.message });
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

    useEffect(() => {
        if (!projectId) {
            setProjectBudgetList([]);
            return;
        }

        const loadProjectBudget = async () => {
            const data = await fetchProjectBudget(Number(projectId));
            setProjectBudgetList(data);
        };

        loadProjectBudget();
    }, [projectId]);

    const handleAddMaterial = async () => {
        setErrors({});
        setSubMaterialDetails(null);
        setInDirectSubMaterialDetails(null);
        setAddMaterialPopUp(true);
        setEditIndex(null);
        setMaterialData(initialFormState());
    }

    const validateMaterialForm = (): {

        isValid: boolean;
        errors: { [key: string]: string };

    } => {
        const newErrors: { [key: string]: string } = {};

        if (active.toUpperCase() === "DIRECT") {

            if (!materialData.LevelId1 || materialData.LevelId1 === 0)
                newErrors.LevelId1 = "Category is required";

            if (!materialData.LevelId2 || materialData.LevelId2 === 0)
                newErrors.LevelId2 = "Sub Category is required";

            if (!materialData.LevelId3 || materialData.LevelId3 === 0)
                newErrors.LevelId3 = "Description is required";

            if (!materialData.LevelId4 || materialData.LevelId4 === 0)
                newErrors.LevelId4 = "Sub Material is required";
        }
        else {
            if (!materialData.MaterialMasterId || materialData.MaterialMasterId === 0)
                newErrors.MaterialMasterId = "Material is required";

            if (!materialData.SubMaterialMasterId || materialData.SubMaterialMasterId === 0)
                newErrors.SubMaterialMasterId = "Sub Material is required";

        }

        if (!materialData.MaterialQuantity) {
            newErrors.MaterialQuantity = "Quantity is required";
        } else if (materialData.MaterialQuantity <= 0) {
            newErrors.MaterialQuantity = "Quantity must be greater than 0";
        }


        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const isDuplicateMaterialDetails = (newItem: AddUpdateMaterialRequisitionDetailRequest): boolean => {
        const isDirect = newItem.MaterialRequisitionType?.trim().toUpperCase() === "DIRECT";

        return materialList.some((item, index) => {

            if (editIndex !== null && index === editIndex) {
                return false;
            }

            if (item.MaterialRequisitionType?.trim().toUpperCase() !== newItem.MaterialRequisitionType?.trim().toUpperCase()) {
                return false;
            }

            if (isDirect) {

                return (
                    item.LevelId1 === newItem.LevelId1 &&
                    item.LevelId2 === newItem.LevelId2 &&
                    item.LevelId3 === newItem.LevelId3 &&
                    item.LevelId4 === newItem.LevelId4
                );
            }

            return (
                item.MaterialMasterId === newItem.MaterialMasterId &&
                item.SubMaterialMasterId === newItem.SubMaterialMasterId
            );
        });
    };

    const handleEditMaterial = useCallback((row: AddUpdateMaterialRequisitionDetailRequest, index: number) => {
        setErrors({});
        setEditIndex(index);

        const isDirect = row.MaterialRequisitionType?.toUpperCase() === "DIRECT";

        setActive(isDirect ? "Direct" : "In - Direct");

        setMaterialData({
            MaterialRequisitionDetailId: row.MaterialRequisitionDetailId,
            MaterialMasterId: row.MaterialMasterId,
            SubMaterialMasterId: row.SubMaterialMasterId,
            UomCode: row.UomCode,
            UomMasterId: row.UomMasterId,
            SubMaterialName: row.SubMaterialName,
            MaterialName: row.MaterialName,
            LevelId1: row.LevelId1,
            Level1Name: row.Level1Name,
            LevelId2: row.LevelId2,
            Level2Name: row.Level2Name,
            LevelId3: row.LevelId3,
            Level3Name: row.Level3Name,
            LevelId4: row.LevelId4,
            Level4Name: row.Level4Name,
            Level4SubMaterialUomCode: row.Level4SubMaterialUomCode,
            Level4SubMaterialUom: row.Level4SubMaterialUom,
            MaterialQuantity: row.MaterialQuantity,
            RequiredDate: convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd(row.RequiredDate) || convert_dd_mm_yyyy_To_Yyyy_mm_dd(row.RequiredDate) || "",

            MaterialRequisitionType: row.MaterialRequisitionType,
            Remark: row.Remark
        });

        if (isDirect && row.LevelId4) {
            const selected = projectBudgetList.find(
                budget =>
                    budget.LevelType === "L4" &&
                    budget.LevelId1 === row.LevelId1 &&
                    budget.LevelId2 === row.LevelId2 &&
                    budget.LevelId3 === row.LevelId3 &&
                    budget.LevelId4 === row.LevelId4
            );

            if (selected) {
                setSubMaterialDetails({
                    MaterialName: selected.Level4MaterialName ?? "",
                    SubMaterialName: selected.Level4Name ?? row.Level4Name ?? "",
                    Uom: selected.Level4SubMaterialUom ?? "",
                    UomCode: selected.Level4SubMaterialUomCode ?? "",
                    MaterialRate: Number(selected.MaterialCost ?? 0),
                    LeadTimeInDays: Number(selected.Level4LeadTimeInDays ?? 0),
                    Quantity: Number(selected.Quantity ?? 0),
                    IsTolerant: selected.Level4IsTolerant ?? false,
                    RequiredDate: formatDate_dd_mm_yyyy(row.RequiredDate) || ""
                });
            } else {
                setSubMaterialDetails(null);
            }
        } else {
            setSubMaterialDetails(null);
        }

        if (!isDirect) {
            if (row.SubMaterialMasterId) {
                fetchSubMaterialMasterById(row.SubMaterialMasterId).then((subMaterial) => {
                    if (!subMaterial) return;
                    setInDirectSubMaterialDetails(subMaterial);
                });
            }
        }

        setDropdownLabels({
            materialName: row.MaterialName || "",
            uom: row.UomCode || "",
            level1Name: row.Level1Name || "",
            level2Name: row.Level2Name || "",
            level3Name: row.Level3Name || "",
            level4Name: row.Level4Name || "",
        });
        setAddMaterialPopUp(true);
    }, [projectId, projectBudgetList]);

    const saveMaterial = async () => {
        setErrors({});

        const validation = validateMaterialForm();
        if (!validation.isValid) {

            setErrors(validation.errors);
            addToast({ type: "error", title: "Please fill the required filed" });
            return;
        }

        const newItem: AddUpdateMaterialRequisitionDetailRequest = {
            ...materialData,
            MaterialRequisitionType: active === "Direct" ? "Direct" : "In - Direct"
        };

        if (isDuplicateMaterialDetails(newItem)) {
            addToast({
                type: "error",
                title:
                    active === "Direct"
                        ? "This Category, Sub Category, Description and Sub Material is already added."
                        : "This Material and Sub Material is already added."
            });

            return;
        }

        setAddMaterialPopUp(false);

        setMaterialList(prev => {
            const updated = [...prev];

            if (editIndex !== null && editIndex >= 0) {
                updated[editIndex] = newItem;
            } else {
                updated.push(newItem);
            }
            return updated;
        });
        setEditIndex(null);
        setMaterialData(initialFormState());
    };

    const handleConfirmationDialogBoxOpen = (row: AddUpdateMaterialRequisitionDetailRequest, index: number) => {
        setDeleteMaterialDetailsData({ row, index });
        setIsConfirmationDialogBoxOpen(true);
    };

    const handleDeleteMaterialDetails = () => {

        if (!deleteMaterialDetailsData) return;

        const removeIndex = deleteMaterialDetailsData.index;

        if (removeIndex < 0) {
            setIsConfirmationDialogBoxOpen(false);
            setDeleteMaterialDetailsData(null);
            addToast({ type: "error", title: "Unable to find the selected material details to delete" });
            return;
        }

        setMaterialList((prev) => prev.filter((_, i) => i !== removeIndex));
        setIsConfirmationDialogBoxOpen(false);
        setDeleteMaterialDetailsData(null);
        addToast({ type: "success", title: "Material Details Removed" });
    };

    const MaterialRequisitionColumns = useMemo<TableColumn[]>(() => {
        const columns: TableColumn[] = [
            {
                key: "MaterialRequisitionType",
                label: "Type",
                align: "left",
                width: "30",
                render: (value) => value || "-"
            }
        ];

        const isDirect = materialList[0]?.MaterialRequisitionType?.trim().toUpperCase() === "DIRECT";

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
                align: "right",
                width: "30",
                render: (value, row) => {
                    return isDirect ? `${value ?? 0} ${row.Level4SubMaterialUomCode ?? ""}`.trim() : `${value ?? 0} ${row.UomCode ?? ""}`.trim() ?? 0;
                }
            },

            {
                key: "RequiredDate",
                label: "Required Date",
                align: "center",
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
            {
                key: "action",
                label: "Action",
                align: "center",
                render: (_value, row) => {
                    const index = materialList.findIndex(
                        item =>
                            item.LevelId1 === row.LevelId1 &&
                            item.LevelId2 === row.LevelId2 &&
                            item.LevelId3 === row.LevelId3 &&
                            item.LevelId4 === row.LevelId4 &&
                            item.MaterialMasterId === row.MaterialMasterId &&
                            item.SubMaterialMasterId === row.SubMaterialMasterId
                    );

                    return canAction ? (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditMaterial(row, index);
                                }}
                                color="transparent"
                                isborderRadius
                                size="sm"
                                style={{ color: "#2563eb", padding: "4px" }}
                                leftIcon={<Edit className="h-4 w-4" />}
                                title="Edit Material Requisition"
                            />

                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleConfirmationDialogBoxOpen(row, index);

                                }}
                                color="transparent"
                                isborderRadius
                                size="sm"
                                style={{
                                    color: "red",
                                    padding: "4px 8px"
                                }}
                                title="Delete Material Requisition"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : null;
                }
            }
        );

        return columns;
    }, [active, canAction, materialList, handleEditMaterial, handleConfirmationDialogBoxOpen]);

    const createDropdownInitialValue = (id: number | null, label: string) => {
        if (!id || !label) return null;
        return { label, value: String(id) };
    };

    const validateMaterialRequisitionForm = (): {
        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {};

        if (!hasAnyDocumentFile(documentFiles, documentURL, removeddocumentFilesURLs)) {
            newErrors.AttachmentsURL = "File is required.";
        }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };

    const PushMaterialRequisitionFormData = (): FormData => {

        const form = new FormData();

        form.append('MaterialRequisitionId', String(formData.MaterialRequisitionId ?? 0));
        form.append('Uniquekey', formData.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6');
        form.append('Remarks', formData.Remarks ?? '');
        form.append('MaterialRequisitionDetailJSON', JSON.stringify(materialList) ?? '');
        form.append("ProjectId", projectId!.toString());

        documentFiles.forEach((file) => {
            if (file instanceof File) {
                form.append('AttachmentsURL', file);
            }
        });

        form.append('RemoveAttachmentsURL', removeddocumentFilesURLs.join(','));
        return form;
    };

    const handleSave = async () => {

        if (materialList.length === 0) {
            addToast({ type: "error", title: "Please select at least one Material Details" });
            return;
        }

        setErrors({});
        
        const validation = validateMaterialRequisitionForm();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushMaterialRequisitionFormData();

                const response = await materialRequisitionService.apiCallToAddMaterialRequisition(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/materialRequisition");

                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message})
            },
            undefined,
            formData.MaterialRequisitionId ? "Updating Material Requisition" : "Add Material Requisition"
        );
    };


    return (
        <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <Loader loading={isLoading} title={loadingMessage}> <div /> </Loader>

                <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll">

                    <div className="space-y-6">

                        <div className="flex items-center justify-between border-b border-gray-500 pb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Material Details
                            </h3>

                            <Button
                                type="button"
                                color="blue"
                                size="sm"
                                onClick={handleAddMaterial}
                                leftIcon={<Plus className="h-4 w-4" />}>
                                Add Material
                            </Button>

                        </div>

                        {materialList.length > 0 ? (

                            <DataTable
                                data={materialList}
                                columns={MaterialRequisitionColumns}
                                emptyMessage="No Material Found"
                                fixedHeight
                                recordsPerPage={5}
                                className="flex-1"
                            />

                        ) : (
                            <div className="flex items-center justify-center">
                                <span className="text-gray-500 text-sm font-medium">No Material Details Found</span>
                            </div>
                        )}

                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Document Details</h3>

                        <div className="flex items-center justify-between">
                            <MultiFilePicker
                                label="File"
                                placeholder="Upload File"
                                value={documentFiles}
                                onChange={setdocumentFiles}
                                availableFilesURL={documentURL}
                                allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf", ".dwg"]}
                                required
                                error={errors.AttachmentsURL}
                                onRemoveExisting={(url) =>
                                    setRemoveddocumentFilesURLs((prev) => [...prev, url])
                                }
                            />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Remark</h3>

                        <div className="flex items-center justify-between">
                            <TextArea
                                label="Remark"
                                className="thin-scroll"
                                value={formData.Remarks}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        Remarks: e.target.value
                                    }))
                                }
                                placeholder="Enter Remark"
                                error={errors.Remarks} />
                        </div>

                    </div>
                </div>

                <BottomActionBar
                    cancelText="Cancel"
                    saveText={formData.MaterialRequisitionId && formData.MaterialRequisitionId > 0 ? "Update" : "Add"}
                    onCancel={() => navigate(-1)}
                    canAction={canAction}
                    onSave={() => {
                        handleSave();
                    }}
                    isLoading={isLoading}
                />
            </div>

            <Modal
                isOpen={addMaterialPopUp}
                onClose={() => {
                    setAddMaterialPopUp(false);
                    setSubMaterialDetails(null);
                    setInDirectSubMaterialDetails(null);
                    setErrors({});
                }}
                title={Number(materialData.MaterialRequisitionDetailId) ? "Update Material Details" : "Add Material Details"}
                onSubmit={e => {
                    e.preventDefault();
                    saveMaterial();
                }}
                saveText={Number(materialData.MaterialRequisitionDetailId) ? "Update" : "Add"}
                size="small50"
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >
                        <Tabs
                            tabs={MaterialRequisitionTab}
                            defaultActive={active}
                            islarge={true}
                            istoggleTab
                            onTabChange={(t) => {

                                if ((t.id === "Direct" && hasInDirect) || (t.id === "In - Direct" && hasDirect)) {
                                    return;
                                }

                                setActive(t.id);

                                setMaterialData(prev => ({
                                    ...prev,
                                    MaterialRequisitionType:
                                        t.id === "Direct" ? "Direct" : "In - Direct"
                                }));

                                setErrors({});
                            }}
                        />

                        {active === "Direct" && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                                    <SingleSelectDropdownWithPagination
                                        label="Category"
                                        title="Select Category"
                                        required
                                        initialValue={createDropdownInitialValue(
                                            materialData.LevelId1,
                                            dropdownLabels.level1Name || materialData.Level1Name!
                                        )}


                                        dataFetchCallBack={async () => {
                                            const itemList = getBudgetL1Dropdown(
                                                projectBudgetList
                                            );

                                            return {
                                                itemList,
                                                totalNumberOfRecord: itemList.length,
                                            };
                                        }}
                                        onSelected={(item) => {
                                            const levelId1 = Number(item?.value ?? 0);

                                            setSubMaterialDetails(null);

                                            setMaterialData(prev => ({
                                                ...prev,

                                                LevelId1: levelId1,
                                                Level1Name: item?.label ?? "",

                                                LevelId2: 0,
                                                Level2Name: "",

                                                LevelId3: 0,
                                                Level3Name: "",

                                                LevelId4: 0,
                                                Level4Name: "",

                                                MaterialQuantity: 0,
                                                RequiredDate: "",
                                            }));


                                            setErrors(prev => ({
                                                ...prev,
                                                LevelId1: "",
                                                LevelId2: "",
                                                LevelId3: "",
                                                LevelId4: "",
                                                MaterialQuantity: "",
                                                RequiredDate: "",
                                            }));
                                        }}
                                        error={errors.LevelId1}
                                    />

                                    <SingleSelectDropdownWithPagination
                                        key={`Category-${materialData.LevelId1}`}
                                        label="Sub Category"
                                        title="Select Sub Category"
                                        required
                                        initialValue={createDropdownInitialValue(
                                            materialData.LevelId2,
                                            dropdownLabels.level2Name || materialData.Level2Name!
                                        )}
                                        dataFetchCallBack={async () => {
                                            const itemList = getBudgetL2Dropdown(
                                                projectBudgetList,
                                                materialData.LevelId1
                                            );

                                            return {
                                                itemList,
                                                totalNumberOfRecord: itemList.length,
                                            };
                                        }}
                                        onSelected={(item) => {
                                            const levelId2 = Number(item?.value ?? 0);

                                            setSubMaterialDetails(null);

                                            setMaterialData(prev => ({
                                                ...prev,

                                                LevelId2: levelId2,
                                                Level2Name: item?.label ?? "",

                                                LevelId3: 0,
                                                Level3Name: "",

                                                LevelId4: 0,
                                                Level4Name: "",
                                                MaterialQuantity: 0,
                                                RequiredDate: "",
                                            }));

                                            setErrors(prev => ({
                                                ...prev,
                                                LevelId2: "",
                                                LevelId3: "",
                                                LevelId4: "",
                                                MaterialQuantity: "",
                                                RequiredDate: "",
                                            }));
                                        }}
                                        error={errors.LevelId2}
                                    />

                                    <SingleSelectDropdownWithPagination
                                        key={`SubCategory-${materialData.LevelId2}`}
                                        label="Description"
                                        title="Select Description"
                                        required
                                        initialValue={createDropdownInitialValue(
                                            materialData.LevelId3,
                                            dropdownLabels.level3Name || materialData.Level3Name!
                                        )}
                                        dataFetchCallBack={async () => {
                                            const itemList = getBudgetL3Dropdown(
                                                projectBudgetList,
                                                materialData.LevelId1,
                                                materialData.LevelId2
                                            );

                                            return {
                                                itemList,
                                                totalNumberOfRecord: itemList.length,
                                            };
                                        }}
                                        onSelected={(item) => {

                                            const levelId3 = Number(item?.value ?? 0);

                                            setSubMaterialDetails(null);

                                            setMaterialData(prev => ({
                                                ...prev,

                                                LevelId3: levelId3,
                                                Level3Name: item?.label ?? "",

                                                LevelId4: 0,
                                                Level4Name: "",
                                                MaterialQuantity: 0,
                                                RequiredDate: "",
                                            }));

                                            setErrors(prev => ({
                                                ...prev,
                                                LevelId3: "",
                                                LevelId4: "",
                                                MaterialQuantity: "",
                                                RequiredDate: "",
                                            }));
                                        }}
                                        error={errors.LevelId3}
                                    />

                                    <SingleSelectDropdownWithPagination
                                        key={`Description-${materialData.LevelId3}`}
                                        label="Sub Material"
                                        title="Select Sub Material"
                                        required
                                        initialValue={createDropdownInitialValue(
                                            materialData.LevelId4,
                                            dropdownLabels.level4Name || materialData.Level4Name!
                                        )}
                                        dataFetchCallBack={async () => {
                                            const itemList = getBudgetL4Dropdown(
                                                projectBudgetList,
                                                materialData.LevelId1,
                                                materialData.LevelId2,
                                                materialData.LevelId3
                                            );

                                            return {
                                                itemList,
                                                totalNumberOfRecord: itemList.length,
                                            };
                                        }}
                                        onSelected={(item) => {

                                            const levelId4 = Number(item?.value ?? 0);

                                            const selected = projectBudgetList.find(
                                                budget =>
                                                    budget.LevelType === "L4" &&
                                                    budget.LevelId1 === materialData.LevelId1 &&
                                                    budget.LevelId2 === materialData.LevelId2 &&
                                                    budget.LevelId3 === materialData.LevelId3 &&
                                                    budget.LevelId4 === levelId4
                                            );

                                            if (!selected) {
                                                setSubMaterialDetails(null);
                                                setMaterialData(prev => ({
                                                    ...prev,
                                                    LevelId4: 0,
                                                    Level4Name: '',
                                                    RequiredDate: "",
                                                }));
                                                return;
                                            }

                                            const leadTime = Number(selected.Level4LeadTimeInDays ?? 0);

                                            const requiredDate = calculateRequiredDate(leadTime);


                                            setSubMaterialDetails({
                                                MaterialName: selected.Level4MaterialName ?? "",
                                                SubMaterialName: selected.Level4Name ?? item?.label ?? "",
                                                Uom: selected.Level4SubMaterialUom ?? "",
                                                UomCode: selected.Level4SubMaterialUomCode ?? "",
                                                MaterialRate: Number(selected.MaterialCost ?? 0),
                                                LeadTimeInDays: leadTime,
                                                Quantity: Number(selected.Quantity ?? 0),
                                                IsTolerant: selected.Level4IsTolerant ?? false,
                                                RequiredDate: requiredDate,
                                            });

                                            setMaterialData(prev => ({
                                                ...prev,
                                                LevelId4: levelId4,
                                                Level4Name: item?.label ?? "",
                                                RequiredDate: requiredDate,
                                                Level4SubMaterialUomCode: selected.Level4SubMaterialUomCode ?? "",
                                                Level4SubMaterialUom: selected.Level4SubMaterialUom ?? "",
                                            }));

                                            setErrors(prev => ({
                                                ...prev,
                                                LevelId4: "",
                                                RequiredDate: "",
                                            }));
                                        }}

                                        error={errors.LevelId4}

                                    />

                                    <Input
                                        label="Quantity"
                                        required
                                        value={materialData.MaterialQuantity || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            if (value === "") {
                                                setMaterialData(prev => ({
                                                    ...prev,
                                                    MaterialQuantity: 0
                                                }));

                                                setErrors(prev => ({
                                                    ...prev,
                                                    MaterialQuantity: ""
                                                }));

                                                return;
                                            }

                                            const quantity = Number(value);

                                            if (Number.isNaN(quantity)) {
                                                return;
                                            }

                                            const maxQuantity = Number(subMaterialDetails?.Quantity ?? 0);

                                            if (quantity > maxQuantity) {
                                                setErrors(prev => ({
                                                    ...prev,
                                                    MaterialQuantity: `Quantity cannot be greater than ${maxQuantity}`
                                                }));
                                                return;
                                            }

                                            setMaterialData(prev => ({
                                                ...prev,
                                                MaterialQuantity: quantity
                                            }));

                                            setErrors(prev => ({
                                                ...prev,
                                                MaterialQuantity: ""
                                            }));
                                        }}
                                        placeholder="Enter Quantity"
                                        max={subMaterialDetails?.Quantity}
                                        error={errors.MaterialQuantity}
                                        rightIcon={subMaterialDetails?.UomCode}
                                    />

                                    <DatePickerInput
                                        label="Required Date"
                                        value={formatDate_dd_mm_yyyy(materialData.RequiredDate)}
                                        onChange={(value) =>
                                            setMaterialData(prev => ({
                                                ...prev,
                                                RequiredDate:
                                                    convert_dd_mm_yyyy_To_Yyyy_mm_dd(value) ?? "",
                                            }))
                                        }
                                        disabled
                                        placeholder="DD/MM/YYYY"
                                        error={errors.RequiredDate}
                                    />



                                </div>
                                {subMaterialDetails && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                                            <FieldItem label="Material Name" value={subMaterialDetails.MaterialName} />

                                            <FieldItem label="Sub Material Name" value={subMaterialDetails.SubMaterialName} className="font-medium text-blue-900" />

                                            <FieldItem label="UOM" value={`${subMaterialDetails.Uom || "-"} (${subMaterialDetails.UomCode || "-"})`} />

                                            <FieldItem label="Material Rate" value={formatCurrency(subMaterialDetails.MaterialRate)} />

                                            <FieldItem label="Required Quantity" value={subMaterialDetails.Quantity} />

                                            <FieldItem label="Lead Time (Days)" value={subMaterialDetails.LeadTimeInDays ?? 0} />

                                            <FieldItem label="Is Tolerant" value={subMaterialDetails.IsTolerant ? "YES" : "NO"} />

                                        </div>
                                    </div>
                                )}

                                <div>
                                    <TextArea
                                        label="Remark"
                                        className="thin-scroll"
                                        value={materialData.Remark}
                                        onChange={(e) =>
                                            setMaterialData(prev => ({
                                                ...prev,
                                                Remark: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter Remark"
                                        error={errors.Remark}
                                    />
                                </div>
                            </div>
                        )}

                        {active === "In - Direct" && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <SingleSelectDropdownWithPagination
                                        key={`Material-${materialData.MaterialMasterId}`}
                                        required
                                        label="Material"
                                        title="Select Material"
                                        size="lg"
                                        dataFetchCallBack={fetchMaterialMasterDropdown}
                                        onSelected={(item) => {
                                            const id = item ? Number(item.value) : 0;

                                            setInDirectSubMaterialDetails(null);

                                            setMaterialData(prev => ({
                                                ...prev,
                                                MaterialMasterId: id,
                                                SubMaterialMasterId: 0,
                                                MaterialName: item?.label ?? "",
                                                SubMaterialName: "",
                                                UomCode: "",
                                                UomMasterId: 0,
                                                RequiredDate: "",
                                            }));
                                        }}
                                        initialValue={createDropdownInitialValue(materialData.MaterialMasterId, dropdownLabels.materialName || materialData.MaterialName)}
                                        error={errors.MaterialMasterId}
                                    />

                                    <SingleSelectDropdownWithPagination
                                        key={`Sub Material-${materialData.SubMaterialMasterId}`}
                                        label="Sub Material"
                                        disabled={!materialData.MaterialMasterId}
                                        required
                                        title="Sub Material"
                                        size="lg"
                                        dataFetchCallBack={(pageNumber, params) =>
                                            fetchSubMaterialMasterDropdown(pageNumber, {
                                                ...params,
                                                MaterialMasterId: materialData.MaterialMasterId,
                                            })
                                        }
                                        onSelected={(item) => {
                                            const id = item ? Number(item.value) : 0;

                                            if (!item) {
                                                setInDirectSubMaterialDetails(null);

                                                setMaterialData(prev => ({
                                                    ...prev,
                                                    SubMaterialMasterId: 0,
                                                    SubMaterialName: "",
                                                    UomCode: "",
                                                    UomMasterId: 0,
                                                    RequiredDate: "",

                                                }));
                                                return;
                                            }

                                            const selected = item as unknown as SubMaterialMasterData

                                            const leadTime = Number(selected?.LeadTimeInDays ?? 0);

                                            const requiredDate = calculateRequiredDate(leadTime);

                                            setMaterialData(prev => ({
                                                ...prev,
                                                SubMaterialMasterId: id,
                                                SubMaterialName: selected?.SubMaterialName ?? "",
                                                UomCode: selected?.UomCode ?? "",
                                                Uom: selected?.Uom ?? "",
                                                UomMasterId: selected?.UomMasterId ?? 0,
                                                LeadTimeInDays: selected?.LeadTimeInDays || 0,
                                                RequiredDate: requiredDate,
                                            }));

                                            setInDirectSubMaterialDetails(selected as unknown as SubMaterialMasterData);
                                        }}

                                        error={errors.SubMaterialMasterId}
                                        initialValue={createDropdownInitialValue(materialData.SubMaterialMasterId, materialData.SubMaterialName)}
                                    />

                                </div>

                                {inDirectSubMaterialDetails && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <FieldItem label="UOM" value={`${inDirectSubMaterialDetails.UomCode || "-"}`} />
                                            <FieldItem label="Lead Time (Days)" value={inDirectSubMaterialDetails.LeadTimeInDays} />
                                            <FieldItem label="Is Tolerant" value={inDirectSubMaterialDetails.IsTolerant ? "YES" : "NO"} />

                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <Input
                                        label="Quantity"
                                        required
                                        value={materialData.MaterialQuantity}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setMaterialData(prev => ({ ...prev, MaterialQuantity: value === "" ? 0 : Number(value) }));
                                        }}
                                        placeholder="Enter Quantity"
                                        error={errors.MaterialQuantity}
                                    />

                                    <div>
                                        <DatePickerInput
                                            label="Required Date"
                                            value={formatDate_dd_mm_yyyy(materialData.RequiredDate)}
                                            onChange={(value) =>
                                                setMaterialData(prev => ({
                                                    ...prev,
                                                    RequiredDate: convert_dd_mm_yyyy_To_Yyyy_mm_dd(value) ?? "",
                                                }))
                                            }
                                            disabled
                                            placeholder="DD/MM/YYYY"
                                            error={errors.RequiredDate}
                                        />

                                    </div>



                                </div>
                                <div>
                                    <TextArea
                                        label="Remark"
                                        className="thin-scroll"
                                        value={materialData.Remark}
                                        onChange={(e) =>
                                            setMaterialData(prev => ({ ...prev, Remark: e.target.value }))
                                        }
                                        placeholder="Enter Remark"
                                        error={errors.Remark}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteMaterialDetailsData(null);
                }}
                onConfirm={handleDeleteMaterialDetails}
                loading={isLoading}
                title="You are about to delete a Material Details"
                pageName={deleteMaterialDetailsData
                    ? deleteMaterialDetailsData.row.MaterialRequisitionType?.trim().toUpperCase() === "DIRECT"
                        ? `Direct - ${deleteMaterialDetailsData.row.Level4Name || "Sub Material"}`
                        : `In - Direct - ${deleteMaterialDetailsData.row.SubMaterialName || "Sub Material"}`
                    : "Material Details"}
            />
        </div>

    )
}


