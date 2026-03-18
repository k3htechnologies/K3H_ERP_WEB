import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react";
import React from "react";
import type {
  AddUpdateShiftMasterRequest,
  FilterWithPaginationShiftMasterRequest,
} from "@/features/shiftMaster/models/ShiftMasterModel";
import { shiftMasterService } from "@/features/shiftMaster/services/ShiftMasterService";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { filterNumbers, isEndTimeGreater } from "@/core/utils/fileValidation";
import { TextArea } from "@/ui/components/forms/Textarea";
import { getTimeDuration, toHHMM, toMinutes } from "@/core/utils/comman";
import RadioButton from "@/ui/components/forms/RadioButton";
import { Clock } from "lucide-react";
import { TimePickerCustomize } from "@/ui/components/TimePicker/TimePickerCustomize";

const initialFormState = (): AddUpdateShiftMasterRequest => ({
  ShiftManagementMasterId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  ShiftCode: "",
  ShiftName: "",
  ShiftBeginTime: "00:00",
  ShiftEndTime: "00:00",
  ShiftDurationTime: "00:00",
  ShiftWorkDurationTime: "00:00",
  FirstHalfUpTo: "00:00",
  AbsentWorkingHours: "00:00",
  HalfDayWorkingHours: "00:00",
  HalfDayInTimeAfter: "00:00",
  HalfDayOutTimeBefore: "00:00",
  BreakBeginTime: "00:00",
  BreakEndTime: "00:00",
  BreakDurationTime: "00:00",
  GraceTime: "",
  Remarks: "",
  LateArrivalAction: "",
  LateCount: 0,
});

