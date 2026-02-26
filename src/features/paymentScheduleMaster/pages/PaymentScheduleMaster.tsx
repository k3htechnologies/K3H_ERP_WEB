import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PaymentScheduleMasterData, FilterWithPaginationPaymentScheduleMasterRequest, AddUpdatePaymentScheduleMasterRequest, DeletePaymentScheduleMasterRequest } from "@/features/paymentScheduleMaster/models/PaymentScheduleMasterModel";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import usePagination from "@/core/hooks/usePagination";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Loader } from "@/core/utils/loader";
import { paymentScheduleMasterService } from "@/features/paymentScheduleMaster/services/PaymentScheduleMasterService";
import * as E from 'fp-ts/Either';
import { Button, Input } from "@/ui/components/forms";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { fetchBuildingDropdown, fetchWingDropdown } from "@/features/inventory/InventoryDropdown";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/ui/components/Modal/Modal";
import { allowPercentage, filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import { fetchPaymentScheduleDropdown } from "@/features/paymentScheduleMaster/paymentScheduleDropDown";

const initialFormState = (): AddUpdatePaymentScheduleMasterRequest => ({
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  PaymentScheduleMasterId: 0,
  ProjectId: 0,
  InventoryBuildingId: 0,
  PaymentSchedulePercentage: 0,
  PaymentScheduleCummulativePercentage: 0,
  Stage: '',
  Wing: '',
});

export const PaymentScheduleMaster: React.FC = () => {

  // STATE
  const [PaymentScheduleMasterList, setPaymentScheduleMasterList] = useState<PaymentScheduleMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [stageOptions, setStageOptions] = useState<{ label: string; value: string }[]>([]);
  const [wingOptions, setWingOptions] = useState<{ label: string; value: string }[]>([]);
  const [buildingOptions, setBuildingOptions] = useState<{ label: string; value: number }[]>([]);

  //DELETE PAYMENT SCHEDULE DATA
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deletePaymentScheduleMasterData, setDeletePaymentScheduleMasterData] = useState<PaymentScheduleMasterData | null>(null)

  // EDIT PAYMENT SCHEDULE DATA
  const [editingPaymentScheduleMasterData, setEditingPaymentScheduleMasterData] = useState<PaymentScheduleMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
  const [formData, setFormData] = useState<AddUpdatePaymentScheduleMasterRequest>(() => initialFormState());

  // PAGINATION
  const { pagination, setPagination } = usePagination(20);

  const { projectId } = useProject();

  const [ratePerSqFt, setRatePerSqFt] = useState<number>(0);

  // USE NAVIGATE
  const navigate = useNavigate();

  // TOAST
  const { addToast } = useToast();

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const { canAction } = useMenuPermissions();

  const calculateCumulative = (currentPercentage: number) => {
    const totalExisting = PaymentScheduleMasterList.reduce(
      (sum, item) =>
        sum +
        (editingPaymentScheduleMasterData &&
          item.PaymentScheduleMasterId ===
          editingPaymentScheduleMasterData.PaymentScheduleMasterId
          ? 0
          : Number(item.PaymentSchedulePercentage || 0)),
      0
    );

    return totalExisting + currentPercentage;
  };
  //#endregion

  //#region LOAD PAYMENT SCHEDULE DATA
  const loadPaymentScheduleMaster = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo = {}, sort?: SortInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationPaymentScheduleMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ProjectId: Number(projectId),
          InventoryBuildingId: filterParams.InventoryBuildingId ? Number(filterParams.InventoryBuildingId) : undefined,
          Wing: filterParams.Wing ?? undefined,
          Stage: filterParams.Stage ?? undefined,
          SortBy: getSortByParam(sort ?? null, PaymentScheduleMasterColumns),
        };

        const response = await paymentScheduleMasterService.apiCallPullPaymentScheduleMaster(params);

        if (E.isRight(response)) {

          setPaymentScheduleMasterList(response.right.Data);
          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });

        } else {
          addToast({ type: 'error', title: response.left.message });
        }
      },
      undefined,
      (error: any) =>
        addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Data '
    );
  },
    [projectId, pagination.currentPage, pagination.pageSize, addToast, setPagination,]);
  //#endregion

  //#region INIT
  useEffect(() => {
    setFormData(initialFormState());
    setStageOptions([]);
  }, [projectId]);
  //#endregion  

  useEffect(() => {
    if (!projectId) return;
    fetchBuildingDropdown({ projectId: Number(projectId) }).then(res => {
      setBuildingOptions(res.itemList);
    });

  }, [projectId]);

  // ================= BUILDING CHANGE =================

  const handleBuildingChange = async (inventoryInventoryBuildingId: number) => {

    if (!inventoryInventoryBuildingId) {
      setFormData(prev => ({
        ...prev,
        InventoryBuildingId: 0,
        Wing: '',
        Stage: ''
      }));

      setWingOptions([]);
      setStageOptions([]);
      setPaymentScheduleMasterList([]);

      setPagination({
        currentPage: 1,
        totalRecords: 0,
        totalPages: 1
      });

      return;
    }

    setFormData(prev => ({
      ...prev,
      InventoryBuildingId: inventoryInventoryBuildingId,
      Wing: '',
      Stage: ''
    }));

    const res = await fetchWingDropdown({
      projectId: projectId ?? undefined,
      inventoryBuildingId: inventoryInventoryBuildingId ?? undefined
    });

    setWingOptions(res.itemList);
  };

  // ================= WING CHANGE =================

  const handleWingChange = async (wing: string) => {

    setRatePerSqFt(0);
    if (!wing) {

      setFormData(prev => ({
        ...prev,
        Wing: '',
        Stage: ''
      }));

      setStageOptions([]);
      setPaymentScheduleMasterList([]);
      setPagination({
        currentPage: 1,
        totalRecords: 0,
        totalPages: 1
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      Wing: wing,
      Stage: ''
    }));

    const res = await fetchPaymentScheduleDropdown({
      projectId: projectId ?? undefined,
      inventoryBuildingId: formData.InventoryBuildingId,
      wing: wing
    });

    setStageOptions(res.itemList);
    await loadPaymentScheduleMaster(1, {
      InventoryBuildingId: String(formData.InventoryBuildingId),
      Wing: wing
    });
  };
  //#endregion

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingPaymentScheduleMasterData) {
        setFormData({
          PaymentScheduleMasterId: editingPaymentScheduleMasterData.PaymentScheduleMasterId ?? 0,
          InventoryBuildingId: formData.InventoryBuildingId,
          Wing: formData.Wing,
          Uniquekey: editingPaymentScheduleMasterData.Uniquekey ?? initialFormState().Uniquekey,
          Stage: editingPaymentScheduleMasterData.Stage ?? '',
          PaymentSchedulePercentage: editingPaymentScheduleMasterData.PaymentSchedulePercentage ?? '',
          PaymentScheduleCummulativePercentage: editingPaymentScheduleMasterData.PaymentScheduleCummulativePercentage ?? '',
          ProjectId: Number(projectId),
        });
      } else {
        setFormData(prev => ({
          ...initialFormState(),
          InventoryBuildingId: prev.InventoryBuildingId,
          Wing: prev.Wing,
          ProjectId: Number(projectId),
        }));
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingPaymentScheduleMasterData, projectId]);
  //#endregion

  const handlePageChange = (page: number) => {
    setPagination({ currentPage: page });
    loadPaymentScheduleMaster(1, {});
  };
  //#endregion


  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: PaymentScheduleMasterData) => {
    setDeletePaymentScheduleMasterData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region EDIT PAYMENT SCHEDULE
  const handleEditPaymentScheduleMaster = useCallback(async (row: PaymentScheduleMasterData) => {

    const res = await fetchPaymentScheduleDropdown({ projectId: projectId ?? undefined });

    setStageOptions(res.itemList);
    setEditingPaymentScheduleMasterData(row);
    setIsAddUpdateModalOpen(true);
  }, [projectId]);

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================

  const validateUpdatePaymentScheduleMasterForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.Stage) {
      newErrors.Stage = "Stage is required";
    }

    if (!formData.PaymentSchedulePercentage) {
      newErrors.PaymentSchedulePercentage = "Percentage is required";
    }

    const percentage = Number(formData.PaymentSchedulePercentage || 0);
    const newTotal = calculateCumulative(percentage);

    if (newTotal > 100) {
      newErrors.PaymentSchedulePercentage =
        "Total percentage cannot exceed 100%";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };
  // PUSH FORM DATA
  const PushPaymentScheduleMasterFormData = (): AddUpdatePaymentScheduleMasterRequest => {

    return {
      PaymentScheduleMasterId: Number(formData.PaymentScheduleMasterId) || 0,
      InventoryBuildingId: Number(formData.InventoryBuildingId) || 0,
      Uniquekey: formData.Uniquekey ?? null,
      Stage: formData.Stage ?? null,
      Wing: formData.Wing ?? null,
      PaymentSchedulePercentage: Number(formData.PaymentSchedulePercentage) || 0,
      PaymentScheduleCummulativePercentage: Number(formData.PaymentScheduleCummulativePercentage) || 0,
      ProjectId: Number(projectId),
    };
  };

  //ADD UPDATE PAYMENT SCHEDULE DATA
  const handleAddEditPaymentScheduleMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})
    const validation = validateUpdatePaymentScheduleMasterForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const payload = PushPaymentScheduleMasterFormData();

        const response = await paymentScheduleMasterService.apiCallAddUpdatePaymentScheduleMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.PaymentScheduleMasterId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as PaymentScheduleMasterData

            setPaymentScheduleMasterList(prevData => [newRecord, ...prevData]);
            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {

            const updatedRecord = response.right.Data[0] as PaymentScheduleMasterData;

            setPaymentScheduleMasterList(prevData =>
              prevData.map(item =>
                item.PaymentScheduleMasterId === formData.PaymentScheduleMasterId
                  ? updatedRecord
                  : item
              )
            )
            await loadPaymentScheduleMaster(
              pagination.currentPage,
              { Wing: formData.Wing ?? '', InventoryBuildingId: formData.InventoryBuildingId ? String(formData.InventoryBuildingId) : "" },
            );
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }
          setEditingPaymentScheduleMasterData(null);
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
      'Update Payment Schdule'
    )
  };
  //#endregion

  //#region TABLE COLUMNS
  const PaymentScheduleMasterColumns = useMemo<TableColumn[]>(() => [
    {
      key: 'Stage',
      label: 'Stage',
      width: '25',
      sortable: false,
      fixed: 'left',
      align: 'left',
      render: (value) => (
        <TooltipText
          text={value || '-'}
          maxWidth="250px"
          tooltipThreshold={25}
        />
      ),
    },
    {
      key: 'PaymentSchedulePercentage',
      label: 'Percentage',
      width: '25',
      sortable: false,
      align: 'center',
      render: (value) => `${value || 0}%`
    },
    {
      key: 'PaymentScheduleCummulativePercentage',
      label: 'Cumulative Percentage',
      width: '15',
      sortable: false,
      align: 'center',
      render: (_value, _row, rowIndex) => {

        const cumulative = PaymentScheduleMasterList.slice(0, rowIndex + 1).reduce((sum, item) => sum + Number(item.PaymentSchedulePercentage || 0), 0);

        return `${cumulative}%`;
      }
    },
    {
      key: 'Actions',
      label: 'Actions',
      width: '12',
      fixed: 'right',
      align: 'center',
      render: (_value, row) => (
        <div className="flex items-center justify-center">
          {canAction && (
            <>
              <Button
                color="transparent"
                size="sm"
                style={{
                  color: 'blue',
                  padding: '0px 8px'
                }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleEditPaymentScheduleMaster(row)
                }}
                leftIcon={<Edit className="h-4 w-4" />}
              />

              <Button
                color="transparent"
                size="sm"
                style={{
                  color: 'red',
                  padding: '0px 8px'
                }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleConfirmationDialogBoxOpen(row)
                }}
                leftIcon={<Trash2 className="h-4 w-4" />}
              />
            </>
          )}
        </div>
      )
    },

  ], [canAction, calculateCumulative, handleEditPaymentScheduleMaster, handleConfirmationDialogBoxOpen])
  //#endregion

  //#region TABLE PAGINATION INFO
  const PaymentScheduleMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination, handlePageChange]
  )
  const PaymentScheduleMasterForTable = useMemo(() => PaymentScheduleMasterList, [PaymentScheduleMasterList]);

  const totalPercentage = useMemo(() => {
    return PaymentScheduleMasterList.reduce(
      (sum, item) => sum + Number(item.PaymentSchedulePercentage || 0),
      0
    );
  }, [PaymentScheduleMasterList]);
  //#endregion

  //#region DELETE PAYMENT SCHEDULE DATA
  const handleDeletePaymentScheduleMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deletePaymentScheduleMasterData) return;

    await runApiWithLoader(

      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeletePaymentScheduleMasterRequest = {

          PaymentScheduleMasterId: deletePaymentScheduleMasterData.PaymentScheduleMasterId || 0,

          Uniquekey: deletePaymentScheduleMasterData.Uniquekey || "",

          ProjectId: Number(projectId)
        };

        const response = await paymentScheduleMasterService.apiCallDeletePaymentScheduleMaster(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (PaymentScheduleMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }
          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });
          await loadPaymentScheduleMaster(
            pageToShow, {
            InventoryBuildingId: formData.InventoryBuildingId ? String(formData.InventoryBuildingId) : "",
            Wing: formData.Wing ?? ""
          },
          );
          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

          setIsConfirmationDialogBoxOpen(false);
          setDeletePaymentScheduleMasterData(null);
        } else {
          addToast({ type: 'error', title: response.left.message });
          setIsConfirmationDialogBoxOpen(false);
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Deleting Payment Schedule"
    );
  };
  //#endregion


  //#region NAVIGATE TO PAYMENT SCHEDULE REPORT
  const handlePaymentScheduleMasterReport = useCallback(() => {
    navigate('/paymentMasterReport', {
      state: {
        ratePerSqFt,
        InventoryBuildingId: formData.InventoryBuildingId,
        Wing: formData.Wing,
      }
    });
  }, [navigate, ratePerSqFt, formData.InventoryBuildingId, formData.Wing, addToast]);
  //#endregion

  //#region HANDLE FIELD CHANGE
  const handleFieldChange = (field: keyof AddUpdatePaymentScheduleMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  //#region
  const validateGenerate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!ratePerSqFt || ratePerSqFt <= 0) {
      newErrors.ratePerSqFt = "Rate is required and must be greater than 0";
    }

    if (!formData.Wing) {
      newErrors.Wing = "Wing is required";
    }

    const totalPercentage = PaymentScheduleMasterList.reduce(
      (sum, item) => sum + Number(item.PaymentSchedulePercentage || 0),
      0
    );

    if (totalPercentage !== 100) {
      addToast({
        type: "error",
        title: "Total Payment Schedule Percentage must be exactly 100% to Generate Report",
      });
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  //#endregion

  //#region
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">

      <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

      <div className="my-6 p-4">

        <div className="grid grid-cols-3 gap-4">
          <div>
            <SinglePageSelection
              label="Building"
              placeholder="Select Building"
              options={buildingOptions}
              value={formData.InventoryBuildingId || ''}
              required
              error={errors.InventoryBuildingId}
              onChange={(value) => handleBuildingChange(Number(value))}
            />
          </div>

          <div>
            <SinglePageSelection
              label="Wing"
              placeholder="Select Wing"
              options={wingOptions}
              value={formData.Wing ?? ''}
              required
              error={errors.Wing}
              onChange={(value) => handleWingChange(String(value))}
            />
          </div>

          {totalPercentage === 100 && (
            <div>
              <Input
                label="Rate Per Sq.Ft"
                placeholder="Enter Rate"
                required
                maxLength={8}
                value={ratePerSqFt || ''}
                error={errors.ratePerSqFt}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  const value = digits === '' ? 0 : Number(digits);

                  setRatePerSqFt(value);
                  if (errors.ratePerSqFt) {
                    setErrors(prev => ({ ...prev, ratePerSqFt: "" }));
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* TOTAL SUMMARY */}

      <div className="space-y-4 pb-5">

        <div className="flex items-center justify-between border-b border-gray-300 pb-2">
          <div className="flex items-center gap-30">

            <h3 className="text-lg font-semibold text-gray-900">
              Payment Schedule List
            </h3>

            <div className="text-sm">
              <span className="font-semibold text-gray-700">Total: </span>
              <span
                className={`font-bold ${totalPercentage === 100
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {totalPercentage.toFixed(2)}%
              </span>

              {totalPercentage !== 100 && (
                <span className="text-xs text-red-600 ml-2">
                  {totalPercentage < 100
                    ? `Missing ${(100 - totalPercentage).toFixed(2)}%`
                    : `Exceeds ${(totalPercentage - 100).toFixed(2)}%`}
                </span>
              )}
            </div>
          </div>

          {totalPercentage < 100 &&
            formData.InventoryBuildingId > 0 &&
            formData.Wing && (
              <Button
                onClick={() => {
                  setEditingPaymentScheduleMasterData(null);
                  setFormData(prev => ({
                    ...initialFormState(),
                    InventoryBuildingId: prev.InventoryBuildingId,
                    Wing: prev.Wing,
                    ProjectId: Number(projectId),
                  }));
                  setErrors({});
                  setIsAddUpdateModalOpen(true);
                }}
                color="blue"
                variant="solid"
                colorMode="extraLight"
                style={{ width: '35px', height: '35px' }}
                centerIcon={<Plus className="h-4 w-4" />}
              />
            )}
        </div>

        {/* DATA TABLE */}

        <DataTable
          data={PaymentScheduleMasterForTable}
          columns={PaymentScheduleMasterColumns}
          pagination={PaymentScheduleMasterPaginationInfo}
          emptyMessage="No Payment Schedule Data Found"
          fixedHeight={true}
          recordsPerPage={20}
          className="flex-1"
        />
      </div>

      {/* Generate Button */}

      {totalPercentage === 100 && (
        <div className="flex justify-end mt-2">
          <Button
            className="border border-green-600 text-green-600 hover:bg-green-50 px-3 py-1 rounded-md"
            onClick={() => {
              if (!validateGenerate()) return;
              handlePaymentScheduleMasterReport();
            }}
          >
            Generate Payment Schedule
          </Button>
        </div>
      )}
      {/*ADD UPDATE MODAL */}

      <Modal
        isOpen={isAddUpdateModalOpen}
        onClose={() => {
          setIsAddUpdateModalOpen(false);
          setEditingPaymentScheduleMasterData(null);

          setFormData(prev => ({
            ...initialFormState(),
            InventoryBuildingId: prev.InventoryBuildingId,
            Wing: prev.Wing,
            ProjectId: prev.ProjectId
          }));
          setErrors({});
        }}
        onCancel={() => {
          setIsAddUpdateModalOpen(false);
          setEditingPaymentScheduleMasterData(null);

          setFormData(prev => ({
            ...initialFormState(),
            InventoryBuildingId: prev.InventoryBuildingId,
            Wing: prev.Wing,
            ProjectId: prev.ProjectId
          }));

          setErrors({});
        }}
        title={editingPaymentScheduleMasterData ? 'Update Schedule' : 'Add Payment Schedule'}
        onSubmit={handleAddEditPaymentScheduleMaster}
        saveText={editingPaymentScheduleMasterData ? 'Update Schedule' : 'Add Schedule'}
        loading={isLoading}
        size="xl"
      >
        <div className="space-y-10 p-6 bg-blue-100">
          <div className="space-y-4" >

            <div>
              <SinglePageSelection
                label="Stages"
                placeholder="Select Stages"
                required
                options={stageOptions}
                value={formData.Stage ?? ''}
                onChange={(value) =>
                  setFormData(prev => ({
                    ...prev,
                    Stage: String(value)
                  }))}
                error={errors.Stage}
              />
            </div>

            <div>
              <Input
                label="Percentage%"
                value={formData.PaymentSchedulePercentage?.toString() ?? ''}
                required
                onChange={(e) => {
                  const val = allowPercentage(e.target.value);
                  if (val !== null) {
                    const percentageValue = filterNumbersWithDecimal(e.target.value);

                    handleFieldChange('PaymentSchedulePercentage', percentageValue);

                    const percentage = Number(percentageValue || 0);
                    const newTotal = calculateCumulative(percentage);

                    if (newTotal > 100) {
                      setErrors(prev => ({
                        ...prev,
                        PaymentSchedulePercentage: "Total percentage cannot exceed 100%"
                      }));
                    } else {
                      setErrors(prev => ({
                        ...prev,
                        PaymentSchedulePercentage: ""
                      }));

                      handleFieldChange('PaymentScheduleCummulativePercentage', newTotal.toFixed(2));
                    }
                  }
                }}
                placeholder="Percentage"
                error={errors.PaymentSchedulePercentage}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setDeletePaymentScheduleMasterData(null);
          setIsConfirmationDialogBoxOpen(false);
        }}
        onConfirm={handleDeletePaymentScheduleMaster}
        loading={isLoading}
        pageName="Payment Schedule"
      />
    </div>
  );
}

export default PaymentScheduleMaster;