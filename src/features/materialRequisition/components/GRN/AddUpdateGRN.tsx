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
import type { AddUpdateMaterialRequisitionGRNRequest, FilterWithPaginationMaterialRequisitionGRN, MaterialRequisitionDetailGRN, MaterialRequisitionDetailGRNData, MaterialRequisitionGRNData } from "@/features/materialRequisition/models/MaterialRequisitionGRNModel";
import { materialRequisitionGRNService } from "@/features/materialRequisition/services/MaterialRequisitionGRNService";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";

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
    TotalReceivedMaterialQuantity: 0,
    QualityAnalystRemark: '',
    MaterialRequisitionDetailGRNId: 0,
    MaterialRequisitionDetailId: 0
})
export const AddUpdateGRN = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [addMaterialPopUp, setAddMaterialPopUp] = useState(false);
    const { addToast } = useToast();
    const [materialList, setMaterialList] = useState<MaterialRequisitionDetailGRN[]>([]);
    const [materialData, setMaterialData] = useState<MaterialRequisitionDetailGRN>(() => initialFormState());
    const [, setMaterialSubMaterialList] = useState<MaterialSubMaterialUOM[]>([]);
    const [formData, setFormData] = useState<AddUpdateMaterialRequisitionGRNRequest>(() => initialFormStateMaterialRequisition())
    const [uploadChallanFiles, setUploadChallanFiles] = useState<(File | string)[]>([]);
    const [removedUploadChallanUrls, setRemovedUploadChallanUrls] = useState<string[]>([]);
    const [uploadChallanURL, setuploadChallanURL] = useState<string>();
    const { canAction } = useMenuPermissions("/materialRequisition");
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [dropdownLabels, setDropdownLabels] = useState({ materialName: "", uom: "" });
    const [dropdownMaterialResetKey, setDropdownMaterialResetKey] = useState(0);
    const [dropdownSubMaterialResetKey, setDropdownSubMaterialResetKey] = useState(-1);
    const [materialOptions, setMaterialOptions] = useState<any[]>([]);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const navigate = useNavigate();
    const { projectId } = useProject();
    const { MaterialRequisitionGRNId } = useParams<{ MaterialRequisitionGRNId?: string }>();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const [GRN, SetGRN] = useState<MaterialRequisitionGRNData[]>([]);
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const currentUniquekey = listState.Uniquekey
    const [GRNData, SetGRNData] = useState<MaterialRequisitionDetailGRNData[]>([]);
    const { detailData } = useMaterialRequisitionListState()
    const { MaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();

    useEffect(() => {
        if (!MaterialRequisitionId) return;
        (async () => {
            await loadGRNData();

        })
            ();
    }, [MaterialRequisitionId]);
    useEffect(() => {
        if (addMaterialPopUp) {
            loadMaterialsSubMaterialMasterUOM();
        }
    }, [addMaterialPopUp]);
    useEffect(() => {

        const materialdata = [
            ...new Map(
                (detailData || []).map(x => [
                    x.MaterialMasterId,
                    x
                ])
            ).values()
        ];
        setMaterialOptions(
            materialdata.map(x => ({
                label: x.MaterialName,
                value: String(x.MaterialMasterId)
            }))
        );


    }, [detailData]);
    // const validateMaterialForm = (): {
    //     isValid: boolean;
    //     errors: { [key: string]: string };
    // } => {
    //     const newErrors: { [key: string]: string } = {};

    //     if (!materialData.MaterialMasterId || materialData.MaterialMasterId === 0)
    //         newErrors.MaterialMasterId = "Material is required";

    //     if (!materialData.SubMaterialMasterId || materialData.SubMaterialMasterId === 0)
    //         newErrors.SubMaterialMasterId = "Sub Material is required";

    //     if (!materialData.MaterialQuantity || materialData.MaterialQuantity <= 0)
    //         newErrors.MaterialQuantity = "Quantity must be greater than 0";

    //     if (!materialData.RequiredDate || materialData.RequiredDate === "")
    //         newErrors.RequiredDate = "Required Date is required";

    //     return {
    //         isValid: Object.keys(newErrors).length === 0,
    //         errors: newErrors,
    //     };
    // };

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

                    SetGRNData(e?.MaterialRequisitionDetailGRNData ?? []);
                    SetGRN(data);

                    if (e) {
                        setFormData(prev => ({
                            ...prev,
                            MaterialRequisitionId: e.MaterialRequisitionId ?? prev.MaterialRequisitionId,
                            Uniquekey: e.Uniquekey ?? prev.Uniquekey,
                            ProjectId: e.ProjectId ?? prev.ProjectId,
                            Remarks: e.Remarks ?? prev.Remarks,
                            VehicleNumber: e.VehicleNumber ?? prev.VehicleNumber,
                            ChallanNumber: e.ChallanNumber ?? prev.ChallanNumber,
                            MaterialRequisitionGRNId: e.MaterialRequisitionGRNId ?? prev.MaterialRequisitionGRNId,

                        }));

                        setMaterialList(
                            e.MaterialRequisitionDetailGRNData.map((x: any) => {

                                const matched = detailData.find(
                                    d =>
                                        d.MaterialName === x.MaterialName &&
                                        d.SubMaterialName === x.SubMaterialName
                                );

                                return {
                                    MaterialRequisitionDetailGRNId: x.MaterialRequisitionDetailGRNId,
                                    MaterialRequisitionDetailId: matched?.MaterialRequisitionDetailId ?? 0,
                                    MaterialMasterId: matched?.MaterialMasterId ?? 0,
                                    SubMaterialMasterId: matched?.SubMaterialMasterId ?? 0,
                                    MaterialName: x.MaterialName,
                                    SubMaterialName: x.SubMaterialName,
                                    UomCode: matched?.UomCode ?? "",
                                    UomMasterId: matched?.UomMasterId ?? 0,
                                    MaterialQuantity: matched?.MaterialQuantity ?? 0,
                                    TotalReceivedMaterialQuantity: x.TotalReceivedMaterialQuantity,
                                    QualityAnalystRemark: x.QualityAnalystRemark,
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
    const handleAddMaterial = async () => {

        setErrors({});
        setAddMaterialPopUp(true);
        setEditIndex(null);
        setMaterialData(initialFormState());

    }

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
            QualityAnalystRemark: row.QualityAnalystRemark,
            MaterialRequisitionDetailGRNId: row.MaterialRequisitionDetailGRNId,
            MaterialRequisitionDetailId: row.MaterialRequisitionDetailId,
            MaterialQuantity: row.MaterialQuantity
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
            render: (value) => (
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
            key: "TotalReceivedMaterialQuantity",
            label: "Received Quantity",
            align: "left",
        },
        {
            key: "QualityAnalystRemark",
            label: "Quality Analyst Remark",
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
                            disabled={formData.MaterialRequisitionGRNId > 0}
                            color="transparent"
                            isborderRadius
                            size="sm"

                            style={{
                                color: "red",
                                padding: "4px 8px",
                            }}
                            title="Delete Material"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ) : null;
            }
        }

    ], [canAction, materialList, materialOptions, handleEditMaterial]);

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

        return detailData
            .filter(x => x.MaterialMasterId === materialData.MaterialMasterId)
            .map(x => ({
                label: x.SubMaterialName,
                value: String(x.SubMaterialMasterId)
            }));
    }, [materialData.MaterialMasterId, detailData]);

    const createDropdownInitialValue = (id: number | null, label: string) => {
        if (!id || !label) return null;
        return { label, value: String(id) };
    };

    const PushMaterialRequisitionGRNFormData = (): FormData => {

        const form = new FormData();
        form.append('MaterialRequisitionId', String(currentMaterialRequisitionId ?? 0));
        form.append('Uniquekey', formData.Uniquekey || "");
        form.append('Remarks', formData.Remarks ?? '');
        form.append('ChallanNumber', formData.ChallanNumber);
        form.append('VehicleNumber', formData.VehicleNumber ?? '');
        form.append('MaterialRequisitionGRNId', formData.MaterialRequisitionGRNId.toString());
        const filtered = materialList
            .filter(x => x.TotalReceivedMaterialQuantity > 0)
            .map(x => ({
                MaterialRequisitionDetailGRNId: x.MaterialRequisitionDetailGRNId ?? 0,
                MaterialRequisitionDetailId: x.MaterialRequisitionDetailId,
                TotalReceivedMaterialQuantity: x.TotalReceivedMaterialQuantity
            }));

        form.append(
            'MaterialRequisitionDetailGRNJSON',
            JSON.stringify(filtered)
        ); form.append("ProjectId", projectId!.toString());

        uploadChallanFiles.forEach(file => {
            if (file instanceof File) {
                form.append('UploadChallanURL', file);
            }
        });

        form.append('RemoveUploadChallanURL', removedUploadChallanUrls.join(','));

        return form;
    };

    const handleSave = async () => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushMaterialRequisitionGRNFormData();

                const response = await materialRequisitionGRNService.apiCallToAddMaterialRequisitionGRN(payload);

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
            "Loading Data"
        );
    };

    const saveMaterial = () => {

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

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <Loader loading={isLoading} title={loadingMessage}>   <div />  </Loader>

                <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll">
                    <form onSubmit={(e) => { e.preventDefault(); void handleSave(); }}>

                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">GRN Details </h3>
                            <div className="flex items-center justify-between">
                                <h3 className="text-md font-medium text-gray-500">
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
                                        className="flex-1"
                                        emptyMessage="No GRN"
                                    />
                                </div>
                            )}

                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Document Details</h3>

                            <div className="flex grid grid-cols-3 gap-4">
                                <Input
                                    type="text"
                                    label="Vehicle No."
                                    placeholder="Enter Vehicle No."
                                    value={formData.VehicleNumber ?? ""}
                                    onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            VehicleNumber: e.target.value
                                        }))
                                    }
                                />

                                <Input
                                    type="text"
                                    label="Challan No."
                                    placeholder="Challan No."
                                    value={formData.ChallanNumber}
                                    onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            ChallanNumber: e.target.value
                                        }))
                                    }
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
                onClose={() => {
                    setAddMaterialPopUp(false);
                    setMaterialData(initialFormState());

                }}
                title={editIndex !== null ? "Edit Material" : "Add Material"}
                onSubmit={e => {
                    e.preventDefault();
                    saveMaterial();
                }}
                saveText="Save"
                cancelText="Cancel"
                onCancel={() => {
                    setAddMaterialPopUp(false);
                    setMaterialData(initialFormState());
                }}
                size="small-half"
            >
                <div className="space-y-4">
                    <SingleSelectDropdownWithPagination
                        required
                        label="Material"
                        key={dropdownMaterialResetKey}
                        disabled={editIndex !== null}
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

                            const selected = detailData.find(
                                x => x.MaterialMasterId === id
                            );

                            if (!selected) return;

                            setMaterialData(prev => ({
                                ...prev,

                                MaterialMasterId: selected.MaterialMasterId,
                                MaterialName: selected.MaterialName,

                                SubMaterialMasterId: selected.SubMaterialMasterId,
                                SubMaterialName: selected.SubMaterialName,

                                UomCode: selected.UomCode,
                                UomMasterId: selected.UomMasterId,

                                MaterialQuantity: selected.MaterialQuantity,
                                RequiredDate: selected.RequiredDate,
                                MaterialRequisitionDetailId: selected.MaterialRequisitionDetailId

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
                            totalNumberOfRecord: subMaterialOptions.length
                        })}
                        onSelected={(item) => {
                            const id = item ? Number(item.value) : 0;

                            const selected = detailData.find(
                                x => x.SubMaterialMasterId === id
                            );

                            setMaterialData(prev => ({
                                ...prev,
                                SubMaterialMasterId: id,
                                SubMaterialName: selected?.SubMaterialName ?? "",
                                UomCode: selected?.UomCode ?? "",
                                UomMasterId: selected?.UomMasterId ?? 0,
                                MaterialRequisitionDetailId: selected?.MaterialRequisitionDetailId ?? 0
                            }));
                        }}
                        error={errors.SubMaterialMasterId}
                    />

                    <Input type="text" disabled label="UOM"
                        value={materialData.UomCode}
                        placeholder="UOM" maxLength={250} error={errors.UomMasterId} />

                    <Input
                        type="number"
                        label="Quantity"
                        required
                        disabled
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

                    <Input
                        type="number"
                        label="Received Quantity"
                        required
                        value={materialData.TotalReceivedMaterialQuantity}
                        onChange={(e) => {
                            const value = e.target.value;

                            setMaterialData(prev => ({
                                ...prev,
                                TotalReceivedMaterialQuantity: value === "" ? 0 : Number(value)
                            }));
                        }}
                        placeholder="Quantity"
                        min={0}
                        error={errors.TotalReceivedMaterialQuantity}
                    />

                    <TextArea
                        label="Quality Analyst Remark"
                        value={materialData.QualityAnalystRemark}
                        onChange={(e) =>
                            setMaterialData(prev => ({
                                ...prev,
                                QualityAnalystRemark: e.target.value
                            }))
                        }
                    />
                </div>
            </Modal >
        </>

    )
}


