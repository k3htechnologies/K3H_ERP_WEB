import { ExpandableCard } from "@/ui/components/Card/ExpandableCard";
import type { FilterWithPaginationPaymentLedgerCrm, PaymentLedgerCrmModelData, AddUpdatePaymentLedgerCrm, } from "@/features/crmPayTrackScreen/models/PaymentLedgerCrmModel";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { runApiWithLoader } from "@/core/utils";
import { paymentLedgerCrmService } from "@/features/crmPayTrackScreen/services/PaymentLedgerCrmService";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { Modal } from "@/ui/components/Modal/Modal";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { PAYMENT_FOR_OPTIONS, PAYMENT_MODE, PAYMENT_RECEIVED_FROM_OPTIONS } from '@/core/constants';
import { fetchBankListMasterDropdown } from "@/features/bankListMaster/bankListMasterDropDown";
import { fetchProjectBankDropdown } from '@/features/projectMaster/projectBankDropdown';
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { Input } from "@/ui/components/forms";
import DatePickerInput from "@/ui/components/forms/Datepicker";


const initialFormState = (): AddUpdatePaymentLedgerCrm => ({
    PayTrackPaymentLedgerId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    BookingId: null,
    ProjectId: null,
    BookingOtherChargesId: 0,
    ChargeName: '',
    PaymentFor: '',
    PaymentMode: '',
    PaymentReceivedFrom: '',
    BankListMasterId: 0,
    BankName: '',
    ProjectBankListMasterId: 0,
    ProjectBankName: '',
    ProjectAccountNumber: '',
    ProjectIFSCCode: '',
    ReceivedAmount: 0,
    TransactionChequeDemandDraftNumber: '',
    TransactionChequeDemandDraftURL: '',
    TransactionChequeDemandDraftDate: '',
    ApprovalStatus: '',
    IsApproval: false,
    PaymentReceiptURL: '',
    CreatedById: 0,
    CreatedBy: '',
    CreatedDate: '',
    ModifiedById: 0,
    ModifiedBy: '',
    ModifiedDate: '',
})


