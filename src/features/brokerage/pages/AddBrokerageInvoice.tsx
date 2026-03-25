import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useToast from "@/core/hooks/useToast";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { Input } from "@/ui/components/forms";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { Loader } from "@/core/utils/loader";
import { TextArea } from "@/ui/components/forms/Textarea";
import type { AddUpdateBrokerageInvoiceRequest, FilterWithPaginationBrokerageInvoiceRequest } from "../models/BrokerageInvoiceModel";
import { brokerageInvoiceService } from "../services/BrokerageInvoiceService";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { fetchBankListMasterDropdown } from "@/features/bankListMaster/bankListMasterDropDown";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { filterIFSC, filterNumbers, isValidAccount, isValidIFSC } from "@/core/utils/fileValidation";
import { isToDateGreaterOrEqualFromDate } from "@/core/utils/comman";

const initialFormState = (): AddUpdateBrokerageInvoiceRequest => ({
    BrokerageInvoiceId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ProjectId: 0,
    BankListMasterId: 0,
    BookingId: 0,
    InvoiceNumber: 0,
    InvoiceDate: '',
    UploadInvoiceURL: '',
    RemoveUploadInvoiceURL: '',
    AccountName: '',
    AccountNumber: 0,
    IFSCCode: '',
    InvoiceAmount: 0,
    DueDate: '',
    Remark: '',
    BankName: ''
})

