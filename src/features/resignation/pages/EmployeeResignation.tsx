import React, { useCallback, useEffect, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateEmployeeResignationRequest,
  DeleteEmployeeResignationRequest,
  EmployeeResignationData,
  FilterWithPaginationEmployeeResignationRequest
} from '@/features/resignation/models/EmployeeResignationModel';

import { employeeResignationService } from '@/features/resignation/services/EmployeeResignationService';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { Button, Input } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { TextArea } from '@/ui/components/forms/Textarea';
import { DatePickerInput } from '@/ui/components/forms/Datepicker';
import Checkbox from '@/ui/components/forms/Checkbox';
import MultiFilePicker from '@/ui/components/ImagePicker/MultiFilePicker';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { Edit, Trash2 } from 'lucide-react';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { filterNumbersWithDecimal } from '@/core/utils/fileValidation';

const initialFormState = (): AddUpdateEmployeeResignationRequest => ({
  EmployeeResignationId: 0,
  UniqueKey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  EmployeeId: null,
  ResignationDate: new Date().toISOString().split("T")[0],
  ReasonOfLeaving: '',
  ExpectedRelievingDate: null,
  IsAnyOfferInHand: false,
  OfferLetterURL: null,
  RemoveOfferLetterURL: '',
  OfferAmount: null
});

