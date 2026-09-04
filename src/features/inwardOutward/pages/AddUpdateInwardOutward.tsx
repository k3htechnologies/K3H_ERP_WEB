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
import { Mail } from "lucide-react";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, } from "@/core/utils/dateFormat";
import { inwardOutwardService } from "@/features/inwardOutward/services/InwardOutwardService";
import { TextArea } from "@/ui/components/forms/Textarea";
import { filterEmail, filterLetters, filterNumbers, filterNumbersWithDecimal, hasAnyDocumentFile, isValidEmail, isValidMobile } from "@/core/utils/fileValidation";
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { DELIVERY_MODE, DELIVERY_STATUS, DOCUMENT_TYPE } from "@/core/constants";
import RadioPill from "@/ui/components/forms/RadioPill";
import MobileNumberInput from "@/ui/components/forms/MobileNumberInput";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";

const initialFormState = (): AddUpdateInwardAndOutWardRequest => ({
    InwardOutwardId: 0,
    UniqueKey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    InvoiceNumber: "",
    InvoiceDate: "",
    DeliveryType: "Others",
    DocumentType: "",
    ChequeNumber: "",
    DocumentTitle: "",
    Amount: 0,
    InwardOutwardDate: null,
    SenderName: "",
    SenderAddress: "",
    SenderMobileNumber: "",
    SenderMobileNumberCountryCode: "+91",
    SenderEmailId: "",
    ReceiverName: "",
    ReceiverAddress: "",
    ReceiverMobileNumber: "",
    ReceiverMobileNumberCountryCode: "+91",
    ReceiverEmailId: "",
    HandOverTo: "",
    HandOverDate: "",
    HandoverPersonMobileNumber: "",
    HandoverPersonMobileNumberCountryCode: "+91",
    DocumentURL: null,
    RemoveDocumentURL: '',
    DocumentDescription: '',
    EmployeeId: '',
    DeliveryMode: '',
    DeliveryStatus: '',
    AcknowledgementBy: '',
    AcknowledgementURL: null,
    RemoveAcknowledgementURL: '',
    AcknowledgementSignatureURL: null,
    RemoveAcknowledgementSignatureURL: '',
    AcknowledgementRemark: '',
})

