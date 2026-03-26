import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Input } from "@/ui/components/forms";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { fetchDepartmentMasterDropdown } from "@/features/departmentMaster/departmentMasterDropdown";
import { fetchDesignationMasterDropdown } from "@/features/designationMaster/designationMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import type {
  AddUpdateLeaveCreditConfigurationRequest,
  LeaveBalanceType,
  FilterWithPaginationLeaveCreditConfigurationRequest,
} from "@/features/leaveCreditConfiguration/models/LeaveCreditConfigurationModel";
import { leaveCreditConfigurationService } from "@/features/leaveCreditConfiguration/services/LeaveCreditConfigurationService";
import {
  formatDate_dd_mm_yyyy,
  convert_dd_mm_yyyy_To_Yyyy_mm_dd,
} from "@/core/utils/dateFormat";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { runApiWithLoader } from "@/core/utils";
import { Plus, Trash2 } from "lucide-react";
import { fetchLeaveTypeMasterDropdown } from "@/features/leaveTypeMaster/leaveTypeMasterDropdown";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { LEAVE_PERIOD_MODES } from "@/core/constants/staticData";
import { useLeaveCreditConfigurationListState } from "@/features/leaveCreditConfiguration/context/LeaveCreditConfigurationListStateContext";

const initialFormState = (): AddUpdateLeaveCreditConfigurationRequest => ({
  LeaveCreditConfigurationId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  LeavePeriodMode: "",
  FinancialYearStartDate: null,
  FinancialYearEndDate: null,
  DepartmentMasterId: 0,
  DesignationId: "",
  LeaveTypebalanceJSONList: "",
});

