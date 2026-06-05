import { useEffect, useState } from "react";
import type { AddUpdateInwardAndOutWardRequest, FilterWithPaginationInwardAndOutWardRequest, FilterWithPaginationSenderReceiverByMobileNoRequest } from "@/features/inwardOutward/models/InwardOutwardModel";
import { useNavigate, useParams } from "react-router";
import { useToast } from "@/core/hooks/useToast";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import { Input } from "@/ui/components/forms";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { Mail, Phone } from "lucide-react";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, } from "@/core/utils/dateFormat";
import { inwardOutwardService } from "@/features/inwardOutward/services/InwardOutwardService";
import { TextArea } from "@/ui/components/forms/Textarea";
import { filterEmail, filterMobile, filterNumbers, filterNumbersWithDecimal, hasAnyDocumentFile, isValidEmail, isValidMobile } from "@/core/utils/fileValidation";
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { DELIVERY_MODE, DELIVERY_STATUS, DOCUMENT_TYPE } from "@/core/constants";
import RadioPill from "@/ui/components/forms/RadioPill";

const initialFormState = (): AddUpdateInwardAndOutWardRequest => ({
    InwardOutwardId: 0,
    UniqueKey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    EmployeeId: "",
    InwardOutwardDate: new Date().toISOString().split("T")[0],
    DocumentURL: null,
    RemoveDocumentURL: '',
    DeliveryType: "Others",
    DocumentTitle: "",
    DeliveryStatus: "",
    Priority: "",
    SenderName: "",
    SenderEmailId: "",
    SenderMobileNo: "",
    SenderAddress: "",
    ReceiverName: "",
    ReceiverEmailId: "",
    ReceiverMobileNo: "",
    ReceiverAddress: "",
    Amount: 0,
    DeliveryMode: "",
    DocumentDescription: "",
    AcknowledgementURL: null,
    RemoveAcknowledgementURL: '',
    AcknowledgementRemark: "",
    ReceiversSignature: null,
    RemoveReceiversSignature: '',
    ReceivedBy: "",
    ChequeNo: "",
    DocumentType: "",
    EmployeeNames: "",
    InVoiceDate: "",
    InwardNumber: 0,
    InVoiceNumber: 0,
    HandOverDate: "",
    HandOverTo: "",

})

