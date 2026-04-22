import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { AddUpdateProjectMasterWithBankDetailsRequest, DeleteProjectMasterWithBankDetailsRequest, ProjectWithBankDetails } from '@/features/projectMaster/models/ProjectMasterModel';
import useToast from '@/core/hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { Loader } from '@/core/utils/loader';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { projectMasterService } from '@/features/projectMaster/services/ProjectMasterService';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { Button, Input } from '@/ui/components/forms';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Edit, Trash2 } from 'lucide-react';
import { filterIFSC, filterNumbers, isValidIFSC } from '@/core/utils/fileValidation';
import { BANK_ACCOUNT_TYPE, NATURE_OF_ACCOUNT } from '@/core/constants';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import { fetchBankListMasterDropdown } from '@/features/bankListMaster/bankListMasterDropDown';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { Modal } from '@/ui/components/Modal/Modal';
import { useProjectMasterListState } from '@/features/projectMaster/context/ProjectMasterListStateContext';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

const initialFormState = (): AddUpdateProjectMasterWithBankDetailsRequest => ({

  ProjectWithBankDetailsId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ProjectId: 0,
  BeneficiaryAccountHolderName: '',
  BankListMasterId: 0,
  AccountNumber: '',
  Branch: '',
  IFSCCode: '',
  AcType: '',
  NatureOfAccount: ''
});

