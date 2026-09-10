import { Loader } from "@/core/utils/loader"
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/core/hooks/useToast";
import * as E from "fp-ts/Either";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { TextArea } from "@/ui/components/forms/Textarea";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import { Input } from "@/ui/components/forms/Input";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { AddUpdateMaterialRequisitionGRNRequest, FilterWithPaginationMaterialRequisitionGRN, MaterialRequisitionDetailGRN } from "@/features/materialRequisition/models/MaterialRequisitionGRNModel";
import { materialRequisitionGRNService } from "@/features/materialRequisition/services/MaterialRequisitionGRNService";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import { filterChallanNumber, hasAnyDocumentFile, isValidVehicleNumber } from "@/core/utils/fileValidation";
import type { TableColumn } from "@/ui/components/DataTable/DataTable";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";
import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";

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
    const { addToast } = useToast();
    const [materialList, setMaterialList] = useState<MaterialRequisitionDetailGRN[]>([]);
    const [materialData, setMaterialData] = useState<MaterialRequisitionDetailGRN>(() => initialFormState());
    const [formData, setFormData] = useState<AddUpdateMaterialRequisitionGRNRequest>(() => initialFormStateMaterialRequisition())
    const [uploadChallanFiles, setUploadChallanFiles] = useState<(File | string)[]>([]);
    const [removedUploadChallanUrls, setRemovedUploadChallanUrls] = useState<string[]>([]);
    const [uploadChallanURL, setuploadChallanURL] = useState<string>();
    const { canAction } = useMenuPermissions("/materialRequisition");
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const navigate = useNavigate();
    const { projectId } = useProject();
    const { MaterialRequisitionGRNId } = useParams<{ MaterialRequisitionGRNId?: string }>();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const currentUniquekey = listState.Uniquekey
    const { detailData } = useMaterialRequisitionListState()
    const { MaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();

    const location = useLocation();

    const {
        matrialRequisitionDetailData = [],
    } = location.state ?? {};

    useEffect(() => {
        if (matrialRequisitionDetailData.length > 0) {
            setMaterialList(
                matrialRequisitionDetailData as MaterialRequisitionDetailGRN[]
            );
        }
    }, [matrialRequisitionDetailData]);

    useEffect(() => {
        if (!MaterialRequisitionId || detailData.length === 0) return;

        loadGRNData();
    }, [MaterialRequisitionId, detailData]);

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

                    const e = response.right.Data?.[0];

                    if (e) {
                        setFormData(prev => ({
                            ...prev,
                        }));

                        setUploadChallanFiles([]);
                        setRemovedUploadChallanUrls([]);
                    }
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
            'Loading GRN Data'
        );
    };

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

    const handleFieldChange = (field: keyof AddUpdateMaterialRequisitionGRNRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value, }));
        setErrors((prev) => ({ ...prev, [field]: "", }));
    };

    const handleMaterialFieldChange = (field: keyof MaterialRequisitionDetailGRN, value: any) => {
        setMaterialData((prev) => ({ ...prev, [field]: value, }));
        setErrors((prev) => ({ ...prev, [field]: "", }));
    };

    const MatrialRequisitionDetailColumns = useMemo<TableColumn[]>(() => {

        const isDirect = materialList?.[0]?.MaterialRequisitionType?.toUpperCase() === "DIRECT";

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
                key: "MaterialReceivedQuantityTillDate",
                label: "Received Quantity Till Date",
                align: "left",
                width: "30",
                render: (value) =>
                    value ? formatDate_dd_MonthName_yy(value) : "-"
            },
            {
                key: "TotalReceivedMaterialQuantity",
                label: "Received Material Quantity",
                align: "left",
                width: "30",
                render: (value: any, row: MaterialRequisitionDetailGRN) => {
                    return (
                        <Input
                            label=""
                            value={value ?? 0}
                            onChange={(e) => {
                                const receivedQuantity = Number(e.target.value);

                                setMaterialList(prev =>
                                    prev.map(item =>
                                        item.MaterialRequisitionDetailId ===
                                            row.MaterialRequisitionDetailId
                                            ? {
                                                ...item,
                                                TotalReceivedMaterialQuantity:
                                                    receivedQuantity,
                                            } : item
                                    )
                                );
                            }}
                        />
                    );
                },
            },
            // {
            //     key: "QualityAnalystRemark",
            //     label: "Quality Analyst Remark",
            //     align: "left",
            //     width: "30",
            //     render: (value: any, row: MaterialRequisitionDetailGRN) => {
            //         return (
            //             <TextArea
            //                 label=""
            //                 value={value ?? ""}
            //                 onChange={(e) => {
            //                     const remark = e.target.value;

            //                     setMaterialList(prev =>
            //                         prev.map(item =>
            //                             item.MaterialRequisitionDetailId ===
            //                                 row.MaterialRequisitionDetailId
            //                                 ? {
            //                                     ...item,
            //                                     QualityAnalystRemark: remark,
            //                                 } : item
            //                         )
            //                     );
            //                 }}
            //             />
            //         );
            //     },
            // }
        );

        return columns;
    }, [materialList]);

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 pt-5">
                <Loader loading={isLoading} title={loadingMessage}> <div /> </Loader>

                <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll">

                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Document Details</h3>

                        {materialList.length > 0 ? (
                            <div className="border border-[#33333321] rounded-xl overflow-hidden mb-4 overflow-y-auto thin-scroll">
                                <DataTableWithHeaderRowDivider
                                    columns={MatrialRequisitionDetailColumns}
                                    data={materialList}
                                    emptyMessage="No Material Requisition Details Found"
                                    fixedHeight={true}
                                    className="flex-1"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <span className="text-gray-500 text-sm font-medium">No materials found</span>
                            </div>
                        )}

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
        </>
    )
}
export default AddUpdateGRN;