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
import { Edit } from "lucide-react";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { fetchBuildingDropdown, fetchWingDropdown } from "../BuildingWingFlatDropdown";
import { useNavigate } from "react-router-dom";
import { fetchPaymentScheduleDropdown } from "@/features/paymentSchedule/paymentScheduleDropDown";

const initialFormState = (): AddUpdatePaymentScheduleMasterRequest => ({
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  PaymentScheduleMasterId: 0,
  ProjectId: 0,
  BuildingId: 0,
  Stage: '',
  PaymentSchedulePercentage: 0,
  PaymentScheduleCummulativePercentage: 0,
  Wing: '',

});

export const PaymentScheduleMaster: React.FC = () => {

  // STATE
  const [PaymentScheduleMasterList, setPaymentScheduleMasterList] = useState<PaymentScheduleMasterData[]>([]);
  const [sortInfo, setSortInfo] = useState<SortInfo>();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [stagedData, setStagedData] = useState<AddUpdatePaymentScheduleMasterRequest[]>([]);
  const [showForm,] = useState(true);
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

  //#region PROJECT SELECTION GET ID
  const { projectId } = useProject();
  //#endregion

  const [ratePerSqFt, setRatePerSqFt] = useState<number>(0);

  // USE NAVIGATE
  const navigate = useNavigate();

  // TOAST
  const { addToast } = useToast();

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions();
  //#endregion

  const calculateCumulative = (currentPercentage: number) => {
    const allRecords = [
      ...PaymentScheduleMasterList,
      ...stagedData,
    ];

    const totalExisting = allRecords.reduce(
      (sum, item) => sum + Number(item.PaymentSchedulePercentage || 0),
      0
    );

    const newTotal = totalExisting + currentPercentage;

    return newTotal;
  };
  //#region LOAD DATA
  const loadPaymentScheduleMaster = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo = {}, sort?: SortInfo) => {

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationPaymentScheduleMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ProjectId: Number(projectId),
          Wing: filterParams.Wing ?? undefined,
          Name: filterParams.Name ?? undefined,
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
      'Loading '
    );
  },
    [projectId, pagination.currentPage, pagination.pageSize, addToast, setPagination,]);
  //#endregion

  //#region INIT
  useEffect(() => {
    if (!projectId) return;

    setPagination({ currentPage: 1 });
    loadPaymentScheduleMaster(1, {}, sortInfo);
  }, [projectId]);
  //#endregion

  useEffect(() => {
    if (!projectId) return;

    fetchBuildingDropdown({
      projectId: projectId
    }).then(res => {
      setBuildingOptions(res.itemList);
    });

  }, [projectId]);

  // ================= BUILDING CHANGE =================

  const handleBuildingChange = async (buildingId: number) => {
    setFormData(prev => ({
      ...prev,
      BuildingId: buildingId,
      Wing: '',
      FlatConfiguration: ''
    }));

    const res = await fetchWingDropdown({
      projectId: projectId ?? undefined,
      buildingId: buildingId ?? undefined
    });

    setWingOptions(res.itemList);
  };

  // ================= WING CHANGE =================

  const handleWingChange = async (wing: string) => {
    setFormData(prev => ({
      ...prev,
      Wing: wing,
      Stage: ''
    }));

    const res = await fetchPaymentScheduleDropdown({
      projectId: projectId ?? undefined,
    });
    setStageOptions(res.itemList);
  };

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingPaymentScheduleMasterData) {
        setFormData({
          PaymentScheduleMasterId: editingPaymentScheduleMasterData.PaymentScheduleMasterId ?? 0,
          BuildingId: editingPaymentScheduleMasterData.BuildingId ?? 0,
          Uniquekey: editingPaymentScheduleMasterData.Uniquekey ?? initialFormState().Uniquekey,
          Stage: editingPaymentScheduleMasterData.Stage ?? '',
          Wing: editingPaymentScheduleMasterData.Wing ?? '',
          PaymentSchedulePercentage: editingPaymentScheduleMasterData.PaymentSchedulePercentage ?? '',
          PaymentScheduleCummulativePercentage: editingPaymentScheduleMasterData.PaymentScheduleCummulativePercentage ?? '',
          ProjectId: Number(projectId),
        });
      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingPaymentScheduleMasterData, projectId]);
  //#endregion

  const handlePageChange = (page: number) => {
    setPagination({ currentPage: page });
    loadPaymentScheduleMaster(1, {}, sortInfo);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    setPagination({ currentPage: 1 });

    loadPaymentScheduleMaster(1, {}, sort);
  }, []);
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: PaymentScheduleMasterData) => {
    setDeletePaymentScheduleMasterData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  const handleFieldChange = (field: keyof AddUpdatePaymentScheduleMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region EDIT PAYMENT SCHEDULE
  const handleEditPaymentScheduleMaster = useCallback((row: PaymentScheduleMasterData) => {
    setEditingPaymentScheduleMasterData({
      ...row,
      Stage: row.Stage
    })
    setIsAddUpdateModalOpen(true);
  }, [])


  // ============================================================= [VALIDATION FUNCTION] =============================================================================================

  const validateUpdatePaymentScheduleMasterForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.Stage) {
      newErrors.Stage = "Stage is required";
    }

    if (!formData.Wing) {
      newErrors.Wing = "Wing is required";
    }

    if (!formData.PaymentSchedulePercentage) {
      newErrors.PaymentSchedulePercentage = "Percentage is required";
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
      BuildingId: Number(formData.BuildingId) || 0,
      Uniquekey: formData.Uniquekey ?? null,
      Stage: formData.Stage ?? null,
      Wing: formData.Wing ?? null,
      PaymentSchedulePercentage: Number(formData.PaymentSchedulePercentage) || 0,
      PaymentScheduleCummulativePercentage: Number(formData.PaymentScheduleCummulativePercentage) || 0,
      ProjectId: Number(projectId),
    };
  };

  // UPDATE PAYMENT SCHEDULE DATA
  const handleAddUpdatePaymentScheduleMaster = async (e: React.FormEvent) => {
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

        const response = await paymentScheduleMasterService.apiCallAddUpdatePaymentScheduleMaster([payload]);

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
      'Update Payment Schedule'
    )
  };
  //#endregion

  //#region TABLE COLUMNS
  const PaymentScheduleMasterColumns = useMemo<TableColumn[]>(() => [
    {
      key: 'Name',
      label: 'Name',
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
      label: 'Cummulative%',
      width: '15',
      sortable: false,
      align: 'center',
      render: (value) => `${value || 0}%`
    },
    {
      key: 'Actions',
      label: 'Actions',
      width: '12',
      fixed: 'right',
      align: 'center',
      render: (_value, row) => (
        <div className="flex items-center justify-center">
          {/* {canAction && ( */}
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

            {/* <Button
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
            /> */}
          </>
          {/* )} */}
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
  //#endregion

  //#region DELETE PAYMENT SCHEDULE
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

          ProjectId: deletePaymentScheduleMasterData.ProjectId || 0
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
          await loadPaymentScheduleMaster(pageToShow);

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
    navigate('/paymentScheduleMasterReport', {
      state: { ratePerSqFt }
    });
  }, [navigate, ratePerSqFt]);
  //#endregion

  //#region
  const validateGenerate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!ratePerSqFt || ratePerSqFt <= 0) {
      newErrors.ratePerSqFt = "Rate is required and must be greater than 0";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  //#endregion

  //#region
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

      {showForm && (

        <div className="my-6 p-2 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-3 gap-4">

            <div>
              <SinglePageSelection
                label="Building"
                placeholder="Select Building"
                options={buildingOptions}
                value={formData.BuildingId || ''}
                required
                error={errors.BuildingId}
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

            <div>
              <SinglePageSelection
                label="Stage"
                placeholder="Select Stage"
                options={stageOptions}
                value={formData.Stage ?? ''}
                onChange={(value) =>
                  setFormData(prev => ({
                    ...prev,
                    Stage: String(value)
                  }))
                }
              />
            </div>

            <div>
              <Input
                label="Percentage"
                type="text"
                value={formData.PaymentSchedulePercentage ?? ''}
                required
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, '');
                  const percentage = digits === '' ? 0 : Number(digits);

                  const newTotal = calculateCumulative(percentage);

                  if (newTotal > 100) {
                    setErrors(prev => ({
                      ...prev,
                      PaymentSchedulePercentage: "Total percentage cannot exceed 100%"
                    }));
                    return;
                  }
                  setFormData(prev => ({
                    ...prev,
                    PaymentSchedulePercentage: percentage,
                    PaymentScheduleCummulativePercentage: newTotal
                  }));
                }}
                error={errors.PaymentSchedulePercentage}

              />
            </div>
          </div>

          {/* Add Button */}
          <div className="flex justify-end mt-1">
            <Button
              className="border border-green-600 text-green-600 hover:bg-green-50 px-3 py-1 rounded-md"
              onClick={() => {
                const validation = validateUpdatePaymentScheduleMasterForm();
                if (!validation.isValid) {
                  setErrors(validation.errors);
                  return;
                }
                const payload = PushPaymentScheduleMasterFormData();

                setStagedData(prev => [...prev, payload]);
                setFormData({
                  ...initialFormState(),
                  ProjectId: Number(projectId)
                });
              }}
            >
              Add
            </Button>
          </div>
        </div>
      )}

      {/* DATA TABLE */}
      {showForm ? (
        <DataTable
          columns={PaymentScheduleMasterColumns}
          data={[...PaymentScheduleMasterForTable, ...stagedData]}
          emptyMessage="No Data Found"
          fixedHeight={true}
          className="flex-1"
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">

            <div>
              <Input
                label="Rate Per Sq.Ft"
                placeholder="Enter Rate"
                required
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

            <div>
              <SinglePageSelection
                label="Wing"
                placeholder="Select Wing"
                options={wingOptions}
                value={formData.Wing ?? ''}
                required
                error={errors.Wing}
                onChange={(value) =>
                  handleFieldChange('Wing', String(value))
                }
              />
            </div>
          </div>

          <DataTable
            data={PaymentScheduleMasterForTable}
            columns={PaymentScheduleMasterColumns}
            pagination={PaymentScheduleMasterPaginationInfo}
            emptyMessage="No Payment Schedule Data Found"
            fixedHeight={true}
            recordsPerPage={20}
            className="flex-1"
            sortInfo={sortInfo}
            onSort={handleSortColumn}
          />
          <div className="flex justify-end mt-4">

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
        </>
      )}

      {showForm && (
        <div className="flex justify-end mt-4">
          <Button
            className="border border-green-600 text-green-600 hover:bg-green-50 px-3 py-1 rounded-md"
            onClick={(e) => {
                handleAddUpdatePaymentScheduleMaster(e);
              }}
          >
            Save
          </Button>
        </div>
      )}

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