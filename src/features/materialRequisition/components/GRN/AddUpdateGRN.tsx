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
import { TextArea } from "@/ui/components/forms/Textarea";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useNavigate, useParams } from "react-router-dom";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import { Input } from "@/ui/components/forms/Input";
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { AddUpdateMaterialRequisitionGRNRequest, FilterWithPaginationMaterialRequisitionGRN, MaterialRequisitionDetailGRN } from "@/features/materialRequisition/models/MaterialRequisitionGRNModel";
import { materialRequisitionGRNService } from "@/features/materialRequisition/services/MaterialRequisitionGRNService";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import { filterChallanNumber, filterNumbers, hasAnyDocumentFile, isValidVehicleNumber } from "@/core/utils/fileValidation";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";

const initialFormStateMaterialRequisition = (): AddUpdateMaterialRequisitionGRNRequest => ({
    MaterialRequisitionId: 0,
    Remarks: '',
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ProjectId: 0,
    MaterialRequisitionGRNId: 0,
    ChallanNumber: "",
    VehicleNumber: null,
    UploadChallanURL: null,
    RemoveUploadChallanURL: "",
    MaterialRequisitionDetailGRNJSON: ""
})

const initialFormState = (): MaterialRequisitionDetailGRN => ({
    MaterialMasterId: 0,
    MaterialName: "",
    SubMaterialName: "",
    SubMaterialMasterId: 0,
    MaterialQuantity: 0,
    UomMasterId: 0,
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
    MaterialRequisitionType: "",
    TotalReceivedMaterialQuantity: 0,
    QualityAnalystRemark: '',
    MaterialRequisitionDetailGRNId: 0,
    MaterialRequisitionDetailId: 0,
    TotalReceivedQuantityByRequisition: 0,
    IsTolerant: false,
    TolerancePercentage: 0,
})

