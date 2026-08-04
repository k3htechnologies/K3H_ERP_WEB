import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AddUpdateCompanyMasterWithBankDetailsRequest, CompanyMasterWithBankDetails, DeleteCompanyMasterWithBankDetailsRequest, FilterWithPaginationCompanyMasterWithBankDetails } from "@/features/companyMaster/models/CompanyMasterModel";
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import useToast from "@/core/hooks/useToast";
import { companyMasterService } from "@/features/companyMaster/services/CompanyMasterService";
import * as E from 'fp-ts/Either';
import { Loader } from "@/core/utils/loader";
import { Button, Input } from "@/ui/components/forms";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Edit, Trash2 } from "lucide-react";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useNavigate, useParams } from "react-router-dom";
import { useCompanyListState } from "@/features/companyMaster/context/CompanyListStateContext";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Modal } from "@/ui/components/Modal/Modal";
import { filterIFSC, filterNumbers, hasAnyDocumentFile, isValidIFSC } from "@/core/utils/fileValidation";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchBankListMasterDropdown } from "@/features/bankListMaster/bankListMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { ACTIVE_INACTIVE_OPTIONS, BANK_ACCOUNT_TYPE, NATURE_OF_ACCOUNT } from "@/core/constants";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";

const initialFormState = (): AddUpdateCompanyMasterWithBankDetailsRequest => ({
   CompanyWithBankDetailsId: 0,
   CompanyId: 0,
   Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
   BeneficiaryAccountHolderName: '',
   BankListMasterId: 0,
   AccountNumber: '',
   Branch: '',
   IFSCCode: '',
   AcType: '',
   NatureOfAccount: '',
   Status: '',
   MICRCode: '',
   CancelChequeURL: null,
   RemoveCancelChequeURLURL: ""
});

