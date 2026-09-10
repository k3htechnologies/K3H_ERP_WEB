import { Loader } from "@/core/utils/loader"
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { Button } from "@/ui/components/forms/Button";
import { Modal } from "@/ui/components/Modal/Modal";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/core/hooks/useToast";
import { technicalService } from "@/features/technical/services/TechnicalService";
import type { FilterWithPaginationMaterialSubMaterialMasterUOM, MaterialSubMaterialUOM } from "@/features/technical/models/TechnicalModel";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import * as E from "fp-ts/Either";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import type { AddUpdateMaterialRequisitionDetailRequest, AddUpdateMaterialRequisitionRequest, FilterWithPaginationMaterialRequisition } from "@/features/materialRequisition/models/MaterialRequisitionModel";
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
    const [materialsubmaterialList, setMaterialSubMaterialList] = useState<MaterialSubMaterialUOM[]>([]);
    const [formData, setFormData] = useState<AddUpdateMaterialRequisitionRequest>(() => initialFormStateMaterialRequisition())
    const [documentFiles, setdocumentFiles] = useState<(File | string)[]>([]);
    const [removeddocumentFilesURLs, setRemoveddocumentFilesURLs] = useState<string[]>([]);
    const [documentURL, setDocumentURL] = useState<string>("");
    const { canAction } = useMenuPermissions("/materialRequisition");
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const [dropdownLabels, setDropdownLabels] = useState({ materialName: "", uom: "", level1Name: "", level2Name: "", level3Name: "", level4Name: "" });
    const [dropdownMaterialResetKey, setDropdownMaterialResetKey] = useState(0);
    const [dropdownSubMaterialResetKey, setDropdownSubMaterialResetKey] = useState(-1);
    const [materialOptions, setMaterialOptions] = useState<any[]>([]);
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


    useEffect(() => {
        if (!MaterialRequisitionId) return;
        loadDetailsdata();
    }, [MaterialRequisitionId]);

    useEffect(() => {
        if (addMaterialPopUp) {
            loadMaterialsSubMaterialMasterUOM();
        }
    }, [addMaterialPopUp]);

    useEffect(() => {
        const uniqueMaterials = [
            ...new Map((materialsubmaterialList || []).map(item => [
                item.MaterialMasterId,
                item
            ])).values()];

        setMaterialOptions(
            uniqueMaterials.map(item => ({
                label: item.MaterialName,
                value: String(item.MaterialMasterId)
            }))
        );
    }, [materialsubmaterialList]);


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



    const validateMaterialForm = (): {

        isValid: boolean;
        errors: { [key: string]: string };

    } => {
        const newErrors: { [key: string]: string } = {};

        if (active.toUpperCase() === "DIRECT") {

            if (!materialData.LevelId1 || materialData.LevelId1 === 0)
                newErrors.LevelId1 = "Category Name is required";

            if (!materialData.LevelId2 || materialData.LevelId2 === 0)
                newErrors.LevelId2 = "Sub Category Name is required";

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

        if (!materialData.MaterialQuantity || materialData.MaterialQuantity <= 0) {
            newErrors.MaterialQuantity = "Required Quantity is required";

        } else if (!materialData.MaterialQuantity || materialData.MaterialQuantity <= 0) {
            newErrors.MaterialQuantity = "Required Quantity must be greater than 0";
        }


        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const loadDetailsdata = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisition = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: Number(projectId),
                    MaterialRequisitionId: Number(MaterialRequisitionId)
                };

                const response = await materialRequisitionService.apiCallPullMaterialRequisition(params);

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

    const handleAddMaterial = async () => {
        setErrors({});
        setDropdownMaterialResetKey(prev => prev + 1);
        setSubMaterialDetails(null);
        setAddMaterialPopUp(true);
        setEditIndex(null);
        setMaterialData(initialFormState());
    }

    const handleEditMaterial = useCallback((row: AddUpdateMaterialRequisitionDetailRequest, index: number) => {
        setErrors({});
        setEditIndex(index);

        const isDirect = row.MaterialRequisitionType?.toUpperCase() === "DIRECT";

        setActive(isDirect ? "Direct" : "In - Direct");
        

        setMaterialData({
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
                    SubMaterialName: selected.Level4Name ?? row.Level4Name ??  "",
                    Uom: selected.Level4SubMaterialUom ?? "",
                    UomCode:  selected.Level4SubMaterialUomCode ?? "",
                    MaterialRate: Number(selected.MaterialCost ?? 0 ),
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

        setDropdownLabels({
            materialName: row.MaterialName || "",
            uom: row.UomCode || "",
            level1Name: row.Level1Name || "",
            level2Name: row.Level2Name || "",
            level3Name: row.Level3Name || "",
            level4Name: row.Level4Name || "",
        });
        setAddMaterialPopUp(true);
    }, [projectBudgetList]);

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

       const isDirect =   materialList[0]?.MaterialRequisitionType?.trim().toUpperCase() === "DIRECT";

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

                                    setMaterialList(prev =>
                                        prev.filter((_, i) => i !== index)
                                    );
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
    }, [active, canAction, materialList, handleEditMaterial]);

    const subMaterialOptions = useMemo(() => {
        if (!materialData.MaterialMasterId) return [];

        return materialsubmaterialList
            .filter(item => item.MaterialMasterId === materialData.MaterialMasterId)
            .map(item => ({
                label: item.SubMaterialName,
                value: String(item.SubMaterialMasterId)
            }));
    }, [materialData.MaterialMasterId, materialsubmaterialList]);

    const createDropdownInitialValue = (id: number | null, label: string) => {
        if (!id || !label) return null;
        return { label, value: String(id) };
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

    const validateMaterialRequisitionForm = (): {

        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.Remarks) {
            newErrors.Remarks = ' Remarks is required.';
        }
        if (!hasAnyDocumentFile(documentFiles, documentURL, removeddocumentFilesURLs)) {
            newErrors.AttachmentsURL = "File is required.";
        }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };

    const handleSave = async () => {

        if (materialList.length === 0) {
            addToast({ type: "error", title: "Please select at least one Material" });
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
            (error: unknown) => {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to save material requisition";

                addToast({ type: "error", title: errorMessage });
            },
            undefined,
            "Saving Data"
        );
    };

    const loadMaterialsSubMaterialMasterUOM = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const employeeData = LocalStorageHelper.getStoredEmployeeData();
                const projectId = employeeData?.ProjectData?.[0]?.ProjectId ?? 0;
                const ClientRegistrationId = Number(employeeData?.ClientRegistrationId);

                const params: FilterWithPaginationMaterialSubMaterialMasterUOM = {
                    ProjectId: projectId,
                    ClientRegistrationId: ClientRegistrationId
                };

                const apiResponse = await technicalService.apiCallMaterialSubMaterialMasterUOMList(params);

                if (E.isRight(apiResponse)) {

                    setMaterialSubMaterialList(apiResponse.right.Data.MaterialMasterSubMaterialMasterData);
                } else {
                    addToast({ type: "error", title: "Error Fetching material list" });
                }
            },
            undefined,
            (error: unknown) => {
                const errorMessage = error instanceof Error ? error.message : "Failed to load vendor data";
                addToast({ type: "error", title: errorMessage });
            },
            undefined,
            "Loading Material - Sub Material - UOM List"
        );
    };

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

    return (
        <>
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
                                leftIcon={<Plus className="h-4 w-4" />}
                            >
                                Add Material
                            </Button>

                        </div>

                        {materialList.length > 0 ? (
                            <div className="pb-2">
                                <DataTable
                                    data={materialList}
                                    columns={MaterialRequisitionColumns}
                                    emptyMessage="No Material Found"
                                    fixedHeight
                                    recordsPerPage={5}
                                    className="flex-1"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <span className="text-gray-500 text-sm font-medium">No materials found</span>
                            </div>
                        )}

                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Document Details</h3>

                        <div className="flex items-center justify-between pb-3">
                            <MultiFilePicker
                                label="Upload Document"
                                placeholder="Upload Document"
                                value={documentFiles}
                                onChange={setdocumentFiles}
                                availableFilesURL={documentURL}
                                allowedTypes={["image/jpeg", "image/png"]}
                                required
                                maxFiles={1}
                                error={errors.AttachmentsURL}
                                maxSizeMB={5}
                                onRemoveExisting={(url) =>
                                    setRemoveddocumentFilesURLs((prev) => [...prev, url])
                                }
                            />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Remark</h3>

                        <div className="flex items-center justify-between pb-3">
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
                                required
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
                    setErrors({});
                }}
                title="Add Material"
                onSubmit={e => {
                    e.preventDefault();
                    saveMaterial();
                }}
                saveText="Add"
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

                                            const requiredDate = new Date();
                                            requiredDate.setDate(requiredDate.getDate() + leadTime);

                                            const yyyy = requiredDate.getFullYear();
                                            const mm = String(requiredDate.getMonth() + 1).padStart(2, "0");
                                            const dd = String(requiredDate.getDate()).padStart(2, "0");

                                            setSubMaterialDetails({
                                                MaterialName: selected.Level4MaterialName ?? "",
                                                SubMaterialName: selected.Level4Name ?? item?.label ?? "",
                                                Uom: selected.Level4SubMaterialUom ?? "",
                                                UomCode: selected.Level4SubMaterialUomCode ?? "",
                                                MaterialRate: Number(selected.MaterialCost ?? 0),
                                                LeadTimeInDays: leadTime,
                                                Quantity: Number(selected.Quantity ?? 0),
                                                IsTolerant: selected.Level4IsTolerant ?? false,
                                                RequiredDate: `${dd}/${mm}/${yyyy}`,
                                            });

                                            setMaterialData(prev => ({
                                                ...prev,
                                                LevelId4: levelId4,
                                                Level4Name: item?.label ?? "",
                                                RequiredDate: `${yyyy}-${mm}-${dd}`,
                                                Level4SubMaterialUomCode:  selected.Level4SubMaterialUomCode ?? "",
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
                                    />

                                    <DatePickerInput
                                        label="Required Date"
                                        value={formatDate_dd_mm_yyyy(
                                            materialData.RequiredDate
                                        )}
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

                                            <FieldItem  label="Sub Material Name" value={subMaterialDetails.SubMaterialName} className="font-medium text-blue-900"  />

                                            <FieldItem  label="UOM"  value={`${subMaterialDetails.Uom || "-"} (${subMaterialDetails.UomCode || "-"})`} />

                                            <FieldItem  label="Material Rate"  value={formatCurrency(subMaterialDetails.MaterialRate)}  />

                                            <FieldItem  label="Required Quantity" value={subMaterialDetails.Quantity} />

                                            <FieldItem label="Lead Time (Days)" value={subMaterialDetails.LeadTimeInDays ?? 0} />

                                            <FieldItem  label="Is Tolerant"  value={subMaterialDetails.IsTolerant ? "YES" : "NO"} />

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



                        {active == "In - Direct" && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SingleSelectDropdownWithPagination
                                        required
                                        label="Material"
                                        key={dropdownMaterialResetKey}
                                        initialValue={createDropdownInitialValue(materialData.MaterialMasterId, dropdownLabels.materialName || materialData.MaterialName)}
                                        title="Select Material"
                                        size="lg"
                                        dataFetchCallBack={async () => ({
                                            itemList: materialOptions,
                                            totalNumberOfRecord: materialOptions.length
                                        })}
                                        onSelected={(item) => {
                                            const id = item ? Number(item.value) : 0;

                                            setMaterialData(prev => ({
                                                ...prev,
                                                MaterialMasterId: id,
                                                SubMaterialMasterId: 0,
                                                MaterialName: item?.label ?? "",
                                                SubMaterialName: "",
                                                UomCode: "",
                                                UomMasterId: 0
                                            }));
                                            setDropdownSubMaterialResetKey(p => p + 1);
                                        }}
                                        error={errors.MaterialMasterId}
                                    />

                                    <SingleSelectDropdownWithPagination
                                        required
                                        label="Sub Material"
                                        key={dropdownSubMaterialResetKey}
                                        initialValue={createDropdownInitialValue(materialData.SubMaterialMasterId, materialData.SubMaterialName)}
                                        title="Select SubMaterial"
                                        size="lg"
                                        dataFetchCallBack={async () => ({
                                            itemList: subMaterialOptions,
                                            totalNumberOfRecord: subMaterialOptions.length
                                        })}

                                        onSelected={(item) => {
                                            const id = item ? Number(item.value) : 0;

                                            const selected = materialsubmaterialList.find(
                                                item => item.SubMaterialMasterId === id
                                            );

                                            setMaterialData(prev => ({
                                                ...prev,
                                                SubMaterialMasterId: id,
                                                SubMaterialName: selected?.SubMaterialName ?? "",
                                                UomCode: selected?.UomCode ?? "",
                                                UomMasterId: selected?.UomMasterId ?? 0
                                            }));
                                        }}
                                        error={errors.SubMaterialMasterId}
                                    />

                                    <Input
                                        type="text"
                                        disabled
                                        label="UOM"
                                        value={materialData.UomCode}
                                        placeholder="UOM"
                                        maxLength={250}
                                        error={errors.UomMasterId}
                                    />


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
                                            required
                                            error={errors.RequiredDate}
                                            value={formatDate_dd_mm_yyyy(materialData.RequiredDate)}
                                            onChange={(value) =>
                                                setMaterialData(prev => ({ ...prev, RequiredDate: convert_dd_mm_yyyy_To_Yyyy_mm_dd(value) ?? "" }))
                                            }
                                            placeholder="DD/MM/YYYY"
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
        </>

    )
}


