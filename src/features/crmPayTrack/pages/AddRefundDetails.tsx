
import { useCallback, useState } from "react";
import { Loader } from "@/core/utils/loader"
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import type { AddUpdateRefundAmountDetailsRequest } from "@/features/crmPayTrack/models/RefundAmountDetailsModel";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { usePayTrackBookingListState } from "../context/PayTrackBookingListStateContext";
import useToast from "@/core/hooks/useToast";
import type { ProjectWithBankDetails } from "@/features/projectMaster/models/ProjectMasterModel";
import { fetchProjectBankDropdown } from "@/features/projectMaster/projectBankDropdown";
import { fetchBankListMasterDropdown } from '@/features/bankListMaster/bankListMasterDropDown';
import { Input } from "@/ui/components/forms";
import { filterIFSC, filterNumbers } from "@/core/utils/fileValidation";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { REFUNDED_DETAILS_AMOUNT_TYPE_OPTIONS } from '@/core/constants';
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

const initialFormState = (): AddUpdateRefundAmountDetailsRequest => ({
    RefundedAmountLedgerId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    BookingId: null,
    ProjectId: null,
    PaymentFor: '',
    PaymentMode: '',
    ProjectBankListMasterId: 0,
    ProjectBankName: '',
    ProjectAccountNumber: '',
    ProjectIFSCCode: '',
    PaymentReceiptURL: null,
    AccountHolderName: '',
    BankListMasterId: 0,
    BankName: '',
    AccountNumber: '',
    IFSCCode: '',
    AmountType: '',
    PaymentType: '',
    RefundedAmount: 0,
    TransactionChequeDemandDraftNumber: '',
    TransactionChequeDemandDraftURL: null,
    TransactionChequeDemandDraftDate: '',
});


