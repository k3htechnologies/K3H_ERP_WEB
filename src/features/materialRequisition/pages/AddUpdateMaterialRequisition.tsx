import type { DropdownItem } from "@/core/types/DropdownItem";
import { Loader } from "@/core/utils/loader"
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { Button } from "@/ui/components/forms/Button";
import { DateInput } from "@/ui/components/forms/DateInput";
import { Modal } from "@/ui/components/Modal/Modal";
import { Plus } from "lucide-react";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useToast } from "@/core/hooks/useToast";
import type { AddUpdateMaterialMasterRequest, FilterWithPaginationMaterialMaster } from "@/features/materialMaster/models/MaterialMasterModel";
import { fetchMaterialMasterDropdown } from "@/features/materialMaster/materialMasterDropdown";
import { fetchUOMMasterDropdown } from "@/features/uomMaster/uomMasterDropdown";
import { technicalService } from "@/features/technical/services/TechnicalService";
import type { FilterWithPaginationMaterialSubMaterialMasterUOM, MaterialSubMaterialUOM } from "@/features/technical/models/TechnicalModel";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import * as E from "fp-ts/Either";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import type { AddUpdateMaterialRequisitionDetailRequest, AddUpdateMaterialRequisitionRequest, MaterialRequisitionDetailData } from "../models/MaterialRequisitionModel";
import { TextArea } from "@/ui/components/forms/Textarea";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useNavigate } from "react-router-dom";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import { Input } from "@/ui/components/forms/Input";

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
    Uniquekey: "",
    MaterialMasterId: 0,
    MaterialCode: "",
    MaterialName: "",
    SubMaterialName: "",
    SubMaterialMasterId: 0,
    MaterialQuantity: 0,
    UomMasterId: 0,
    UomCode: "",
    Uom: "",
    RequiredDate: new Date(),

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
    const [documentFiles, setdocumentFilesFiles] = useState<(File | string)[]>([]);
    const [removeddocumentFilesURLs, setRemoveddocumentFilesURLs] = useState<string[]>([]);
    const { canAction } = useMenuPermissions("/materialRequisition");
    const [uomMaster, setUomMaster] = useState<any[]>([]);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [dropdownLabels, setDropdownLabels] = useState({ materialName: "", uom: "" });
    const [dropdownMaterialResetKey, setDropdownMaterialResetKey] = useState(0);
    const [dropdownSubMaterialResetKey, setDropdownSubMaterialResetKey] = useState(0);
    const [materialOptions, setMaterialOptions] = useState<any[]>([]);
    const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
    const [selectedUom, setSelectedUom] = useState<string>("");
    const [selectedSubMaterialId, setSelectedSubMaterialId] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!addMaterialPopUp) return;

        loadMaterialsSubMaterialMasterUOM();

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
    const handleAddMaterial = async () => {

        setErrors({});
        setAddMaterialPopUp(true);

    }


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
    const handleSave = async () => {


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
        // const newErrors: FormErrors = {};

        // if (!formData.MaterialMasterId) {
        //     newErrors.MaterialMasterId = "Material is required";
        // }
        // if (!formData.UomMasterId) {
        //     newErrors.UomMasterId = "Unit is required";
        // }
        // if (!formData.MaterialQuantity || formData.MaterialQuantity <= 0) {
        //     newErrors.MaterialQuantity = "Valid quantity is required";
        // }
        // if (!formData.RequiredDate) {
        //     newErrors.RequiredDate = "Required date is required";
        // }

        // if (Object.keys(newErrors).length > 0) {
        //     setErrors(newErrors);
        //     return;
        // }

        // Add material to list
        setAddMaterialPopUp(false);
        addToast({ type: 'success', title: 'Material added successfully' });
        // Reset form
        // setFormData({
        //     MaterialMasterId: null,
        //     MaterialName: "",
        //     UomMasterId: null,
        //     UomCode: "",
        //     MaterialQuantity: 0,
        //     RequiredDate: "",
        // });
    }
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
                            <div
                                className="rounded-lg shadow-sm border border-gray-200"
                                style={{ backgroundColor: "#FFFFFF", padding: "14px" }}
                            >
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



                            </div>
                            <div
                                className="rounded-lg shadow-sm border border-gray-200"
                                style={{ backgroundColor: "#FFFFFF", padding: "14px" }}
                            >
                                <h3 className="text-md font-medium text-gray-500">
                                    Document Details
                                </h3>
                                <div className="flex items-center justify-between pt-4">
                                    <MultiFilePicker label="Upload Document" placeholder="Upload Document" required error={errors.attachmentsURL} value={documentFiles} onChange={setdocumentFilesFiles} allowedTypes={["image/jpeg", "image/png"]} maxFiles={1} maxSizeMB={5} onRemoveExisting={(url) => setRemoveddocumentFilesURLs((prev) => [...prev, url])} />

                                </div>
                            </div>
                            <div
                                className="rounded-lg shadow-sm border border-gray-200"
                                style={{ backgroundColor: "#FFFFFF", padding: "14px" }}
                            >
                                <h3 className="text-md font-medium text-gray-500">
                                    Remark
                                </h3>
                                <div className="flex items-center justify-between pt-4">
                                    <TextArea label="Remark" className="thin-scroll" placeholder="Enter Remark" error={errors.Remarks} />

                                </div>
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
                        // key={dropdownMaterialResetKey}
                        value={materialData.MaterialMasterId}
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
                        value={materialData.SubMaterialMasterId}
                        title="Select SubMaterial"
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

                    <Input type="number" label="Quantity" value={materialData.MaterialQuantity} onChange={(e) =>
                        setMaterialData(prev => ({
                            ...prev,
                            MaterialQuantity: Number(e.target.value)
                        }))
                    }
                        placeholder="Quantity" maxLength={250} error={errors.MaterialQuantity} />
                    <div>
                        <DateInput
                            label="Required Date"
                            required
                            // value={formData.RequiredDate}
                            // onChange={(value) => onFieldChange("RequiredDate", value)}
                            placeholder="DD/MM/YYYY"
                        />
                        {errors.RequiredDate && <p className="text-red-500 text-sm mt-1">{errors.RequiredDate}</p>}
                    </div>
                </div>
            </Modal>
        </>

    )
}   