export const AddUpdateBrokerageInvoice: React.FC = () => {

    //#region STATE MANAGEMENT
    const [formData, setFormData] = useState<AddUpdateBrokerageInvoiceRequest>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const [uploadInvoiceURLFiles, setUploadInvoiceURLFiles] = useState<(File | string)[]>([]);
    const [removeUploadInvoiceURLUrls, SetRemoveUploadInvoiceURLUrls] = useState<string[]>([]);
    const [uploadInvoiceURL, setUploadInvoiceURL] = useState<string>();

    // NAVIGATE
    const navigate = useNavigate();

    // GET BROKERAGE INVOICE ID
    const { BookingId, BrokerageInvoiceId } = useParams<{ BookingId?: string, BrokerageInvoiceId?: string }>();
    const currentBookingId = BookingId ? Number(BookingId) : 0;
    const brokerageInvoiceId = BrokerageInvoiceId ? Number(BrokerageInvoiceId) : 0;

    const isAddMode = brokerageInvoiceId === 0;

    // ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const { projectId } = useProject();

    // TOAST
    const { addToast } = useToast();
    //#endregion

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/brokerage');
    //#endregion

    //#region HANDLE FIELD CHANGE EVENT
    const handleFieldChange = (field: keyof AddUpdateBrokerageInvoiceRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };
    //#endregion

    //SET DROP DOWN 
    const [dropdownLabels, setDropdownLabels] = useState<{
        bankName?: string;
    }>({});
    //#endregion

    //#region INITIALIZATION
    useEffect(() => {
        if (!projectId) return;

        setFormData(prev => ({
            ...prev,
            BookingId: currentBookingId,
            ProjectId: Number(projectId)
        }));
        if (!isAddMode) {
            fetchBrokerageInvoiceDetails();
        }
    }, [currentBookingId, projectId,brokerageInvoiceId]);
    //#endregion

    //#region FETCH BROKERAGE INVOICE DETAILS
    const fetchBrokerageInvoiceDetails = async () => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationBrokerageInvoiceRequest = {
                    PageNumber: 1,
                    PageSize: 20,
                    BookingId: Number(currentBookingId),
                    ProjectId: Number(projectId),
                    BrokerageInvoiceId: Number(BrokerageInvoiceId)
                };

                const response = await brokerageInvoiceService.apiCallPullBrokerageInvoice(params);

                if (E.isRight(response)) {

                    const e = response.right.Data?.[0];

                    if (e) {
                        setFormData(prev => ({
                            ...prev,
                            BrokerageInvoiceId: e.BrokerageInvoiceId ?? prev.BrokerageInvoiceId,
                            Uniquekey: e.Uniquekey ?? prev.Uniquekey,
                            ProjectId: e.ProjectId ?? prev.ProjectId,
                            BankListMasterId: e.BankListMasterId ?? prev.BankListMasterId,
                            InvoiceNumber: e.InvoiceNumber ?? prev.InvoiceNumber,
                            InvoiceDate: e.InvoiceDate ?? prev.InvoiceDate,
                            AccountName: e.AccountName ?? prev.AccountName,
                            BankName: e.BankName ?? prev.BankName,
                            AccountNumber: e.AccountNumber ?? prev.AccountNumber,
                            IFSCCode: e.IFSCCode ?? prev.IFSCCode,
                            InvoiceAmount: e.InvoiceAmount ?? prev.InvoiceAmount,
                            DueDate: e.DueDate ?? prev.DueDate,
                            Remark: e.Remark ?? prev.Remark,
                        }));
                    }
                    setDropdownLabels({
                        bankName: e.BankName || "",
                    });
                    setUploadInvoiceURL('')
                    setUploadInvoiceURLFiles([])
                    SetRemoveUploadInvoiceURLUrls([])
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
            'Loading Brokerage Invoice'
        );
    };
    //#endregion

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================
    const validateAddBrokerageInvoiceForm = (): {

        isValid: boolean

        errors: { [key: string]: string }

    } => {
        const newErrors: { [key: string]: string } = {};


        if (!formData.AccountNumber) {
            newErrors.AccountNumber = 'Account Number is required.';
        }
        if (!formData.AccountName) {
            newErrors.AccountName = 'Account Name is required.';
        }
        if (!formData.Remark) {
            newErrors.Remark = 'Case Remarks is required.';
        }

        if (!formData.IFSCCode?.trim()) {
            newErrors.IFSCCode = 'IFSC Code is required.'
        }

        else if (formData.IFSCCode.trim().length > 12) {
            newErrors.IFSCCode = 'IFSC Code must be at most 50 characters'
        }
        else if (!isValidIFSC(formData.IFSCCode.trim())) {
            newErrors.IFSCCode = 'Enter a valid IFSC Code'
        }
        if (!formData.AccountNumber) {
            newErrors.AccountNumber = 'Account Number is required.';
        } else if (!isValidAccount(formData.AccountNumber.toString())) {
            newErrors.AccountNumber = "Enter a valid Account Number (6–18 digits)";
        }

        if (!formData.InvoiceDate) {
            newErrors.InvoiceDate = 'Invoice Date is required.';
        }
        if (!formData.DueDate) {
            newErrors.DueDate = 'Due Date is required.';

        } else if (formData.InvoiceDate != null && formData.InvoiceDate !== "" && !isToDateGreaterOrEqualFromDate(formData.InvoiceDate, formData.DueDate)) {
            newErrors.DueDate = "Due Date must be greater to Invoice Date";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };
    //#endregion

    const PushBrokerageInvoiceData = (): FormData => {
        const fd = new FormData();

        fd.append("BrokerageInvoiceId", formData.BrokerageInvoiceId.toString());
        fd.append("Uniquekey", formData.Uniquekey ?? "");
        fd.append("ProjectId", projectId!.toString());
        fd.append("BookingId", currentBookingId.toString());
        fd.append("InvoiceNumber", formData.InvoiceNumber.toString());
        fd.append("InvoiceDate", formData.InvoiceDate ?? "");
        fd.append("BankListMasterId", formData.BankListMasterId.toString());
        fd.append("AccountName", formData.AccountName ?? "");
        fd.append("AccountNumber", formData.AccountNumber.toString());
        fd.append("IFSCCode", formData.IFSCCode ?? "");
        fd.append("InvoiceAmount", formData.InvoiceAmount.toString());
        fd.append("DueDate", formData.DueDate ?? "");
        fd.append("Remark", formData.Remark ?? "");

        uploadInvoiceURLFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append("UploadInvoiceURL", file);
            }
        });

        fd.append("RemoveUploadInvoiceURL", removeUploadInvoiceURLUrls.join(","));

        return fd;
    };

    //#region HANDLE  ADD UPDATE BROKERAGE INVOICE 
    const handleAddUpdateBrokerageInvoice = async () => {
        setErrors({});

        const validation = validateAddBrokerageInvoiceForm();

        if (!validation.isValid) {

            setErrors(validation.errors);

            return;
        }
        await runApiWithLoader(

            setIsLoading,
            setLoadingMessage,

            async () => {
                const payload = PushBrokerageInvoiceData();

                const response = await brokerageInvoiceService.apiCallAddUpdateBrokerageInvoice(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate(`/brokerageInvoice/view/${currentBookingId}`);
                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            isAddMode ? 'Add Brokerage Invoice' : 'Update Brokerage Invoice'
        );
    };
    //#endregion

    //#region
    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            {/* Loader */}

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">

                <form onSubmit={handleAddUpdateBrokerageInvoice}>

                    {/* Basic Brokerage Invoice Details */}

                    <div className="space-y-4 pb-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Add Invoice</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='Invoice Number'
                                    value={formData.InvoiceNumber ?? ""}
                                    onChange={(e) => handleFieldChange("InvoiceNumber", e.target.value)}
                                    placeholder="Enter Invoice Number"
                                    maxLength={15}
                                    error={errors.InvoiceNumber}
                                />
                            </div>
                            <div>
                                <DatePickerInput
                                    label="Invoice Date"
                                    value={formatDate_dd_mm_yyyy(formData.InvoiceDate)}
                                    onChange={(val) => handleFieldChange('InvoiceDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                    required
                                    error={errors.InvoiceDate}
                                />
                            </div>
                            <div>
                                <MultiFilePicker
                                    label="Upload Invoice"
                                    required
                                    placeholder='Select Files'
                                    value={uploadInvoiceURLFiles}
                                    onChange={setUploadInvoiceURLFiles}
                                    availableFilesURL={uploadInvoiceURL ?? ""}
                                    allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                    maxFiles={3}
                                    maxSizeMB={10}
                                    onRemoveExisting={(url) => {
                                        SetRemoveUploadInvoiceURLUrls((prev) => [...prev, url])
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <SingleSelectDropdownWithPagination
                                    label="Bank Name"
                                    required
                                    title="Select Bank"
                                    size="lg"
                                    dataFetchCallBack={fetchBankListMasterDropdown}
                                    onSelected={(item) => {
                                        if (!item) {
                                            handleFieldChange("BankListMasterId", null);
                                            return;
                                        }

                                        handleFieldChange("BankListMasterId", Number(item.value));
                                    }}
                                    initialValue={createDropdownInitialValue(formData.BankListMasterId, dropdownLabels.bankName)}
                                    error={errors.BankListMasterId}
                                />
                            </div>

                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='Account Name'
                                    value={formData.AccountName ?? ""}
                                    onChange={(e) => handleFieldChange("AccountName", e.target.value)}
                                    placeholder="Enter Account Name"
                                    maxLength={50}
                                    error={errors.AccountName}
                                />
                            </div>

                            <Input
                                label="IFSC Code"
                                placeholder="Enter IFSC Code"
                                required
                                value={formData.IFSCCode}
                                onChange={(e) => handleFieldChange("IFSCCode", filterIFSC(e.target.value))}
                                error={errors.IFSCCode} />

                            <div>
                                <Input
                                    label="Account Number"
                                    value={formData.AccountNumber || ''}
                                    onChange={(e) => handleFieldChange('AccountNumber', filterNumbers(e.target.value))}
                                    error={errors.AccountNumber}
                                    placeholder="Enter Account Number"
                                    required
                                    maxLength={15}
                                />
                            </div>

                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='Invoice Amount'
                                    value={formData.InvoiceAmount ?? ""}
                                    onChange={(e) => handleFieldChange("InvoiceAmount", e.target.value)}
                                    placeholder="Enter Invoice Amount"
                                    maxLength={15}
                                    error={errors.InvoiceAmount}
                                />
                            </div>

                            <div>
                                <DatePickerInput
                                    label="Due Date"
                                    value={formatDate_dd_mm_yyyy(formData.DueDate)}
                                    onChange={(val) => handleFieldChange('DueDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                    required
                                    error={errors.DueDate}
                                />
                            </div>
                        </div>

                        <div>
                            <TextArea
                                label="  Remarks"
                                required
                                className='thin-scroll'
                                value={formData.Remark ?? ""}
                                placeholder="Enter Remarks"
                                onChange={(e) => handleFieldChange("Remark", e.target.value)}
                                error={errors.Remark} />
                        </div>
                    </div>
                </form>
            </div>

            <BottomActionBar
                cancelText="Cancel"
                saveText={formData.BrokerageInvoiceId ? "Update" : "Add"}
                onCancel={() => navigate(-1)}
                canAction={canAction}
                onSave={() => {
                    handleAddUpdateBrokerageInvoice();
                }}
                isLoading={isLoading}
            />
        </div>
    );
};

export default AddUpdateBrokerageInvoice;
