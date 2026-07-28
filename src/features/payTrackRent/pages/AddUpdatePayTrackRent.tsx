import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/ui/components/forms';
import * as E from 'fp-ts/Either';
import { runApiWithLoader } from '@/core/utils';
import { payTrackRentService } from '@/features/payTrackRent/services/PayTrackRentService';
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import type { AddUpdatePayTrackRentRequest, PayTrackRentLedgerData } from '@/features/payTrackRent/models/PayTrackRentModel';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import MultiFilePicker from '@/ui/components/ImagePicker/MultiFilePicker';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchBankListMasterDropdown } from '@/features/bankListMaster/bankListMasterDropDown';
import { filterIFSC, filterNumbers, filterNumbersWithDecimal, isValidAccount, isValidIFSC } from '@/core/utils/fileValidation';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import { AMOUNT_TYPE, PAYMENT_MODE } from '@/core/constants';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat';
import DatePickerInput from '@/ui/components/forms/Datepicker';
import { fetchProjectBankDropdown, fetchProjectBankDropdownById } from '@/features/projectMaster/projectBankDropdown';
import { useRentListState } from '@/features/rent/context/RentListStateContext';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import type { ProjectWithBankDetails } from '@/features/projectMaster/models/ProjectMasterModel';

const initialFormState = (): AddUpdatePayTrackRentRequest => ({
  PayTrackRentId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  TenantId: null,
  TenantApplicantId: null,
  BuildingId: null,
  ProjectId: null,
  ProjectBankListMasterId: null,
  AccountHolderName: null,
  BankListMasterId: null,
  AccountNumber: null,
  IFSCCode: null,
  PaymentMode: null,
  AmountType: null,
  PayAmount: null,
  TransactionChequeDemandDraftNumber: null,
  TransactionChequeDemandDraftURL: null,
  RemoveTransactionChequeDemandDraftURL: '',
  TransactionChequeDemandDraftDate: null,
  PaymentReceiptURL: null,
  RemovePaymentReceiptURL: '',
  Tenure: null,
  ChargeType: null,
});