const Bank: React.FC = () => {

  //#region STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [projectWithBankDetailsList, setProjectWithBankDetailsList] = useState<ProjectWithBankDetails[]>([]);

  // TOAST
  const { addToast } = useToast()

  //LOCATION
  const navigate = useNavigate();

  const { listState } = useProjectMasterListState();
  const projectId = listState.projectId;
  const projectName = listState.projectName;
  //#endregion

  //#region PROJECT MASTER WITH BANK DETAILS MODULE

  //SET DROP DOWN 
  const [dropdownLabels, setDropdownLabels] = useState<{
    bankName?: string;
  }>({});

  const [formDataForBankDetails, setFormDataForBankDetails] = useState<AddUpdateProjectMasterWithBankDetailsRequest>(() => initialFormState());

  //ERROR SET UP
  const [errorsForBankDetails, setErrorsForBankDetails] = useState<{ [k: string]: string }>({});

  // EDIT PROJECT MASTER WITH BANK DETAILS
  const [editingProjectMasterWithBankDetailsData, setEditingProjectMasterWithBankDetailsData] = useState<ProjectWithBankDetails | null>(null);
  const [isAddUpdateModalOpenForBankDetails, setIsAddUpdateModalOpenForBankDetails] = useState(false);

  const [isConfirmationDialogBoxOpenForBankDetails, setIsConfirmationDialogBoxOpenForBankDetails] = useState(false)

  const [deleteProjectMasterWithBankDetailsData, setDeleteProjectMasterWithBankDetailsData] = useState<ProjectWithBankDetails | null>(null)
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions('/projectMaster');
  //#endregion

  //#region INIT
  useEffect(() => {

    loadProjectMasterWithBankDetails(projectId);

  }, []);

  useEffect(() => {
    if (isAddUpdateModalOpenForBankDetails) {
      if (editingProjectMasterWithBankDetailsData) {

        setFormDataForBankDetails({
          ProjectWithBankDetailsId: editingProjectMasterWithBankDetailsData.ProjectWithBankDetailsId,
          Uniquekey: editingProjectMasterWithBankDetailsData.Uniquekey || initialFormState().Uniquekey,
          BeneficiaryAccountHolderName: editingProjectMasterWithBankDetailsData.BeneficiaryAccountHolderName || "",
          ProjectId: editingProjectMasterWithBankDetailsData.ProjectId,
          BankListMasterId: editingProjectMasterWithBankDetailsData.BankListMasterId || 0,
          AccountNumber: editingProjectMasterWithBankDetailsData.AccountNumber || "",
          Branch: editingProjectMasterWithBankDetailsData.Branch || "",
          IFSCCode: editingProjectMasterWithBankDetailsData.IFSCCode || "",
          AcType: editingProjectMasterWithBankDetailsData.AcType || "",
          NatureOfAccount: editingProjectMasterWithBankDetailsData.NatureOfAccount || ""
        });

        setDropdownLabels({
          bankName: editingProjectMasterWithBankDetailsData.BankName || ""
        });

      } else {
        setFormDataForBankDetails(initialFormState());
      }
      setErrorsForBankDetails({});
    }
  }, [isAddUpdateModalOpenForBankDetails, editingProjectMasterWithBankDetailsData]);
  //#endregion

  //#region FETCH PROJECT MASTER WITH BANK
  const loadProjectMasterWithBankDetails = async (ProjectId: number) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const response = await projectMasterService.apiCallPullProjectMasterWithBankDetails(ProjectId);

        if (E.isRight(response)) {

          setProjectWithBankDetailsList(response.right.Data);

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
      'Loading Bank Details'
    );
  };
  //#endregion
  //#region  BACK TO PROJECT MASTER PAGE
  const handleBackToListProjectMaster = () => {
    navigate("/projectMaster");
  };
  //#endregion

  //#region PROJECT MASTER WITH BANK DETAILS

  const handleEditProjectMasterBankDetails = useCallback((row: ProjectWithBankDetails) => {
    setEditingProjectMasterWithBankDetailsData({
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

  const handleConfirmationDialogBoxOpenForProjectMasterBankDetails = useCallback((row: ProjectWithBankDetails) => {
    setDeleteProjectMasterWithBankDetailsData(row)
    setIsConfirmationDialogBoxOpenForBankDetails(true)
  }, [])
  //#endregion

  //#region TABLE COLUMN

  const projectMasterBankDetailsColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'BeneficiaryAccountHolderName',
        label: 'Account Holder',
        width: '33',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className={`flex items-center justify-start`}>
            <TooltipText
              text={value || '-'}
              maxWidth="250px"
              tooltipThreshold={25}
            />
            <div className="flex items-center justify-end ml-2 w-20">
              {canAction ?
                <>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleEditProjectMasterBankDetails(row)
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
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1A4D73')} // lighter on hover
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#0B3251')} // revert
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleConfirmationDialogBoxOpenForProjectMasterBankDetails(row)
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
          </div>
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
      
    ],
    [handleEditProjectMasterBankDetails, handleConfirmationDialogBoxOpenForProjectMasterBankDetails]
  )

  //#endregion

  //#region ADD UPDATE EDIT PROJECT MASTER WITH BANK DETAILS

  const handleFieldChange = (field: keyof AddUpdateProjectMasterWithBankDetailsRequest, value: any) => {

    setFormDataForBankDetails((prev) => ({ ...prev, [field]: value }));

    if (errorsForBankDetails[field]) {
      setErrorsForBankDetails((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddProjectMasterWithBankDetailsModal = () => {
    setEditingProjectMasterWithBankDetailsData(null);
    setFormDataForBankDetails(initialFormState());
    setErrorsForBankDetails({});
    setIsAddUpdateModalOpenForBankDetails(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddProjectMasterWithBankDetailsForm = (): {

    isValid: boolean

    errorsForBankDetails: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (formDataForBankDetails.BeneficiaryAccountHolderName.trim() === "") {

      newErrors.BeneficiaryAccountHolderName = "Beneficiary Account Holder Name is required"
    }

    if (formDataForBankDetails.AcType.trim() === "") {
      newErrors.AcType = "Account type is required";
    }

    if (formDataForBankDetails.NatureOfAccount.trim() === "") {
      newErrors.NatureOfAccount = "Nature Of Account is required";
    }


    if (!formDataForBankDetails.BankListMasterId) {
      newErrors.BankListMasterId = "Bank Name is required";
    }

    if (!formDataForBankDetails.Branch?.trim()) {
      newErrors.Branch = 'Bank Branch Name is required.'
    } else if (formDataForBankDetails.Branch.trim().length > 50) {
      newErrors.Branch = 'Bank Branch Name must be at most 50 characters'
    }

    if (!formDataForBankDetails.AccountNumber?.trim()) {
      newErrors.AccountNumber = 'Account Number is required.'
    } else if (formDataForBankDetails.AccountNumber.trim().length > 18) {
      newErrors.AccountNumber = 'Account Number must be at most 50 characters'
    }

    if (!formDataForBankDetails.IFSCCode?.trim()) {
      newErrors.IFSCCode = 'IFSC Code is required.'
    }
    else if (formDataForBankDetails.IFSCCode.trim().length > 12) {
      newErrors.IFSCCode = 'IFSC Code must be at most 50 characters'
    }
    else if (!isValidIFSC(formDataForBankDetails.IFSCCode.trim())) {
      newErrors.IFSCCode = 'Enter a valid IFSC Code'
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errorsForBankDetails: newErrors
    }
  }

  const PushProjectMasterWithBankDetailsFormData = (): AddUpdateProjectMasterWithBankDetailsRequest => {
    return {
      ProjectWithBankDetailsId: formDataForBankDetails.ProjectWithBankDetailsId,
      Uniquekey: formDataForBankDetails.Uniquekey,
      ProjectId: projectId,
      BeneficiaryAccountHolderName: formDataForBankDetails.BeneficiaryAccountHolderName,
      BankListMasterId: formDataForBankDetails.BankListMasterId,
      AccountNumber: formDataForBankDetails.AccountNumber,
      Branch: formDataForBankDetails.Branch,
      IFSCCode: formDataForBankDetails.IFSCCode,
      AcType: formDataForBankDetails.AcType,
      NatureOfAccount: formDataForBankDetails.NatureOfAccount,
    };

  };

  const handleAddUpdateProjectMasterWithBankDetails = async (e: React.FormEvent) => {

    e.preventDefault();

    setErrorsForBankDetails({})

    const validation = validateAddProjectMasterWithBankDetailsForm()

    if (!validation.isValid) {

      setErrorsForBankDetails(validation.errorsForBankDetails)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,
      async () => {

        const payload = PushProjectMasterWithBankDetailsFormData();

        const response = await projectMasterService.apiCallAddUpdateProjectMasterWithBankDetails(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpenForBankDetails(false);

          const isAdd = formDataForBankDetails.ProjectWithBankDetailsId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as ProjectWithBankDetails

            setProjectWithBankDetailsList(prevData => [newRecord, ...prevData]);

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as ProjectWithBankDetails;

            setProjectWithBankDetailsList(prevData =>
              prevData.map(item =>
                item.ProjectWithBankDetailsId === formDataForBankDetails.ProjectWithBankDetailsId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingProjectMasterWithBankDetailsData(null);

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

      Number(formDataForBankDetails.ProjectWithBankDetailsId) === 0 ? 'Add Bank Details' : 'Update Bank Details'
    )

  };

  //#endregion

  //#region DELETE PROJECT MASTER WITH BANK DETAILS

  const handleDeleteProjectMasterWithBankDetails = async () => {

    setIsConfirmationDialogBoxOpenForBankDetails(false);

    if (!deleteProjectMasterWithBankDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,

      async () => {

        const params: DeleteProjectMasterWithBankDetailsRequest = {
          ProjectWithBankDetailsId: deleteProjectMasterWithBankDetailsData.ProjectWithBankDetailsId,
          Uniquekey: deleteProjectMasterWithBankDetailsData.Uniquekey,
          ProjectId: deleteProjectMasterWithBankDetailsData.ProjectId
        }

        const response = await projectMasterService.apiCallDeleteProjectMasterWithBankDetails(params);

        if (E.isRight(response)) {

          setProjectWithBankDetailsList(prevData => prevData.filter(item => item.ProjectWithBankDetailsId !== deleteProjectMasterWithBankDetailsData.ProjectWithBankDetailsId));


          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpenForBankDetails(false);

          setDeleteProjectMasterWithBankDetailsData(null);

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
  //#endregion

  //#endregion


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" >
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <HeaderActionBar
        titleText={'Bank Details : '}
        subTitleText={projectName}
        cancelText="Cancel"
        EditText="Add"
        onCancel={() => handleBackToListProjectMaster()}
        canAction={canAction}
        onEdit={() => {
          handleAddProjectMasterWithBankDetailsModal();

        }}
        isLoading={isLoading}
      />
      <div className='pt-5'>
        <DataTable
          data={projectWithBankDetailsList}
          columns={projectMasterBankDetailsColumns}
          emptyMessage="No Bank Data Found"
          fixedHeight={true}
          recordsPerPage={20}
          className="flex-1"
          loading={isLoading}
        />
      </div>

      {/*  ADD EDIT UPDATE PROJECT MASTER WITH BANK DETAILS MODAL */}
      <Modal
        isOpen={isAddUpdateModalOpenForBankDetails}
        onClose={() => {
          setIsAddUpdateModalOpenForBankDetails(false);
          setEditingProjectMasterWithBankDetailsData(null);
          setFormDataForBankDetails(initialFormState());
          setErrorsForBankDetails({});
        }}
        onCancel={() => {
          setIsAddUpdateModalOpenForBankDetails(false);
          setEditingProjectMasterWithBankDetailsData(null);
          setFormDataForBankDetails(initialFormState());
          setErrorsForBankDetails({});
        }}
        title={editingProjectMasterWithBankDetailsData ? 'Update Bank Details' : 'Add Bank Details'}
        onSubmit={handleAddUpdateProjectMasterWithBankDetails}
        saveText={editingProjectMasterWithBankDetailsData ? 'Update' : 'Add'}

        loading={isLoading}
        size='half-screen'
      >
        <div className="space-y-4 p-6 bg-blue-100">
          <div className="space-y-4" >
            <div>
              <Input
                label='Beneficiary Account Holder Name'
                required
                error={errorsForBankDetails.BeneficiaryAccountHolderName}
                type="text"
                value={formDataForBankDetails.BeneficiaryAccountHolderName}
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
                initialValue={createDropdownInitialValue(formDataForBankDetails.BankListMasterId, dropdownLabels.bankName)}
                error={errorsForBankDetails.BankListMasterId}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">

            <div>
              <SinglePageSelection
                label="Account Type"
                placeholder='Select Account Type'
                required
                value={formDataForBankDetails.AcType}
                onChange={(e) => handleFieldChange('AcType', String(e))}
                options={BANK_ACCOUNT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errorsForBankDetails.AcType}
              />

            </div>
            <div>
              <SinglePageSelection
                label="Nature Of Account"
                placeholder='Select Nature Of Account'
                required
                value={formDataForBankDetails.NatureOfAccount}
                onChange={(e) => handleFieldChange('NatureOfAccount', String(e))}
                options={NATURE_OF_ACCOUNT.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errorsForBankDetails.NatureOfAccount}
              />

            </div>

            <div>
              <Input
                label='Branch Name'
                required
                error={errorsForBankDetails.Branch}
                type="text"
                value={formDataForBankDetails.Branch}
                maxLength={100}
                onChange={(e) => handleFieldChange('Branch', e.target.value)}
                placeholder="Enter Branch"
              />

            </div>
            <div>
              <Input
                label="Account Number"
                placeholder='Enter Account Number'
                required value={formDataForBankDetails.AccountNumber}
                maxLength={18}
                onChange={(e) => handleFieldChange("AccountNumber", filterNumbers(e.target.value))}
                error={errorsForBankDetails.AccountNumber} />
            </div>
            <div>
              <Input label="IFSC Code"
                placeholder='Enter IFSC Code'
                required
                value={formDataForBankDetails.IFSCCode}
                maxLength={11}
                onChange={(e) => handleFieldChange("IFSCCode", filterIFSC(e.target.value))}
                error={errorsForBankDetails.IFSCCode} />
            </div>
          </div>
        </div>

      </Modal>
      {/* DELETE CONFIRMATION  PROJECT MASTER WTTH BANK DETAILS MODAL */}

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenForBankDetails}
        onClose={() => {
          setIsConfirmationDialogBoxOpenForBankDetails(false)
          setDeleteProjectMasterWithBankDetailsData(null)
        }}
        onConfirm={handleDeleteProjectMasterWithBankDetails}
        loading={isLoading}
        pageName='bank'
      />

    </div >
  )
}

export default Bank