export const AddUpdateInwardOutward: React.FC = () => {

    const [formData, setFormData] = useState<AddUpdateInwardAndOutWardRequest>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [acknowledgementURLFiles, setAcknowledgementURLFiles] = useState<(File | string)[]>([]);
    const [acknowledgementURL, setAcknowledgementURL] = useState<string>();
    const [removedAcknowledgementURLs, setRemovedAcknowledgementURLs] = useState<string[]>([]);
    const [documentURLFiles, setDocumentURLFiles] = useState<(File | string)[]>([]);
    const [documentURL, setDocumentURL] = useState<string>();
    const [removedDocumentURLs, setRemovedDocumentURLs] = useState<string[]>([]);
    const [acknowledgementSignatureFiles, setAcknowledgementSignatureFiles] = useState<(File | string)[]>([]);
    const [acknowledgementSignatureURL, setAcknowledgementSignatureURL] = useState<string>();
    const [removedAcknowledgementSignatureURLs, setRemovedAcknowledgementSignatureURLs] = useState<string[]>([]);
    const [selectedEmployeeValues, setSelectedEmployeeValues] = useState<string | number | null>(null);

    const navigate = useNavigate();
    const { InwardOutwardId } = useParams<{ InwardOutwardId?: string }>();
    const inwardOutwardId = InwardOutwardId ? Number(InwardOutwardId) : 0;
    const isAddMode = inwardOutwardId === 0;

    const { addToast } = useToast();

    const { canAction: canActionAcknowledgement } = useMenuPermissions("/inwardOutwardAcknowledgement");
    const { canAction: canActionInwardOutward } = useMenuPermissions("/inwardOutward");
    const { canAction: canActionAdministrativeAccess } = useMenuPermissions("/inwardOutwardAdministrativeAccess");

    const loggedInUser = LocalStorageHelper.getStoredEmployeeData();

    const canEdit = !canActionInwardOutward && canActionAcknowledgement && ((formData?.CreatedById === loggedInUser?.EmployeeId) || (formData?.InwardOutwardId === 0))

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
                    PageSize: 1,
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
                            InvoiceNumber: e.InvoiceNumber ?? prev.InvoiceNumber,
                            InvoiceDate: e.InvoiceDate ?? prev.InvoiceDate,
                            DocumentTitle: e.DocumentTitle ?? prev.DocumentTitle,
                            DeliveryStatus: e.DeliveryStatus ?? prev.DeliveryStatus,
                            AcknowledgementRemark: e.AcknowledgementRemark ?? prev.AcknowledgementRemark,
                            Amount: e.Amount ?? prev.Amount,
                            ChequeNumber: e.ChequeNumber ?? prev.ChequeNumber,
                            AcknowledgementBy: e.AcknowledgementBy ?? prev.AcknowledgementBy,
                            DocumentDescription: e.DocumentDescription ?? prev.DocumentDescription,
                            SenderName: e.SenderName ?? prev.SenderName,
                            SenderEmailId: e.SenderEmailId ?? prev.SenderEmailId,
                            SenderMobileNumber: e.SenderMobileNumber ?? prev.SenderMobileNumber,
                            SenderMobileNumberCountryCode: e.SenderMobileNumberCountryCode ?? prev.SenderMobileNumberCountryCode,
                            SenderAddress: e.SenderAddress ?? prev.SenderAddress,
                            ReceiverName: e.ReceiverName ?? prev.ReceiverName,
                            ReceiverEmailId: e.ReceiverEmailId ?? prev.ReceiverEmailId,
                            ReceiverMobileNumber: e.ReceiverMobileNumber ?? prev.ReceiverMobileNumber,
                            ReceiverMobileNumberCountryCode: e.ReceiverMobileNumberCountryCode ?? prev.ReceiverMobileNumberCountryCode,
                            ReceiverAddress: e.ReceiverAddress ?? prev.ReceiverAddress,
                            DeliveryMode: e.DeliveryMode ?? prev.DeliveryMode,
                            DocumentType: e.DocumentType ?? prev.DocumentType,
                            InwardOutwardDate: e.InwardOutwardDate ?? prev.InwardOutwardDate,
                            HandOverDate: e.HandOverDate ?? prev.HandOverDate,
                            HandOverTo: e.HandOverTo ?? prev.HandOverTo,
                            HandoverPersonMobileNumber: e.HandoverPersonMobileNumber ?? prev.HandoverPersonMobileNumber,
                            HandoverPersonMobileNumberCountryCode: e.HandoverPersonMobileNumberCountryCode ?? prev.HandoverPersonMobileNumberCountryCode,
                            DeliveryType: e.DeliveryType ?? prev.DeliveryType,
                            CreatedById: e.CreatedById ?? prev.CreatedById,
                        }));

                        setSelectedEmployeeValues(e.EmployeeId || null);
                        setDocumentURL(e.DocumentURL || '');
                        setRemovedDocumentURLs([]);
                        setDocumentURLFiles([]);

                        setAcknowledgementURL(e.AcknowledgementURL || '');
                        setRemovedAcknowledgementURLs([]);
                        setAcknowledgementURLFiles([]);

                        setAcknowledgementSignatureURL(e.AcknowledgementSignatureURL || '');
                        setRemovedAcknowledgementSignatureURLs([]);
                        setAcknowledgementSignatureFiles([]);
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

    const validateAddUpdateInwardOutwardForm = (): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [k: string]: string } = {};

        if (formData.DeliveryType?.toUpperCase() === "CHEQUE") {
            if (!formData.ChequeNumber) {
                newErrors.ChequeNumber = "Cheque Number is required";
            } else if (Number(formData.ChequeNumber) === 0) {
                newErrors.ChequeNumber = "Cheque Number cannot be zero";
            }
            if (!formData.Amount) {
                newErrors.Amount = "Amount is required";
            } else if (formData.Amount <= 0) {
                newErrors.Amount = "Amount must be greater than 0";
            }

            if (!formData.InvoiceDate) {
                newErrors.InvoiceDate = "Invoice Date is required";
            }
        } else {
            if ((formData.InvoiceNumber !== null && String(formData.InvoiceNumber).trim() !== "") && Number(formData.InvoiceNumber) === 0) {
                newErrors.InvoiceNumber = "Invoice Number cannot be zero";
            }
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
        if (!formData.SenderName) {
            newErrors.SenderName = "Sender Name is required";
        }
        if (!formData.SenderMobileNumber) {
            newErrors.SenderMobileNumber = 'Sender Mobile Number is required.'
        } else if (!isValidMobile(formData.SenderMobileNumber.trim(), formData.SenderMobileNumberCountryCode!)) {
            newErrors.SenderMobileNumber = 'Enter a valid Mobile Number'
        }
        if (!formData.SenderEmailId?.trim()) {
            newErrors.SenderEmailId = 'Sender E-Mail ID is required'
        } else if (!isValidEmail(formData.SenderEmailId.trim())) {
            newErrors.SenderEmailId = 'Enter a Valid E-Mail ID'
        }
        if (!formData.SenderAddress) {
            newErrors.SenderAddress = "Sender Address is required";
        }
        if (!formData.ReceiverName) {
            newErrors.ReceiverName = "Receiver Name is required";
        }
        if (!formData.ReceiverMobileNumber) {
            newErrors.ReceiverMobileNumber = 'Receiver Mobile Number is required.'
        } else if (!isValidMobile(formData.ReceiverMobileNumber.trim(), formData.ReceiverMobileNumberCountryCode!)) {
            newErrors.ReceiverMobileNumber = 'Enter a valid Mobile Number'
        }
        if (!formData.ReceiverEmailId?.trim()) {
            newErrors.ReceiverEmailId = 'Receiver E-Mail ID is required'
        } else if (!isValidEmail(formData.ReceiverEmailId.trim())) {
            newErrors.ReceiverEmailId = 'Enter a Valid E-Mail ID'
        }
        if (!formData.ReceiverAddress) {
            newErrors.ReceiverAddress = "Receiver Address is required";
        }

        // Data Duplicacy Checks

        if (formData.SenderMobileNumber?.trim() && formData.ReceiverMobileNumber?.trim() && formData.SenderMobileNumber.trim() === formData.ReceiverMobileNumber.trim()) {
            newErrors.ReceiverMobileNumber = "Sender and Receiver mobile numbers should not be the same";
            newErrors.SenderMobileNumber = "Sender and Receiver mobile numbers should not be the same";
        }
        if (formData.SenderEmailId?.trim() &&
            formData.ReceiverEmailId?.trim() &&
            formData.SenderEmailId.trim().toLowerCase() === formData.ReceiverEmailId.trim().toLowerCase()
        ) {
            newErrors.ReceiverEmailId = "Sender and Receiver Email-Ids should not be the same";
            newErrors.SenderEmailId = "Sender and Receiver Email-Ids should not be the same";
        }
        if (
            formData.SenderName?.trim() &&
            formData.ReceiverName?.trim() &&
            formData.SenderName.trim().toLowerCase() === formData.ReceiverName.trim().toLowerCase()
        ) {
            newErrors.ReceiverName = "Sender and Receiver names should not be the same";
            newErrors.SenderName = "Sender and Receiver names should not be the same";
        }
        if (
            formData.SenderAddress?.trim() &&
            formData.ReceiverAddress?.trim() &&
            formData.SenderAddress.trim().toLowerCase() === formData.ReceiverAddress.trim().toLowerCase()
        ) {
            newErrors.ReceiverAddress = "Sender and Receiver addresses should not be the same";
            newErrors.SenderAddress = "Sender and Receiver addresses should not be the same";
        }



        if (!formData.EmployeeId) {
            newErrors.EmployeeId = "Assign Employee is required";
        }
        if (!hasAnyDocumentFile(documentURLFiles, documentURL, removedDocumentURLs)) {
            newErrors.DocumentURL = "Document File is required.";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const PushInwardOutwardFormData = (): FormData => {

        const fd = new FormData();
        fd.append("InwardOutwardId", formData.InwardOutwardId.toString());
        fd.append("UniqueKey", formData.UniqueKey ?? "");
        fd.append("EmployeeId", formData.EmployeeId ?? "");
        fd.append("InwardOutwardDate", formData.InwardOutwardDate ?? "");
        fd.append("DeliveryMode", formData.DeliveryMode ?? "");
        fd.append("DeliveryStatus", formData.DeliveryStatus ?? "");
        fd.append("DeliveryType", formData.DeliveryType ?? "");
        fd.append("Amount", String(Number(formData.Amount) || 0));
        fd.append("DocumentDescription", formData.DocumentDescription ?? "");
        fd.append("DocumentTitle", formData.DocumentTitle ?? "");
        fd.append("AcknowledgementRemark", formData.AcknowledgementRemark ?? "");
        fd.append("AcknowledgementBy", formData.AcknowledgementBy ?? "");
        fd.append("DocumentType", formData.DocumentType ?? "");
        fd.append("ChequeNumber", formData.ChequeNumber ?? "");
        fd.append("SenderName", formData.SenderName ?? "");
        fd.append("SenderMobileNumber", formData.SenderMobileNumber ?? "");
        fd.append("SenderMobileNumberCountryCode", formData.SenderMobileNumberCountryCode ?? "");
        fd.append("SenderEmailId", formData.SenderEmailId ?? "");
        fd.append("SenderAddress", formData.SenderAddress ?? "");
        fd.append("ReceiverName", formData.ReceiverName ?? "");
        fd.append("ReceiverMobileNumber", formData.ReceiverMobileNumber ?? "");
        fd.append("ReceiverMobileNumberCountryCode", formData.ReceiverMobileNumberCountryCode ?? "");
        fd.append("ReceiverEmailId", formData.ReceiverEmailId ?? "");
        fd.append("ReceiverAddress", formData.ReceiverAddress ?? "");
        fd.append("InvoiceDate", formData.InvoiceDate ?? "");
        fd.append("InvoiceNumber", String(formData.InvoiceNumber ?? 0));
        fd.append("HandOverDate", formData.HandOverDate ?? "");
        fd.append("HandOverTo", formData.HandOverTo ?? "");
        fd.append("HandoverPersonMobileNumber", formData.HandoverPersonMobileNumber ?? "");
        fd.append("HandoverPersonMobileNumberCountryCode", formData.HandoverPersonMobileNumberCountryCode ?? "");

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

        acknowledgementSignatureFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append("AcknowledgementSignatureURL", file);
            }
        })

        fd.append("RemoveAcknowledgementSignatureURL", removedAcknowledgementSignatureURLs.join(","));

        return fd;
    };

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

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <Loader loading={isLoading} title={loadingMessage}>{" "}<div></div>{" "}</Loader>

            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2"> Basic Details</h3>

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
                                    handleFieldChange("ChequeNumber", "");
                                }}
                                disabled={!(canEdit || canActionInwardOutward || canActionAdministrativeAccess)}
                            />

                            <RadioPill
                                name="Nationality"
                                label="Cheque"
                                value="Cheque"
                                checked={formData.DeliveryType === "Cheque"}
                                onChange={() => {
                                    handleFieldChange("DeliveryType", "Cheque");
                                }}
                                disabled={!(canEdit || canActionInwardOutward || canActionAdministrativeAccess)}
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
                            disabled={!(canEdit || canActionInwardOutward || canActionAdministrativeAccess)}

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
                            disabled={!(canEdit || canActionInwardOutward || canActionAdministrativeAccess)}
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label="Date"
                            value={formatDate_dd_mm_yyyy(formData.InwardOutwardDate ?? '')}
                            onChange={(val) => handleFieldChange('InwardOutwardDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                            required
                            disabled={true}
                            isDisplayCurrentDate
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label='Invoice Number'
                            value={formData.InvoiceNumber ?? ""}
                            onChange={(e) => {
                                const val = (e.target.value);
                                handleFieldChange("InvoiceNumber", val);
                            }}
                            placeholder="Enter Invoice Number"
                            maxLength={15}
                            disabled={!(canEdit || canActionInwardOutward || canActionAdministrativeAccess)}
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label="Invoice Date"
                            value={formatDate_dd_mm_yyyy(formData.InvoiceDate ?? '')}
                            onChange={(val) => handleFieldChange('InvoiceDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                            required={formData.DeliveryType === "Cheque"}
                            error={errors.InvoiceDate}
                            disabled={!(canEdit || canActionInwardOutward || canActionAdministrativeAccess)}
                        />
                    </div>

                    <div>
                        <Input
                            label="Amount (₹)"
                            value={formData.Amount ?? ''}
                            required={formData.DeliveryType === "Cheque"}
                            rightIcon="₹"
                            onChange={e => handleFieldChange('Amount', filterNumbersWithDecimal(e.target.value) || "")}
                            error={errors.Amount}
                            maxLength={15}
                            placeholder="Enter Amount"
                            disabled={!(canEdit || canActionInwardOutward || canActionAdministrativeAccess)}
                        />
                    </div>

                    {formData.DeliveryType === "Cheque" && (
                        <div>
                            <Input
                                label="Cheque No"
                                value={formData.ChequeNumber ?? ''}
                                required
                                onChange={e => handleFieldChange('ChequeNumber', filterNumbers(e.target.value))}
                                error={errors.ChequeNumber}
                                maxLength={6}
                                placeholder="Enter Cheque No"
                                disabled={!(canEdit || canActionInwardOutward)}
                            />
                        </div>
                    )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2 pt-5">Sender Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <MobileNumberInput
                            label="Mobile No."
                            mobileNumber={formData.SenderMobileNumber ?? ''}
                            countryCode={formData.SenderMobileNumberCountryCode ?? "+91"}
                            disabled={Number(formData.InwardOutwardId) > 0}
                            required
                            onMobileChange={(value) => {
                                handleFieldChange("SenderMobileNumber", value);

                                fetchSenderReceiverByMobileNoData(value, "sender");
                                setFormData(prev => ({
                                    ...prev,
                                    SenderName: "",
                                    SenderEmailId: "",
                                    SenderAddress: ""
                                }));
                            }}
                            onCountryCodeChange={(value) =>
                                handleFieldChange("SenderMobileNumberCountryCode", value)
                            }
                            error={errors.SenderMobileNumber}
                        />
                    </div>

                    <div>
                        <Input
                            label="Name"
                            value={formData.SenderName ?? ''}
                            required
                            onChange={e => handleFieldChange("SenderName", filterLetters(e.target.value))}
                            error={errors.SenderName}
                            maxLength={50}
                            placeholder="Enter Sender Name"
                            disabled={!(canEdit || canActionInwardOutward || canActionAdministrativeAccess)}
                        />
                    </div>

                    <div>
                        <Input
                            label="E-Mail ID"
                            value={formData.SenderEmailId ?? ''}
                            required
                            onChange={(e) => {
                                const emailId = filterEmail(e.target.value);
                                handleFieldChange("SenderEmailId", emailId);
                            }}
                            error={errors.SenderEmailId}
                            placeholder="Enter Sender E-Mail ID"
                            rightIcon={<Mail className="h-8 w-8" />}
                            disabled={!(canEdit || canActionInwardOutward || canActionAdministrativeAccess)}
                        />
                    </div>

                    <div>
                        <Input
                            label="Address"
                            value={formData.SenderAddress ?? ''}
                            required
                            onChange={e => handleFieldChange("SenderAddress", e.target.value)}
                            error={errors.SenderAddress}
                            maxLength={250}
                            placeholder="Enter Sender Address"
                            disabled={!(canEdit || canActionInwardOutward || canActionAdministrativeAccess)}
                        />
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2 pt-5">Receiver Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <MobileNumberInput
                            label="Mobile No."
                            mobileNumber={formData.ReceiverMobileNumber ?? ''}
                            countryCode={formData.ReceiverMobileNumberCountryCode ?? "+91"}
                            disabled={Number(formData.InwardOutwardId) > 0}
                            required
                            onMobileChange={(value) => {
                                handleFieldChange("ReceiverMobileNumber", value);
                                fetchSenderReceiverByMobileNoData(value, "receiver");
                                setFormData(prev => ({
                                    ...prev,
                                    ReceiverName: "",
                                    ReceiverEmailId: "",
                                    ReceiverAddress: ""
                                }));
                            }}
                            onCountryCodeChange={(value) =>
                                handleFieldChange("ReceiverMobileNumberCountryCode", value)
                            }
                            error={errors.ReceiverMobileNumber}
                        />
                    </div>

                    <div>
                        <Input
                            label="Name"
                            value={formData.ReceiverName ?? ''}
                            required
                            onChange={e => handleFieldChange("ReceiverName", filterLetters(e.target.value))}
                            error={errors.ReceiverName}
                            maxLength={50}
                            placeholder="Enter Receiver Name"
                            disabled={!(canEdit || canActionInwardOutward || canActionAdministrativeAccess)}
                        />
                    </div>

                    <div>
                        <Input
                            label="E-Mail ID"
                            value={formData.ReceiverEmailId ?? ''}
                            required
                            onChange={(e) => {
                                const emailId = filterEmail(e.target.value);
                                handleFieldChange("ReceiverEmailId", emailId);
                            }}
                            error={errors.ReceiverEmailId}
                            placeholder="Enter Receiver E-Mail ID"
                            rightIcon={<Mail className="h-8 w-8" />}
                            disabled={!(canEdit || canActionInwardOutward || canActionAdministrativeAccess)}
                        />
                    </div>

                    <div>
                        <Input
                            label="Address"
                            value={formData.ReceiverAddress ?? ''}
                            required
                            onChange={e => handleFieldChange("ReceiverAddress", e.target.value)}
                            error={errors.ReceiverAddress}
                            maxLength={250}
                            placeholder="Enter Receiver Address"
                            disabled={!(canEdit || canActionInwardOutward || canActionAdministrativeAccess)}
                        />
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2 pt-5">Document Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                        <MultiFilePicker
                            label="Upload Document"
                            required
                            placeholder="Upload Document File"
                            value={documentURLFiles}
                            onChange={setDocumentURLFiles}
                            availableFilesURL={documentURL ?? ''}
                            allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf", "application/vnd.ms-excel"]}
                            maxFiles={5}
                            error={errors.DocumentURL}
                            onRemoveExisting={(url) => {
                                setRemovedDocumentURLs((prev) => [...prev, url]);
                            }}
                            disabled={!(canEdit || canActionInwardOutward || canActionAdministrativeAccess)}
                        />
                    </div>

                    <div>
                        <Input
                            label="Document Description"
                            value={formData.DocumentDescription ?? ''}
                            required
                            onChange={e => handleFieldChange("DocumentDescription", e.target.value)}
                            error={errors.DocumentDescription}
                            maxLength={500}
                            placeholder="Enter Document Description"
                            disabled={!(canEdit || canActionInwardOutward || canActionAdministrativeAccess)}
                        />
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2 pt-5">Assign To</h3>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div>
                        <MultiSelectPagination
                            label="Employee"
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
                            disabled={!(canEdit || canActionInwardOutward || canActionAdministrativeAccess)}
                        />
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2 pt-5">Delivery Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <SinglePageSelection
                            label="Delivery Mode"
                            placeholder='Select Delivery Mode'
                            disabled={!canActionAcknowledgement && !canActionAdministrativeAccess}
                            value={formData.DeliveryMode || ''}
                            onChange={(e) => handleFieldChange('DeliveryMode', String(e))}
                            options={DELIVERY_MODE.map((opt) => ({ label: opt.name, value: opt.id }))}
                        />
                    </div>

                    <div>
                        <SinglePageSelection
                            label="Delivery Status"
                            disabled={!canActionAcknowledgement && !canActionAdministrativeAccess}
                            placeholder='Select Delivery Status'
                            value={formData.DeliveryStatus || ''}
                            onChange={(e) => handleFieldChange('DeliveryStatus', String(e))}
                            options={DELIVERY_STATUS.map((opt) => ({ label: opt.name, value: opt.id }))}
                        />
                    </div>

                </div>

                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2 pt-5">Acknowledgement</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="mt-2">
                        <Input
                            label="Acknowledged By"
                            disabled={!canActionAcknowledgement && !canActionAdministrativeAccess}
                            value={formData.AcknowledgementBy ?? ''}
                            onChange={e => handleFieldChange("AcknowledgementBy", e.target.value)}
                            maxLength={50}
                            placeholder="Enter Acknowledged By"
                        />
                    </div>

                    <div className="mt-2">
                        <MultiFilePicker
                            label="Acknowledger's Signature"
                            placeholder="Select files"
                            disabled={!canActionAcknowledgement && !canActionAdministrativeAccess}
                            value={acknowledgementSignatureFiles}
                            onChange={setAcknowledgementSignatureFiles}
                            availableFilesURL={acknowledgementSignatureURL ?? ''}
                            allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                            maxFiles={5}
                            maxSizeMB={10}
                            onRemoveExisting={(url) => {
                                setRemovedAcknowledgementSignatureURLs((prev) => [...prev, url]);
                            }}
                        />
                    </div>

                    <div className="mt-2">
                        <MultiFilePicker
                            label="Acknowledgement Document"
                            placeholder="select file"
                            disabled={!canActionAcknowledgement && !canActionAdministrativeAccess}
                            value={acknowledgementURLFiles}
                            onChange={setAcknowledgementURLFiles}
                            availableFilesURL={acknowledgementURL ?? ''}
                            allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf", "application/vnd.ms-excel"]}
                            maxFiles={5}
                            onRemoveExisting={(url) => {
                                setRemovedAcknowledgementURLs((prev) => [...prev, url]);
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="mt-2">
                        <Input
                            label="Handover To"
                            disabled={!canActionAcknowledgement && !canActionAdministrativeAccess}
                            value={formData.HandOverTo ?? ''}
                            onChange={e => handleFieldChange("HandOverTo", e.target.value)}
                            maxLength={50}
                            placeholder="Enter Name"
                        />
                    </div>

                    <div className="mt-2">
                        <DatePickerInput
                            label="Handover Date"
                            disabled={!canActionAcknowledgement && !canActionAdministrativeAccess}
                            value={formatDate_dd_mm_yyyy(formData.HandOverDate ?? '')}
                            minDate={new Date(new Date().setDate(new Date().getDate() - 2))}
                            onChange={(val) => handleFieldChange('HandOverDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                        />
                    </div>

                    <div>
                        <div>
                            <MobileNumberInput
                                label="Handover Person's Mobile Number"
                                mobileNumber={formData.HandoverPersonMobileNumber ?? ""}
                                countryCode={formData.HandoverPersonMobileNumberCountryCode ?? "+91"}
                                disabled={!canActionAcknowledgement && !canActionAdministrativeAccess}
                                onMobileChange={(value) =>
                                    handleFieldChange("HandoverPersonMobileNumber", value)
                                }
                                onCountryCodeChange={(value) =>
                                    handleFieldChange("HandoverPersonMobileNumberCountryCode", value)
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div className="mt-2">
                        <TextArea
                            label="Remark"
                            disabled={!canActionAcknowledgement && !canActionAdministrativeAccess}
                            value={formData.AcknowledgementRemark ?? ''}
                            onChange={e => handleFieldChange("AcknowledgementRemark", e.target.value)}
                            placeholder="Enter Remark"
                            maxLength={500}
                        />
                    </div>
                </div>
            </div>

            <BottomActionBar
                cancelText="Cancel"
                saveText={formData.InwardOutwardId ? "Update" : "Add"}
                onCancel={() => navigate(-1)}
                canAction={canActionInwardOutward || canActionAcknowledgement || canActionAdministrativeAccess}
                onSave={() => {
                    handleAddUpdateInward();
                }}
                isLoading={isLoading}
            />
        </div>
    )
}

export default AddUpdateInwardOutward;