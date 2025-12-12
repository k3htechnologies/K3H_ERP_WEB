import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/ui/components/forms/Button";
import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react";
import React from "react";
import type { AddUpdateShiftMasterRequest, FilterWithPaginationShiftMasterRequest } from "../models/ShiftMasterModel";
import { ShiftMasterService } from "../services/ShiftMasterService";
import { TimePicker } from "@/ui/components/TimePicker/TimePicker";

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
  const location = useLocation();

  // GET VALUE FROM URL SHIFT ID
  const { ShiftManagementMasterId } = useParams<{ ShiftManagementMasterId?: string }>();
  const ShiftId = ShiftManagementMasterId ? Number(ShiftManagementMasterId) : 0;
  const isAddMode = ShiftId === 0;

  // TOAST
  const { addToast } = useToast();

  // ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  //#endregion


  //#region HANDLE FIELD CHANGE EVENT
  const handleFieldChange = (field: keyof AddUpdateShiftMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

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

        const response = await ShiftMasterService.apiCallPullShiftMaster(params);

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
      'Loading Shift Data'
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
    }
    if (!formData.ShiftCode) {
      newErrors.ShiftCode = 'Shift Code is required.';
    }

    if (!formData.ShiftBeginTime || formData.ShiftBeginTime === "00:00") {
      newErrors.ShiftBeginTime = 'Shift Begin Time is required.';
    }

    if (!formData.ShiftEndTime || formData.ShiftEndTime === "00:00") {
      newErrors.ShiftEndTime = 'Shift End Time is required.';
    }

    if (!formData.ShiftDurationTime || formData.ShiftDurationTime === "00:00") {
      newErrors.ShiftDurationTime = 'Shift Duration Time is required.';
    }

    if (!formData.ShiftWorkDurationTime || formData.ShiftWorkDurationTime === "00:00") {
      newErrors.ShiftWorkDurationTime = 'Shift Work Duration Time is required.';
    }

    if (!formData.FirstHalfUpTo || formData.FirstHalfUpTo === "00:00") {
      newErrors.FirstHalfUpTo = 'First Half Up To is required.';
    }

    if (!formData.AbsentWorkingHours || formData.AbsentWorkingHours === "00:00") {
      newErrors.AbsentWorkingHours = 'Absent Working Hours is required.';
    }

    if (!formData.HalfDayWorkingHours || formData.HalfDayWorkingHours === "00:00") {
      newErrors.HalfDayWorkingHours = 'Half Day Working Hours is required.';
    }

    if (!formData.HalfDayInTimeAfter || formData.HalfDayInTimeAfter === "00:00") {
      newErrors.HalfDayInTimeAfter = 'Half Day In Time After is required.';
    }

    if (!formData.HalfDayOutTimeBefore || formData.HalfDayOutTimeBefore === "00:00") {
      newErrors.HalfDayOutTimeBefore = 'Half Day Out Time Before is required.';
    }

    if (!formData.BreakBeginTime || formData.BreakBeginTime === "00:00") {
      newErrors.BreakBeginTime = 'Break Begin Time is required.';
    }

    if (!formData.BreakEndTime || formData.BreakEndTime === "00:00") {
      newErrors.BreakEndTime = 'Break End Time is required.';
    }

    if (!formData.BreakDurationTime || formData.BreakDurationTime === "00:00") {
      newErrors.BreakDurationTime = 'Break Duration Time is required.';
    }

    if (!formData.GraceTime?.trim()) {
      newErrors.GraceTime = 'Grace Time is required.';
    }
    if (!formData.Remarks) {
      newErrors.Remarks = 'Remarks is required.';
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
  const handleAddUpdateShiftMaster = async (e: React.FormEvent) => {
    e.preventDefault();

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
        const response = await ShiftMasterService.apiCallAddUpdateShiftMaster(payload);

        if (E.isRight(response)) {
          addToast({ type: "success", title: isAddMode ? "Shift added successfully" : "Shift updated successfully" });

          const locationState = location.state as {
            listState?: {
              page?: number;
              filters?: any;
              sortInfo?: any;
              searchTerm?: string;
            };
          } | null;

          const listState = locationState?.listState || {
            page: 1,
            filters: {},
            sortInfo: undefined,
            searchTerm: '',
          };

          navigate("/ShiftMaster",
            {
              state: { listState }
            });

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

        <div className="flex-1 space-y-2 px-6 py-3 pb-20 overflow-y-auto thin-scroll ">

          <form onSubmit={handleAddUpdateShiftMaster}>

            {/* Basic Shift Details */}

            <div className="space-y-4 pb-3">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Shift Details</h3>
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

              <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                <div>
                  <TimePicker
                    label="Shift Begin Time"
                    required
                    size="sm"
                    format={24}
                    value={formData.ShiftBeginTime || ""}
                    onChange={(val) => handleFieldChange("ShiftBeginTime", val)}
                    error={errors.ShiftBeginTime}
                  />
                </div>

                <div>
                  <TimePicker
                    label="Shift End Time"
                    required
                    size="sm"
                    format={24}
                    value={formData.ShiftEndTime || ""}
                    onChange={(val) => handleFieldChange("ShiftEndTime", val)}
                    error={errors.ShiftEndTime}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                <div>
                  <TimePicker
                    label="Shift Duration Time"
                    required
                    size="sm"
                    format={24}
                    value={formData.ShiftDurationTime || ""}
                    onChange={(val) => handleFieldChange("ShiftDurationTime", val)}
                    error={errors.ShiftDurationTime}
                  />
                </div>
                
                <div>
                  <TimePicker
                    label="Shift Work Duration Time"
                    required
                    size="sm"
                    format={24}
                    value={formData.ShiftWorkDurationTime || ""}
                    onChange={(val) => handleFieldChange("ShiftWorkDurationTime", val)}
                    error={errors.ShiftWorkDurationTime}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                <div>
                  <TimePicker
                    label="First Half Up To"
                    required
                    size="sm"
                    format={24}
                    value={formData.FirstHalfUpTo || ""}
                    onChange={(val) => handleFieldChange("FirstHalfUpTo", val)}
                    error={errors.FirstHalfUpTo}
                  />
                </div>
                
                <div>
                  <TimePicker
                    label="Absent Working Hours"
                    required
                    size="sm"
                    format={24}
                    value={formData.AbsentWorkingHours || ""}
                    onChange={(val) => handleFieldChange("AbsentWorkingHours", val)}
                    error={errors.AbsentWorkingHours}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                <div>
                  <TimePicker
                    label="Half Day Working Hours"
                    required
                    size="sm"
                    format={24}
                    value={formData.HalfDayWorkingHours || ""}
                    onChange={(val) => handleFieldChange("HalfDayWorkingHours", val)}
                    error={errors.HalfDayWorkingHours}
                  />
                </div>

                <div>
                  <TimePicker
                    label="Half DayIn Time After"
                    required
                    size="sm"
                    format={24}
                    value={formData.HalfDayInTimeAfter || ""}
                    onChange={(val) => handleFieldChange("HalfDayInTimeAfter", val)}
                    error={errors.HalfDayInTimeAfter}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                <div>
                  <TimePicker
                    label="Half DayOut Time Before"
                    required
                    size="sm"
                    format={24}
                    value={formData.HalfDayOutTimeBefore || ""}
                    onChange={(val) => handleFieldChange("HalfDayOutTimeBefore", val)}
                    error={errors.HalfDayOutTimeBefore}
                  />
                </div>

                <div>
                  <TimePicker
                    label="Break Begin Time"
                    required
                    size="sm"
                    format={24}
                    value={formData.BreakBeginTime || ""}
                    onChange={(val) => handleFieldChange("BreakBeginTime", val)}
                    error={errors.BreakBeginTime}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                <div>
                  <TimePicker
                    label="Break End Time"
                    required
                    size="sm"
                    format={24}
                    value={formData.BreakEndTime || ""}
                    onChange={(val) => handleFieldChange("BreakEndTime", val)}
                    error={errors.BreakEndTime}
                  />
                </div>

                <div>
                  <TimePicker
                    label="Break Duration Time"
                    required
                    size="sm"
                    format={24}
                    value={formData.BreakDurationTime || ""}
                    onChange={(val) => handleFieldChange("BreakDurationTime", val)}
                    error={errors.BreakDurationTime}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                <div>
                  <Input
                    type="text"
                    required
                    label='Grace Time'
                    value={formData.GraceTime ?? ""}
                    onChange={(e) => handleFieldChange("GraceTime", e.target.value)}
                    placeholder="Enter Grace Time"
                    maxLength={250}
                    error={errors.GraceTime}
                  />

                </div>
              </div>

              <div>
                <Input
                  type="text"
                  required
                  label='Remarks'
                  value={formData.Remarks ?? ""}
                  onChange={(e) => handleFieldChange("Remarks", e.target.value)}
                  placeholder="Enter Remarks"
                  maxLength={250}
                  error={errors.Remarks}
                />
              </div>
            </div>
          </form>
        </div >

        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-2 flex justify-end items-center gap-3 shadow-md h-16"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)', left: "299px", right: '14px' }}>
          <Button
            color="transparent"
            variant='transparent_border'
            size="sm"
            onClick={() => { navigate(-1); }}
            className="px-6"
          >
            Cancel
          </Button>

          <Button
            color="green"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              handleAddUpdateShiftMaster(e);
            }}
            className="px-6"
            disabled={isLoading}
          >
            {isAddMode ? "Add Shift" : "Update Shift"}
          </Button>
        </div>
      </div >
  );
};

export default AddUpdateShiftMaster;























