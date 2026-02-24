import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react";
import React from "react";
import type { AddUpdateShiftMasterRequest, FilterWithPaginationShiftMasterRequest } from "../models/ShiftMasterModel";
import { shiftMasterService } from "@/features/shiftMaster/services/ShiftMasterService";
import { TimePicker } from "@/ui/components/TimePicker/TimePicker";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { filterNumbers, isEndTimeGreater } from "@/core/utils/fileValidation";
import { TextArea } from "@/ui/components/forms/Textarea";
import { getTimeDuration, toHHMM, toMinutes } from "@/core/utils/comman";

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
  Remarks: ""
});

export const AddUpdateShiftMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [formData, setFormData] = useState<AddUpdateShiftMasterRequest>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // NAVIGATE
  const navigate = useNavigate();

  // GET VALUE FROM URL SHIFT ID
  const { ShiftManagementMasterId } = useParams<{ ShiftManagementMasterId?: string }>();
  const ShiftId = ShiftManagementMasterId ? Number(ShiftManagementMasterId) : 0;
  const isAddMode = ShiftId === 0;

  // TOAST
  const { addToast } = useToast();


  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions('/ShiftMaster');
  //#endregion

  // ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  //#endregion


  //#region HANDLE FIELD CHANGE EVENT
  const handleFieldChange = (field: keyof AddUpdateShiftMasterRequest, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };


      if (field === "ShiftBeginTime" || field === "ShiftEndTime") {
        const duration = getTimeDuration(
          updated.ShiftBeginTime,
          updated.ShiftEndTime
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
          updated.BreakEndTime
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
          ShiftManagementMasterId: ShiftId
        };

        const response = await shiftMasterService.apiCallPullShiftMaster(params);

        if (E.isRight(response)) {

          const e = response.right.Data?.[0];

          if (e) {
            setFormData(prev => ({
              ...prev,
              ShiftManagementMasterId: e.ShiftManagementMasterId ?? prev.ShiftManagementMasterId,
              Uniquekey: e.Uniquekey ?? prev.Uniquekey,
              ShiftCode: e.ShiftCode ?? prev.ShiftCode,
              ShiftName: e.ShiftName ?? prev.ShiftName,
              ShiftBeginTime: e.ShiftBeginTime ?? prev.ShiftBeginTime,
              ShiftEndTime: e.ShiftEndTime ?? prev.ShiftEndTime,
              ShiftDurationTime: e.ShiftDurationTime ?? prev.ShiftDurationTime,
              ShiftWorkDurationTime: e.ShiftWorkDurationTime ?? prev.ShiftWorkDurationTime,
              FirstHalfUpTo: e.FirstHalfUpTo ?? prev.FirstHalfUpTo,
              AbsentWorkingHours: e.AbsentWorkingHours ?? prev.AbsentWorkingHours,
              HalfDayWorkingHours: e.HalfDayWorkingHours ?? prev.HalfDayWorkingHours,
              HalfDayInTimeAfter: e.HalfDayInTimeAfter ?? prev.HalfDayInTimeAfter,
              HalfDayOutTimeBefore: e.HalfDayOutTimeBefore ?? prev.HalfDayOutTimeBefore,
              BreakBeginTime: e.BreakBeginTime ?? prev.BreakBeginTime,
              BreakEndTime: e.BreakEndTime ?? prev.BreakEndTime,
              BreakDurationTime: e.BreakDurationTime ?? prev.BreakDurationTime,
              GraceTime: e.GraceTime ?? prev.GraceTime,
              Remarks: e.Remarks ?? prev.Remarks
            }));

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
      'Loading Shift'
    );
  };
  //#endregion

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddShiftMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.ShiftName) {
      newErrors.ShiftName = 'Shift Name is required.';
    } else if (formData.ShiftName.trim().length > 50) {
      newErrors.ShiftName = 'Shift Name must be at most 50 characters'
    }

    if (!formData.ShiftCode) {
      newErrors.ShiftCode = 'Shift Code is required.';
    }

    if (!formData.ShiftBeginTime || formData.ShiftBeginTime === "00:00") {
      newErrors.ShiftBeginTime = 'Shift Begin Time is required.';
    }

    if (!formData.ShiftEndTime || formData.ShiftEndTime === "00:00") {
      newErrors.ShiftEndTime = 'Shift End Time is required.';
    } else if (!isEndTimeGreater(formData.ShiftBeginTime, formData.ShiftEndTime)) {
      newErrors.ShiftEndTime = "End time must be greater than start time.";
    }

    if (!formData.FirstHalfUpTo || formData.FirstHalfUpTo === "00:00") {
      newErrors.FirstHalfUpTo = 'First Half Up To is required.';
    }

    if (!isEndTimeGreater(formData.ShiftBeginTime, formData.BreakBeginTime)) {
      newErrors.BreakBeginTime = "Break Begin time must be greater than Shift start time.";
    }

    if (!formData.BreakBeginTime || formData.BreakBeginTime === "00:00") {
      newErrors.BreakBeginTime = 'Break Begin Time is required.';
    }

    if (!formData.BreakEndTime || formData.BreakEndTime === "00:00") {
      newErrors.BreakEndTime = 'Break End Time is required.';
    } else if (!isEndTimeGreater(formData.BreakBeginTime, formData.BreakEndTime)) {
      newErrors.BreakEndTime = "Break End time must be greater than start time.";
    }

    if (!formData.GraceTime) {
      newErrors.GraceTime = 'Grace Time is required.';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
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
      Remarks: formData.Remarks
    };
  }
  //#endregion

  //#region HANDLE ADD AND UPDATE SHIFT MASTER
  const handleAddUpdateShiftMaster = async () => {

    setErrors({});

    const validation = validateAddShiftMasterForm();

    if (!validation.isValid) {

      setErrors(validation.errors);

      return;
    }

    await runApiWithLoader(

      setIsLoading,

      setLoadingMessage,

      async () => {

        const payload = PushShiftMasterFormData();
        console.log("payload", payload);
        const response = await shiftMasterService.apiCallAddUpdateShiftMaster(payload);

        if (E.isRight(response)) {
          addToast({ type: "success", title: isAddMode ? "Shift added successfully" : "Shift updated successfully" });

          navigate("/shiftMaster");

        } else {
          addToast({ type: "error", title: response.left?.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      isAddMode ? 'Add Shift' : 'Update Shift'
    );
  };
  //#endregion

  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      {/* Loader */}

      <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

      <div className="flex-1 space-y-2 px-6 py-3  overflow-y-auto thin-scroll ">

        <form onSubmit={handleAddUpdateShiftMaster}>

          {/* Basic Shift Details */}

          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Shift Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
              <div>
                <Input
                  type="text"
                  required
                  label='Shift Name'
                  value={formData.ShiftName ?? ""}
                  onChange={(e) => handleFieldChange("ShiftName", e.target.value)}
                  placeholder="Enter Shift Name"
                  maxLength={250}
                  error={errors.ShiftName}
                />
              </div>

              <div>
                <Input
                  type="text"
                  required
                  label='Shift Code '
                  value={formData.ShiftCode.toUpperCase() ?? ""}
                  onChange={(e) => handleFieldChange("ShiftCode", e.target.value)}
                  placeholder="Enter Shift Code"
                  maxLength={4}
                  error={errors.ShiftCode}
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Time Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
              <div>
                <TimePicker
                  label="Shift Begin Time (24 hours Format)"
                  required
                  size="md"
                  format={24}
                  value={formData.ShiftBeginTime || ""}
                  onChange={(val) => handleFieldChange("ShiftBeginTime", val)}
                  error={errors.ShiftBeginTime}
                />
              </div>

              <div>
                <TimePicker
                  label="Shift End Time (24 hours Format)"
                  required
                  size="md"
                  format={24}
                  value={formData.ShiftEndTime || ""}
                  onChange={(val) => handleFieldChange("ShiftEndTime", val)}
                  error={errors.ShiftEndTime}
                />
              </div>

              <div>
                <TimePicker
                  label="Shift Duration (24 hours Format)"
                  disabled
                  size="md"
                  format={24}
                  value={formData.ShiftDurationTime || ""}
                  onChange={(val) => handleFieldChange("ShiftDurationTime", val)}
                  error={errors.ShiftDurationTime}
                />
              </div>

              <div>
                <TimePicker
                  label="Shift Work Duration (24 hours Format)"
                  disabled
                  size="md"
                  format={24}
                  value={formData.ShiftWorkDurationTime || ""}
                  onChange={(val) => handleFieldChange("ShiftWorkDurationTime", val)}
                  error={errors.ShiftWorkDurationTime}
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Break Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
              <div>
                <TimePicker
                  label="Break Begin Time (24 hours Format)"
                  required
                  size="md"
                  format={24}
                  value={formData.BreakBeginTime || ""}
                  onChange={(val) => handleFieldChange("BreakBeginTime", val)}
                  error={errors.BreakBeginTime}
                />
              </div>
              <div>
                <TimePicker
                  label="Break End Time (24 hours Format)"
                  required
                  size="md"
                  format={24}
                  value={formData.BreakEndTime || ""}
                  onChange={(val) => handleFieldChange("BreakEndTime", val)}
                  error={errors.BreakEndTime}
                />
              </div>

              <div>
                <TimePicker
                  label="Break Duration Time (24 hours Format)"
                  disabled
                  size="md"
                  format={24}
                  value={formData.BreakDurationTime || ""}
                  onChange={(val) => handleFieldChange("BreakDurationTime", val)}
                  error={errors.BreakDurationTime}
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Advance Setting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
              <div>
                <TimePicker
                  label="First Half Upto (24 hours Format)"
                  required
                  size="md"
                  format={24}
                  value={formData.FirstHalfUpTo || ""}
                  onChange={(val) => handleFieldChange("FirstHalfUpTo", val)}
                  error={errors.FirstHalfUpTo}
                />
              </div>

              <div>
                <TimePicker
                  label="Calculate Absent if working hours less than (24 hours Format)"
                  size="md"
                  format={24}
                  value={formData.AbsentWorkingHours || ""}
                  onChange={(val) => handleFieldChange("AbsentWorkingHours", val)}
                  error={errors.AbsentWorkingHours}
                />
              </div>
              <div>
                <TimePicker
                  label="Calculate Half day working hours less than"
                  size="md"
                  format={24}
                  value={formData.HalfDayWorkingHours || ""}
                  onChange={(val) => handleFieldChange("HalfDayWorkingHours", val)}
                  error={errors.HalfDayWorkingHours}
                />
              </div>

              <div>
                <TimePicker
                  label="Mark Half Day if Intime After"
                  size="md"
                  format={24}
                  value={formData.HalfDayInTimeAfter || ""}
                  onChange={(val) => handleFieldChange("HalfDayInTimeAfter", val)}
                  error={errors.HalfDayInTimeAfter}
                />
              </div>

              <div>
                <TimePicker
                  label="Mark Half Day if Outtime Before"
                  size="md"
                  format={24}
                  value={formData.HalfDayOutTimeBefore || ""}
                  onChange={(val) => handleFieldChange("HalfDayOutTimeBefore", val)}
                  error={errors.HalfDayOutTimeBefore}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Time Allowed for Late Entry Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
              <div>
                <Input
                  type="text"
                  required
                  label='Grace Time In Minutes'
                  value={formData.GraceTime ?? ""}
                  maxLength={2}
                  onChange={(e) => handleFieldChange("GraceTime", filterNumbers(e.target.value))}
                  placeholder="Enter Grace Time"
                  error={errors.GraceTime}
                />

              </div>
            </div>
          </div>
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Remarks</h3>

            <div className="grid grid-cols-1 md:grid-cols-1  gap-6">

              <div>
                <TextArea
                  label="Remarks"
                  placeholder="Enter Remarks"
                  className='thin-scroll'
                  value={formData.Remarks}
                  onChange={(e) => handleFieldChange("Remarks", e.target.value)}
                  error={errors.Remarks} />

              </div>
            </div>
          </div>
        </form>
      </div >

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
    </div >
  );
};

export default AddUpdateShiftMaster;