export const CompanyBank: React.FC = () => {
   
   const [companyBankList, setCompanyBankList] = useState<CompanyMasterWithBankDetails[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [loadingMessage, setLoadingMessage] = useState('');
   const [formData, setFormData] = useState<AddUpdateCompanyMasterWithBankDetailsRequest>(() => initialFormState());
   const [editCompanyMasterWithBankDetails, setEditCompanyMasterWithBankDetails] = useState<CompanyMasterWithBankDetails | null>(null);
   const [isConfirmationDialogBoxOpenForBankDetails, setIsConfirmationDialogBoxOpenForBankDetails] = useState(false)
   const [errors, setErrors] = useState<{ [k: string]: string }>({});
   const [deleteCompanyMasterWithBankDetails, setDeleteCompanyMasterWithBankDetails] = useState<CompanyMasterWithBankDetails | null>(null);
   const [isAddUpdateModalOpenForBankDetails, setIsAddUpdateModalOpenForBankDetails] = useState(false);
   const [cancelChequeFiles, setCancelChequeFiles] = useState<(File | string)[]>([]);
   const [removeCancelChequeUrls, setRemoveCancelChequeUrls] = useState<string[]>([]);
   const [cancelChequeURL, setCancelChequeURL] = useState<string>();
   const { addToast } = useToast();
   const { canAction } = useMenuPermissions();
   const navigate = useNavigate();
   const { listState } = useCompanyListState();
   const companyName = listState.companyName || '';
   const { CompanyId } = useParams<{ CompanyId?: string }>();
   const companyId = CompanyId ? Number(CompanyId) : listState.companyId;
   const [dropdownLabels, setDropdownLabels] = useState<{ bankName?: string; }>({});

   useEffect(() => {

      if (listState.companyId) {
         loadCompanyMasterWithBankDetails();
      }
   }, [listState.companyId]);

   const loadCompanyMasterWithBankDetails = async () => {
      runApiWithLoader(
         setIsLoading,
         setLoadingMessage,
         async () => {
            const params: FilterWithPaginationCompanyMasterWithBankDetails = {
               CompanyId: Number(companyId),
            }

            const response = await companyMasterService.apiCallPullCompanyMasterWithBankDetails(params);

            if (E.isRight(response)) {

               setCompanyBankList(response.right.Data);

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
         'Loading Company Bank Data'
      );
   };

   useEffect(() => {
      if (isAddUpdateModalOpenForBankDetails) {
         if (editCompanyMasterWithBankDetails) {
            setFormData({
               CompanyWithBankDetailsId: editCompanyMasterWithBankDetails.CompanyWithBankDetailsId,
               Uniquekey: editCompanyMasterWithBankDetails.Uniquekey || initialFormState().Uniquekey,
               BeneficiaryAccountHolderName: editCompanyMasterWithBankDetails.BeneficiaryAccountHolderName || "",
               CompanyId: editCompanyMasterWithBankDetails.CompanyId,
               BankListMasterId: editCompanyMasterWithBankDetails.BankListMasterId || 0,
               AccountNumber: editCompanyMasterWithBankDetails.AccountNumber || "",
               Branch: editCompanyMasterWithBankDetails.Branch || "",
               IFSCCode: editCompanyMasterWithBankDetails.IFSCCode || "",
               AcType: editCompanyMasterWithBankDetails.AcType || "",
               NatureOfAccount: editCompanyMasterWithBankDetails.NatureOfAccount || "",
               Status: editCompanyMasterWithBankDetails.Status || "",
               MICRCode: editCompanyMasterWithBankDetails.MICRCode || "",
               CancelChequeURL: null,
               RemoveCancelChequeURLURL: ""
            })
            setCancelChequeFiles([]);
            setCancelChequeURL(editCompanyMasterWithBankDetails.CancelChequeURL || '');
            setRemoveCancelChequeUrls([]);
            setDropdownLabels({
               bankName: editCompanyMasterWithBankDetails.BankName || ""
            });
         } else {
            setFormData(initialFormState());
            setCancelChequeFiles([]);
            setCancelChequeURL('');
            setRemoveCancelChequeUrls([]);
         }
         setErrors({});
      }
   }, [isAddUpdateModalOpenForBankDetails, editCompanyMasterWithBankDetails]);

   const handleEditCompanyMasterBankDetails = useCallback((row: CompanyMasterWithBankDetails) => {
      setEditCompanyMasterWithBankDetails({
         ...row,
         BeneficiaryAccountHolderName: row.BeneficiaryAccountHolderName || '',
         AcType: row.AcType || '',
         NatureOfAccount: row.NatureOfAccount || '',
         Branch: row.Branch || '',
         BankListMasterId: row.BankListMasterId || 0,
         AccountNumber: row.AccountNumber || '',
         IFSCCode: row.IFSCCode || ''
      })
      setIsAddUpdateModalOpenForBankDetails(true);
   }, [])

   const handleConfirmationDialogBoxOpenForCompanyMasterBankDetails = useCallback((row: CompanyMasterWithBankDetails) => {
      setDeleteCompanyMasterWithBankDetails(row)
      setIsConfirmationDialogBoxOpenForBankDetails(true)
   }, [])

   const CompanyBankColumns = useMemo<TableColumn[]>(
      () => [
         {
            key: 'BeneficiaryAccountHolderName',
            label: 'Account Holder',
            width: '33',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: (value) => (
               <TooltipText
                  text={value || '-'}
                  maxWidth="250px"
                  tooltipThreshold={25}
               />
            )
         },
         {
            key: 'NatureOfAccount',
            label: 'Nature Of Account',
            width: '33',
            sortable: false,
            align: 'left',
            render: (value) => value || ''
         },
         {
            key: 'BankName',
            label: 'Bank Name',
            width: '33',
            sortable: false,
            align: 'left',
            render: (value) => value || ''
         },
         {
            key: 'AcType',
            label: 'Account Type',
            width: '33',
            sortable: false,
            align: 'left',
            render: (value) => value || ''
         },
         {
            key: 'AccountNumber',
            label: 'Account Number',
            width: '33',
            sortable: false,
            align: 'left',
            render: (value) => value || ''
         },
         {
            key: 'IFSCCode',
            label: 'IFSC',
            width: '33',
            sortable: false,
            align: 'left',
            render: (value) => value || ''
         },
         {
            key: 'Branch',
            label: 'Branch',
            width: '33',
            sortable: false,
            align: 'left',
            render: (value) => value || ''
         },
         {
            key: 'Status',
            label: 'Status',
            width: '33',
            sortable: false,
            align: 'left',
            render: (value) => value || ''
         },
         {
            key: 'MICRCode',
            label: 'MICR Code',
            width: '33',
            sortable: false,
            align: 'left',
            render: (value) => value || ''
         },
         {
            key: 'CancelChequeURL',
            label: 'Document',
            width: '15',
            sortable: false,
            align: 'left',
            render: (_value: string, row: any) => {
               const urls = parseDocumentUrls(row.CancelChequeURL);

               if (!urls || urls.length === 0) {
                  return <span>-</span>;
               }

               return (
                  <div className="flex items-center justify-between gap-2 w-full">
                     <MultiImageViewer
                        images={urls}
                        title="Document"
                        triggerLabel={
                           <TooltipText
                              text="View"
                              maxWidth="250px"
                              tooltipThreshold={25}
                           />
                        }
                     />
                  </div>
               );
            }
         },
         {
            key: "Actions",
            label: "Actions",
            width: '20',
            sortable: false,
            fixed: "right",
            align: "center",
            render: (_value, row) => {
               if (!canAction) return null;
               return (
                  <div className="flex items-center justify-end ml-2 w-20">
                     {canAction ?
                        <>
                           <Button
                              onClick={(e) => {
                                 e.preventDefault()
                                 e.stopPropagation()
                                 handleEditCompanyMasterBankDetails(row)
                              }}
                              color='transparent'
                              fullWidth
                              isborderRadius
                              size='sm'
                              title="Edit Bank Account"
                              style={{
                                 color: '#0B3251',
                                 padding: '0px 8px'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#1A4D73')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#0B3251')}
                           >
                              <Edit className="h-4 w-4" />
                           </Button>

                           <Button
                              onClick={(e) => {
                                 e.preventDefault()
                                 e.stopPropagation()
                                 handleConfirmationDialogBoxOpenForCompanyMasterBankDetails(row)
                              }}
                              color='transparent'
                              fullWidth
                              isborderRadius
                              size='sm'
                              style={{
                                 color: 'red',
                                 padding: '0px 8px'
                              }}
                              title="Delete Bank Account"
                           >
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </>
                        : ""}
                  </div>
               )
            }
         }
      ], []);

   const handleFieldChange = (field: keyof AddUpdateCompanyMasterWithBankDetailsRequest, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (errors[field]) {
         setErrors((prev) => ({ ...prev, [field]: "" }));
      }
   };

   const handleAddCompanyMasterWithBankDetailsModal = () => {
      setEditCompanyMasterWithBankDetails(null);
      setFormData(initialFormState());
      setErrors({});
      setCancelChequeFiles([]);
      setCancelChequeURL('');
      setRemoveCancelChequeUrls([]);
      setIsAddUpdateModalOpenForBankDetails(true);
   }

   const validateAddCompanyMasterWithBankDetailsForm = (): {

      isValid: boolean
      errorsForBankDetails: { [key: string]: string }

   } => {

      const newErrors: { [key: string]: string } = {}

      if (formData.BeneficiaryAccountHolderName.trim() === "") {
         newErrors.BeneficiaryAccountHolderName = "Beneficiary Account Holder Name is required"
      }

      if (formData.AcType.trim() === "") {
         newErrors.AcType = "Account type is required";
      }

      if (formData.NatureOfAccount.trim() === "") {
         newErrors.NatureOfAccount = "Nature Of Account is required";
      }

      if (!formData.BankListMasterId) {
         newErrors.BankListMasterId = "Bank Name is required";
      }

      if (!formData.Branch?.trim()) {
         newErrors.Branch = 'Bank Branch Name is required.'
      } else if (formData.Branch.trim().length > 50) {
         newErrors.Branch = 'Bank Branch Name must be at most 50 characters'
      }

      if (!formData.AccountNumber?.trim()) {
         newErrors.AccountNumber = 'Account Number is required.'
      } else if (formData.AccountNumber.trim().length > 18) {
         newErrors.AccountNumber = 'Account Number must be at most 50 characters'
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
      if (!formData.MICRCode?.trim()) {
         newErrors.MICRCode = 'MICR Code is required.'
      } else if (formData.MICRCode?.trim().length < 10) {
         newErrors.MICRCode = 'MICR Code must be at most 10 Digit'

      }
      if (!formData.Status?.trim()) {
         newErrors.Status = 'Status is required.'
      }
      if (!hasAnyDocumentFile(cancelChequeFiles, cancelChequeURL, removeCancelChequeUrls)) {
         newErrors.CancelChequeURL = "File is required.";
      }
      return {
         isValid: Object.keys(newErrors).length === 0,
         errorsForBankDetails: newErrors
      }
   }

   const PushCompanyMasterWithBankDetailsFormData = (): FormData => {

      const fd = new FormData();

      fd.append("CompanyWithBankDetailsId", formData.CompanyWithBankDetailsId.toString());
      fd.append("Uniquekey", formData.Uniquekey ?? "");
      fd.append("CompanyId", String(companyId));
      fd.append("BeneficiaryAccountHolderName", formData.BeneficiaryAccountHolderName ?? "");
      fd.append("BankListMasterId", formData.BankListMasterId.toString());
      fd.append("AccountNumber", formData.AccountNumber ?? "");
      fd.append("Branch", formData.Branch ?? "");
      fd.append("IFSCCode", formData.IFSCCode ?? "");
      fd.append("AcType", formData.AcType ?? "");
      fd.append("NatureOfAccount", formData.NatureOfAccount ?? "")
      fd.append("MICRCode", formData.MICRCode ?? "");
      fd.append("Status", formData.Status ?? "");

      cancelChequeFiles.forEach(file => {
         if (file instanceof File) {
            fd.append('CancelChequeURL', file);
         }
      });

      fd.append('RemoveCancelChequeURLURL', removeCancelChequeUrls.join(','));

      return fd;
   }

   const handleAddUpdateCompanyMasterWithBankDetails = async (e: React.FormEvent) => {

      e.preventDefault();

      setErrors({})

      const validation = validateAddCompanyMasterWithBankDetailsForm()

      if (!validation.isValid) {

         setErrors(validation.errorsForBankDetails)

         return
      }

      await runApiWithLoader(
         setIsLoading,
         setLoadingMessage,

         async () => {

            const payload = PushCompanyMasterWithBankDetailsFormData();

            const response = await companyMasterService.apiCallAddUpdateCompanyMasterWithBankDetails(payload);

            if (E.isRight(response)) {

               setIsAddUpdateModalOpenForBankDetails(false);

               const isAdd = formData.CompanyWithBankDetailsId === 0;

               if (isAdd) {

                  const newRecord = response.right.Data[0] as CompanyMasterWithBankDetails

                  setCompanyBankList(prevData => [newRecord, ...prevData]);

                  addToast({ type: 'success', title: response.right.SuccessMessage[0] })

               } else {

                  const updatedRecord = response.right.Data[0] as CompanyMasterWithBankDetails;

                  setCompanyBankList(prevData =>
                     prevData.map(item =>
                        item.CompanyWithBankDetailsId === formData.CompanyWithBankDetailsId
                           ? updatedRecord
                           : item
                     )
                  )

                  addToast({ type: 'success', title: response.right.SuccessMessage[0] })
               }

               setEditCompanyMasterWithBankDetails(null);
               setCancelChequeFiles([])
               setCancelChequeURL('')
               setRemoveCancelChequeUrls([])

            } else {
               addToast({ type: "error", title: response.left?.message });
            }
            return response;
         },
         undefined,
         (error: any) => {

            addToast({ type: 'error', title: error.message })
         },
         undefined,

         Number(formData.CompanyWithBankDetailsId) === 0 ? 'Add Bank Details' : 'Update Bank Details'
      )
   };

   const handleDeleteCompanyMasterWithBankDetails = async () => {
      setIsConfirmationDialogBoxOpenForBankDetails(false);

      if (!deleteCompanyMasterWithBankDetails) return

      await runApiWithLoader(
         setIsLoading,
         setLoadingMessage,

         async () => {
            const params: DeleteCompanyMasterWithBankDetailsRequest = {
               CompanyWithBankDetailsId: deleteCompanyMasterWithBankDetails.CompanyWithBankDetailsId,
               Uniquekey: deleteCompanyMasterWithBankDetails.Uniquekey,
               CompanyId: deleteCompanyMasterWithBankDetails.CompanyId
            }

            const response = await companyMasterService.apiCallDeleteCompanyMasterWithBankDetails(params);

            if (E.isRight(response)) {

               setCompanyBankList(prevData => prevData.filter(item => item.CompanyWithBankDetailsId !== deleteCompanyMasterWithBankDetails.CompanyWithBankDetailsId));

               addToast({ type: 'success', title: response.right.SuccessMessage[0] })

               setIsConfirmationDialogBoxOpenForBankDetails(false);

               setDeleteCompanyMasterWithBankDetails(null);

            } else {
               addToast({ type: 'error', title: response.left.message });

               setIsConfirmationDialogBoxOpenForBankDetails(false);
            }
            return response
         },
         undefined,
         (error: any) => {
            addToast({ type: 'error', title: error.message })
         },
         undefined,
         'Delete Bank'
      )
   }

   const handleBackToListCompanyMaster = () => {
      navigate('/companyMaster');
   };

   return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
         <Loader loading={isLoading} title={loadingMessage}>  <div></div>  </Loader>

         <HeaderActionBar
            titleText={'Bank Details : '}
            subTitleText={companyName}
            EditText="Add"
            cancelText="Cancel"
            onCancel={() => {
               handleBackToListCompanyMaster();
            }}
            canAction={canAction}
            onEdit={() => {
               handleAddCompanyMasterWithBankDetailsModal();
            }}
            isLoading={isLoading} />

         <div className='pt-5'>
            <DataTable
               data={companyBankList}
               columns={CompanyBankColumns}
               emptyMessage="No Bank Data Found"
               fixedHeight={true}
               recordsPerPage={20}
               className="flex-1"
               loading={isLoading}
            />
         </div>

         <Modal
            isOpen={isAddUpdateModalOpenForBankDetails}
            onClose={() => {
               setIsAddUpdateModalOpenForBankDetails(false);
               setEditCompanyMasterWithBankDetails(null);
               setFormData(initialFormState());
               setErrors({});
               setCancelChequeFiles([]);
               setCancelChequeURL('');
               setRemoveCancelChequeUrls([])
            }}
            onCancel={() => {
               setIsAddUpdateModalOpenForBankDetails(false);
               setEditCompanyMasterWithBankDetails(null);
               setFormData(initialFormState());
               setErrors({});
               setCancelChequeFiles([]);
               setCancelChequeURL('');
               setRemoveCancelChequeUrls([])
            }}
            title={editCompanyMasterWithBankDetails ? 'Update Bank Details' : 'Add Bank Details'}
            onSubmit={handleAddUpdateCompanyMasterWithBankDetails}
            saveText={editCompanyMasterWithBankDetails ? 'Update' : 'Add'}
            loading={isLoading}
            size='half-screen'
         >
            <div className="space-y-4 p-6 bg-blue-100">
               <div className="space-y-4" >
                  <div>
                     <Input
                        label='Beneficiary Account Holder Name'
                        required
                        error={errors.BeneficiaryAccountHolderName}
                        type="text"
                        value={formData.BeneficiaryAccountHolderName}
                        maxLength={250}
                        onChange={(e) => handleFieldChange('BeneficiaryAccountHolderName', e.target.value)}
                        placeholder="Enter Account Holder Name"
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
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  <div>
                     <SinglePageSelection
                        label="Account Type"
                        placeholder='Select Account Type'
                        required
                        value={formData.AcType}
                        onChange={(e) => handleFieldChange('AcType', String(e))}
                        options={BANK_ACCOUNT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                        error={errors.AcType}
                     />
                  </div>
                  <div>
                     <SinglePageSelection
                        label="Nature Of Account"
                        placeholder='Select Nature Of Account'
                        required
                        value={formData.NatureOfAccount}
                        onChange={(e) => handleFieldChange('NatureOfAccount', String(e))}
                        options={NATURE_OF_ACCOUNT.map((opt) => ({ label: opt.name, value: opt.id }))}
                        error={errors.NatureOfAccount}
                     />

                  </div>
                  <div>
                     <Input
                        label='Branch Name'
                        required
                        error={errors.Branch}
                        type="text"
                        value={formData.Branch}
                        maxLength={100}
                        onChange={(e) => handleFieldChange('Branch', e.target.value)}
                        placeholder="Enter Branch"
                     />

                  </div>
                  <div>
                     <Input
                        label="Account Number"
                        placeholder='Enter Account Number'
                        required value={formData.AccountNumber}
                        maxLength={18}
                        onChange={(e) => handleFieldChange("AccountNumber", filterNumbers(e.target.value))}
                        error={errors.AccountNumber} />
                  </div>
                  <div>
                     <Input label="IFSC Code"
                        placeholder='Enter IFSC Code'
                        required
                        value={formData.IFSCCode}
                        maxLength={11}
                        onChange={(e) => handleFieldChange("IFSCCode", filterIFSC(e.target.value))}
                        error={errors.IFSCCode} />
                  </div>
                  <div>
                     <Input label="MICR Code"
                        placeholder='Enter MICR Code'
                        required
                        value={formData.MICRCode}
                        maxLength={10}
                        onChange={(e) => handleFieldChange("MICRCode", filterNumbers(e.target.value))}
                        error={errors.MICRCode} />
                  </div>
                  <div>
                     <SinglePageSelection
                        label="Status"
                        placeholder='Select Status'
                        required
                        value={formData.Status}
                        onChange={(e) => handleFieldChange('Status', String(e))}
                        options={ACTIVE_INACTIVE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                        error={errors.Status}
                     />
                  </div>

                  <MultiFilePicker
                     label="Cancel Cheque"
                     placeholder='Select Files'
                     required
                     value={cancelChequeFiles}
                     onChange={setCancelChequeFiles}
                     availableFilesURL={cancelChequeURL ?? ""}
                     error={errors.CancelChequeURL}
                     allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                     maxFiles={5}
                     onRemoveExisting={(url) => {
                        setRemoveCancelChequeUrls((prev) => [...prev, url])
                     }}
                  />
               </div>
            </div>
         </Modal>

         <DeleteDialog
            isOpen={isConfirmationDialogBoxOpenForBankDetails}
            onClose={() => {
               setIsConfirmationDialogBoxOpenForBankDetails(false)
               setDeleteCompanyMasterWithBankDetails(null)
            }}
            onConfirm={handleDeleteCompanyMasterWithBankDetails}
            loading={isLoading}
            pageName='bank'
         />
      </div>
   )
}
export default CompanyBank;