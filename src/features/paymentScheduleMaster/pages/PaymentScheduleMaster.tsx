import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  PaymentScheduleMasterData,
  FilterWithPaginationPaymentScheduleMasterRequest,
  AddUpdatePaymentScheduleMasterRequest,
  DeletePaymentScheduleMasterRequest,
} from "@/features/paymentScheduleMaster/models/PaymentScheduleMasterModel";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import usePagination from "@/core/hooks/usePagination";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Loader } from "@/core/utils/loader";
import { paymentScheduleMasterService } from "@/features/paymentScheduleMaster/services/PaymentScheduleMasterService";
import * as E from "fp-ts/Either";
import { Button, Input } from "@/ui/components/forms";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { Modal } from "@/ui/components/Modal/Modal";
import { allowPercentage, filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import { fetchPaymentScheduleDropdown } from "@/features/paymentScheduleMaster/paymentScheduleDropDown";
import { fetchPaymentScheduleSchemeMasterDropDown } from "@/features/paymentScheduleSchemeMaster/PaymentScheduleSchemeMasterDropdown";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { FieldItem } from "@/ui/components/forms/FieldItem";

const initialFormState = (): AddUpdatePaymentScheduleMasterRequest => ({
  PaymentScheduleMasterId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  ProjectId: 0,
  InventoryBuildingId: 0,
  InventoryFlatFloorBasementPodiumWingId: 0,
  PaymentScheduleSchemeMasterId: 0,
  PaymentSchedulePercentage: 0,
  PaymentScheduleCummulativePercentage: 0,
  Stage: "",
});

export const PaymentScheduleMaster: React.FC = () => {
  const [PaymentScheduleMasterList, setPaymentScheduleMasterList] = useState<PaymentScheduleMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [stageOptions, setStageOptions] = useState<{ label: string; value: string }[]>([]);

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deletePaymentScheduleMasterData, setDeletePaymentScheduleMasterData] = useState<PaymentScheduleMasterData | null>(null);

  const [editingPaymentScheduleMasterData, setEditingPaymentScheduleMasterData] = useState<PaymentScheduleMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
  const [formData, setFormData] = useState<AddUpdatePaymentScheduleMasterRequest>(() => initialFormState());

  const [buildingName, setBuildingName] = useState<string>();
  const [wingName, setWingName] = useState<string>();

  const { pagination, setPagination } = usePagination(20);

  const { projectId } = useProject();

  const { addToast } = useToast();

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const { canAction } = useMenuPermissions();

  const fetchPaymentScheduleSchemeMaster = () => (page: number, params?: { value?: string }) =>
    fetchPaymentScheduleSchemeMasterDropDown(page, {
      projectId: Number(projectId),
      paymentScheduleScheme: params?.value || "",
      isReuiredOthersOption: false,
    });

  const loadPaymentScheduleMaster = useCallback(
    async (
      page: number = pagination.currentPage,
      filterParams: FilterInfo = {},
      sort?: SortInfo,
      schemeId?: number,
      buildingId?: number,
      wingId?: number,
    ) => {
      await runApiWithLoader(
        setIsLoading,
        setLoadingMessage,

        async () => {
          const params: FilterWithPaginationPaymentScheduleMasterRequest = {
            PageNumber: page,
            PageSize: pagination.pageSize,
            ProjectId: Number(projectId),
            PaymentScheduleSchemeMasterId: Number(schemeId) ?? formData.PaymentScheduleSchemeMasterId,
            InventoryBuildingId: buildingId ?? formData.InventoryBuildingId,
            InventoryFlatFloorBasementPodiumWingId: wingId ?? formData.InventoryFlatFloorBasementPodiumWingId,
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
            addToast({ type: "error", title: response.left.message });
          }
        },
        undefined,
        (error: any) => addToast({ type: "error", title: error.message }),
        undefined,
        "Loading Data ",
      );
    },
    [projectId, formData.PaymentScheduleMasterId, pagination.currentPage, pagination.pageSize, addToast, setPagination],
  );

  useEffect(() => {
    setFormData(initialFormState());

    setStageOptions([]);

    setPaymentScheduleMasterList([]);

    setBuildingName("");

    setWingName("");

    setPagination({
      currentPage: 1,
      totalRecords: 0,
      totalPages: 1,
    });
  }, [projectId]);

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      fetchPaymentSchedulestage();
    }
  }, [isAddUpdateModalOpen]);

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingPaymentScheduleMasterData) {
        setFormData({
          PaymentScheduleMasterId: editingPaymentScheduleMasterData.PaymentScheduleMasterId ?? 0,
          InventoryBuildingId: formData.InventoryBuildingId,
          InventoryFlatFloorBasementPodiumWingId: formData.InventoryFlatFloorBasementPodiumWingId,
          Uniquekey: editingPaymentScheduleMasterData.Uniquekey ?? initialFormState().Uniquekey,
          Stage: editingPaymentScheduleMasterData.Stage ?? "",
          PaymentSchedulePercentage: editingPaymentScheduleMasterData.PaymentSchedulePercentage ?? "",
          PaymentScheduleCummulativePercentage: editingPaymentScheduleMasterData.PaymentScheduleCummulativePercentage ?? "",
          ProjectId: Number(projectId),
          PaymentScheduleSchemeMasterId: editingPaymentScheduleMasterData.PaymentScheduleSchemeMasterId ?? null,
        });
      } else {
        setFormData((prev) => ({
          ...initialFormState(),
          PaymentScheduleSchemeMasterId: prev.PaymentScheduleSchemeMasterId,
          InventoryBuildingId: prev.InventoryBuildingId,
          InventoryFlatFloorBasementPodiumWingId: prev.InventoryFlatFloorBasementPodiumWingId,
          ProjectId: Number(projectId),
        }));
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingPaymentScheduleMasterData, projectId]);

  const handlePageChange = (page: number) => {
    setPagination({ currentPage: page });
    loadPaymentScheduleMaster(1, {});
  };

  const handleConfirmationDialogBoxOpen = useCallback((row: PaymentScheduleMasterData) => {
    setDeletePaymentScheduleMasterData(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);

  const fetchPaymentSchedulestage = async () => {
    const res = await fetchPaymentScheduleDropdown({
      projectId: projectId ?? undefined,
      inventoryBuildingId: formData.InventoryBuildingId,
      inventoryFlatFloorBasementPodiumWingId: formData.InventoryFlatFloorBasementPodiumWingId,
    });

    setStageOptions(res.itemList);
  };

  const calculateCumulative = (currentPercentage: number) => {
    const totalExisting = PaymentScheduleMasterList.reduce(
      (sum, item) =>
        sum +
        (editingPaymentScheduleMasterData && item.PaymentScheduleMasterId === editingPaymentScheduleMasterData.PaymentScheduleMasterId
          ? 0
          : Number(item.PaymentSchedulePercentage || 0)),
      0,
    );

    return totalExisting + currentPercentage;
  };

  const totalPercentage = useMemo(() => {
    return PaymentScheduleMasterList.reduce((sum, item) => sum + Number(item.PaymentSchedulePercentage || 0), 0);
  }, [PaymentScheduleMasterList]);

  const handleEditPaymentScheduleMaster = useCallback(
    async (row: PaymentScheduleMasterData) => {
      setEditingPaymentScheduleMasterData(row);
      setIsAddUpdateModalOpen(true);
    },
    [projectId],
  );

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
    if (Number(formData.PaymentSchedulePercentage) === 0) {
      newErrors.PaymentSchedulePercentage = "Percentage is required";
    }

    const percentage = Number(formData.PaymentSchedulePercentage || 0);
    const newTotal = calculateCumulative(percentage);

    if (newTotal > 100) {
      newErrors.PaymentSchedulePercentage = "Total percentage cannot exceed 100%";
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
      InventoryFlatFloorBasementPodiumWingId: formData.InventoryFlatFloorBasementPodiumWingId ?? 0,
      PaymentSchedulePercentage: Number(formData.PaymentSchedulePercentage) || 0,
      PaymentScheduleCummulativePercentage: Number(formData.PaymentScheduleCummulativePercentage) || 0,
      ProjectId: Number(projectId),
      PaymentScheduleSchemeMasterId: formData.PaymentScheduleSchemeMasterId ?? 0,
    };
  };

  //ADD UPDATE PAYMENT SCHEDULE DATA
  const handleAddEditPaymentScheduleMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});
    const validation = validateUpdatePaymentScheduleMasterForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
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
            const newRecord = response.right.Data[0] as PaymentScheduleMasterData;

            setPaymentScheduleMasterList((prevData) => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize),
            });

            addToast({
              type: "success",
              title: response.right.SuccessMessage[0],
            });
          } else {
            const updatedRecord = response.right.Data[0] as PaymentScheduleMasterData;

            setPaymentScheduleMasterList((prevData) =>
              prevData.map((item) => (item.PaymentScheduleMasterId === formData.PaymentScheduleMasterId ? updatedRecord : item)),
            );

            addToast({
              type: "success",
              title: response.right.SuccessMessage[0],
            });
          }

          totalPercentage;

          setEditingPaymentScheduleMasterData(null);
        } else {
          addToast({ type: "error", title: response.left?.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      Number(formData.PaymentScheduleMasterId) === 0 ? "Adding Payment Schedule" : "Updating Payment Schedule",
    );
  };
  //#endregion

  //#region TABLE COLUMNS
  const PaymentScheduleMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "Stage",
        label: "Stage",
        width: "25",
        sortable: false,
        fixed: "left",
        align: "left",
        render: (value) => <TooltipText text={value || "-"} maxWidth="250px" tooltipThreshold={25} />,
      },
      {
        key: "PaymentSchedulePercentage",
        label: "Percentage (%)",
        width: "25",
        sortable: false,
        align: "center",
        render: (value) => `${value || 0}%`,
      },
      {
        key: "PaymentScheduleCummulativePercentage",
        label: "Cumulative Percentage (%)",
        width: "15",
        sortable: false,
        align: "center",
        render: (_value, _row, rowIndex) => {
          const cumulative = PaymentScheduleMasterList.slice(0, rowIndex + 1).reduce(
            (sum, item) => sum + Number(item.PaymentSchedulePercentage || 0),
            0,
          );

          return `${cumulative}%`;
        },
      },
      {
        key: "Actions",
        label: "Actions",
        width: "12",
        fixed: "right",
        align: "center",
        render: (_value, row) => (
          <div className="flex items-center justify-center">

            <Button
              color="transparent"
              size="sm"
              style={{
                color: canAction ? '' : '#9CA3AF',
                padding: '4px 8px',
                cursor: canAction ? 'pointer' : 'not-allowed',
                opacity: canAction ? 1 : 0.5
              }}

              disabled={!canAction}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!canAction) return;
                handleEditPaymentScheduleMaster(row);
              }}
              leftIcon={<Edit className="h-4 w-4" />}
            />

            <Button
              color="transparent"
              size="sm"
              style={{
                color: canAction ? 'red' : '#9CA3AF',
                padding: '4px 8px',
                cursor: canAction ? 'pointer' : 'not-allowed',
                opacity: canAction ? 1 : 0.5
              }}
              disabled={!canAction}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!canAction) return;
                handleConfirmationDialogBoxOpen(row);
              }}
              leftIcon={<Trash2 className="h-4 w-4" />}
            />

          </div>
        ),
      },
    ],
    [canAction, calculateCumulative, handleEditPaymentScheduleMaster, handleConfirmationDialogBoxOpen],
  );
  //#endregion

  //#region TABLE PAGINATION INFO
  const PaymentScheduleMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange,
    }),
    [pagination, handlePageChange],
  );
  const PaymentScheduleMasterForTable = useMemo(() => PaymentScheduleMasterList, [PaymentScheduleMasterList]);

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

          ProjectId: Number(projectId),
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
            totalPages: newTotalPages,
          });

          await loadPaymentScheduleMaster(pageToShow, {}, undefined, formData.PaymentScheduleSchemeMasterId ?? 0, formData.InventoryBuildingId, formData.InventoryFlatFloorBasementPodiumWingId);

          addToast({
            type: "success",
            title: response.right.SuccessMessage?.[0],
          });

          setIsConfirmationDialogBoxOpen(false);
          setDeletePaymentScheduleMasterData(null);
        } else {
          addToast({ type: "error", title: response.left.message });
          setIsConfirmationDialogBoxOpen(false);
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Deleting Payment Schedule",
    );
  };
  //#endregion

  //#region HANDLE FIELD CHANGE
  const handleFieldChange = (field: keyof AddUpdatePaymentScheduleMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#region

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <Loader loading={isLoading} title={loadingMessage}>
        {" "}
        <div />{" "}
      </Loader>

      <div className="p-4">
        <div className="grid grid-cols-3 gap-4">

          <SingleSelectDropdownWithPagination
            key={projectId}
            label="Payment Schedule Scheme"
            title="Select Payment Schedule Scheme"
            size="lg"
            dataFetchCallBack={fetchPaymentScheduleSchemeMaster()}
            onSelected={(item) => {
              if (!item) {
                setFormData((prev) => ({
                  ...prev,
                  InventoryBuildingId: 0,
                  InventoryFlatFloorBasementPodiumWingId: 0,
                  PaymentScheduleSchemeMasterId: 0,
                }));

                handleFieldChange("PaymentScheduleSchemeMasterId", 0);

                setBuildingName("");
                setWingName("");

                setPaymentScheduleMasterList([]);

                return;
              }

              const schemeId = Number(item?.value);
              const buildingId = item?.inventoryBuildingId;
              const wingId = item?.inventoryFlatFloorBasementPodiumWingId;

              setFormData((prev) => ({
                ...prev,
                InventoryBuildingId: buildingId ?? 0,
                InventoryFlatFloorBasementPodiumWingId: wingId ?? 0,
                PaymentScheduleSchemeMasterId: schemeId,
              }));

              setBuildingName(item?.buildingName || "");
              setWingName(item?.wingName || "");

              handleFieldChange("PaymentScheduleSchemeMasterId", schemeId);

              setPaymentScheduleMasterList([]);

              loadPaymentScheduleMaster(1, {}, undefined, schemeId, buildingId, wingId);
            }}
            error={errors.PaymentScheduleSchemeMasterId}
          />

        </div>

        {Number(formData.PaymentScheduleSchemeMasterId) > 0 && (
          <div className="pt-5">
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <FieldItem label="Building" value={buildingName || "-"} />
                <FieldItem label="Wing" value={wingName || "-"} />
                <FieldItem
                  label="Total"
                  value={
                    <div className="flex items-center">
                      <span className={`font-bold ${totalPercentage === 100 ? "text-green-600" : "text-red-600"}`}>
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
                  }
                />
              </div>
            </div>
          </div>
        )}
        {/* TOTAL SUMMARY */}
        <div className="space-y-4 pt-5">
          <div className="flex items-center justify-between border-b border-gray-300 pb-2">
            <div className="flex items-center gap-30">
              <h3 className="text-lg font-semibold text-gray-900">Payment Schedule List</h3>
            </div>

            {canAction && totalPercentage < 100 && Number(formData.PaymentScheduleSchemeMasterId) > 0 && (
              <Button
                onClick={() => {
                  setEditingPaymentScheduleMasterData(null);
                  setFormData((prev) => ({
                    ...initialFormState(),
                    PaymentScheduleSchemeMasterId: prev.PaymentScheduleSchemeMasterId,
                    InventoryBuildingId: prev.InventoryBuildingId,
                    InventoryFlatFloorBasementPodiumWingId: prev.InventoryFlatFloorBasementPodiumWingId,
                    ProjectId: Number(projectId),
                  }));
                  setErrors({});
                  setIsAddUpdateModalOpen(true);
                }}
                color="blue"
                variant="solid"
                colorMode="extraLight"
                style={{ width: "35px", height: "35px" }}
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
      </div>
      {/*ADD UPDATE MODAL */}

      <Modal
        isOpen={isAddUpdateModalOpen}
        onClose={() => {
          setIsAddUpdateModalOpen(false);
          setEditingPaymentScheduleMasterData(null);

          setFormData((prev) => ({
            ...initialFormState(),
            PaymentScheduleSchemeMasterId: prev.PaymentScheduleSchemeMasterId,
            InventoryBuildingId: prev.InventoryBuildingId,
            InventoryFlatFloorBasementPodiumWingId: prev.InventoryFlatFloorBasementPodiumWingId,
            ProjectId: prev.ProjectId,
          }));
          setErrors({});
        }}
        onCancel={() => {
          setIsAddUpdateModalOpen(false);
          setEditingPaymentScheduleMasterData(null);

          setFormData((prev) => ({
            ...initialFormState(),
            PaymentScheduleSchemeMasterId: prev.PaymentScheduleSchemeMasterId,
            InventoryBuildingId: prev.InventoryBuildingId,
            InventoryFlatFloorBasementPodiumWingId: prev.InventoryFlatFloorBasementPodiumWingId,
            ProjectId: prev.ProjectId,
          }));

          setErrors({});
        }}
        title={editingPaymentScheduleMasterData ? "Update Payment Schedule" : "Add Payment Schedule"}
        onSubmit={handleAddEditPaymentScheduleMaster}
        saveText={editingPaymentScheduleMasterData ? "Update" : "Add"}
        loading={isLoading}
        size="xl"
      >
        <div className="space-y-10 p-6 bg-blue-100">
          <div className="space-y-4">
            <div>
              <SinglePageSelection
                label="Stages"
                placeholder="Select Stages"
                required
                options={stageOptions}
                value={formData.Stage ?? ""}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    Stage: String(value),
                  }))
                }
                error={errors.Stage}
              />
            </div>

            <div>
              <Input
                label="Percentage (%)"
                value={formData.PaymentSchedulePercentage?.toString() ?? ""}
                required
                onChange={(e) => {
                  const val = allowPercentage(e.target.value);
                  if (val !== null) {
                    const percentageValue = filterNumbersWithDecimal(e.target.value);

                    handleFieldChange("PaymentSchedulePercentage", percentageValue);

                    const percentage = Number(percentageValue || 0);

                    const newTotal = calculateCumulative(percentage);

                    if (newTotal > 100) {
                      setErrors((prev) => ({
                        ...prev,
                        PaymentSchedulePercentage: "Total percentage cannot exceed 100%",
                      }));
                    } else {
                      setErrors((prev) => ({
                        ...prev,
                        PaymentSchedulePercentage: "",
                      }));

                      handleFieldChange("PaymentScheduleCummulativePercentage", newTotal.toFixed(2));
                    }
                  }
                }}
                placeholder="Percentage"
                rightIcon="%"
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
};

export default PaymentScheduleMaster;