export const EmployeeResignation: React.FC = () => {

  //#region STATE MANAGEMENT
  const [employeeResignationList, setEmployeeResignationList] = useState<EmployeeResignationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  // TOAST
  const { addToast } = useToast()

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT EMPLOYEE RESIGNATION
  const [editingEmployeeResignationData, setEditingEmployeeResignationData] = useState<EmployeeResignationData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE EMPLOYEE RESIGNATION
  const [formData, setFormData] = useState<AddUpdateEmployeeResignationRequest>(() => initialFormState());

  //DELETE EMPLOYEE RESIGNATION STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteEmployeeResignationDetailsData, setDeleteEmployeeResignationDetailsData] = useState<EmployeeResignationData | null>(null)

  const [offerLetterFiles, setOfferLetterFiles] = useState<(File | string)[]>([]);
  const [removedOfferLetterUrls, setRemovedOfferLetterUrls] = useState<string[]>([]);
  const [offerLetterURL, setOfferLetterURL] = useState<string>();
  //#endregion

  const canAddResignation = !employeeResignationList.some(
    (item) => item.ApprovalStatus === "Pending" || item.ApprovalStatus === "Approved");

  //#region INITIALIZATION

  useEffect(() => {

    loadResignations(1);

  }, [])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingEmployeeResignationData) {
        setFormData({
          EmployeeResignationId: editingEmployeeResignationData.EmployeeResignationId,
          UniqueKey: editingEmployeeResignationData.UniqueKey || null,
          EmployeeId: editingEmployeeResignationData.EmployeeId,
          ResignationDate: editingEmployeeResignationData.ResignationDate,
          ReasonOfLeaving: editingEmployeeResignationData.ReasonOfLeaving || '',
          ExpectedRelievingDate: editingEmployeeResignationData.ExpectedRelievingDate,
          IsAnyOfferInHand: editingEmployeeResignationData.IsAnyOfferInHand || false,
          OfferLetterURL: null,
          RemoveOfferLetterURL: '',
          OfferAmount: editingEmployeeResignationData.OfferAmount
        });

        setOfferLetterFiles([]);
        setOfferLetterURL(editingEmployeeResignationData.OfferLetterURL)
        setRemovedOfferLetterUrls([]);

      }
      else {
        setOfferLetterFiles([]);
        setOfferLetterURL('')
        setRemovedOfferLetterUrls([]);
      }

    }
  }, [isAddUpdateModalOpen, editingEmployeeResignationData]);

  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const loadResignations = async (page: number) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationEmployeeResignationRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          IsReport: false,
          CanApprove: false,
          EmployeeId: LocalStorageHelper.getStoredEmployeeData()?.EmployeeId || 0,
        }

        const response = await employeeResignationService.apiCallPullEmployeeResignation(params);

        if (E.isRight(response)) {

          setEmployeeResignationList(response.right.Data);

          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });

        } else {

          addToast({ type: 'error', title: response.left.message });

        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Employee Resignation'
    )

  }
  //#endregion


  //#region EDIT EMPLOYEE RESIGNATION
  const handleEditEmployeeResignation = useCallback((row: EmployeeResignationData) => {
    setEditingEmployeeResignationData(row)
    setIsAddUpdateModalOpen(true);

  }, [])

  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: EmployeeResignationData) => {
    setDeleteEmployeeResignationDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  //#endregion

  //#region ADD UPDATE EDIT EMPLOYEE RESIGNATION

  const handleFieldChange = (field: keyof AddUpdateEmployeeResignationRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddResignationModal = () => {
    setEditingEmployeeResignationData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddEmployeeResignationForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (!formData.ResignationDate) {
      newErrors.ResignationDate = "Resignation Date is required"
    }

    if (formData.ReasonOfLeaving.trim() === "") {
      newErrors.ReasonOfLeaving = "Reason Of Leaving is required"
    }

    if (formData.ExpectedRelievingDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selectedDate = new Date(formData.ExpectedRelievingDate)
      selectedDate.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.ExpectedRelievingDate = "Expected Relieving Date cannot be before today"
      }
    }

    if (formData.IsAnyOfferInHand) {
      if (!formData.OfferAmount || formData.OfferAmount <= 0) {
        newErrors.OfferAmount = "Offer Amount is required when offer is in hand"
      }
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }


  const PushEmployeeResignationFormData = (): FormData => {

    const formDataToSend = new FormData();

    formDataToSend.append('EmployeeResignationId', formData.EmployeeResignationId.toString() ?? 0);

    formDataToSend.append('UniqueKey', formData.UniqueKey ?? '');

    formDataToSend.append('EmployeeId', LocalStorageHelper.getStoredEmployeeData()?.EmployeeId.toString() || '0');

    formDataToSend.append('ResignationDate', formData.ResignationDate ?? '');

    formDataToSend.append('ReasonOfLeaving', formData.ReasonOfLeaving.trim() ?? '');

    formDataToSend.append('ExpectedRelievingDate', formData.ExpectedRelievingDate ?? '');

    formDataToSend.append('IsAnyOfferInHand', formData.IsAnyOfferInHand.toString() ?? 'false');

    formDataToSend.append('OfferAmount', String(formData.OfferAmount ?? 0));

    offerLetterFiles.forEach(file => {
      if (file instanceof File) {
        formDataToSend.append('OfferLetterURL', file);
      }
    });
    formDataToSend.append('RemoveOfferLetterURL', removedOfferLetterUrls.join(',') ?? '');

    return formDataToSend;
  }

  const handleAddUpdateEmployeeResignation = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddEmployeeResignationForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,
      async () => {


        const payload = PushEmployeeResignationFormData();

        const response = await employeeResignationService.apiCallAddUpdateEmployeeResignation(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.EmployeeResignationId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as EmployeeResignationData

            setEmployeeResignationList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as EmployeeResignationData;

            setEmployeeResignationList(prevData =>
              prevData.map(item =>
                item.EmployeeResignationId === formData.EmployeeResignationId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingEmployeeResignationData(null);
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
      Number(formData.EmployeeResignationId) === 0 ? 'Add Employee Resignation' : 'Update Employee Resignation'
    )
  };

  //#endregion

  //#region DELETE EMPLOYEE RESIGNATION
  const handleDeleteEmployeeResignation = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteEmployeeResignationDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,

      async () => {

        const params: DeleteEmployeeResignationRequest = {
          EmployeeResignationId: deleteEmployeeResignationDetailsData.EmployeeResignationId,
          UniqueKey: deleteEmployeeResignationDetailsData.UniqueKey
        }

        const response = await employeeResignationService.apiCallDeleteEmployeeResignation(params);

        if (E.isRight(response)) {

          setEmployeeResignationList(prevData => prevData.filter(item => item.EmployeeResignationId !== deleteEmployeeResignationDetailsData.EmployeeResignationId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteEmployeeResignationDetailsData(null);

        } else {
          addToast({ type: 'error', title: response.left.message });

          setIsConfirmationDialogBoxOpen(false);
        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Delete Employee Resignation'
    )
  }

  //#endregion

  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      {/* ============================================================================
          COMMON LOADER FOR PAGEl̥
           ============================================================================ */}

      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

      {canAddResignation && (
        <TableActionToolbar
          isShowSearchBar={false}
          isShowAddButton={true}
          addTitle="Add"
          onAdd={handleAddResignationModal}
          exportLoading={isLoading}
        />
      )}

      <div className="space-y-4 p-4">
        {employeeResignationList?.length ? (
          employeeResignationList.map(data => {
            return (
              <section className="bg-white rounded-xl shadow-sm border border-[#3333334f] p-4 space-y-4 ">

                {/* Header Row */}
                <div className="flex justify-between items-center">

                  <h3 className="font-semibold text-lg">
                    {data.EmployeeName}
                  </h3>

                  <div className="flex justify-end gap-0">
                    <Button
                      color='transparent'
                      isborderRadius
                      size='sm'
                      style={{
                        color: 'blue',
                        padding: '4px 8px'
                      }}
                      title="Edit"
                      onClick={() => handleEditEmployeeResignation(data)}
                      disabled={isLoading}
                      leftIcon={<Edit className="h-4 w-4" />}
                    />

                    <Button
                      color='transparent'
                      isborderRadius
                      size='sm'
                      style={{
                        color: 'red',
                        padding: '4px 8px'
                      }}
                      title="Delete"
                      onClick={() => handleConfirmationDialogBoxOpen(data)}
                      disabled={isLoading}
                      leftIcon={<Trash2 className="h-4 w-4" />}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FieldItem label="Resignation Date" value={data.ResignationDate ? formatDate_dd_MonthName_yy(data.ResignationDate) : '-'} />
                  <FieldItem label="Notice Period" value={data.NoticePeriod} />
                  <FieldItem label="Relieving Date" value={data.RelievingDate ? formatDate_dd_MonthName_yy(data.RelievingDate) : '-'} />
                  <FieldItem label="Expected Relieving Date" value={data.ExpectedRelievingDate ? formatDate_dd_MonthName_yy(data.ExpectedRelievingDate) : '-'} />
                  <FieldItem label="Reason Of Leaving" value={data.ReasonOfLeaving} />
                  <FieldItem label="Offer In Hand" value={data.IsAnyOfferInHand ? 'Yes' : 'No'} />
                  <FieldItem label="Offer Amount" value={data.OfferAmount ?? 0} urls={data?.OfferLetterURL} isIcon />
                  <FieldItem label="Approval Status" value={data.ApprovalStatus} className='' />
                </div>
              </section>

            );
          })
        ) : (
          <p className="text-center text-gray-500 py-6">
            <NoDataView />
          </p>
        )}

      </div>

      {/*  ADD EDIT UPDATE EMPLOYEE RESIGNATION MODAL */}
      <Modal
        isOpen={isAddUpdateModalOpen}
        onClose={() => {
          setIsAddUpdateModalOpen(false);
          setEditingEmployeeResignationData(null);
          setFormData(initialFormState());
          setErrors({});
        }}
        onCancel={() => {
          setIsAddUpdateModalOpen(false);
          setEditingEmployeeResignationData(null);
          setFormData(initialFormState());
          setErrors({});
        }}
        title={editingEmployeeResignationData ? 'Update Employee Resignation' : 'Add Employee Resignation'}
        onSubmit={handleAddUpdateEmployeeResignation}
        saveText={'Save'}

        loading={isLoading}
        size='xl'
      >
        <div className="space-y-6 p-6 bg-blue-50">
          <div className="space-y-4" >
            <div>
              <DatePickerInput
                label='Resignation Date'
                required
                error={errors.ResignationDate}
                value={formatDate_dd_mm_yyyy(formData.ResignationDate)}
                onChange={(val) => handleFieldChange('ResignationDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                disabled={!!formData.ResignationDate}
                placeholder="Select Resignation Date"
              />
            </div>

            <div>
              <TextArea
                label="Reason Of Leaving"
                placeholder="Enter Reason Of Leaving"
                required
                className='thin-scroll'
                value={formData.ReasonOfLeaving}
                onChange={(e) => handleFieldChange("ReasonOfLeaving", e.target.value)}
                error={errors.ReasonOfLeaving} />
            </div>

            <div>
              <DatePickerInput
                label='Expected Relieving Date'
                error={errors.ExpectedRelievingDate}
                value={formatDate_dd_mm_yyyy(formData.ExpectedRelievingDate)}
                onChange={(val) => handleFieldChange('ExpectedRelievingDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                minDate={new Date()}
                placeholder="Select Expected Relieving Date"
              />
            </div>

            <div>
              <Checkbox
                label='Offer In Hand'
                checked={formData.IsAnyOfferInHand === true}
                onChange={(e) => handleFieldChange('IsAnyOfferInHand', e.target.checked ? true : false)}
              />

            </div>

            {formData.IsAnyOfferInHand && (
              <>
                <div>
                  <Input
                    label='Offer Amount '
                    required
                    type='number'
                    error={errors.OfferAmount}
                    value={formData.OfferAmount?.toString() || ''}
                    onChange={(e) => handleFieldChange('OfferAmount', e.target.value ? filterNumbersWithDecimal(e.target.value) : null)}
                    placeholder="Enter Offer Amount"
                  />
                </div>

                <div>
                  <MultiFilePicker
                    label="Offer Letter"
                    placeholder="Select Offer Letter"
                    required
                    error={errors.OfferLetterURL}
                    value={offerLetterFiles}
                    onChange={setOfferLetterFiles}
                    availableFilesURL={offerLetterURL ?? ""}
                    allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                    maxFiles={5}
                    maxSizeMB={10}
                    onRemoveExisting={(url) => {
                      setRemovedOfferLetterUrls((prev) => [...prev, url])
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

      </Modal>


      {/* DELETE CONFIRMATION EMPLOYEE RESIGNATION MODAL */}
      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteEmployeeResignationDetailsData(null)
        }}
        onConfirm={handleDeleteEmployeeResignation}
        loading={isLoading}
        pageName='employee resignation'
      />


    </div>
  )
}

export default EmployeeResignation