export const AddUpdateGRN = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [addMaterialPopUp, setAddMaterialPopUp] = useState(false);
    const { addToast } = useToast();
    const [materialList, setMaterialList] = useState<MaterialRequisitionDetailGRN[]>([]);
    const [materialData, setMaterialData] = useState<MaterialRequisitionDetailGRN>(() => initialFormState());
    const [materialSubMaterialList, setMaterialSubMaterialList] = useState<MaterialSubMaterialUOM[]>([]);
    const [formData, setFormData] = useState<AddUpdateMaterialRequisitionGRNRequest>(() => initialFormStateMaterialRequisition())
    const [uploadChallanFiles, setUploadChallanFiles] = useState<(File | string)[]>([]);
    const [removedUploadChallanUrls, setRemovedUploadChallanUrls] = useState<string[]>([]);
    const [uploadChallanURL, setuploadChallanURL] = useState<string>();
    const { canAction } = useMenuPermissions("/materialRequisition");
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [dropdownMaterialResetKey] = useState(0);
    const [dropdownSubMaterialResetKey, setDropdownSubMaterialResetKey] = useState(-1);
    const [materialOptions, setMaterialOptions] = useState<any[]>([]);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const navigate = useNavigate();
    const { projectId } = useProject();
    const { MaterialRequisitionGRNId } = useParams<{ MaterialRequisitionGRNId?: string }>();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const currentUniquekey = listState.Uniquekey
    const { detailData } = useMaterialRequisitionListState()
    const { MaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();

    useEffect(() => {
        if (!MaterialRequisitionId || detailData.length === 0) return;

        loadGRNData();
    }, [MaterialRequisitionId, detailData]);

    useEffect(() => {
        if (addMaterialPopUp) {
            loadMaterialsSubMaterialMasterUOM();
        }
    }, [addMaterialPopUp]);

    useEffect(() => {
        const uniqueMaterials = [
            ...new Map((detailData || []).map(item => [
                item.MaterialMasterId,
                item
            ])).values()];

        setMaterialOptions(
            uniqueMaterials.map(item => ({
                label: item.MaterialName,
                value: String(item.MaterialMasterId)
            }))
        );
    }, [detailData]);

    const loadGRNData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationMaterialRequisitionGRN = {
                    MaterialRequisitionId: currentMaterialRequisitionId,
                    Uniquekey: currentUniquekey,
                    ProjectId: Number(projectId),
                    MaterialRequisitionGRNId: Number(MaterialRequisitionGRNId)
                };

                const response = await materialRequisitionGRNService.apiCallPullMaterialRequisitionGRN(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    const e = data?.[0];

                    if (e.MaterialRequisitionDetailGRNData) {
                        const grnDetails = e.MaterialRequisitionDetailGRNData;

                        setMaterialList(
                            grnDetails.map((item: any) => {

                                const matched = detailData.find(detail =>
                                    Number(detail.MaterialRequisitionDetailId) ===
                                    Number(item.MaterialRequisitionDetailId)
                                );

                                return {
                                    MaterialMasterId: item.MaterialMasterId ?? matched?.MaterialMasterId ?? 0,
                                    MaterialName: item.MaterialName ?? matched?.MaterialName ?? "",
                                    SubMaterialMasterId: item.SubMaterialMasterId ?? matched?.SubMaterialMasterId ?? 0,
                                    SubMaterialName: item.SubMaterialName ?? matched?.SubMaterialName ?? "",
                                    UomCode: item.UomCode ?? matched?.UomCode ?? item.Level4SubMaterialUomCode ?? matched?.Level4SubMaterialUomCode ?? "",
                                    UomMasterId: item.UomMasterId ?? matched?.UomMasterId ?? 0,
                                    LevelId1: item.LevelId1 ?? matched?.LevelId1 ?? 0,
                                    Level1Name: item.Level1Name ?? matched?.Level1Name ?? "",
                                    LevelId2: item.LevelId2 ?? matched?.LevelId2 ?? 0,
                                    Level2Name: item.Level2Name ?? matched?.Level2Name ?? "",
                                    LevelId3: item.LevelId3 ?? matched?.LevelId3 ?? 0,
                                    Level3Name: item.Level3Name ?? matched?.Level3Name ?? "",
                                    LevelId4: item.LevelId4 ?? matched?.LevelId4 ?? 0,
                                    Level4Name: item.Level4Name ?? matched?.Level4Name ?? "",
                                    Level4SubMaterialUomCode: item.Level4SubMaterialUomCode ?? matched?.Level4SubMaterialUomCode ?? "",
                                    Level4SubMaterialUom: item.Level4SubMaterialUom ?? matched?.Level4SubMaterialUom ?? "",
                                    MaterialQuantity: item.MaterialQuantity ?? matched?.MaterialQuantity ?? 0,
                                    MaterialRequisitionType: item.MaterialRequisitionType ?? matched?.MaterialRequisitionType ?? "",
                                    MaterialRequisitionDetailGRNId: item.MaterialRequisitionDetailGRNId ?? 0,
                                    MaterialRequisitionDetailId: item.MaterialRequisitionDetailId ?? 0,
                                    TotalReceivedMaterialQuantity: item.TotalReceivedMaterialQuantity ?? 0,
                                    QualityAnalystRemark: item.QualityAnalystRemark ?? "",
                                    TotalReceivedQuantityByRequisition: item.TotalReceivedQuantityByRequisition ?? matched?.MaterialReceivedQuantityTillDate ?? 0,
                                    IsTolerant: item.IsTolerant ?? matched?.IsTolerant ?? false,
                                    TolerancePercentage: item.TolerancePercentage ?? matched?.TolerancePercentage ?? matched?.Tolerance ?? 0,
                                };
                            })
                        );
                        setuploadChallanURL(e.UploadChallanURL ?? undefined);
                        setUploadChallanFiles([]);
                        setRemovedUploadChallanUrls([]);
                    }
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

    const handleAddMaterial = () => {
        setErrors({});
        setEditIndex(null);

        const materialType = detailData?.[0]?.MaterialRequisitionType?.trim().toUpperCase() ?? "";

        setMaterialData({
            ...initialFormState(),
            MaterialRequisitionType: materialType === "DIRECT" ? "DIRECT" : "IN - DIRECT",
        });
        setAddMaterialPopUp(true);
    };

    const handleEditMaterial = useCallback((row: MaterialRequisitionDetailGRN, index: number) => {
        setErrors({});
        setEditIndex(index);

        setMaterialData({
            MaterialMasterId: row.MaterialMasterId,
            SubMaterialMasterId: row.SubMaterialMasterId,
            UomCode: row.UomCode,
            UomMasterId: row.UomMasterId,
            TotalReceivedMaterialQuantity: row.TotalReceivedMaterialQuantity,
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
            MaterialRequisitionType: row.MaterialRequisitionType,
            QualityAnalystRemark: row.QualityAnalystRemark,
            MaterialRequisitionDetailGRNId: row.MaterialRequisitionDetailGRNId,
            MaterialRequisitionDetailId: row.MaterialRequisitionDetailId,
            MaterialQuantity: row.MaterialQuantity,
            TotalReceivedQuantityByRequisition: row.TotalReceivedQuantityByRequisition ?? 0,
            IsTolerant: row.IsTolerant ?? false,
            TolerancePercentage: row.TolerancePercentage ?? 0,
        });
        setAddMaterialPopUp(true);
    }, [materialOptions]);

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
                key: "QualityAnalystRemark",
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
    }, [materialOptions, canAction, materialList, handleEditMaterial]);

    const subMaterialOptions = useMemo(() => {
        if (!materialData.MaterialMasterId) return [];

        return detailData.filter(item =>
            item.MaterialMasterId === materialData.MaterialMasterId)
            .map(item => ({
                label: item.SubMaterialName,
                value: String(item.SubMaterialMasterId)
            }));

    }, [materialData.MaterialMasterId, detailData]);

    const createDropdownInitialValue = (id: number | null, label: string) => {
        if (!id || !label) {
            return null;
        }
        return { label, value: String(id) };
    };

    const selectedMaterialDetail = detailData.find(item =>
        materialData.MaterialRequisitionType?.toUpperCase() === "DIRECT"
            ? (item.MaterialRequisitionDetailId) ===
            (materialData.MaterialRequisitionDetailId)
            : (item.MaterialMasterId) ===
            (materialData.MaterialMasterId) &&
            (item.SubMaterialMasterId) ===
            (materialData.SubMaterialMasterId)
    );

    const selectedMaterialSubMaterial = materialSubMaterialList.find(item =>
        item.MaterialMasterId === materialData.MaterialMasterId &&
        item.SubMaterialMasterId === materialData.SubMaterialMasterId
    );

    const isDirectMaterial = materialData.MaterialRequisitionType?.toUpperCase() === "DIRECT";

    const addedQuantity = materialList
        .filter((_item, index) => index !== editIndex)
        .filter(item =>
            isDirectMaterial
                ? (item.MaterialRequisitionDetailId) ===
                (materialData.MaterialRequisitionDetailId)
                : (item.MaterialMasterId) ===
                (materialData.MaterialMasterId) &&
                (item.SubMaterialMasterId) ===
                (materialData.SubMaterialMasterId)
        )
        .reduce((total, item) =>
            total + (item.TotalReceivedMaterialQuantity ?? 0), 0
        );

    const receivedQuantity = materialData.TotalReceivedQuantityByRequisition ?? selectedMaterialDetail?.MaterialReceivedQuantityTillDate ?? 0;

    const totalReceived = receivedQuantity + addedQuantity;

    const pendingQuantity = Math.max(Number((materialData.MaterialQuantity - totalReceived).toFixed(2)), 0);

    const isToleranceAllowed = materialData.IsTolerant ?? selectedMaterialDetail?.IsTolerant ?? selectedMaterialSubMaterial?.IsTolerant ?? false;

    const tolerancePercentage =
        materialData.TolerancePercentage ?? selectedMaterialDetail?.TolerancePercentage ?? selectedMaterialDetail?.Tolerance  ?? 0;

    const allowedReceivedQuantity = isToleranceAllowed
        ? pendingQuantity + (pendingQuantity * tolerancePercentage) / 100
        : pendingQuantity;

    const currentEditedRowQuantity = editIndex !== null ? materialList[editIndex]?.TotalReceivedMaterialQuantity ?? 0 : 0;
    const effectiveAllowedReceivedQuantity = editIndex !== null
        ? currentEditedRowQuantity + allowedReceivedQuantity
        : allowedReceivedQuantity;

    const validateMaterialRequisitionGRNForm = (): {
        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.Remarks) {
            newErrors.Remarks = ' Remarks is required.';
        }
        if (!formData.VehicleNumber?.trim()) {
            newErrors.VehicleNumber = 'Vehicle Number is required.';
        } else if (!isValidVehicleNumber(formData.VehicleNumber)) {
            newErrors.VehicleNumber = 'Invalid vehicle number format. Examples: MH12AB1234, 21 BH 0001 AA, 628, 1';
        }
        if (!formData.ChallanNumber) {
            newErrors.ChallanNumber = ' Challan Number is required.';
        } else if (formData.ChallanNumber.length !== 15) {
            newErrors.ChallanNumber = ' Challan Number must be 15 characters long.';
        }
        if (!hasAnyDocumentFile(uploadChallanFiles, uploadChallanURL, removedUploadChallanUrls)) {
            newErrors.UploadChallanFiles = "File is required.";
        }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };

    const PushMaterialRequisitionGRNFormData = (): FormData => {

        const form = new FormData();

        form.append('MaterialRequisitionId', String(currentMaterialRequisitionId ?? 0));
        form.append('Uniquekey', formData.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6");
        form.append('Remarks', formData.Remarks ?? '');
        form.append('ChallanNumber', formData.ChallanNumber);
        form.append('VehicleNumber', formData.VehicleNumber ?? '');
        form.append('MaterialRequisitionGRNId', formData.MaterialRequisitionGRNId.toString());

        const filtered = materialList
            .filter(item => item.TotalReceivedMaterialQuantity > 0)
            .map(item => ({
                MaterialRequisitionDetailGRNId: item.MaterialRequisitionDetailGRNId ?? 0,
                MaterialRequisitionDetailId: item.MaterialRequisitionDetailId,
                TotalReceivedMaterialQuantity: item.TotalReceivedMaterialQuantity,
                QualityAnalystRemark: item.QualityAnalystRemark,
            }));

        form.append('MaterialRequisitionDetailGRNJSON', JSON.stringify(filtered));
        form.append("ProjectId", projectId!.toString());

        uploadChallanFiles.forEach(file => {
            if (file instanceof File) {
                form.append('UploadChallanURL', file);
            }
        });

        form.append('RemoveUploadChallanURL', removedUploadChallanUrls.join(','));
        return form;
    };

    const handleSave = async () => {
        if (materialList.length === 0) {
            addToast({ type: "error", title: "Please select at least one Material" });
            return;
        }

        setErrors({});
        const validation = validateMaterialRequisitionGRNForm();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushMaterialRequisitionGRNFormData();

                const response = await materialRequisitionGRNService.apiCallToAddMaterialRequisitionGRN(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/materialRequisition/view", {
                        state: { activeTab: "GRN" }
                    });

                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error?.message || 'Failed to save material requisition' });
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
            (error: any) => {
                addToast({ type: "error", title: error?.message || 'Failed to load vendor data' });
            },
            undefined,
            "Loading Data"
        );
    };

    const validateMaterialDetailsForm = (): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [key: string]: string } = {};

        const isDirect = materialData.MaterialRequisitionType?.toUpperCase() === "DIRECT";

        if (isDirect) {
            if (!materialData.MaterialRequisitionDetailId || materialData.MaterialRequisitionDetailId === 0) {
                newErrors.MaterialRequisitionDetailId = "Material is required";
            }
        } else {
            if (!materialData.MaterialMasterId || materialData.MaterialMasterId === 0) {
                newErrors.MaterialMasterId = "Material is required";
            }
            if (!materialData.SubMaterialMasterId || materialData.SubMaterialMasterId === 0) {
                newErrors.SubMaterialMasterId = "Sub Material is required";
            }
        }

        if (!materialData.TotalReceivedMaterialQuantity) {
            newErrors.TotalReceivedMaterialQuantity = "Received Quantity is required";

        } else if (materialData.TotalReceivedMaterialQuantity > effectiveAllowedReceivedQuantity
        ) {
            if (isToleranceAllowed) {
                newErrors.TotalReceivedMaterialQuantity = `Received Quantity cannot be greater than allowed quantity ${effectiveAllowedReceivedQuantity} (${pendingQuantity} + ${tolerancePercentage}% tolerance).`;
            } else {
                newErrors.TotalReceivedMaterialQuantity = `Received Quantity cannot be greater than pending quantity ${effectiveAllowedReceivedQuantity}.`;
            }
        }

        if (!materialData.QualityAnalystRemark) {
            newErrors.QualityAnalystRemark = "Quality Analyst Remark is required";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const saveMaterial = () => {
        setErrors({});

        const validation = validateMaterialDetailsForm();
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        const isDirectMaterial = materialData.MaterialRequisitionType?.toUpperCase() === "DIRECT";

        const otherRowsQuantity = materialList
            .filter((_, i) => i !== editIndex)
            .filter(data =>
                isDirectMaterial
                    ? (data.MaterialRequisitionDetailId) === (materialData.MaterialRequisitionDetailId)
                    : (data.MaterialMasterId) ===
                    (materialData.MaterialMasterId) &&
                    (data.SubMaterialMasterId) ===
                    (materialData.SubMaterialMasterId)
            )
            .reduce((sum, row) =>
                sum + (row.TotalReceivedMaterialQuantity ?? 0), 0
            );

        const cumulativeTotal = otherRowsQuantity + materialData.TotalReceivedMaterialQuantity;
        const maxAllowedTotal = isToleranceAllowed
            ? materialData.MaterialQuantity + (materialData.MaterialQuantity * tolerancePercentage) / 100
            : materialData.MaterialQuantity;

        if (cumulativeTotal > maxAllowedTotal) {
            setErrors({
                TotalReceivedMaterialQuantity: `Total received (${cumulativeTotal}) cannot exceed ${maxAllowedTotal}. Already added: ${otherRowsQuantity}.`
            });
            return;
        }

        const newItem: MaterialRequisitionDetailGRN = {
            ...materialData
        };

        setMaterialList(prev => {
            const updated = [...prev];

            if (editIndex !== null) {
                updated[editIndex] = newItem;
            } else {
                updated.push(newItem);
            }
            return updated;
        });
        setAddMaterialPopUp(false);
        setEditIndex(null);
        setMaterialData(initialFormState());
    };

    const handleFieldChange = (field: keyof AddUpdateMaterialRequisitionGRNRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value, }));
        setErrors((prev) => ({ ...prev, [field]: "", }));
    };

    const handleMaterialFieldChange = (field: keyof MaterialRequisitionDetailGRN, value: any) => {
        setMaterialData((prev) => ({ ...prev, [field]: value, }));
        setErrors((prev) => ({ ...prev, [field]: "", }));
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 pt-5">
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
                                    className="flex-1"
                                    emptyMessage="No GRN Data Found"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <span className="text-gray-500 text-sm font-medium">No materials found</span>
                            </div>
                        )}

                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Document Details</h3>

                        <div className="flex grid grid-cols-3 gap-4">
                            <Input
                                type="text"
                                label="Vehicle No."
                                placeholder="Enter Vehicle No."
                                value={formData.VehicleNumber ?? ""}
                                onChange={(e) => handleFieldChange("VehicleNumber", e.target.value)}
                                maxLength={10}
                                error={errors.VehicleNumber}
                                required
                            />

                            <Input
                                type="text"
                                label="Challan No."
                                placeholder="Challan No."
                                value={formData.ChallanNumber}
                                onChange={(e) => handleFieldChange("ChallanNumber", filterChallanNumber(e.target.value))}
                                maxLength={15}
                                error={errors.ChallanNumber}
                                required
                            />

                            <MultiFilePicker
                                label="Upload Document"
                                placeholder="Upload Document"
                                value={uploadChallanFiles}
                                onChange={setUploadChallanFiles}
                                availableFilesURL={uploadChallanURL ?? ""}
                                allowedTypes={["image/jpeg", "image/png"]}
                                maxFiles={1}
                                maxSizeMB={5}
                                onRemoveExisting={(url) =>
                                    setRemovedUploadChallanUrls(prev => [...prev, url])
                                }
                                error={errors.UploadChallanFiles}
                                required
                            />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Remark</h3>

                        <div className="flex items-center justify-between pb-3">
                            <TextArea label="Remark" className="thin-scroll" value={formData.Remarks}
                                onChange={(e) => handleFieldChange("Remarks", e.target.value)}
                                placeholder="Enter Remark"
                                error={errors.Remarks}
                                required
                            />
                        </div>

                    </div>
                </div>

                <BottomActionBar
                    cancelText="Cancel"
                    saveText={formData.MaterialRequisitionId && formData.MaterialRequisitionId > 0 ? "Update" : "Add"}
                    onCancel={() => navigate("/materialRequisition/view", {
                        state: { activeTab: "GRN" }
                    })}
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
                    setMaterialData(initialFormState());
                }}
                title={editIndex !== null ? "Update Material" : "Add Material"}
                onSubmit={e => {
                    e.preventDefault();
                    saveMaterial();
                }}
                saveText={editIndex !== null ? "Update" : "Add"}
                cancelText="Cancel"
                onCancel={() => {
                    setAddMaterialPopUp(false);
                    setMaterialData(initialFormState());
                }}
                size="small50"
            >
                <div className="space-y-10 p-6 bg-blue-100">

                    {materialData.MaterialRequisitionType?.trim().toUpperCase() === "DIRECT" ? (

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <SingleSelectDropdownWithPagination
                                    required
                                    label="Category"
                                    title="Select Category"
                                    size="lg"
                                    disabled={false}
                                    initialValue={
                                        materialData.LevelId1
                                            ? {
                                                label: materialData.Level1Name ?? "",
                                                value: String(materialData.LevelId1),
                                            } : null
                                    }
                                    dataFetchCallBack={async () => {

                                        const categories = [
                                            ...new Map((detailData || [])
                                                .filter(item =>
                                                    item.MaterialRequisitionType?.trim().toUpperCase() === "DIRECT"
                                                )
                                                .filter(item => item.LevelId1)
                                                .map(item => [item.LevelId1, item])
                                            ).values(),
                                        ];

                                        return {
                                            itemList: categories.map(item => ({
                                                label: item.Level1Name ?? "",
                                                value: String(item.LevelId1),
                                            })),
                                            totalNumberOfRecord: categories.length,
                                        };
                                    }}
                                    onSelected={item => {
                                        const categoryId = item ? Number(item.value) : 0;

                                        setMaterialData(prev => ({
                                            ...prev,
                                            MaterialRequisitionType: "DIRECT",
                                            LevelId1: categoryId,
                                            Level1Name: item?.label ?? "",
                                            LevelId2: 0,
                                            Level2Name: "",
                                            LevelId3: 0,
                                            Level3Name: "",
                                            LevelId4: 0,
                                            Level4Name: "",
                                            MaterialMasterId: 0,
                                            MaterialName: "",
                                            SubMaterialMasterId: 0,
                                            SubMaterialName: "",
                                            UomMasterId: 0,
                                            UomCode: "",
                                            Level4SubMaterialUomCode: "",
                                            Level4SubMaterialUom: "",
                                            MaterialRequisitionDetailId: 0,
                                            MaterialQuantity: 0,
                                            TotalReceivedQuantityByRequisition: 0,
                                            TotalReceivedMaterialQuantity: 0,
                                            IsTolerant: false,
                                            TolerancePercentage: 0,
                                        }));
                                        setErrors({});
                                    }}
                                    error={errors.LevelId1}
                                />

                                <SingleSelectDropdownWithPagination
                                    required
                                    label="Sub Category"
                                    title="Select Sub Category"
                                    size="lg"
                                    disabled={!materialData.LevelId1 || editIndex !== null}
                                    initialValue={
                                        materialData.LevelId2
                                            ? {
                                                label: materialData.Level2Name ?? "",
                                                value: String(materialData.LevelId2),
                                            } : null
                                    }
                                    dataFetchCallBack={async () => {
                                        const subCategories = [
                                            ...new Map(
                                                (detailData || []).filter(item =>
                                                    item.MaterialRequisitionType?.trim().toUpperCase() === "DIRECT"
                                                )
                                                    .filter(item =>
                                                        Number(item.LevelId1) ===
                                                        Number(materialData.LevelId1)
                                                    )
                                                    .filter(item => item.LevelId2)
                                                    .map(item => [item.LevelId2, item])
                                            ).values(),
                                        ];

                                        return {
                                            itemList: subCategories.map(item => ({
                                                label: item.Level2Name ?? "",
                                                value: String(item.LevelId2),
                                            })),
                                            totalNumberOfRecord: subCategories.length,
                                        };
                                    }}
                                    onSelected={item => {
                                        const level2Id = item ? Number(item.value) : 0;

                                        const selected = detailData.find(
                                            data =>
                                                Number(data.LevelId1) === Number(materialData.LevelId1) &&
                                                Number(data.LevelId2) === level2Id &&
                                                data.MaterialRequisitionType?.trim().toUpperCase() ===
                                                "DIRECT"
                                        );

                                        setMaterialData(prev => ({
                                            ...prev,
                                            LevelId2: level2Id,
                                            Level2Name: item?.label ?? "",
                                            LevelId3: 0,
                                            Level3Name: "",
                                            LevelId4: 0,
                                            Level4Name: "",
                                            MaterialMasterId: 0,
                                            MaterialName: "",
                                            SubMaterialMasterId: 0,
                                            SubMaterialName: "",
                                            UomMasterId: 0,
                                            UomCode: "",
                                            Level4SubMaterialUomCode: "",
                                            Level4SubMaterialUom: "",
                                            MaterialRequisitionDetailId: selected?.MaterialRequisitionDetailId ?? 0,
                                        }));
                                        setErrors({});
                                    }}
                                    error={errors.LevelId2}
                                />

                                <SingleSelectDropdownWithPagination
                                    required
                                    label="Description"
                                    title="Select Description"
                                    size="lg"
                                    disabled={!materialData.LevelId2 || editIndex !== null}
                                    initialValue={
                                        materialData.LevelId3
                                            ? {
                                                label: materialData.Level3Name ?? "",
                                                value: String(materialData.LevelId3),
                                            }
                                            : null
                                    }
                                    dataFetchCallBack={async () => {
                                        const descriptions = [
                                            ...new Map(
                                                (detailData || [])
                                                    .filter(
                                                        item =>
                                                            item.MaterialRequisitionType?.trim().toUpperCase() ===
                                                            "DIRECT"
                                                    )
                                                    .filter(
                                                        item =>
                                                            Number(item.LevelId1) ===
                                                            Number(materialData.LevelId1) &&
                                                            Number(item.LevelId2) ===
                                                            Number(materialData.LevelId2)
                                                    )
                                                    .filter(item => item.LevelId3)
                                                    .map(item => [item.LevelId3, item])
                                            ).values(),
                                        ];

                                        return {
                                            itemList: descriptions.map(item => ({
                                                label: item.Level3Name ?? "",
                                                value: String(item.LevelId3),
                                            })),
                                            totalNumberOfRecord: descriptions.length,
                                        };
                                    }}
                                    onSelected={item => {
                                        const level3Id = item ? Number(item.value) : 0;

                                        setMaterialData(prev => ({
                                            ...prev,
                                            LevelId3: level3Id,
                                            Level3Name: item?.label ?? "",
                                            LevelId4: 0,
                                            Level4Name: "",
                                            MaterialMasterId: 0,
                                            MaterialName: "",
                                            SubMaterialMasterId: 0,
                                            SubMaterialName: "",
                                            UomMasterId: 0,
                                            UomCode: "",
                                            Level4SubMaterialUomCode: "",
                                            Level4SubMaterialUom: "",
                                            MaterialRequisitionDetailId: 0,
                                        }));
                                        setErrors({});
                                    }}
                                    error={errors.LevelId3}
                                />

                                <SingleSelectDropdownWithPagination
                                    required
                                    label="Sub Material"
                                    title="Select Sub Material"
                                    size="lg"
                                    disabled={!materialData.LevelId3 || editIndex !== null}
                                    initialValue={
                                        materialData.LevelId4
                                            ? {
                                                label: materialData.Level4Name ?? "",
                                                value: String(materialData.LevelId4),
                                            } : null
                                    }
                                    dataFetchCallBack={async () => {
                                        const subMaterials = [
                                            ...new Map((detailData || []).filter(item =>
                                                item.MaterialRequisitionType?.trim().toUpperCase() === "DIRECT"
                                            )
                                                .filter(
                                                    item =>
                                                        Number(item.LevelId1) ===
                                                        Number(materialData.LevelId1) &&
                                                        Number(item.LevelId2) ===
                                                        Number(materialData.LevelId2) &&
                                                        Number(item.LevelId3) ===
                                                        Number(materialData.LevelId3)
                                                )
                                                .filter(item => item.LevelId4)
                                                .map(item => [item.LevelId4, item])
                                            ).values(),
                                        ];

                                        return {
                                            itemList: subMaterials.map(item => ({
                                                label: item.Level4Name ?? "",
                                                value: String(item.LevelId4),
                                            })),
                                            totalNumberOfRecord: subMaterials.length,
                                        };
                                    }}
                                    onSelected={item => {
                                        const level4Id = item ? Number(item.value) : 0;

                                        const selected = detailData.find(data =>
                                            Number(data.LevelId1) === Number(materialData.LevelId1) &&
                                            Number(data.LevelId2) === Number(materialData.LevelId2) &&
                                            Number(data.LevelId3) === Number(materialData.LevelId3) &&
                                            Number(data.LevelId4) === level4Id &&
                                            data.MaterialRequisitionType?.trim().toUpperCase() === "DIRECT"
                                        );

                                        if (!selected) return;

                                        setMaterialData(prev => ({
                                            ...prev,
                                            LevelId4: level4Id,
                                            Level4Name: item?.label ?? "",
                                            MaterialRequisitionDetailId: selected.MaterialRequisitionDetailId ?? 0,
                                            MaterialMasterId: selected.MaterialMasterId ?? 0,
                                            MaterialName: selected.MaterialName ?? "",
                                            SubMaterialMasterId: selected.SubMaterialMasterId ?? 0,
                                            SubMaterialName: selected.SubMaterialName ?? "",
                                            UomMasterId: selected.UomMasterId ?? 0,
                                            UomCode: selected.UomCode ?? selected.Level4SubMaterialUomCode ?? "",
                                            Level4SubMaterialUomCode: selected.Level4SubMaterialUomCode ?? "",
                                            Level4SubMaterialUom: selected.Level4SubMaterialUom ?? "",
                                            MaterialQuantity: selected.MaterialQuantity ?? 0,
                                            TotalReceivedQuantityByRequisition: selected.MaterialReceivedQuantityTillDate ?? 0,
                                            TotalReceivedMaterialQuantity: 0,
                                            IsTolerant: selected.IsTolerant ?? false,
                                            TolerancePercentage: selected.TolerancePercentage ?? selected.Tolerance ?? 0,
                                        }));
                                        setErrors({});
                                    }}
                                    error={errors.LevelId4}
                                />

                                <Input
                                    type="text"
                                    disabled
                                    label="UOM"
                                    value={materialData.LevelId1
                                        ? materialData.Level4SubMaterialUomCode
                                            ? `${materialData.Level4SubMaterialUom ?? ""} (${materialData.Level4SubMaterialUomCode})`
                                            : materialData.Level4SubMaterialUom ?? ""
                                        : ""
                                    }
                                    placeholder="UOM"
                                />

                                <Input
                                    type="text"
                                    label="Pending Quantity"
                                    required
                                    disabled
                                    value={materialData.LevelId1 ? `${pendingQuantity}` : ""}
                                    placeholder="Pending Quantity"
                                />

                                <Input
                                    label="Received Quantity"
                                    required
                                    value={materialData.LevelId1 ? materialData.TotalReceivedMaterialQuantity : ""}
                                    onChange={e => handleMaterialFieldChange("TotalReceivedMaterialQuantity", filterNumbers(e.target.value))}
                                    placeholder="Quantity"
                                    error={errors.TotalReceivedMaterialQuantity}
                                    disabled={!materialData.LevelId1}
                                />
                            </div>

                            <TextArea
                                label="Quality Analyst Remark"
                                value={materialData.LevelId1 ? materialData.QualityAnalystRemark : ""}
                                onChange={e => handleMaterialFieldChange("QualityAnalystRemark", e.target.value)}
                                required
                                error={errors.QualityAnalystRemark}
                                disabled={!materialData.LevelId1}
                            />
                        </div>

                    ) : materialData.MaterialRequisitionType?.trim().toUpperCase() === "IN - DIRECT" && (

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SingleSelectDropdownWithPagination
                                    required
                                    label="Material"
                                    key={dropdownMaterialResetKey}
                                    disabled={editIndex !== null}
                                    initialValue={createDropdownInitialValue(
                                        materialData.MaterialMasterId,
                                        materialData.MaterialName
                                    )}
                                    title="Select Material"
                                    size="lg"
                                    dataFetchCallBack={async () => ({
                                        itemList: materialOptions,
                                        totalNumberOfRecord: materialOptions.length,
                                    })}
                                    onSelected={(item) => {
                                        const id = item ? Number(item.value) : 0;

                                        const selected = detailData.find(data =>
                                            data.MaterialMasterId === id &&
                                            data.MaterialRequisitionType?.trim().toUpperCase() === "IN - DIRECT"
                                        );

                                        if (!selected) return;

                                        const selectedUOM = materialSubMaterialList.find(data =>
                                            data.MaterialMasterId === selected.MaterialMasterId &&
                                            data.SubMaterialMasterId === selected.SubMaterialMasterId
                                        );

                                        setMaterialData(prev => ({
                                            ...prev,
                                            MaterialRequisitionType: selected.MaterialRequisitionType ?? "In - Direct",
                                            MaterialMasterId: selected.MaterialMasterId,
                                            MaterialName: selected.MaterialName,
                                            SubMaterialMasterId: selected.SubMaterialMasterId,
                                            SubMaterialName: selected.SubMaterialName,
                                            UomCode: selected.UomCode,
                                            UomMasterId: selected.UomMasterId,
                                            MaterialQuantity: selected.MaterialQuantity,
                                            MaterialRequisitionDetailId: selected.MaterialRequisitionDetailId,
                                            TotalReceivedQuantityByRequisition: selected.MaterialReceivedQuantityTillDate ?? 0,
                                            IsTolerant: selected.IsTolerant ?? selectedUOM?.IsTolerant ?? false,
                                            TolerancePercentage: selected.TolerancePercentage ?? selected.Tolerance  ?? 0,
                                        }));
                                        setDropdownSubMaterialResetKey(p => p + 1);
                                    }}
                                    error={errors.MaterialMasterId}
                                />

                                <SingleSelectDropdownWithPagination
                                    required
                                    label="Sub Material"
                                    disabled={editIndex !== null}
                                    key={dropdownSubMaterialResetKey}
                                    initialValue={createDropdownInitialValue(
                                        materialData.SubMaterialMasterId,
                                        materialData.SubMaterialName
                                    )}
                                    title="Select SubMaterial"
                                    size="lg"
                                    dataFetchCallBack={async () => ({
                                        itemList: subMaterialOptions,
                                        totalNumberOfRecord: subMaterialOptions.length,
                                    })}
                                    onSelected={item => {
                                        const id = item ? Number(item.value) : 0;

                                        const selected = detailData.find(data =>
                                            data.SubMaterialMasterId === id &&
                                            data.MaterialMasterId ===
                                            materialData.MaterialMasterId &&
                                            data.MaterialRequisitionType?.trim().toUpperCase() === "IN - DIRECT"
                                        );

                                        const selectedUOM = materialSubMaterialList.find(data =>
                                            data.MaterialMasterId ===
                                            materialData.MaterialMasterId &&
                                            data.SubMaterialMasterId === id
                                        );

                                        setMaterialData(prev => ({
                                            ...prev,
                                            SubMaterialMasterId: id,
                                            SubMaterialName: selected?.SubMaterialName ?? "",
                                            UomCode: selected?.UomCode ?? "",
                                            UomMasterId: selected?.UomMasterId ?? 0,
                                            MaterialRequisitionDetailId: selected?.MaterialRequisitionDetailId ?? 0,
                                            MaterialQuantity: selected?.MaterialQuantity ?? prev.MaterialQuantity,
                                            TotalReceivedQuantityByRequisition: selected?.MaterialReceivedQuantityTillDate ?? 0,
                                            IsTolerant: selected?.IsTolerant ?? selectedUOM?.IsTolerant ?? false,
                                            TolerancePercentage: selected?.TolerancePercentage ?? selected?.Tolerance ,
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
                                    error={errors.UomMasterId}
                                />

                                <Input
                                    type="text"
                                    label="Pending Quantity"
                                    required
                                    disabled
                                    value={`${pendingQuantity}`}
                                    placeholder="Pending Quantity"
                                />

                                <Input
                                    label="Received Quantity"
                                    required
                                    value={materialData.TotalReceivedMaterialQuantity}
                                    onChange={e => handleMaterialFieldChange("TotalReceivedMaterialQuantity", filterNumbers(e.target.value))}
                                    placeholder="Quantity"
                                    error={errors.TotalReceivedMaterialQuantity}
                                />
                            </div>

                            <TextArea
                                label="Quality Analyst Remark"
                                value={materialData.QualityAnalystRemark}
                                onChange={e => handleMaterialFieldChange("QualityAnalystRemark", e.target.value)}
                                required
                                error={errors.QualityAnalystRemark}
                            />
                        </div>
                    )}
                </div>

            </Modal>
        </>
    )
}
export default AddUpdateGRN;