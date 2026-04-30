import { Loader } from "@/core/utils/loader"
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { Button } from "@/ui/components/forms/Button";
import { DateInput } from "@/ui/components/forms/DateInput";
import { Modal } from "@/ui/components/Modal/Modal";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/core/hooks/useToast";
import { technicalService } from "@/features/technical/services/TechnicalService";
import type { FilterWithPaginationMaterialSubMaterialMasterUOM, MaterialSubMaterialUOM } from "@/features/technical/models/TechnicalModel";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import * as E from "fp-ts/Either";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import type { AddUpdateMaterialRequisitionDetailRequest, AddUpdateMaterialRequisitionRequest, FilterWithPaginationMaterialRequisition, MaterialRequisitionDetailData } from "@/features/materialRequisition/models/MaterialRequisitionModel";
import { TextArea } from "@/ui/components/forms/Textarea";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useNavigate, useParams } from "react-router-dom";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import { Input } from "@/ui/components/forms/Input";
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { materialRequisitionService } from "../services/MaterialRequisitionService";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";

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
    // MaterialRequisitionDetailId: 0,
    // Uniquekey: "",
    MaterialMasterId: 0,
    // MaterialCode: "",
    MaterialName: "",
    // SubMaterialName: "",
    SubMaterialMasterId: 0,
    MaterialQuantity: 0,
    UomMasterId: 0,
    SubMaterialName: "",
    UomCode: "",
    // Uom: "",
    RequiredDate: ""
})
export const AddUpdateMaterialRequisition = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
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
    const [uomMaster, setUomMaster] = useState<any[]>([]);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [dropdownLabels, setDropdownLabels] = useState({ materialName: "", uom: "" });
    const [dropdownMaterialResetKey, setDropdownMaterialResetKey] = useState(0);
    const [dropdownSubMaterialResetKey, setDropdownSubMaterialResetKey] = useState(-1);
    const [materialOptions, setMaterialOptions] = useState<any[]>([]);
    const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
    const [selectedUom, setSelectedUom] = useState<string>("");
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [selectedSubMaterialId, setSelectedSubMaterialId] = useState<number | null>(null);
    const navigate = useNavigate();
    const { projectId } = useProject();

    const { MaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();

    useEffect(() => {
        if (!MaterialRequisitionId) return;
        (async () => {
            await loadDetailsdata();

        })
            ();
    }, [MaterialRequisitionId]);
    useEffect(() => {
        if (addMaterialPopUp) {
            loadMaterialsSubMaterialMasterUOM();
        }
    }, [addMaterialPopUp]);
    useEffect(() => {
        const uniqueMaterials = [
            ...new Map(
                (materialsubmaterialList || []).map(x => [
                    x.MaterialMasterId,
                    x
                ])
            ).values()
        ];

        setMaterialOptions(
            uniqueMaterials.map(x => ({
                label: x.MaterialName,
                value: String(x.MaterialMasterId)
            }))
        );

    }, [materialsubmaterialList]);
    const validateMaterialForm = (): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [key: string]: string } = {};

        if (!materialData.MaterialMasterId || materialData.MaterialMasterId === 0)
            newErrors.MaterialMasterId = "Material is required";

        if (!materialData.SubMaterialMasterId || materialData.SubMaterialMasterId === 0)
            newErrors.SubMaterialMasterId = "Sub Material is required";

        if (!materialData.MaterialQuantity || materialData.MaterialQuantity <= 0)
            newErrors.MaterialQuantity = "Quantity must be greater than 0";

        if (!materialData.RequiredDate || materialData.RequiredDate === "")
            newErrors.RequiredDate = "Required Date is required";

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
                                e.MaterialRequisitionDetailData.map((x: any) => ({
                                    MaterialMasterId: x.MaterialMasterId,
                                    SubMaterialMasterId: x.SubMaterialMasterId,
                                    SubMaterialName: x.SubMaterialName,
                                    UomCode: x.UomCode,
                                    UomMasterId: x.UomMasterId,
                                    MaterialQuantity: x.MaterialQuantity,
                                    RequiredDate: x.RequiredDate,
                                    MaterialName: x.MaterialName
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
        setAddMaterialPopUp(true);
        setEditIndex(null);
        setMaterialData(initialFormState());

    }
    const handleEditMaterial = useCallback((row: AddUpdateMaterialRequisitionDetailRequest, index: number) => {
        setErrors({});
        setEditIndex(index);
        setMaterialData({
            MaterialMasterId: row.MaterialMasterId,
            SubMaterialMasterId: row.SubMaterialMasterId,
            UomCode: row.UomCode,
            UomMasterId: row.UomMasterId,
            MaterialQuantity: row.MaterialQuantity,
            RequiredDate: convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd(row.RequiredDate)
                || convert_dd_mm_yyyy_To_Yyyy_mm_dd(row.RequiredDate)
                || "",
            SubMaterialName: row.SubMaterialName,
            MaterialName: row.MaterialName
        });
        setDropdownLabels({
            materialName: row.MaterialName || "",
            uom: row.UomCode || "",
        });

        setAddMaterialPopUp(true);
    }, [materialOptions]);

    const MaterialRequisitionColumns = useMemo<TableColumn[]>(() => [
        {
            key: "MaterialName",
            label: "Material",
            align: "left",
            width: "30",
            render: (value, row) => (
                <TooltipText
                    text={value || '-'}
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
                    text={value || '-'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                />
            )
        },
        {

            key: "MaterialQuantity",
            label: "Quantity",
            align: "left"

        },
        {

            key: "UomCode",
            label: "UOM",
            align: "left"
        },

        {
            key: "RequiredDate",
            label: "Required Date",
            align: "left",
            render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
        },
        {
            key: "action",
            label: "Action",
            align: "right",
            render: (_value, row) => {
                const index = materialList.findIndex(
                    x =>
                        x.MaterialMasterId === row.MaterialMasterId &&
                        x.SubMaterialMasterId === row.SubMaterialMasterId
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
                                padding: "4px 8px",
                            }}
                            title="Delete Material Requisition"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ) : null;
            }
        }

    ]
        , [canAction, materialList, materialOptions, handleEditMaterial]);
    // const onFieldChange = useCallback((field: keyof MaterialDetail, value: any) => {
    //     setFormData(prev => ({
    //         ...prev,
    //         [field]: value
    //     }));
    //     if (errors[field as keyof FormErrors]) {
    //         setErrors(prev => ({
    //             ...prev,
    //             [field]: undefined
    //         }));
    //     }
    // }, [errors]);
    const subMaterialOptions = useMemo(() => {
        if (!materialData.MaterialMasterId) return [];

        return materialsubmaterialList
            .filter(x => x.MaterialMasterId === materialData.MaterialMasterId)
            .map(x => ({
                label: x.SubMaterialName,
                value: String(x.SubMaterialMasterId)
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

        form.append(
            'RemoveAttachmentsURL',
            removeddocumentFilesURLs.join(',')
        );
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

                const response =
                    await materialRequisitionService.apiCallToAddMaterialRequisition(payload);

                if (E.isRight(response)) {
                    addToast({
                        type: "success",
                        title: response.right.SuccessMessage[0]
                    });

                    navigate("/materialRequisition");
                } else {
                    addToast({
                        type: "error",
                        title: response.left?.message
                    });
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
            "Loading Data"
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
            ...materialData
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
                <Loader loading={isLoading} title={loadingMessage}>
                    <div />
                </Loader>
                <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll">
                    <form onSubmit={(e) => { e.preventDefault(); void handleSave(); }}>
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">Material Requisition Details </h3>
                            <div className="flex items-center justify-between">                                <h3 className="text-md font-medium text-gray-500">
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

                            {materialList.length > 0 && (
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
                                <TextArea label="Remark" className="thin-scroll" value={formData.Remarks}
                                    onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            Remarks: e.target.value
                                        }))
                                    } placeholder="Enter Remark" error={errors.Remarks} />

                            </div>

                        </div>
                    </form>
                </div>
                <BottomActionBar
                    cancelText="Cancel"
                    saveText={
                        formData.MaterialRequisitionId &&
                            formData.MaterialRequisitionId > 0 ? "Update" : "Add"
                    }
                    onCancel={() => navigate(-1)}
                    canAction={canAction}
                    onSave={() => {
                        void handleSave();
                    }}
                    isLoading={isLoading}
                />



            </div>

            <Modal
                isOpen={addMaterialPopUp}
                onClose={() => setAddMaterialPopUp(false)}
                title="Add Material"
                onSubmit={e => {
                    e.preventDefault();
                    saveMaterial();
                }}
                saveText="Save"
                cancelText="Cancel"
                onCancel={() => setAddMaterialPopUp(false)}
                size="small-half"
            >
                <div className="space-y-4">
                    <SingleSelectDropdownWithPagination
                        required
                        label="Material"
                        key={dropdownMaterialResetKey}
                        initialValue={createDropdownInitialValue(
                            materialData.MaterialMasterId,
                            // materialData.MaterialMasterId ? String(materialData.MaterialMasterId) : null,
                            materialData.MaterialName,
                        )}
                        // value={materialData.MaterialMasterId}
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
                        initialValue={createDropdownInitialValue(
                            materialData.SubMaterialMasterId,
                            materialData.SubMaterialName
                        )} title="Select SubMaterial"
                        size="lg"
                        dataFetchCallBack={async () => ({
                            itemList: subMaterialOptions,
                            totalNumberOfRecord: subMaterialOptions.length
                        })}
                        onSelected={(item) => {
                            const id = item ? Number(item.value) : 0;

                            const selected = materialsubmaterialList.find(
                                x => x.SubMaterialMasterId === id
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

                    <Input type="text" disabled label="UOM" value={materialData.UomCode}
                        placeholder="UOM" maxLength={250} error={errors.UomMasterId} />

                    <Input
                        type="number"
                        label="Quantity"
                        required
                        value={materialData.MaterialQuantity}
                        onChange={(e) => {
                            const value = e.target.value;

                            setMaterialData(prev => ({
                                ...prev,
                                MaterialQuantity: value === "" ? 0 : Number(value)
                            }));
                        }}
                        placeholder="Quantity"
                        min={0}
                        error={errors.MaterialQuantity}
                    />
                    <div>
                        <DatePickerInput
                            label="Required Date"
                            required
                            value={formatDate_dd_mm_yyyy(materialData.RequiredDate)}
                            onChange={(value) =>
                                setMaterialData(prev => ({
                                    ...prev,
                                    RequiredDate: convert_dd_mm_yyyy_To_Yyyy_mm_dd(value) ?? ""
                                }))
                            }
                            placeholder="DD/MM/YYYY"
                        />
                        {errors.RequiredDate && <p className="text-red-500 text-sm mt-1">{errors.RequiredDate}</p>}
                    </div>
                </div>
            </Modal>
        </>

    )
}