export const AddUpdateLeaveCreditConfiguration: React.FC = () => {
  //#region STATE MANAGEMENT
  const [formData, setFormData] =
    useState<AddUpdateLeaveCreditConfigurationRequest>(() =>
      initialFormState(),
    );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [leaveBalanceTypes, setLeaveBalanceTypes] = useState<
    LeaveBalanceType[]
  >([]);
  const [leaveTypeLabels, setLeaveTypeLabels] = useState<{
    [index: number]: string;
  }>({});
  const [designationValue, setDesignationValue] = useState<
    string | number | null
  >(null);

  //SET DROP DOWN LABELS
  const [dropdownLabels, setDropdownLabels] = useState<{
    departmentName?: string;
  }>({});
  const leaveBalanceTypeRefs = useRef<{
    [index: number]: HTMLDivElement | null;
  }>({});

  // NAVIGATE
  const navigate = useNavigate();

  //GET VALUE FROM URL :ID
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  // TOAST
  const { addToast } = useToast();

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const designationDropdown = useMultiSelectDropdown({
    value: designationValue,
    fetchCallback: fetchDesignationMasterDropdown,
    autoFetchOptions: true,
  });

  //#endregion

  //#region LEAVE CREDIT CONFIGURATION LIST STATE CONTEXT
  const { resetFilters } = useLeaveCreditConfigurationListState();
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions("/leaveCreditConfiguration");
  //#endregion

  //#region HANDLE CHNAGE EVENT WHEN INPUT BOX ANY OTHER
  const handleFieldChange = (
    field: keyof AddUpdateLeaveCreditConfigurationRequest,
    value: any,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  //#endregion

  //#region FETCH LEAVE CREDIT CONFIGURATION DETAILS
  const fetchLeaveCreditConfigurationDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationLeaveCreditConfigurationRequest = {
          PageNumber: 1,
          PageSize: 1,
          IsCheckPermission: false,
          LeaveCreditConfigurationId: Number(id),
        };

        const response =
          await leaveCreditConfigurationService.apiCallPullLeaveCreditConfiguration(
            params,
          );

        if (E.isRight(response)) {
          const row = response.right.Data?.[0];

          if (row) {
            setFormData((prev) => ({
              ...prev,
              LeaveCreditConfigurationId:
                row.LeaveCreditConfigurationId ??
                prev.LeaveCreditConfigurationId,
              Uniquekey: row.Uniquekey ?? prev.Uniquekey,
              LeavePeriodMode:
                row.LeavePeriodMode ?? prev.LeavePeriodMode ?? "",
              FinancialYearStartDate: row.FinancialYearStartDate
                ? formatDate_dd_mm_yyyy(row.FinancialYearStartDate)
                : (prev.FinancialYearStartDate ?? null),
              FinancialYearEndDate: row.FinancialYearEndDate
                ? formatDate_dd_mm_yyyy(row.FinancialYearEndDate)
                : (prev.FinancialYearEndDate ?? null),
              DesignationId: row.DesignationId ?? prev.DesignationId ?? "",
              DepartmentMasterId:
                row.DepartmentMasterId ?? prev.DepartmentMasterId ?? 0,
              LeaveTypebalanceJSONList: "",
            }));
            setLeaveBalanceTypes(row.LeaveBalanceType || []);

            setDropdownLabels({
              departmentName: row.DepartmentName || "",
            });

            if (row.LeaveBalanceType && row.LeaveBalanceType.length > 0) {
              const labels: { [index: number]: string } = {};
              row.LeaveBalanceType.forEach((item, index) => {
                if (item.LeaveTypeName) {
                  labels[index] = item.LeaveTypeName;
                }
              });
              setLeaveTypeLabels(labels);
            }

            if (row.DesignationId) {
              const designationIdValue =
                typeof row.DesignationId === "string"
                  ? row.DesignationId
                  : String(row.DesignationId);
              setDesignationValue(designationIdValue);
            } else {
              setDesignationValue(null);
            }
          }
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
      "Loading Leave Credit Configuration Data",
    );
  };
  //#endregion

  //#region INITIALIZATION
  useEffect(() => {
    if (id) {
      fetchLeaveCreditConfigurationDetails();
      return;
    }

    setFormData(initialFormState());
    setLeaveBalanceTypes([]);
    setLeaveTypeLabels({});
    setDropdownLabels({});
    setDesignationValue(null);
    setErrors({});
  }, [id]);
  //#endregion

  const handleAddLeaveBalanceType = () => {
    // Clear the "Add at least one Leave Balance Type" error if it exists
    if (errors.LeaveBalanceTypes) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.LeaveBalanceTypes;
        return next;
      });
    }

    const newIndex = leaveBalanceTypes.length;
    setLeaveBalanceTypes((prev) => [
      ...prev,
      {
        LeaveTypeBalanceId: 0,
        LeaveTypeId: 0,
        LeaveCredit: 0,
        LeaveCreditConfigurationId: 0,
        LeaveTypeName: "",
      },
    ]);

    setTimeout(() => {
      const element = leaveBalanceTypeRefs.current[newIndex];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 100);
  };

  const handleRemoveLeaveBalanceType = (index: number) => {
    setLeaveBalanceTypes((prev) => prev.filter((_, i) => i !== index));
    setLeaveTypeLabels((prev) => {
      const reindexed: { [index: number]: string } = {};
      Object.keys(prev).forEach((key) => {
        const oldIndex = Number(key);
        if (oldIndex < index) {
          // Keep indices before the removed one
          reindexed[oldIndex] = prev[oldIndex];
        } else if (oldIndex > index) {
          // Shift indices after the removed one down by 1
          reindexed[oldIndex - 1] = prev[oldIndex];
        }
        // Skip the removed index
      });
      return reindexed;
    });
    // Clean up refs
    const newRefs: { [index: number]: HTMLDivElement | null } = {};
    Object.keys(leaveBalanceTypeRefs.current).forEach((key) => {
      const oldIndex = Number(key);
      if (oldIndex < index) {
        newRefs[oldIndex] = leaveBalanceTypeRefs.current[oldIndex];
      } else if (oldIndex > index) {
        newRefs[oldIndex - 1] = leaveBalanceTypeRefs.current[oldIndex];
      }
    });
    leaveBalanceTypeRefs.current = newRefs;
  };

  const handleUpdateLeaveBalanceType = (
    index: number,
    field: keyof LeaveBalanceType,
    value: any,
  ) => {
    // Clear related validation error if this field was previously invalid
    setErrors((prev) => {
      const next = { ...prev };
      if (field === "LeaveTypeId")
        delete next[`LeaveBalanceType_${index}_LeaveTypeId`];
      if (field === "LeaveCredit")
        delete next[`LeaveBalanceType_${index}_LeaveCredit`];
      return next;
    });

    setLeaveBalanceTypes((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  //#region LEAVE CREDIT CONFIGURATION VALIDATION | ADD | UPDATE ACTION
  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateLeaveCreditConfigurationForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.LeavePeriodMode?.trim()) {
      newErrors.LeavePeriodMode = "Leave Period Mode is required.";
    }

    if (
      !formData.FinancialYearStartDate ||
      formData.FinancialYearStartDate.trim() === ""
    ) {
      newErrors.StartDate = "Start Date is required.";
    }

    if (
      !formData.FinancialYearEndDate ||
      formData.FinancialYearEndDate.trim() === ""
    ) {
      newErrors.EndDate = "End Date is required.";
    }

    if (formData.FinancialYearStartDate && formData.FinancialYearEndDate) {
      const startDate = new Date(
        formData.FinancialYearStartDate.split("-").reverse().join("-"),
      );
      const endDate = new Date(
        formData.FinancialYearEndDate.split("-").reverse().join("-"),
      );
      if (endDate <= startDate) {
        newErrors.EndDate = "End Date must be after Start Date.";
      }
    }

    if (!formData.DepartmentMasterId || formData.DepartmentMasterId === 0) {
      newErrors.DepartmentMasterId = "Department is required.";
    }

    if (leaveBalanceTypes.length === 0) {
      newErrors.LeaveBalanceTypes = "Add at least one Leave Balance Type.";
    }

    leaveBalanceTypes.forEach((item, index) => {
      const leaveTypeId = Number(item.LeaveTypeId);
      if (!leaveTypeId || leaveTypeId === 0 || isNaN(leaveTypeId)) {
        newErrors[`LeaveBalanceType_${index}_LeaveTypeId`] =
          "Leave Type is required.";
      }
      if (
        item.LeaveCredit === undefined ||
        item.LeaveCredit === null ||
        item.LeaveCredit < 0
      ) {
        newErrors[`LeaveBalanceType_${index}_LeaveCredit`] =
          "Leave Credit must be valid.";
      }
    });

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  // ============================================================= [ADD UPDATE FUNCTION] =============================================================================================
  const handleSave = async () => {
    setErrors({});

    const validation = validateLeaveCreditConfigurationForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        // Get designation IDs from the hook
        const designationIdsString =
          designationDropdown.selectedValues.length > 0
            ? designationDropdown.selectedValues.join(",")
            : "";

        const payload: AddUpdateLeaveCreditConfigurationRequest = {
          ...formData,
          DepartmentMasterId: formData.DepartmentMasterId || 0,
          DesignationId: designationIdsString,
          FinancialYearStartDate: convert_dd_mm_yyyy_To_Yyyy_mm_dd(
            formData.FinancialYearStartDate,
          ),
          FinancialYearEndDate: convert_dd_mm_yyyy_To_Yyyy_mm_dd(
            formData.FinancialYearEndDate,
          ),
          LeaveTypebalanceJSONList: JSON.stringify(
            leaveBalanceTypes.map((item) => ({
              LeaveTypeBalanceId: item.LeaveTypeBalanceId || 0,
              LeaveTypeId: item.LeaveTypeId || 0,
              LeaveCredit: item.LeaveCredit || 0,
              LeaveCreditConfigurationId:
                item.LeaveCreditConfigurationId ||
                formData.LeaveCreditConfigurationId ||
                0,
            })),
          ),
        };

        const response =
          await leaveCreditConfigurationService.apiCallAddUpdateLeaveCreditConfiguration(
            payload,
          );

        if (E.isRight(response)) {
          const apiResponse = response.right;

          // Check backend ErrorMessage first
          if (apiResponse.ErrorMessage && apiResponse.ErrorMessage.length > 0) {
            addToast({ type: "error", title: apiResponse.ErrorMessage[0] });
          } else if (
            apiResponse.WarningMessage &&
            apiResponse.WarningMessage.length > 0
          ) {
            addToast({ type: "warning", title: apiResponse.WarningMessage[0] });
            resetFilters();
            navigate("/leaveCreditConfiguration");
          } else {
            // Success - use backend SuccessMessage
            addToast({
              type: "success",
              title: apiResponse.SuccessMessage?.[0],
            });
            resetFilters();
            navigate("/leaveCreditConfiguration");
          }
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
      formData.LeaveCreditConfigurationId === 0
        ? "Adding Leave Credit Configuration..."
        : "Updating Leave Credit Configuration...",
    );
  };
  //#endregion

  return (
    <div className="p-6" style={{ backgroundColor: "#F9FAFB" }}>
      <Loader loading={isLoading} title={loadingMessage}>
        <div />
      </Loader>
      <div className="space-y-6">
        {/* Details Card */}
        <div
          className="rounded-lg shadow-sm border border-gray-200 p-6"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <h3 className="text-md font-medium text-gray-500 mb-2">Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SinglePageSelection
              label="Leave Period Mode"
              required
              options={LEAVE_PERIOD_MODES.map((opt) => ({
                label: opt.name,
                value: opt.id,
              }))}
              value={formData.LeavePeriodMode || ""}
              onChange={(value) => {
                handleFieldChange("LeavePeriodMode", String(value));
              }}
              error={errors.LeavePeriodMode}
              placeholder="Select Leave Period Mode"
              searchable
              size="md"
            />
            <DatePickerInput
              label="Start Date"
              required
              value={formData.FinancialYearStartDate || null}
              onChange={(value) =>
                handleFieldChange("FinancialYearStartDate", value || null)
              }
              error={errors.FinancialYearStartDate}
            />
            <DatePickerInput
              label="End Date"
              required
              value={formData.FinancialYearEndDate || null}
              onChange={(value) =>
                handleFieldChange("FinancialYearEndDate", value || null)
              }
              error={errors.EndDate}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <SingleSelectDropdownWithPagination
              label="Department"
              title="Select Department"
              required
              disabled={isEdit}
              dataFetchCallBack={fetchDepartmentMasterDropdown}
              onSelected={(selectedItem) => {
                const deptId = selectedItem?.value
                  ? Number(selectedItem.value)
                  : null;
                handleFieldChange("DepartmentMasterId", deptId || 0);
                setDropdownLabels((prev) => ({
                  ...prev,
                  departmentName: selectedItem?.label || "",
                }));
                if (errors.DepartmentMasterId) {
                  setErrors((prev) => ({ ...prev, DepartmentMasterId: "" }));
                }
              }}
              initialValue={
                formData.DepartmentMasterId
                  ? createDropdownInitialValue(
                    String(formData.DepartmentMasterId),
                    dropdownLabels.departmentName || "",
                  )
                  : null
              }
              error={errors.DepartmentMasterId}
            />
            <MultiSelectPagination
              label="Designation"
              title="Select Designation"
              disabled={isEdit}
              dataFetchCallBack={fetchDesignationMasterDropdown}
              selectedValues={designationDropdown.selectedValues}
              options={designationDropdown.initialOptions}
              onChange={(values) => {
                const { idsString } = designationDropdown.handleChange(values);
                setDesignationValue(idsString || null);
                if (errors.DesignationId) {
                  setErrors((prev) => ({ ...prev, DesignationId: "" }));
                }
              }}
            />
          </div>
        </div>

        {/* Leave Balance Type Card */}
        <div
          className="rounded-lg shadow-sm border border-gray-200"
          style={{ backgroundColor: "#FFFFFF", padding: "24px" }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium text-gray-500">
              Leave Balance Type
            </h3>
            <Button
              type="button"
              color="blue"
              size="sm"
              onClick={handleAddLeaveBalanceType}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Leave Credit
            </Button>
          </div>
          {errors.LeaveBalanceTypes && (
            <div className="mb-3">
              <p className="text-sm text-red-600">{errors.LeaveBalanceTypes}</p>
            </div>
          )}
          {leaveBalanceTypes.length > 0 && (
            <div className="space-y-3">
              {leaveBalanceTypes.map((item, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    leaveBalanceTypeRefs.current[index] = el;
                  }}
                >
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <SingleSelectDropdownWithPagination
                        key={`leave-type-${index}-${item.LeaveTypeId}`}
                        label="Leave Type"
                        title="Select Leave Type"
                        size="md"
                        required
                        dataFetchCallBack={fetchLeaveTypeMasterDropdown}
                        onSelected={(selectedItem) => {
                          const leaveTypeId = Number(selectedItem?.value);
                          if (leaveTypeId && leaveTypeId > 0) {
                            handleUpdateLeaveBalanceType(
                              index,
                              "LeaveTypeId",
                              leaveTypeId,
                            );
                            setLeaveTypeLabels((prev) => ({
                              ...prev,
                              [index]: selectedItem?.label || "",
                            }));
                            if (
                              errors[`LeaveBalanceType_${index}_LeaveTypeId`]
                            ) {
                              setErrors((prev) => ({
                                ...prev,
                                [`LeaveBalanceType_${index}_LeaveTypeId`]: "",
                              }));
                            }
                          }
                        }}
                        initialValue={
                          item.LeaveTypeId && item.LeaveTypeId > 0
                            ? createDropdownInitialValue(
                              String(item.LeaveTypeId),
                              leaveTypeLabels[index] || "",
                            )
                            : null
                        }
                        error={errors[`LeaveBalanceType_${index}_LeaveTypeId`]}
                      />
                    </div>

                    <div className="flex-1">
                      <Input
                        label="Leave Credit"
                        required
                        type="text"
                        value={item.LeaveCredit}
                        onChange={(e) =>
                          handleUpdateLeaveBalanceType(
                            index,
                            "LeaveCredit",
                            e.target.value === "" ? 0 : Number(e.target.value),
                          )
                        }
                        placeholder="Enter Leave Credit"
                        error={errors[`LeaveBalanceType_${index}_LeaveCredit`]}
                        min={0}
                        maxLength={2}
                        step={1}
                      />
                    </div>
                    <div className="flex-shrink-0 pb-2">
                      <Button
                        type="button"
                        color="transparent"
                        size="sm"
                        style={{ color: 'red' }}
                        onClick={() => handleRemoveLeaveBalanceType(index)}
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4 " />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
       
        <BottomActionBar
          cancelText="Cancel"
          saveText={
            formData.LeaveCreditConfigurationId &&
              formData.LeaveCreditConfigurationId > 0
              ? "Update"
              : "Add"
          }
          onCancel={() => navigate(-1)}
          canAction={canAction}
          onSave={() => {
            void handleSave();
          }}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AddUpdateLeaveCreditConfiguration;