export const AddRefundDetails: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [projectWithBankData, setProjectWithBankData] = useState<ProjectWithBankDetails | null>(null);
    const [formData, setFormData] = useState<AddUpdateRefundAmountDetailsRequest>(() => initialFormState());

    // File states
    const [transactionChequeDemandFiles, setTransactionChequeDemandFiles] = useState<(File | string)[]>([]);
    const [removedTransactionChequeDemandUrls, setRemovedTransactionChequeDemandUrls] = useState<string[]>([]);
    const [transactionChequeDemandURL, setTransactionChequeDemandURL] = useState<string>();

    const [paymentReceiptFiles, setPaymentReceiptFiles] = useState<(File | string)[]>([]);
    const [removedPaymentReceiptUrls, setRemovedPaymentReceiptUrls] = useState<string[]>([]);
    const [paymentReceiptURL, setPaymentReceiptURL] = useState<string>();

    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const { projectId } = useProject();

    const { canAction } = useMenuPermissions("/payTrack");

    const { listState } = usePayTrackBookingListState();
    const { bookingId } = listState;

    const { addToast } = useToast();

    const [dropdownLabels, setDropdownLabels] = useState<{
        projectBankName?: string;
        bankName?: string;
    }>({});

    const handleFieldChange = (field: keyof AddUpdateRefundAmountDetailsRequest, value: any) => {

        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    // #region HANDLE ADD UPDATE REFUNDED AMOUNT LEDGER

    const handleSubmit = async () => {
        console.log("handle add update refunded amount ledger");
    }

    const fetchProjectBankList = useCallback
        (async (page: number) => {
            return fetchProjectBankDropdown(page, {
                projectId: Number(projectId)
            });
        },
            [projectId]
        );

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            {/* Loader */}

            <Loader loading={isLoading} title={loadingMessage}>
                {" "}
                <div>
                </div>{" "}
            </Loader>

            <div className="flex-1 overflow-y-auto thin-scroll ">
                <form onSubmit={handleSubmit}>

                    <div className="space-y-4 pb-2">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Our Bank Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            <div>
                                <SingleSelectDropdownWithPagination
                                    label="Project Bank Name"
                                    required
                                    title='Select Project Bank Name'
                                    size="lg"
                                    dataFetchCallBack={fetchProjectBankList}
                                    onSelected={(item) => {
                                        if (!item) {
                                            handleFieldChange("ProjectBankListMasterId", null);
                                            setProjectWithBankData(null);
                                            return;
                                        }

                                        setProjectWithBankData(item as unknown as ProjectWithBankDetails);

                                        handleFieldChange("ProjectBankListMasterId", Number(item.value));
                                    }}
                                    initialValue={createDropdownInitialValue(formData.ProjectBankListMasterId, dropdownLabels.projectBankName)}
                                    error={errors.ProjectBankListMasterId}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Account Number"
                                    placeholder="Enter Account Number"
                                    value={projectWithBankData?.AccountNumber || ""}
                                    disabled
                                />
                            </div>
                            <div>
                                <Input
                                    label="IFSC Code"
                                    placeholder="Enter IFSC Code"
                                    value={projectWithBankData?.IFSCCode || ""}
                                    disabled
                                />
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Opposite Party Bank Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            <div>
                                <Input
                                    label="Account Holder Name"
                                    value={formData.AccountHolderName || ''}
                                    onChange={(e) => handleFieldChange('AccountHolderName', e.target.value)}
                                    error={errors.AccountHolderName}
                                    placeholder="Enter Account Holder Name"
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div>
                                <SingleSelectDropdownWithPagination
                                    label="Bank"
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
                                    label="Account Number"
                                    value={formData.AccountNumber || ''}
                                    onChange={(e) => handleFieldChange('AccountNumber', filterNumbers(e.target.value))}
                                    error={errors.AccountNumber}
                                    placeholder="Enter Account Number"
                                    required
                                />
                            </div>

                            <div>
                                <Input
                                    label="IFSC Code"
                                    value={formData.IFSCCode || ''}
                                    onChange={(e) => handleFieldChange("IFSCCode", filterIFSC(e.target.value))}
                                    error={errors.IFSCCode}
                                    placeholder="Enter IFSC Code"
                                    maxLength={11}
                                    required
                                />
                            </div>

                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Payment Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            <div>
                                <Input
                                    label="Payment For"
                                    value={formData.PaymentFor || ''}
                                    onChange={(e) => handleFieldChange('PaymentFor', e.target.value)}
                                    error={errors.PaymentFor}
                                    placeholder="Enter Payment For"
                                    required
                                />
                            </div>

                            <div>
                                <SinglePageSelection
                                    label="Payment Mode"
                                    required
                                    placeholder='Select Payment Mode'
                                    value={formData.PaymentMode || ''}
                                    onChange={(e) => handleFieldChange('PaymentMode', String(e))}
                                    options={REFUNDED_DETAILS_AMOUNT_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                    error={errors.PaymentMode}
                                />
                            </div>

                            <div>
                                <SinglePageSelection
                                    label="Amount Type"
                                    placeholder='Select Amount Type'
                                    required
                                    value={formData.AmountType || ''}
                                    onChange={(e) => handleFieldChange('AmountType', String(e))}
                                    options={REFUNDED_DETAILS_AMOUNT_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                    error={errors.AmountType}
                                />
                            </div>

                            <div>
                                <Input
                                    label='Refundable Amount'
                                    required
                                    value={formData.RefundedAmount || ''}
                                    onChange={e => handleFieldChange('RefundedAmount', e.target.value)}
                                    placeholder="Enter Refundable Amount"
                                    error={errors.RefundedAmount}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Transaction No. / Cheque No. / Demand Draft Number"
                                    required
                                    value={formData.TransactionChequeDemandDraftNumber || ''}
                                    onChange={(e) => handleFieldChange('TransactionChequeDemandDraftNumber', e.target.value)}
                                    error={errors.TransactionChequeDemandDraftNumber}
                                    placeholder="Enter Transaction / Cheque / Demand Draft Number"
                                />
                            </div>

                            <div>
                                <MultiFilePicker
                                    label="Transaction / Cheque / Demand Draft Image"
                                    placeholder="Select File"
                                    error={errors.TransactionChequeDemandDraftURL}
                                    value={transactionChequeDemandFiles}
                                    onChange={setTransactionChequeDemandFiles}
                                    availableFilesURL={transactionChequeDemandURL ?? ""}
                                    allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                    maxFiles={5}
                                    maxSizeMB={10}
                                    onRemoveExisting={(url) => {
                                        setRemovedTransactionChequeDemandUrls((prev) => [...prev, url])
                                    }}
                                />
                            </div>

                            <div>
                                <DatePickerInput
                                    label="Transaction / Cheque / Demand Draft Date"
                                    required
                                    value={formatDate_dd_mm_yyyy(formData.TransactionChequeDemandDraftDate)}
                                    error={errors.TransactionChequeDemandDraftDate}
                                    onChange={(val) => handleFieldChange('TransactionChequeDemandDraftDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                />
                            </div>

                            <div>
                                <MultiFilePicker
                                    label="Payment Receipt"
                                    placeholder="Select Payment Receipt"
                                    error={errors.PaymentReceiptURL}
                                    value={paymentReceiptFiles}
                                    onChange={setPaymentReceiptFiles}
                                    availableFilesURL={paymentReceiptURL ?? ""}
                                    allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                    maxFiles={5}
                                    maxSizeMB={10}
                                    onRemoveExisting={(url) => {
                                        setRemovedPaymentReceiptUrls((prev) => [...prev, url])
                                    }}
                                />
                            </div>


                        </div>
                    </div>
                </form>
            </div>

            <div className="mt-4">
                <BottomActionBar
                    saveText={"Save"}
                    canAction={canAction}
                    onSave={() => {
                        handleSubmit();
                    }}
                    isLoading={isLoading}
                />
            </div>
        </div >
    )
}

export default AddRefundDetails