export const AddUpdatePayTrackRent: React.FC = () => {

  const [formData, setFormData] = useState<AddUpdatePayTrackRentRequest>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const navigate = useNavigate();
  const { PayTrackRentId } = useParams<{ PayTrackRentId?: string }>();
  const { projectId } = useProject();
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions();
  const { listState, clearPayTrackRentContext, updateListState } = useRentListState();
  const { buildingId, payTrackRentTenantApplicantId, tenantId, tenantApplicantId, activeTab, tenure, flatNumber, applicantName, totalAmount, paidTotalAmount, unitType, carpetArea } = listState;

  const [transactionChequeDemandFiles, setTransactionChequeDemandFiles] = useState<(File | string)[]>([]);
  const [removedTransactionChequeDemandUrls, setRemovedTransactionChequeDemandUrls] = useState<string[]>([]);
  const [transactionChequeDemandURL, setTransactionChequeDemandURL] = useState<string>();

  const [paymentReceiptFiles, setPaymentReceiptFiles] = useState<(File | string)[]>([]);
  const [removedPaymentReceiptUrls, setRemovedPaymentReceiptUrls] = useState<string[]>([]);
  const [paymentReceiptURL, setPaymentReceiptURL] = useState<string>();

  const [projectWithBankData, setProjectWithBankData] = useState<ProjectWithBankDetails | null>(null);

  const [originalPayAmount, setOriginalPayAmount] = useState<number>(0);

  const [dropdownLabels, setDropdownLabels] = useState<{
    projectBankName?: string;
    bankName?: string;
  }>({});

  useEffect(() => {
    if (!projectId) return;

    if (PayTrackRentId && Number(PayTrackRentId) > 0) {

      loadPayTrackRentData(Number(PayTrackRentId));

    } else {

      setFormData(prev => ({
        ...prev,
        ProjectId: Number(projectId),
        BuildingId: buildingId > 0 ? buildingId : null,
        TenantApplicantId: payTrackRentTenantApplicantId > 0 ? payTrackRentTenantApplicantId : null,
        ChargeType: activeTab || null,
        Tenure: tenure || null,
      }));
    }
  }, [projectId, PayTrackRentId, buildingId, payTrackRentTenantApplicantId, activeTab, tenure]);

  useEffect(() => {
    return () => {
      clearPayTrackRentContext();
    };
  }, [clearPayTrackRentContext]);

  const loadPayTrackRentData = async (id: number) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params = {
          PageNumber: 1,
          PageSize: 1,
          IsCheckPermission: false,
          PayTrackRentId: id,
          ProjectId: Number(projectId),
          BuildingId: buildingId > 0 ? buildingId : undefined,
        };

        const response = await payTrackRentService.apiCallPullPayTrackRentLedger(params);

        if (E.isRight(response)) {

          const data = response.right.Data?.[0] as PayTrackRentLedgerData;
          if (data) {

            setFormData({
              PayTrackRentId: data.PayTrackRentId,
              Uniquekey: data.Uniquekey,
              TenantId: data.TenantId,
              TenantApplicantId: data.TenantApplicantId,
              BuildingId: data.BuildingId,
              ProjectId: data.ProjectId,
              ProjectBankListMasterId: data.ProjectBankListMasterId,
              AccountHolderName: data.AccountHolderName,
              BankListMasterId: data.BankListMasterId,
              AccountNumber: data.AccountNumber,
              IFSCCode: data.IFSCCode,
              PaymentMode: data.PaymentMode,
              AmountType: data.AmountType,
              PayAmount: data.PayAmount,
              TransactionChequeDemandDraftNumber: data.TransactionChequeDemandDraftNumber,

              TransactionChequeDemandDraftURL: null,
              RemoveTransactionChequeDemandDraftURL: '',

              TransactionChequeDemandDraftDate: data.TransactionChequeDemandDraftDate || null,

              PaymentReceiptURL: null,
              RemovePaymentReceiptURL: '',

              Tenure: data.Tenure,
              ChargeType: data.ChargeType,
            });
            setOriginalPayAmount(Number(data.PayAmount || 0));
            setTransactionChequeDemandFiles([]);
            setTransactionChequeDemandURL(data.TransactionChequeDemandDraftURL || "")
            setRemovedTransactionChequeDemandUrls([]);

            setPaymentReceiptFiles([]);
            setPaymentReceiptURL(data.PaymentReceiptURL || "")
            setRemovedPaymentReceiptUrls([]);

            setDropdownLabels({
              bankName: data.BankName || "",
              projectBankName: data.ProjectBankName || "",
            });

            if (data.ProjectId) {
              fetchProjectBankDropdownById(Number(projectId)).then((bank) => {
                if (!bank) return;
                setProjectWithBankData(bank);
              });
            }

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
      'Loading Pay Track Rent Data'
    );
  };

  const handleFieldChange = (field: keyof AddUpdatePayTrackRentRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.AccountHolderName || formData.AccountHolderName.trim() === '') {
      newErrors.AccountHolderName = 'Account Holder Name is required.';
    }
    if (!formData.AccountNumber || formData.AccountNumber.trim() === '') {
      newErrors.AccountNumber = 'Account Number is required.';
    } else if (!isValidAccount(formData.AccountNumber)) {
      newErrors.AccountNumber = "Enter a valid Account Number (6–18 digits)";
    }

    if (!formData.IFSCCode || formData.IFSCCode.trim() === '') {
      newErrors.IFSCCode = 'IFSC Code is required.';
    } else if (!isValidIFSC(formData.IFSCCode)) {
      newErrors.IFSCCode = "Enter a valid IFSC Code";
    }


    if (!formData.BankListMasterId || formData.BankListMasterId <= 0) {
      newErrors.BankListMasterId = "Bank is required";
    }

    if (!formData.PaymentMode || formData.PaymentMode.trim() === '') {
      newErrors.PaymentMode = 'Payment Mode is required.';
    }

    if (!formData.AmountType || formData.AmountType.trim() === '') {
      newErrors.AmountType = 'Amount Type is required.';
    }


    if (!formData.PayAmount || formData.PayAmount <= 0) {
      newErrors.PayAmount = 'Amount is required and must be greater than 0.';
    }

    const toNumber = (v: any) => Number(String(v ?? '0').replace(/[₹,]/g, '').trim()) || 0;

    const total = toNumber(totalAmount);
    const alreadyPaid = toNumber(paidTotalAmount);
    const pay = toNumber(formData.PayAmount);

    const effectivePaid = Number(PayTrackRentId) > 0 ? alreadyPaid - originalPayAmount + pay : alreadyPaid + pay;

    const remaining = total - effectivePaid;

    if (remaining < 0) {
      newErrors.PayAmount = `Amount exceeds remaining balance (₹${total - alreadyPaid})`;
    }


    if (!formData.TransactionChequeDemandDraftDate || formData.TransactionChequeDemandDraftDate.trim() === '') {
      newErrors.TransactionChequeDemandDraftDate = 'Transaction Cheque / Demand / Draft Date is required.';
    }

    if (!formData.ProjectBankListMasterId || formData.ProjectBankListMasterId <= 0) {
      newErrors.ProjectBankListMasterId = "Project Bank is required";
    }


    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const buildMultipartFormData = (): FormData => {
    const fd = new FormData();

    fd.append('PayTrackRentId', String(formData.PayTrackRentId ?? 0));
    fd.append('Uniquekey', formData.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6');
    fd.append('TenantId', tenantId > 0 ? String(tenantId) : '0');
    fd.append('TenantApplicantId', tenantApplicantId > 0 ? String(tenantApplicantId) : '0');
    fd.append('BuildingId', String(formData.BuildingId ?? 0));
    fd.append('ProjectId', String(formData.ProjectId ?? projectId ?? 0));
    fd.append('ProjectBankListMasterId', String(formData.ProjectBankListMasterId ?? 0));
    fd.append('AccountHolderName', formData.AccountHolderName || '');
    fd.append('BankListMasterId', String(formData.BankListMasterId ?? 0));
    fd.append('AccountNumber', formData.AccountNumber || '');
    fd.append('IFSCCode', formData.IFSCCode || '');
    fd.append('PaymentMode', formData.PaymentMode || '');
    fd.append('AmountType', formData.AmountType || '');
    fd.append('PayAmount', String(formData.PayAmount ?? 0));
    fd.append('TransactionChequeDemandDraftNumber', formData.TransactionChequeDemandDraftNumber || '');
    fd.append('TransactionChequeDemandDraftDate', formData.TransactionChequeDemandDraftDate || '');
    fd.append('Tenure', tenure || '');
    fd.append('ChargeType', activeTab || '');


    transactionChequeDemandFiles.forEach(file => {
      if (file instanceof File) {
        fd.append('TransactionChequeDemandDraftURL', file);
      }
    });
    fd.append('RemoveTransactionChequeDemandDraftURL', removedTransactionChequeDemandUrls.join(','));

    paymentReceiptFiles.forEach(file => {
      if (file instanceof File) {
        fd.append('PaymentReceiptURL', file);
      }
    });
    fd.append('RemovePaymentReceiptURL', removedPaymentReceiptUrls.join(','));
    return fd;
  };

  const handleSubmit = async () => {

    setErrors({});

    const validation = validateForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const toNumber = (v: any) =>
      Number(String(v ?? '0').replace(/[₹,]/g, '').trim()) || 0;

    const alreadyPaid = toNumber(paidTotalAmount);
    const pay = toNumber(formData.PayAmount);

    const effectivePaid =
      Number(PayTrackRentId) > 0
        ? alreadyPaid - originalPayAmount + pay
        : alreadyPaid + pay;


    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = buildMultipartFormData();
        const response = await payTrackRentService.apiCallAddUpdatePayTrackRent(payload);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          updateListState({
            ...listState,
            paidTotalAmount: effectivePaid
          });

          navigate(-1);

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
      formData.PayTrackRentId === 0 ? 'Adding Pay Track Rent' : 'Updating Pay Track Rent'
    );
  };


  const fetchProjectBankList = useCallback(
    async (pageNumber: number, params?: { value?: string }) => {
      return fetchProjectBankDropdown(pageNumber, {
        projectId: projectId || 0,
        bankName: params?.value || "",
        isCheckPermission: false
      });
    },
    [projectId]
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>
      <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">


            <div className="mt-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FieldItem label="Flat Number" value={flatNumber || '-'} />
                <FieldItem label="Applicant Name" value={applicantName || '-'} />
                {!["", "-"].includes(tenure?.trim() ?? "") && (
                  <FieldItem label="Tenure" value={tenure} />
                )}
                <FieldItem label="Charge Type" value={activeTab || '-'} />
                <FieldItem label="Carpet Area (SqFt)" value={carpetArea ? `${carpetArea} SqFt` : '-'} />
                <FieldItem label="Unit Type" value={unitType || '-'} />
                <FieldItem label="Total Amount" value={totalAmount > 0 ? `₹${totalAmount}` : '-'} />
                <FieldItem label="Paid Total Amount" value={paidTotalAmount > 0 ? `₹${paidTotalAmount}` : '-'} />
              </div>
            </div>

            {/* Payment Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                Payment Details (Payee)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <div>
                  <Input
                    label="Account Holder Name"
                    value={formData.AccountHolderName || ''}
                    onChange={(e) => handleFieldChange('AccountHolderName', e.target.value)}
                    error={errors.AccountHolderName}
                    placeholder="Enter Account Holder Name"
                    maxLength={50}
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
                    maxLength={15}
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

                  <SinglePageSelection
                    label="Amount Type"
                    placeholder='Select Amount Type'
                    required
                    value={formData.AmountType || ''}
                    onChange={(e) => handleFieldChange('AmountType', String(e))}
                    options={AMOUNT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                    error={errors.AmountType}
                  />
                </div>

                <div>
                  <Input
                    label="Amount (₹)"
                    required
                    value={formData.PayAmount ?? ''}
                    onChange={(e) => handleFieldChange('PayAmount', filterNumbersWithDecimal(e.target.value))}
                    error={errors.PayAmount}
                    placeholder="Enter Amount"
                  />
                </div>

                <div>
                  <Input
                    label="Transaction / Cheque / Demand Draft Number"
                    value={formData.TransactionChequeDemandDraftNumber || ''}
                    onChange={(e) => handleFieldChange('TransactionChequeDemandDraftNumber', e.target.value)}
                    error={errors.TransactionChequeDemandDraftNumber}
                    placeholder="Enter Transaction / Cheque / Demand Draft Number"
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
                    label="Transaction / Cheque / Demand Draft"
                    placeholder="Select Transaction / Cheque / Demand Draft"
                    error={errors.TransactionChequeDemandDraftURL}
                    value={transactionChequeDemandFiles}
                    onChange={setTransactionChequeDemandFiles}
                    availableFilesURL={transactionChequeDemandURL ?? ""}
                    allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                    maxFiles={5}
                    onRemoveExisting={(url) => {
                      setRemovedTransactionChequeDemandUrls((prev) => [...prev, url])
                    }}
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
                    onRemoveExisting={(url) => {
                      setRemovedPaymentReceiptUrls((prev) => [...prev, url])
                    }}
                  />
                </div>
              </div>

            </div>


            {/* Bank Details Section */}
            <div className="space-y-4 pt-5">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Developer Bank Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <div>
                  <SingleSelectDropdownWithPagination
                    label="Project Bank Name"
                    required
                    title="Select Project Bank Name"
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
                {projectWithBankData && (
                  <>
                    <div>
                      <Input
                        label="Account Number"
                        placeholder="Enter Account Number"
                        value={projectWithBankData?.AccountNumber || ""}
                        disabled
                      />
                    </div>
                    <div>
                      <Input label="IFSC Code" placeholder="Enter IFSC Code" value={projectWithBankData?.IFSCCode || ""} disabled />
                    </div>
                    <div>
                      <Input label="Branch" placeholder="Enter Branch" value={projectWithBankData?.Branch || ""} disabled />
                    </div>
                    <div>
                      <Input label="Account Type" placeholder="Enter Account Type" value={projectWithBankData?.AcType || ""} disabled />
                    </div>
                    <div>
                      <Input label="Nature Of Account" placeholder="Enter Nature Of Account" value={projectWithBankData?.NatureOfAccount || ""} disabled />
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>


        </form>
      </div>
      <BottomActionBar
        cancelText="Cancel"
        saveText={"Add"}
        onCancel={() => navigate(-1)}
        onSave={() => {
          handleSubmit();
        }}
        canAction={canAction}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AddUpdatePayTrackRent;