export const AddUpdateShiftMaster: React.FC = () => {
  //#region STATE MANAGEMENT
  const [formData, setFormData] = useState<AddUpdateShiftMasterRequest>(() =>
    initialFormState(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [timePickerField, setTimePickerField] = useState<{
    field: keyof AddUpdateShiftMasterRequest;
    value: string;
  } | null>(null);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  // NAVIGATE
  const navigate = useNavigate();

  // GET VALUE FROM URL SHIFT ID
  const { ShiftManagementMasterId } = useParams<{
    ShiftManagementMasterId?: string;
  }>();

  const ShiftId = ShiftManagementMasterId ? Number(ShiftManagementMasterId) : 0;
  const isAddMode = ShiftId === 0;

  // TOAST
  const { addToast } = useToast();

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions("/ShiftMaster");
  //#endregion

  // ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  //#endregion

  const [minuteValues, setMinuteValues] = useState({
    AbsentWorkingHours: "",
    HalfDayWorkingHours: "",
    HalfDayInTimeAfter: "",
    HalfDayOutTimeBefore: "",
  });

  const isWithinShift = (time: string) =>
    isEndTimeGreater(formData.ShiftBeginTime, time) &&
    isEndTimeGreater(time, formData.ShiftEndTime);

  const formatLabel = (value: string) =>
    value
      .split(/(?=[A-Z])/)
      .join(" ")
      .trim();

  //#region CONVERT MINUTES TO HOUR
  const handleMinuteFieldChange = (
    field: keyof AddUpdateShiftMasterRequest,
    value: string,
  ) => {
    const minutes = filterNumbers(value) || "0";
    setMinuteValues((prev) => ({
      ...prev,
      [field]: minutes,
    }));

    handleFieldChange(field, toHHMM(Number(minutes)));
  };
  //#endregion

  //#region HANDLE FIELD CHANGE EVENT
  const handleFieldChange = (
    field: keyof AddUpdateShiftMasterRequest,
    value: any,
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "ShiftBeginTime" || field === "ShiftEndTime") {
        const duration = getTimeDuration(
          updated.ShiftBeginTime,
          updated.ShiftEndTime,
        );

        updated.ShiftDurationTime = duration;

        const shiftMins = toMinutes(duration);
        const breakMins = toMinutes(updated.BreakDurationTime);

        const workMins = Math.max(shiftMins - breakMins, 0);
        updated.ShiftWorkDurationTime = toHHMM(workMins);
      }

      if (field === "BreakBeginTime" || field === "BreakEndTime") {
        const breakDuration = getTimeDuration(
          updated.BreakBeginTime,
          updated.BreakEndTime,
        );

        updated.BreakDurationTime = breakDuration;

        const shiftMins = toMinutes(updated.ShiftDurationTime);
        const breakMins = toMinutes(breakDuration);

        const workMins = Math.max(shiftMins - breakMins, 0);
        updated.ShiftWorkDurationTime = toHHMM(workMins);
      }
      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region INITIALIZATION
  useEffect(() => {
    if (!isAddMode) {
      fetchShiftMasterDetails();
    }
  }, [ShiftId]);
  //#endregion

  //#region FETCH  SHIFT MASTER DETAILS
  const fetchShiftMasterDetails = async () => {
    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,

      async () => {
        const params: FilterWithPaginationShiftMasterRequest = {
          PageNumber: 1,
          PageSize: 1,
          ShiftManagementMasterId: ShiftId,
        };

        const response = await shiftMasterService.apiCallPullShiftMaster(params);

        if (E.isRight(response)) {

          const e = response.right.Data?.[0];

          if (e) {
            setFormData((prev) => ({
              ...prev,
              ShiftManagementMasterId:
                e.ShiftManagementMasterId ?? prev.ShiftManagementMasterId,
              Uniquekey: e.Uniquekey ?? prev.Uniquekey,
              ShiftCode: e.ShiftCode ?? prev.ShiftCode,
              ShiftName: e.ShiftName ?? prev.ShiftName,
              ShiftBeginTime: e.ShiftBeginTime ?? prev.ShiftBeginTime,
              ShiftEndTime: e.ShiftEndTime ?? prev.ShiftEndTime,
              ShiftDurationTime: e.ShiftDurationTime ?? prev.ShiftDurationTime,
              ShiftWorkDurationTime:
                e.ShiftWorkDurationTime ?? prev.ShiftWorkDurationTime,
              FirstHalfUpTo: e.FirstHalfUpTo ?? prev.FirstHalfUpTo,
              AbsentWorkingHours:
                e.AbsentWorkingHours ?? prev.AbsentWorkingHours,
              HalfDayWorkingHours:
                e.HalfDayWorkingHours ?? prev.HalfDayWorkingHours,
              HalfDayInTimeAfter:
                e.HalfDayInTimeAfter ?? prev.HalfDayInTimeAfter,
              HalfDayOutTimeBefore:
                e.HalfDayOutTimeBefore ?? prev.HalfDayOutTimeBefore,
              BreakBeginTime: e.BreakBeginTime ?? prev.BreakBeginTime,
              BreakEndTime: e.BreakEndTime ?? prev.BreakEndTime,
              BreakDurationTime: e.BreakDurationTime ?? prev.BreakDurationTime,
              GraceTime: e.GraceTime ?? prev.GraceTime,
              Remarks: e.Remarks ?? prev.Remarks,
              LateArrivalAction: e.LateArrivalAction ?? prev.LateArrivalAction,
              LateCount: e.LateCount ?? prev.LateCount,
            }));
            setMinuteValues({
              AbsentWorkingHours: e.AbsentWorkingHours
                ? String(toMinutes(e.AbsentWorkingHours))
                : "",
              HalfDayWorkingHours: e.HalfDayWorkingHours
                ? String(toMinutes(e.HalfDayWorkingHours))
                : "",
              HalfDayInTimeAfter: e.HalfDayInTimeAfter
                ? String(toMinutes(e.HalfDayInTimeAfter))
                : "",
              HalfDayOutTimeBefore: e.HalfDayOutTimeBefore
                ? String(toMinutes(e.HalfDayOutTimeBefore))
                : "",
            });
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
      "Loading Shift",
    );
  };
  //#endregion

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddShiftMasterForm = (): {
    isValid: boolean;

    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.ShiftName) {
      newErrors.ShiftName = "Shift Name is required.";
    } else if (formData.ShiftName.trim().length > 50) {
      newErrors.ShiftName = "Shift Name must be at most 50 characters";
    }

    if (!formData.ShiftCode) {
      newErrors.ShiftCode = "Shift Code is required.";
    }

    if (!formData.ShiftBeginTime || formData.ShiftBeginTime === "00:00") {
      newErrors.ShiftBeginTime = "Shift Begin Time is required.";
    }

    if (!formData.ShiftEndTime || formData.ShiftEndTime === "00:00") {
      newErrors.ShiftEndTime = "Shift End Time is required.";
    } else if (
      !isEndTimeGreater(formData.ShiftBeginTime, formData.ShiftEndTime)
    ) {
      newErrors.ShiftEndTime = "End time must be greater than start time.";
    }

    if (!formData.FirstHalfUpTo || formData.FirstHalfUpTo === "00:00") {
      newErrors.FirstHalfUpTo = "First Half Up To is required.";
    } else if (!isWithinShift(formData.FirstHalfUpTo)) {
      newErrors.FirstHalfUpTo = "First Half time must be within Shift time.";
    }

    if (!isEndTimeGreater(formData.ShiftBeginTime, formData.BreakBeginTime)) {
      newErrors.BreakBeginTime =
        "Break Begin time must be greater than Shift start time.";
    }

    if (!formData.BreakBeginTime || formData.BreakBeginTime === "00:00") {
      newErrors.BreakBeginTime = "Break Begin Time is required.";
    } else if (!isWithinShift(formData.BreakBeginTime)) {
      newErrors.BreakBeginTime = "Break Begin Time must be within Shift time.";
    }

    if (!formData.BreakBeginTime || formData.BreakBeginTime === "00:00") {
      newErrors.BreakBeginTime = "Break Begin Time is required.";
    } else if (!isWithinShift(formData.BreakBeginTime)) {
      newErrors.BreakBeginTime = "Break Begin Time must be within Shift time.";
    }

    if (!formData.BreakEndTime || formData.BreakEndTime === "00:00") {
      newErrors.BreakEndTime = "Break End Time is required.";
    } else if (!isWithinShift(formData.BreakEndTime)) {
      newErrors.BreakEndTime = "Break End Time must be within Shift time.";
    } else if (
      formData.BreakBeginTime &&
      formData.BreakBeginTime !== "00:00" &&
      isWithinShift(formData.BreakBeginTime) &&
      !isEndTimeGreater(formData.BreakBeginTime, formData.BreakEndTime)
    ) {
      newErrors.BreakEndTime =
        "Break End Time must be greater than Break Begin Time.";
    }

    if (!formData.GraceTime) {
      newErrors.GraceTime = "Grace Time is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };
  //#endregion

  //#region PUSH DATA
  const PushShiftMasterFormData = (): AddUpdateShiftMasterRequest => {
    return {
      ShiftManagementMasterId: formData.ShiftManagementMasterId,
      Uniquekey: formData.Uniquekey,
      ShiftCode: formData.ShiftCode,
      ShiftName: formData.ShiftName,
      ShiftBeginTime: formData.ShiftBeginTime,
      ShiftEndTime: formData.ShiftEndTime,
      ShiftDurationTime: formData.ShiftDurationTime,
      ShiftWorkDurationTime: formData.ShiftWorkDurationTime,
      FirstHalfUpTo: formData.FirstHalfUpTo,
      AbsentWorkingHours: formData.AbsentWorkingHours,
      HalfDayWorkingHours: formData.HalfDayWorkingHours,
      HalfDayInTimeAfter: formData.HalfDayInTimeAfter,
      HalfDayOutTimeBefore: formData.HalfDayOutTimeBefore,
      BreakBeginTime: formData.BreakBeginTime,
      BreakEndTime: formData.BreakEndTime,
      BreakDurationTime: formData.BreakDurationTime,
      GraceTime: formData.GraceTime,
      Remarks: formData.Remarks,
      LateArrivalAction: formData.LateArrivalAction,
      LateCount: formData.LateCount || 0,
    };
  };
  //#endregion

  //#region HANDLE ADD AND UPDATE SHIFT MASTER
  const handleAddUpdateShiftMaster = async () => {
    setErrors({});

    const validation = validateAddShiftMasterForm();

    if (!validation.isValid) {
      setErrors(validation.errors);

      addToast({ type: "error", title: "Please fill the required filed" });
      return;
    }

    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,

      async () => {
        const payload = PushShiftMasterFormData();

        const response =
          await shiftMasterService.apiCallAddUpdateShiftMaster(payload);

        if (E.isRight(response)) {
          addToast({
            type: "success",
            title: isAddMode
              ? "Shift added successfully"
              : "Shift updated successfully",
          });

          navigate("/shiftMaster");
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
      isAddMode ? "Add Shift" : "Update Shift",
    );
  };
  //#endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Loader */}

      <Loader loading={isLoading} title={loadingMessage}>
        {" "}
        <div></div>{" "}
      </Loader>

      <div className="flex-1 space-y-2 px-6 py-3  overflow-y-auto thin-scroll ">
        <form onSubmit={handleAddUpdateShiftMaster}>
          {/* Basic Shift Details */}

          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Shift Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
              <div>
                <Input
                  type="text"
                  required
                  label="Shift Name"
                  value={formData.ShiftName ?? ""}
                  onChange={(e) =>
                    handleFieldChange("ShiftName", e.target.value)
                  }
                  placeholder="Enter Shift Name"
                  maxLength={250}
                  error={errors.ShiftName}
                />
              </div>

              <div>
                <Input
                  type="text"
                  required
                  label="Shift Code "
                  value={formData.ShiftCode.toUpperCase() ?? ""}
                  onChange={(e) =>
                    handleFieldChange("ShiftCode", e.target.value)
                  }
                  placeholder="Enter Shift Code"
                  maxLength={4}
                  error={errors.ShiftCode}
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
              Time Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
              <div>
                <Input
                  label="Shift Begin Time"
                  required
                  value={formData.ShiftBeginTime || ""}
                  onClick={() => {
                    setTimePickerField({
                      field: "ShiftBeginTime",
                      value: formData.ShiftBeginTime,
                    });
                    setIsTimePickerOpen(true);
                  }}
                  leftIcon={<Clock className="h-8 w-8" />}
                  error={errors.ShiftBeginTime}
                />
              </div>

              <div>
                <Input
                  label="Shift End Time"
                  required
                  value={formData.ShiftEndTime || ""}
                  onClick={() => {
                    setTimePickerField({
                      field: "ShiftEndTime",
                      value: formData.ShiftEndTime,
                    });
                    setIsTimePickerOpen(true);
                  }}
                  leftIcon={<Clock className="h-8 w-8" />}
                  error={errors.ShiftEndTime}
                />
              </div>

              <div>
                <Input
                  label="Shift Duration (24 hours Format)"
                  disabled
                  size="md"
                  value={formData.ShiftDurationTime || ""}
                  onChange={(val) =>
                    handleFieldChange("ShiftDurationTime", val)
                  }
                  leftIcon={<Clock className="h-8 w-8" />}
                  error={errors.ShiftDurationTime}
                />
              </div>

              <div>
                <Input
                  label="Shift Work Duration (24 hours Format)"
                  disabled
                  size="md"
                  value={formData.ShiftWorkDurationTime || ""}
                  onChange={(val) =>
                    handleFieldChange("ShiftWorkDurationTime", val)
                  }
                  leftIcon={<Clock className="h-8 w-8" />}
                  error={errors.ShiftWorkDurationTime}
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
              Break Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
              <div>
                <Input
                  label="Break Begin Time (24 hours Format)"
                  required
                  size="md"
                  value={formData.BreakBeginTime || ""}
                  onClick={() => {
                    setTimePickerField({
                      field: "BreakBeginTime",
                      value: formData.BreakBeginTime,
                    });
                    setIsTimePickerOpen(true);
                  }}
                  leftIcon={<Clock className="h-8 w-8" />}
                  error={errors.BreakBeginTime}
                />
              </div>

              <div>
                <Input
                  label="Break End Time (24 hours Format)"
                  required
                  size="md"
                  value={formData.BreakEndTime || ""}
                  onClick={() => {
                    setTimePickerField({
                      field: "BreakEndTime",
                      value: formData.BreakEndTime,
                    });
                    setIsTimePickerOpen(true);
                  }}
                  leftIcon={<Clock className="h-8 w-8" />}
                  error={errors.BreakEndTime}
                />
              </div>

              <div>
                <Input
                  label="Break Duration Time (24 hours Format)"
                  disabled
                  size="md"
                  value={formData.BreakDurationTime || ""}
                  onChange={(val) =>
                    handleFieldChange("BreakDurationTime", val)
                  }
                  leftIcon={<Clock className="h-8 w-8" />}
                  error={errors.BreakDurationTime}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
              Advance Setting
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
              <div>
                <Input
                  label="First Half Upto (24 hours Format)"
                  required
                  size="md"
                  value={formData.FirstHalfUpTo || ""}
                  onClick={() => {
                    setTimePickerField({
                      field: "FirstHalfUpTo",
                      value: formData.FirstHalfUpTo,
                    });
                    setIsTimePickerOpen(true);
                  }}
                  leftIcon={<Clock className="h-8 w-8" />}
                  error={errors.FirstHalfUpTo}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Absent Working Hours */}
                <div>
                  <Input
                    label="Mark Absent If Working Hour less than (in Minutes)"
                    type="text"
                    value={minuteValues.AbsentWorkingHours}
                    onChange={(e) =>
                      handleMinuteFieldChange(
                        "AbsentWorkingHours",
                        e.target.value,
                      )
                    }
                    placeholder="Enter Minutes"
                  />
                </div>

                <div>
                  <Input
                    label="Mark Absent If Working Hour Less than (in Hours)"
                    type="text"
                    value={formData.AbsentWorkingHours}
                    disabled
                  />
                </div>

                {/* Half Day Working Hours */}
                <div>
                  <Input
                    label="Mark Half Day If Working Hour Less than (in Minutes)"
                    type="text"
                    value={minuteValues.HalfDayWorkingHours}
                    onChange={(e) =>
                      handleMinuteFieldChange(
                        "HalfDayWorkingHours",
                        e.target.value,
                      )
                    }
                    placeholder="Enter Minutes"
                  />
                </div>

                <div>
                  <Input
                    label="Mark Half Day If Working Hour Less than (in Hours)"
                    type="text"
                    value={formData.HalfDayWorkingHours}
                    disabled
                  />
                </div>

                {/* Half Day In Time After */}
                <div>
                  <Input
                    label="Mark Half Day if Intime After (in Minutes)"
                    type="text"
                    value={minuteValues.HalfDayInTimeAfter}
                    onChange={(e) =>
                      handleMinuteFieldChange(
                        "HalfDayInTimeAfter",
                        e.target.value,
                      )
                    }
                    placeholder="Enter Minutes"
                  />
                </div>

                <div>
                  <Input
                    label="Mark Half Day if Intime After (in Hours)"
                    type="text"
                    value={formData.HalfDayInTimeAfter}
                    disabled
                  />
                </div>

                {/* Half Day Out Time Before */}
                <div>
                  <Input
                    label="Mark Half Day if Outtime Before (in Minutes)"
                    type="text"
                    value={minuteValues.HalfDayOutTimeBefore}
                    onChange={(e) =>
                      handleMinuteFieldChange(
                        "HalfDayOutTimeBefore",
                        e.target.value,
                      )
                    }
                    placeholder="Enter Minutes"
                  />
                </div>

                <div>
                  <Input
                    label="Mark Half Day if Outtime Before (in Hours)"
                    type="text"
                    value={formData.HalfDayOutTimeBefore}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
              Time Allowed for Late Entry Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
              <div>
                <Input
                  type="text"
                  required
                  label="Grace Time In Minutes"
                  value={formData.GraceTime ?? ""}
                  maxLength={2}
                  onChange={(e) =>
                    handleFieldChange(
                      "GraceTime",
                      filterNumbers(e.target.value),
                    )
                  }
                  placeholder="Enter Grace Time"
                  error={errors.GraceTime}
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 pb-1">
              Late Arrival Action
            </h3>

            <div>
              <RadioButton
                label="Count As Late (No Deduction)"
                checked={formData.LateArrivalAction === "Count As Late (No Deduction)"? true : false}
                onChange={() =>
                  handleFieldChange("LateArrivalAction", "Count As Late (No Deduction)")
                }
              />
            </div>

            <div>
              <RadioButton
                label="Deduct Salary Automatically"
                checked={formData.LateArrivalAction === "Deduct Salary Automatically"? true : false}
                onChange={() =>
                  handleFieldChange("LateArrivalAction", "Deduct Salary Automatically")
                }
              />
            </div>

            <div>
              <RadioButton
                label="Mark As Half Day"
                checked={formData.LateArrivalAction === "Mark As Half Day" ? true : false}
                onChange={() =>
                  handleFieldChange("LateArrivalAction", "Mark As Half Day")
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
              {(formData.LateArrivalAction === "Count As Late (No Deduction)" ||
                formData.LateArrivalAction === "Deduct Salary Automatically" ||
                formData.LateArrivalAction === "Mark As Half Day") && (
                <Input
                  type="text"
                  label="Late Count"
                  value={formData.LateCount ?? ""}
                  maxLength={2}
                  onChange={(e) =>
                    handleFieldChange(
                      "LateCount",
                      filterNumbers(e.target.value),
                    )
                  }
                  placeholder="Enter Late Count"
                  error={errors.LateCount}
                />
              )}
            </div>
          </div>

          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
              Remarks
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-1  gap-6">
              <div>
                <TextArea
                  label="Remarks"
                  placeholder="Enter Remarks"
                  className="thin-scroll"
                  value={formData.Remarks}
                  onChange={(e) => handleFieldChange("Remarks", e.target.value)}
                  error={errors.Remarks}
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      <TimePickerCustomize
        isOpen={isTimePickerOpen}
        title={formatLabel(timePickerField?.field || "")}
        value={timePickerField?.value ?? "00:00"}
        onClose={() => {
          setIsTimePickerOpen(false);
          setTimePickerField(null);
        }}
        onConfirm={(time) => {
          if (timePickerField) {
            handleFieldChange(timePickerField.field, time);
          }
          setIsTimePickerOpen(false);
          setTimePickerField(null);
        }}
      />

      <BottomActionBar
        cancelText="Cancel"
        saveText={formData.ShiftManagementMasterId ? "Update" : "Add"}
        onCancel={() => navigate(-1)}
        canAction={canAction}
        onSave={() => {
          handleAddUpdateShiftMaster();
        }}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AddUpdateShiftMaster;