export const PaymentLedgerCrm: React.FC = () => {

    const [paymentLedgerCrmList, setPaymentLedgerCrmList] = useState<PaymentLedgerCrmModelData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [formData, setFormData] = useState<AddUpdatePaymentLedgerCrm>(() => initialFormState());
    const [bankName, setBankName] = useState<string>("");
    const [bankListMasterId, setBankListMasterId] = useState<number | null>(null);
    const [projectBankListMasterId, setProjectBankListMasterId] = useState<number | null>(null);
    const [selectedBankProject, setSelectedBankProject] = useState<any | null>(null);


    //ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const { canAction } = useMenuPermissions("/payTrack");

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject();
    //#endregion

    //#region BOOKING ID
    const { BookingId } = useParams<{ BookingId?: string }>();
    const bookingId = BookingId ? Number(BookingId) : 0;
    //#endregion

    const { addToast } = useToast();

    useEffect(() => {
        if (projectId && bookingId) {
            loadPaymentLedgerCrm();
        }
    }, [projectId, bookingId]);


    const handlePaymentLedgerCrmModal = () => {
        setIsAddUpdateModalOpen(true);
    }

    const handleFieldChange = (field: keyof AddUpdatePaymentLedgerCrm, value: any) => {

        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    // #region DATA LOAD
    const loadPaymentLedgerCrm = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationPaymentLedgerCrm = {
                    ProjectId: Number(projectId),
                    BookingId: bookingId,
                };

                const response = await paymentLedgerCrmService.apiCallPullPaymentLedgerCrm(params);

                if (E.isRight(response)) {

                    setPaymentLedgerCrmList(response.right.Data);
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
            "Loading Payment Ledger Crm Details"
        )

    }

    // #endregion

    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>
            <TableActionToolbar
                isShowSearchBar={false}

                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handlePaymentLedgerCrmModal}

            />
            <div className="mt-2 flex flex-col gap-3">
                {paymentLedgerCrmList.map((item, index) => (
                    <ExpandableCard
                        key={item.PayTrackPaymentLedgerId}
                        showline={true}
                        title={
                            <div className="flex items-center justify-between w-full">

                                {/* LEFT SIDE */}
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-500">{index + 1}</span>

                                    <span className="font-semibold">
                                        {item.PaymentFor}
                                    </span>

                                </div>

                                {/* RIGHT SIDE */}

                            </div>
                        }

                        child={
                            <div className="space-y-6">
                                <div className="space-y-0 p-2">
                                    <div className=""></div>
                                    <FieldItem label="PAYMENT MODE" value={item.PaymentMode || '-'} isRow={true} />

                                    <FieldItem label="BANK NAME" value={item.BankName || '-'} isRow={true} />
                                    {/* TODO: NEED TO ADD AMOUNT TYPE */}
                                    <FieldItem label="AMOUNT TYPE" value={'-'} isRow={true} />
                                    {/* TODO: NEED TO ADD PAYMENT TYPE */}
                                    <FieldItem label="PAYMENT TYPE" value={'-'} isRow={true} />
                                    <FieldItem label="TRANSACTION No./ CHEQUE No./ DEMAND DRAFT NO." value={item.TransactionChequeDemandDraftNumber || '-'} isRow={true} />
                                    <FieldItem label="TRANSACTION IMAGE/ CHEQUE IMAGE/ DEMAND DRAFT IMAGE" value={item.TransactionChequeDemandDraftURL || '-'} isRow={true} />
                                    <FieldItem label="TRANSACTION DATE/ CHEQUE DATE/ DEMAND DRAFT DATE" value={formatDate_dd_MonthName_yy(item.TransactionChequeDemandDraftDate) || '-'} isRow={true} />
                                    <FieldItem label="CREATED BY / DATE" value={`${item.CreatedBy} (${formatDate_dd_MonthName_yy(item.CreatedDate)})`} isRow={true} />
                                </div>
                            </div>
                        }
                    />
                ))}

            </div>

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => setIsAddUpdateModalOpen(false)}
                title="Add Payment Ledger">
                <div>
                    <SinglePageSelection
                        label="Payment For"
                        required
                        placeholder='Select Payment For'
                        value={formData.PaymentFor || ''}
                        onChange={(e) => handleFieldChange('PaymentFor', String(e))}
                        options={PAYMENT_FOR_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                        error={errors.PaymentFor}
                    />
                </div>
                <div>
                    <SinglePageSelection
                        label="Payment Mode"
                        required
                        placeholder='Select Payment Mode'
                        value={formData.PaymentMode || ''}
                        onChange={(e) => handleFieldChange('PaymentMode', String(e))}
                        options={PAYMENT_MODE.map((opt) => ({ label: opt.name, value: opt.id }))}
                        error={errors.PaymentMode}
                    />
                </div>
                <div>
                    <SingleSelectDropdownWithPagination
                        label="Bank Name"
                        required
                        title="Select Bank Name"
                        size="lg"
                        dataFetchCallBack={fetchBankListMasterDropdown}
                        onSelected={(item) => {
                            if (!item) {
                                setBankListMasterId(null);
                                setBankName("");
                                return;
                            }
                            setBankListMasterId(Number(item.value));
                            setBankName(item.label);
                        }}
                        initialValue={createDropdownInitialValue(bankListMasterId, bankName)}
                    />
                </div>
                <div>
                    <SinglePageSelection
                        label="Payment From"
                        required
                        placeholder='Select Payment From'
                        value={formData.PaymentReceivedFrom || ''}
                        onChange={(e) => handleFieldChange('PaymentReceivedFrom', String(e))}
                        options={PAYMENT_RECEIVED_FROM_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                        error={errors.PaymentFor}
                    />
                </div>

                <div>
                    <SingleSelectDropdownWithPagination
                        label="Project Wise Bank"
                        required
                        title='Select Project Wise Bank'
                        dataFetchCallBack={(page, params) => fetchProjectBankDropdown(page, { ...params, projectId: Number(projectId) })}
                        onSelected={(item) => {
                            if (!item) {
                                setProjectBankListMasterId(null);
                                setBankName("");
                                setSelectedBankProject(null);
                                return;
                            }
                            setProjectBankListMasterId(Number(item.value));
                            setSelectedBankProject(item);
                            setBankName(item.label);

                        }}
                        initialValue={createDropdownInitialValue(projectBankListMasterId, bankName)}
                    />
                </div>

                <div>
                    <Input
                        label="Account Number"
                        value={selectedBankProject?.AccountNumber || ""}
                        disabled
                    />
                </div>
                <div>
                    <Input
                        label="IFSC Code"
                        value={selectedBankProject?.IFSCCode || ""}
                        disabled
                    />
                </div>
                <div>
                    <Input
                        label="Branch"
                        value={selectedBankProject?.Branch || ""}
                        disabled
                    />
                </div>
                <div>
                    <Input
                        label="Account Type"
                        value={selectedBankProject?.AcType || ""}
                        disabled
                    />
                </div>

                <div>
                    <Input
                        label="Received Amount"
                        value={formData.ReceivedAmount || ""}
                        onChange={(e) => handleFieldChange('ReceivedAmount', Number(e))}
                        error={errors.ReceivedAmount}
                    />
                </div>
                <div>
                    <Input
                        label="Transaction No./ Cheque No./ Demand Draft No."
                        value={formData.TransactionChequeDemandDraftNumber || ""}
                        onChange={(e) => handleFieldChange('TransactionChequeDemandDraftNumber', String(e))}
                        error={errors.TransactionChequeDemandDraftNumber}
                    />
                </div>
                <div>
                    <Input
                        label="Transaction/Cheque Image/ Demand Draft Image"
                        value={formData.TransactionChequeDemandDraftURL || ""}
                        onChange={(e) => handleFieldChange('TransactionChequeDemandDraftURL', String(e))}
                        error={errors.TransactionChequeDemandDraftURL}
                    />
                </div>
                <div>
                    <DatePickerInput
                        label="Transaction/Cheque Date/ Demand Draft Date"
                        value={formData.TransactionChequeDemandDraftDate || ""}
                        onChange={(e) => handleFieldChange('TransactionChequeDemandDraftDate', String(e))}
                        error={errors.TransactionChequeDemandDraftDate}
                    />
                </div>
            </Modal >
        </div>
    )
}

export default PaymentLedgerCrm