export const AddUpdateInwardOutward: React.FC = () => {

    //#region STATE MANAGEMENT
    const [formData, setFormData] = useState<AddUpdateInwardAndOutWardRequest>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [acknowledgementURLFiles, setAcknowledgementURLFiles] = useState<(File | string)[]>([]);
    const [acknowledgementURL, setAcknowledgementURL] = useState<string>();
    const [removedAcknowledgementURLs, setRemovedAcknowledgementURLs] = useState<string[]>([]);
    const [documentURLFiles, setDocumentURLFiles] = useState<(File | string)[]>([]);
    const [documentURL, setDocumentURL] = useState<string>();
    const [removedDocumentURLs, setRemovedDocumentURLs] = useState<string[]>([]);
    const [receiversSignatureFiles, setReceiversSignatureFiles] = useState<(File | string)[]>([]);
    const [receiversSignatureURL, setReceiversSignatureURL] = useState<string>();
    const [removedReceiversSignatureURLs, setRemovedReceiversSignatureURLs] = useState<string[]>([]);
    const [selectedEmployeeValues, setSelectedEmployeeValues] = useState<string | number | null>(null);

    const navigate = useNavigate();
    const { InwardOutwardId } = useParams<{ InwardOutwardId?: string }>();
    const inwardOutwardId = InwardOutwardId ? Number(InwardOutwardId) : 0;
    const isAddMode = inwardOutwardId === 0;

    const { addToast } = useToast();

    const { canAction } = useMenuPermissions("/inwardOutwardAcknowledgement");

    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const handleFieldChange = (field: keyof AddUpdateInwardAndOutWardRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const employeeDropdown = useMultiSelectDropdown({
        value: selectedEmployeeValues,
        fetchCallback: fetchEmployeeMasterDropdown,
        autoFetchOptions: true,
    });

    useEffect(() => {
        if (!isAddMode) {
            fetchInwardOutwardDetails();
        }
    }, [inwardOutwardId])

    const fetchInwardOutwardDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationInwardAndOutWardRequest = {
                    PageNumber: 1,
                    PageSize: 20,
                    InwardOutwardId: Number(InwardOutwardId)
                };

                const response = await inwardOutwardService.apiCallPullInwardOutward(params);

                if (E.isRight(response)) {
                    const e = response.right.Data?.[0];

                    if (e) {

                        setFormData((prev) => ({
                            ...prev,
                            InwardOutwardId: e.InwardOutwardId ?? prev.InwardOutwardId,
                            UniqueKey: e.UniqueKey ?? prev.UniqueKey,
                            EmployeeId: e.EmployeeId ?? prev.EmployeeId,
                            DeliveryType: e.DeliveryType ?? prev.DeliveryType,
                            DocumentTitle: e.DocumentTitle ?? prev.DocumentTitle,
                            DeliveryStatus: e.DeliveryStatus ?? prev.DeliveryStatus,
                            AcknowledgementRemark: e.AcknowledgementRemark ?? prev.AcknowledgementRemark,
                            Amount: e.Amount ?? prev.Amount,
                            ChequeNo: e.ChequeNo ?? prev.ChequeNo,
                            EmployeeNames: e.EmployeeNames ?? prev.EmployeeNames,
                            ReceivedBy: e.ReceivedBy ?? prev.ReceivedBy,
                            DocumentDescription: e.DocumentDescription ?? prev.DocumentDescription,
                            SenderName: e.SenderName ?? prev.SenderName,
                            SenderEmailId: e.SenderEmailId ?? prev.SenderEmailId,
                            SenderMobileNo: e.SenderMobileNo ?? prev.SenderMobileNo,
                            SenderAddress: e.SenderAddress ?? prev.SenderAddress,
                            ReceiverName: e.ReceiverName ?? prev.ReceiverName,
                            ReceiverEmailId: e.ReceiverEmailId ?? prev.ReceiverEmailId,
                            ReceiverMobileNo: e.ReceiverMobileNo ?? prev.ReceiverMobileNo,
                            ReceiverAddress: e.ReceiverAddress ?? prev.ReceiverAddress,
                            DeliveryMode: e.DeliveryMode ?? prev.DeliveryMode,
                            DocumentType: e.DocumentType ?? prev.DocumentType,
                            InwardOutwardDate: e.InwardOutwardDate ?? prev.InwardOutwardDate,
                            InVoiceDate: e.InVoiceDate ?? prev.InVoiceDate,
                            InVoiceNumber: e.InVoiceNumber ?? prev.InVoiceNumber,
                            HandOverDate: e.HandOverDate ?? prev.HandOverDate,
                            HandOverTo: e.HandOverTo ?? prev.HandOverTo,
                            InwardNumber: e.InwardNumber ?? prev.InwardNumber
                        }));

                        setSelectedEmployeeValues(e.EmployeeId || null);
                        setDocumentURL(e.DocumentURL || '');
                        setRemovedDocumentURLs([]);
                        setDocumentURLFiles([]);

                        setAcknowledgementURL(e.AcknowledgementURL || '');
                        setRemovedAcknowledgementURLs([]);
                        setAcknowledgementURLFiles([]);

                        setReceiversSignatureURL(e.ReceiversSignature || '');
                        setRemovedReceiversSignatureURLs([]);
                        setAcknowledgementURLFiles([]);
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
            "Loading Inward Outward Data",
        );
    };
    //#endregion

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================
    const validateAddUpdateInwardOutwardForm = (): {

        isValid: boolean;
        errors: { [key: string]: string };

    } => {
        const newErrors: { [k: string]: string } = {};

        if (formData.DeliveryType === "Cheque" && !formData.ChequeNo) {
            newErrors.ChequeNo = "Cheque No is required";
        }
        if (!formData.DocumentTitle) {
            newErrors.DocumentTitle = "Document Title is required";
        }
        if (!formData.DocumentDescription) {
            newErrors.DocumentDescription = "Document Description is required";
        }

        if (!formData.DocumentType) {
            newErrors.DocumentType = "Document Type is required";
        }
        if (!formData.Amount) {
            newErrors.Amount = "Amount is required";
        } else if (formData.Amount <= 0) {
            newErrors.Amount = "Amount must be greater than 0";
        }
        if (!formData.SenderName) {
            newErrors.SenderName = "Sender Name is required";
        }
        if (!formData.SenderMobileNo?.trim()) {
            newErrors.SenderMobileNo = 'Mobile Number is required.'
        } else if (!isValidMobile(formData.SenderMobileNo.trim())) {
            newErrors.SenderMobileNo = 'Enter a Valid 10-Digit Mobile Number'
        }

        if (!formData.SenderEmailId?.trim()) {
            newErrors.SenderEmailId = 'E-mail Id is required'
        } else if (!isValidEmail(formData.SenderEmailId.trim())) {
            newErrors.SenderEmailId = 'Enter a Valid E-mail Id'
        }
        if (!formData.SenderAddress) {
            newErrors.SenderAddress = "Sender Address is required";
        }
        if (!formData.ReceiverName) {
            newErrors.ReceiverName = "Receiver Name is required";
        }
        if (!formData.ReceiverMobileNo?.trim()) {
            newErrors.ReceiverMobileNo = 'Mobile Number is required.'
        } else if (!isValidMobile(formData.ReceiverMobileNo.trim())) {
            newErrors.ReceiverMobileNo = 'Enter a Valid 10-Digit Mobile Number'
        }

        if (!formData.ReceiverEmailId?.trim()) {
            newErrors.ReceiverEmailId = 'E-mail Id is required'
        } else if (!isValidEmail(formData.ReceiverEmailId.trim())) {
            newErrors.ReceiverEmailId = 'Enter a Valid E-mail Id'
        }
        if (!formData.ReceiverAddress) {
            newErrors.ReceiverAddress = "Receiver Address is required";
        }
        if (!formData.InVoiceDate) {
            newErrors.InVoiceDate = "Invoice Date required";
        }
        if (!formData.InVoiceNumber) {
            newErrors.InVoiceNumber = "Invoice Number is required";
        }
        if (!formData.InwardNumber) {
            newErrors.InwardNumber = "Inward Number is required";
        }
        if (!formData.ReceiverAddress) {
            newErrors.ReceiverAddress = "Receiver Address is required";
        }
        if (!formData.EmployeeId) {
            newErrors.EmployeeId = "Assign Employee is required";
        }
        if (!hasAnyDocumentFile(documentURLFiles, documentURL, removedDocumentURLs)) {
            newErrors.DocumentURL = "File is required.";
        }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };
    //#endregion

    //#region PUSH INWARD OUTWARD DATA
    const PushInwardOutwardFormData = (): FormData => {

        const fd = new FormData();
        fd.append("InwardOutwardId", formData.InwardOutwardId.toString());
        fd.append("UniqueKey", formData.UniqueKey ?? "");
        fd.append("EmployeeId", formData.EmployeeId ?? "");
        fd.append("InwardOutwardDate", formData.InwardOutwardDate ?? "");
        fd.append("DeliveryMode", formData.DeliveryMode ?? "");
        fd.append("DeliveryStatus", formData.DeliveryStatus ?? "");
        fd.append("DeliveryType", formData.DeliveryType ?? "");
        fd.append("Amount", String(formData.Amount ?? 0));
        fd.append("DocumentDescription", formData.DocumentDescription ?? "");
        fd.append("DocumentTitle", formData.DocumentTitle ?? "");
        fd.append("AcknowledgementRemark", formData.AcknowledgementRemark ?? "");
        fd.append("ReceivedBy", formData.ReceivedBy ?? "");
        fd.append("DocumentType", formData.DocumentType ?? "");
        fd.append("ChequeNo", formData.ChequeNo ?? "");
        fd.append("SenderName", formData.SenderName ?? "");
        fd.append("SenderMobileNo", formData.SenderMobileNo ?? "");
        fd.append("SenderEmailId", formData.SenderEmailId ?? "");
        fd.append("SenderAddress", formData.SenderAddress ?? "");
        fd.append("ReceiverName", formData.ReceiverName ?? "");
        fd.append("ReceiverMobileNo", formData.ReceiverMobileNo ?? "");
        fd.append("ReceiverEmailId", formData.ReceiverEmailId ?? "");
        fd.append("ReceiverAddress", formData.ReceiverAddress ?? "");
        fd.append("InVoiceDate", formData.InVoiceDate ?? "");
        fd.append("InwardNumber", String(formData.InwardNumber ?? 0));
        fd.append("InVoiceNumber", String(formData.InVoiceNumber ?? 0));
        fd.append("HandOverDate", formData.HandOverDate ?? "");
        fd.append("HandOverTo", formData.HandOverTo ?? "");

        documentURLFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append("DocumentURL", file);
            }
        })

        fd.append("RemoveDocumentURL", removedDocumentURLs.join(","));

        acknowledgementURLFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append("AcknowledgementURL", file);
            }
        });

        fd.append("RemoveAcknowledgementURL", removedAcknowledgementURLs.join(","));

        receiversSignatureFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append("ReceiversSignature", file);
            }
        })

        fd.append("RemoveReceiversSignature", removedReceiversSignatureURLs.join(","));

        return fd;
    };
    //#endregion

    //#region HANDLE ADD UPDATE INWARD OUTWARD
    const handleAddUpdateInward = async () => {

        setErrors({});
        const validation = validateAddUpdateInwardOutwardForm();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,

            async () => {

                const payload = PushInwardOutwardFormData();

                const response = await inwardOutwardService.apiCallAddUpdateInwardOutward(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/inwardOutward");
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
            isAddMode ? "Adding Inward Outward" : "Updating Inward Outward",
        );
    };
    //#endregion

    //#region FETCH SENDER RECEIVER DATA BY MOBILE NUMBER
    const fetchSenderReceiverByMobileNoData = async (mobileNumber: string, type: "sender" | "receiver") => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationSenderReceiverByMobileNoRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    MobileNumber: mobileNumber
                };

                const response = await inwardOutwardService.apiCallPullSenderReceiverByMobileNo(params);
                if (E.isRight(response)) {
                    const data = response.right.Data?.[0];

                    if (data) {
                        setFormData(prev => ({
                            ...prev,
                            ...(type === "sender" && {
                                SenderName: data.Name ?? "",
                                SenderEmailId: data.EmailId ?? "",
                                SenderAddress: data.Address ?? ""
                            }),
                            ...(type === "receiver" && {
                                ReceiverName: data.Name ?? "",
                                ReceiverEmailId: data.EmailId ?? "",
                                ReceiverAddress: data.Address ?? ""
                            })
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
            "Loading Data",
        );
    };
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            {/* Loader */}

            <Loader loading={isLoading} title={loadingMessage}>{" "}<div></div>{" "}</Loader>

            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


                    <div>
                        <p className="text-sm text-gray-600 mb-2">Delivery Type</p>
                        <div className="flex gap-3">
                            <RadioPill
                                name="Nationality"
                                label="Others"
                                value="Others"
                                checked={formData.DeliveryType === "Others"}
                                onChange={() => {
                                    handleFieldChange("DeliveryType", "Others");
                                    handleFieldChange("ChequeNo", "");
                                }}
                            />

                            <RadioPill
                                name="Nationality"
                                label="Cheque"
                                value="Cheque"
                                checked={formData.DeliveryType === "Cheque"}
                                onChange={() => {
                                    handleFieldChange("DeliveryType", "Cheque");
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <SinglePageSelection
                            label="Document Type"
                            required
                            placeholder='Select Document Type'
                            value={formData.DocumentType || ''}
                            onChange={(e) => handleFieldChange('DocumentType', String(e))}
                            options={DOCUMENT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                            error={errors.DocumentType}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label='Inward Number'
                            value={formData.InwardNumber ?? ""}
                            onChange={(e) => handleFieldChange("InwardNumber", filterNumbersWithDecimal(e.target.value) || 0)}
                            placeholder="Enter Inward Number"
                            maxLength={15}
                            error={errors.InwardNumber}
                        />
                    </div>

                    <div>
                        <Input
                            label="Document Title"
                            value={formData.DocumentTitle ?? ''}
                            required
                            onChange={e => handleFieldChange("DocumentTitle", e.target.value)}
                            error={errors.DocumentTitle}
                            maxLength={50}
                            placeholder="Enter Document title"
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label="Date"
                            value={formatDate_dd_mm_yyyy(formData.InwardOutwardDate ?? '')}
                            onChange={(val) => handleFieldChange('InwardOutwardDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                            required
                            disabled={!!formData.InwardOutwardDate}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label='Invoice Number'
                            value={formData.InVoiceNumber ?? ""}
                            onChange={(e) => handleFieldChange("InVoiceNumber", filterNumbersWithDecimal(e.target.value) || 0)}
                            placeholder="Enter Invoice Number"
                            maxLength={15}
                            error={errors.InVoiceNumber}
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label="Invoice Date"
                            value={formatDate_dd_mm_yyyy(formData.InVoiceDate ?? '')}
                            onChange={(val) => handleFieldChange('InVoiceDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                            required
                            error={errors.InVoiceDate}
                        />
                    </div>

                    <div>
                        <Input
                            label="Amount (₹)"
                            value={formData.Amount ?? ''}
                            required
                            rightIcon="₹"
                            onChange={e => handleFieldChange('Amount', filterNumbersWithDecimal(e.target.value) || 0)}
                            error={errors.Amount}
                            maxLength={15}
                            placeholder="Enter Amount"
                        />
                    </div>

                    {formData.DeliveryType === "Cheque" && (
                        <div>
                            <Input
                                label="Cheque No"
                                value={formData.ChequeNo ?? ''}
                                required
                                onChange={e => handleFieldChange('ChequeNo', filterNumbers(e.target.value))}
                                error={errors.ChequeNo}
                                maxLength={6}
                                placeholder="Enter Cheque No"
                            />
                        </div>
                    )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2 pt-5">Sender Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Input
                            label="Mobile No."
                            value={formData.SenderMobileNo ?? ''}
                            required
                            onChange={(e) => {
                                const value = filterMobile(e.target.value);
                                handleFieldChange("SenderMobileNo", value);

                                if (value.length === 10) {
                                    fetchSenderReceiverByMobileNoData(value, "sender");
                                } else {
                                    setFormData(prev => ({
                                        ...prev,
                                        SenderName: "",
                                        SenderEmailId: "",
                                        SenderAddress: ""
                                    }));
                                }
                            }}
                            leftIcon="+91"
                            error={errors.SenderMobileNo}
                            rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
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
                            value={formData.SenderEmailId ?? ''}
                            required
                            onChange={(e) => {
                                const emailId = filterEmail(e.target.value);
                                handleFieldChange("SenderEmailId", emailId);
                            }}
                            error={errors.SenderEmailId}
                            placeholder="Enter Valid E-mail Id"
                            rightIcon={<Mail className="h-8 w-8" />}
                        />
                    </div>

                    <div>
                        <Input
                            label="Address"
                            value={formData.SenderAddress ?? ''}
                            required
                            onChange={e => handleFieldChange("SenderAddress", e.target.value)}
                            error={errors.SenderAddress}
                            maxLength={100}
                            placeholder="Enter Sender Address"
                        />
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2 pt-5">Receiver Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Input
                            label="Mobile No."
                            value={formData.ReceiverMobileNo ?? ''}
                            required
                            onChange={(e) => {
                                const value = filterMobile(e.target.value);
                                handleFieldChange("ReceiverMobileNo", value);

                                if (value.length === 10) {
                                    fetchSenderReceiverByMobileNoData(value, "receiver");
                                } else {
                                    setFormData(prev => ({
                                        ...prev,
                                        ReceiverName: "",
                                        ReceiverEmailId: "",
                                        ReceiverAddress: ""
                                    }));
                                }
                            }}
                            leftIcon="+91"
                            rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                            error={errors.ReceiverMobileNo}
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
                            value={formData.ReceiverEmailId ?? ''}
                            required
                            onChange={(e) => {
                                const emailId = filterEmail(e.target.value);
                                handleFieldChange("ReceiverEmailId", emailId);
                            }}
                            error={errors.ReceiverEmailId}
                            placeholder="Enter Valid E-mail Id"
                            rightIcon={<Mail className="h-8 w-8" />}
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

                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2 pt-5">Document Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                        <MultiFilePicker
                            label="Upload Document"
                            required
                            placeholder="select file"
                            value={documentURLFiles}
                            onChange={setDocumentURLFiles}
                            availableFilesURL={documentURL ?? ''}
                            allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                            maxFiles={5}
                            error={errors.DocumentURL}
                            onRemoveExisting={(url) => {
                                setRemovedDocumentURLs((prev) => [...prev, url]);
                            }}
                        />
                    </div>

                    <div>
                        <Input
                            label="Document Description"
                            value={formData.DocumentDescription ?? ''}
                            required
                            onChange={e => handleFieldChange("DocumentDescription", e.target.value)}
                            error={errors.DocumentDescription}
                            maxLength={50}
                            placeholder="Enter Document Description"
                        />
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2 pt-5">Assign To</h3>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div>
                        <MultiSelectPagination
                            label="Assign Employee"
                            dataFetchCallBack={fetchEmployeeMasterDropdown}
                            selectedValues={employeeDropdown.selectedValues}
                            options={employeeDropdown.initialOptions}
                            onChange={(values) => {
                                const { idsString } = employeeDropdown.handleChange(values);
                                setSelectedEmployeeValues(idsString || null);
                                handleFieldChange("EmployeeId", idsString);
                                if (errors.EmployeeId) {
                                    setErrors((prev) => ({ ...prev, EmployeeId: "" }));
                                }
                            }}
                            required
                            error={errors.EmployeeId}
                        />
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2 pt-5">Delivery Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <SinglePageSelection
                            label="Delivery Mode"
                            placeholder='Select Delivery Mode'
                            disabled={!canAction}
                            value={formData.DeliveryMode || ''}
                            onChange={(e) => handleFieldChange('DeliveryMode', String(e))}
                            options={DELIVERY_MODE.map((opt) => ({ label: opt.name, value: opt.id }))}
                        />
                    </div>

                    <div>
                        <SinglePageSelection
                            label="Delivery Status"
                            disabled={!canAction}
                            placeholder='Select Delivery Status'
                            value={formData.DeliveryStatus || ''}
                            onChange={(e) => handleFieldChange('DeliveryStatus', String(e))}
                            options={DELIVERY_STATUS.map((opt) => ({ label: opt.name, value: opt.id }))}
                        />
                    </div>

                </div>

                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2 pt-5">Acknowledgement</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <Input
                            label="Received By"
                            disabled={!canAction}
                            value={formData.ReceivedBy ?? ''}
                            onChange={e => handleFieldChange("ReceivedBy", e.target.value)}
                            maxLength={50}
                            placeholder="Enter Received By"
                        />
                    </div>

                    <div>
                        <MultiFilePicker
                            label="Receiver’s Signature"
                            placeholder="select file"
                            disabled={!canAction}
                            value={receiversSignatureFiles}
                            onChange={setReceiversSignatureFiles}
                            availableFilesURL={receiversSignatureURL ?? ''}
                            allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                            maxFiles={5}
                            onRemoveExisting={(url) => {
                                setRemovedReceiversSignatureURLs((prev) => [...prev, url]);
                            }}
                        />
                    </div>

                    <div>
                        <MultiFilePicker
                            label="Upload Document"
                            placeholder="select file"
                            disabled={!canAction}
                            value={acknowledgementURLFiles}
                            onChange={setAcknowledgementURLFiles}
                            availableFilesURL={acknowledgementURL ?? ''}
                            allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                            maxFiles={5}
                            onRemoveExisting={(url) => {
                                setRemovedAcknowledgementURLs((prev) => [...prev, url]);
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                        <Input
                            label="Handover To"
                            disabled={!canAction}
                            value={formData.HandOverTo ?? ''}
                            onChange={e => handleFieldChange("HandOverTo", e.target.value)}
                            maxLength={50}
                            placeholder="Enter Name"
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label="Handover Date"
                            disabled={!canAction}
                            value={formatDate_dd_mm_yyyy(formData.HandOverDate ?? '')}
                            onChange={(val) => handleFieldChange('HandOverDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div>
                        <TextArea
                            label="Remark"
                            disabled={!canAction}
                            value={formData.AcknowledgementRemark ?? ''}
                            onChange={e => handleFieldChange("AcknowledgementRemark", e.target.value)}
                            maxLength={50}
                            placeholder="Enter Remark"
                        />
                    </div>
                </div>
            </div>

            <BottomActionBar
                cancelText="Cancel"
                saveText={formData.InwardOutwardId ? "Update" : "Add"}
                onCancel={() => navigate(-1)}
                canAction={(formData.DeliveryStatus || "") === "" ? true : false}
                onSave={() => {
                    handleAddUpdateInward();
                }}
                isLoading={isLoading}
            />
        </div>
    )
}

export default AddUpdateInwardOutward;