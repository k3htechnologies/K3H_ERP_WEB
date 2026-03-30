import { useEffect, useState } from "react";
import type { AddUpdateInwardAndOutWardRequest, FilterWithPaginationInwardAndOutWardRequest } from "../models/InwardAndOutWardModel";
import { useNavigate } from "react-router";
import { useToast } from "@/core/hooks/useToast";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { runApiWithLoader } from "@/core/utils";
import { InwardService } from "../services/InwardAndOutWardService";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import { Input } from "@/ui/components/forms";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { Mail } from "lucide-react";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";

const initialFormState = (): AddUpdateInwardAndOutWardRequest => ({
    DocumentId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    Type: "",
    Title: "",
    Status: "",
    Priority: "",
    AssignedTo: "",
    SenderName: "",
    SenderEmail: "",
    SenderContactNumber: "",
    senderAddress: "",
    ReceiverName: "",
    ReceiverEmail: "",
    ReceiverContactNumber: "",
    ReceiverAddress: "",
    InvoiceDate: "",
    Amount: 0,
    DeliveryMode:"",

})

export const AddUpdateInward: React.FC = () => {

    //#region STATE MANAGEMENT
    const [formData, setFormData] = useState<AddUpdateInwardAndOutWardRequest>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    // NAVIGATE
    const navigate = useNavigate();

    const isAddMode = formData.DocumentId === 0;

    // TOASTs
    const { addToast } = useToast();

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions("/inwardAndOutward");
    //#endregion

    // ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    //#endregion

    //#region HANDLE FIELD CHANGE EVENT
    const handleFieldChange = (field: keyof AddUpdateInwardAndOutWardRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };
    //#endregion

    //#region INIT
    useEffect(() => {
        if (!isAddMode) {
            fetchInwardDetails();
        }
    }, [isAddMode])
    //#endregion

    //#region FETCH INWARD DETAILS
    const fetchInwardDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationInwardAndOutWardRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                };

                const response = await InwardService.apiCallPullInward(params);

                if (E.isRight(response)) {
                    const e = response.right.Data?.[0];

                    if (e) {
                        setFormData((prev) => ({
                            ...prev,
                            DocumentId: e.DocumentId ?? prev.DocumentId,
                            Type: e.Type ?? prev.Type,
                            Title: e.Title ?? prev.Title,
                            Status: e.Status ?? prev.Status,
                            Priority: e.Priority ?? prev.Priority,
                            AssignedTo: e.AssignedTo ?? prev.AssignedTo,
                        }));
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
            "Loading Inward Data",
        );
    };
    //#endregion

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================
    const validateAddUpdateInwardForm = (): {

        isValid: boolean;

        errors: { [key: string]: string };

    } => {
        const newErrors: { [k: string]: string } = {};

        if (!formData.Type) {
            newErrors.Type = "Type is required";
        }
        if (!formData.Title) {
            newErrors.Title = "Title is required";
        }
        if (!formData.Status) {
            newErrors.Status = "Status is required";
        }
        if (!formData.Priority) {
            newErrors.Priority = "Priority is required";
        }
        if (!formData.AssignedTo) {
            newErrors.AssignedTo = "Assigned To is required";
        }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };
    //#endregion

    //#region PUSH DATA
    const PushInwardFormData = (): AddUpdateInwardAndOutWardRequest => {

        return {
            DocumentId: formData.DocumentId,
            Uniquekey: formData.Uniquekey,
            Type: formData.Type,
            Title: formData.Title,
            Status: formData.Status,
            Priority: formData.Priority,
            AssignedTo: formData.AssignedTo,
            SenderName: formData.SenderName,
            SenderEmail: formData.SenderEmail,
            SenderContactNumber: formData.SenderContactNumber,
            senderAddress: formData.senderAddress,
            ReceiverName: formData.ReceiverName,
            ReceiverEmail: formData.ReceiverEmail,
            ReceiverContactNumber: formData.ReceiverContactNumber,
            ReceiverAddress: formData.ReceiverAddress,
            InvoiceDate: formData.InvoiceDate,
            Amount: formData.Amount,
            DeliveryMode: formData.DeliveryMode
        }
    }
    //#endregion

    //#region HANDLE ADD AND UPDATE INWARD
    const handleAddUpdateInward = async () => {
        setErrors({});
        const validation = validateAddUpdateInwardForm();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,

            async () => {

                const payload = PushInwardFormData();

                const response = await InwardService.apiCallAddUpdateInward(payload);

                if (E.isRight(response)) {
                    addToast({ type: "success", title: response.right.SuccessMessage[0] });
                    navigate("/inwardAndOutward");
                } else {
                    addToast({ type: "error", title: response.left.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.massage });
            },
            undefined,
            isAddMode ? "Adding Inward" : "Updating Inward",
        );
    };
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Loader */}

            <Loader loading={isLoading} title={loadingMessage}>
                {" "}
                <div></div>{" "}
            </Loader>

            <div className="items-center space-y-4 mb-6">
                <div className=" bg-white rounded-lg shadow-sm border border-gray-200 p-2 pb-3 ">
                    <h3 className="text-md font-medium text-gray-500 pb-2">Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Input
                                label="Type"
                                value={formData.Title ?? ''}
                                required
                                onChange={e => handleFieldChange("Title", e.target.value)}
                                error={errors.Title}
                                maxLength={50}
                                placeholder="Enter Document title"
                            />
                        </div>

                        <div>
                            <Input
                                label="Priority"
                                value={formData.Priority ?? ''}
                                required
                                onChange={e => handleFieldChange("Priority", e.target.value)}
                                error={errors.Priority}
                                maxLength={50}
                                placeholder="Set Priority"
                            />
                        </div>

                        <div>
                            <Input
                                label="Document Title"
                                value={formData.Title ?? ''}
                                required
                                onChange={e => handleFieldChange("Title", e.target.value)}
                                error={errors.Title}
                                maxLength={50}
                                placeholder="Enter Document title"
                            />
                        </div>

                        <div>
                            <DatePickerInput
                                label="Invoice Date"
                                value={formatDate_dd_mm_yyyy(formData.InvoiceDate ?? '')}
                                onChange={(val) => handleFieldChange('InvoiceDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                required
                                error={errors.InvoiceDate}
                            />
                        </div>
                    </div>
                </div>

                <div className=" bg-white rounded-lg shadow-sm border border-gray-200 p-2 pb-3 ">
                    <h3 className="text-md font-medium text-gray-500 pb-2">Sender Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Input
                                label="Mobile No."
                                value={formData.SenderContactNumber ?? ''}
                                required
                                onChange={e => handleFieldChange("SenderContactNumber", e.target.value)}
                                leftIcon="+91"
                                error={errors.SenderContactNumber}
                                maxLength={50}
                                placeholder="Enter Sender Contact Number"
                            />
                        </div>

                        <div>
                            <Input
                                label="Name"
                                value={formData.SenderName ?? ''}
                                required
                                onChange={e => handleFieldChange("SenderName", e.target.value)}
                                error={errors.SenderName}
                                maxLength={50}
                                placeholder="Enter Sender Name"
                            />
                        </div>

                        <div>
                            <Input
                                label="Email-ID"
                                value={formData.SenderEmail ?? ''}
                                required
                                onChange={e => handleFieldChange("SenderEmail", e.target.value)}
                                rightIcon={<Mail className="h-8 w-8" />}
                                error={errors.SenderEmail}
                                maxLength={50}
                                placeholder="Enter Sender Email"
                            />
                        </div>

                        <div>
                            <Input
                                label="Address"
                                value={formData.senderAddress ?? ''}
                                required
                                onChange={e => handleFieldChange("senderAddress", e.target.value)}
                                error={errors.senderAddress}
                                maxLength={100}
                                placeholder="Enter Sender Address"
                            />
                        </div>
                    </div>
                </div>

                <div className=" bg-white rounded-lg shadow-sm border border-gray-200 p-2 pb-3 ">
                    <h3 className="text-md font-medium text-gray-500 pb-2">Receiver Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Input
                                label="Mobile No."
                                value={formData.ReceiverContactNumber ?? ''}
                                required
                                onChange={e => handleFieldChange("ReceiverContactNumber", e.target.value)}
                                leftIcon="+91"
                                error={errors.ReceiverContactNumber}
                                maxLength={50}
                                placeholder="Enter Receiver Contact Number"
                            />
                        </div>

                        <div>
                            <Input
                                label="Name"
                                value={formData.ReceiverName ?? ''}
                                required
                                onChange={e => handleFieldChange("ReceiverName", e.target.value)}
                                error={errors.ReceiverName}
                                maxLength={50}
                                placeholder="Enter Receiver Name"
                            />
                        </div>

                        <div>
                            <Input
                                label="Email-ID"
                                value={formData.ReceiverEmail ?? ''}
                                required
                                onChange={e => handleFieldChange("ReceiverEmail", e.target.value)}
                                rightIcon={<Mail className="h-8 w-8" />}
                                error={errors.ReceiverEmail}
                                maxLength={50}
                                placeholder="Enter Receiver Email"
                            />
                        </div>

                        <div>
                            <Input
                                label="Address"
                                value={formData.ReceiverAddress ?? ''}
                                required
                                onChange={e => handleFieldChange("ReceiverAddress", e.target.value)}
                                error={errors.ReceiverAddress}
                                maxLength={100}
                                placeholder="Enter Receiver Address"
                            />
                        </div>
                    </div>
                </div>

            </div>

            <BottomActionBar
                cancelText="Cancel"
                saveText={formData.DocumentId ? "Update" : "Add"}
                onCancel={() => navigate(-1)}
                canAction={canAction}
                onSave={() => {
                    handleAddUpdateInward();
                }}
                isLoading={isLoading}
            />

        </div>
    )
}

export default AddUpdateInward;