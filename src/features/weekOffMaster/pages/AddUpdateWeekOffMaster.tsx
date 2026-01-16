import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react";
import React from "react";
import type { AddUpdateWeekOffMasterRequest, FilterWithPaginationWeekOffMasterRequest } from "../models/WeekOffMasterModel";
import { WeekOffMasterService } from "../services/WeekOffMasterService";
import { MultiSelectDropdown } from "@/ui/components/DropDown/MultiSelectDropdown";
import { DAYS_OPTIONS, MONTHS_OPTIONS, WEEK_OFF_TYPE, WEEKDAYS } from "@/core/constants";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";

const initialFormState = (): AddUpdateWeekOffMasterRequest => ({
  WeekOffPolicyMasterId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  WeekOffPolicyCode: "",
  WeekOffPolicyName: "",
  WeekDays: 0,
  WeekDaysStartsOn: "",
  WeeklyOff: "",
  WeeklyOff2: "",
  WeeklyOff2Type: "",
  NotApplicableForMonths: ""
});

export const AddUpdateWeekOffMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [formData, setFormData] = useState<AddUpdateWeekOffMasterRequest>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // NAVIGATE
  const navigate = useNavigate();
  const location = useLocation();

  // GET VALUE FROM URL WEEK OFF MASTER ID
  const { WeekOffMasterId } = useParams<{ WeekOffMasterId?: string }>();
  const WeekOffId = WeekOffMasterId ? Number(WeekOffMasterId) : 0;
  const isAddMode = WeekOffId === 0;

  // TOAST
  const { addToast } = useToast();

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions('/WeekOffMaster');
  //#endregion

  // ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  //#endregion

  //#region HANDLE FIELD CHANGE EVENT
  const handleFieldChange = (field: keyof AddUpdateWeekOffMasterRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region INITIALIZATION
  useEffect(() => {

    if (!isAddMode) {

      fetchWeekOffMasterDetails();
    }
  }, [WeekOffId]);
  //#endregion

  //#region FETCH WEEK OFF MASTER DETAILS
  const fetchWeekOffMasterDetails = async () => {

    await runApiWithLoader(

      setIsLoading,

      setLoadingMessage,

      async () => {

        const params: FilterWithPaginationWeekOffMasterRequest = {
          PageNumber: 1,
          PageSize: 1,
          WeekOffPolicyMasterId: WeekOffId
        };

        const response = await WeekOffMasterService.apiCallPullWeekOffMaster(params);

        if (E.isRight(response)) {

          const e = response.right.Data?.[0];

          if (e) {
            setFormData(prev => ({
              ...prev,
              WeekOffPolicyMasterId: e.WeekOffPolicyMasterId ?? prev.WeekOffPolicyMasterId,
              Uniquekey: e.Uniquekey ?? prev.Uniquekey,
              WeekOffPolicyName: e.WeekOffPolicyName ?? prev.WeekOffPolicyName,
              WeekOffPolicyCode: e.WeekOffPolicyCode ?? prev.WeekOffPolicyCode,
              WeekDays: e.WeekDays ?? prev.WeekDays,
              WeeklyOff: e.WeeklyOff ?? prev.WeeklyOff,
              WeeklyOff2: e.WeeklyOff2 ?? prev.WeeklyOff2,
              WeekDaysStartsOn: e.WeekDaysStartsOn ?? prev.WeekDaysStartsOn,
              WeeklyOff2Type: e.WeeklyOff2Type ?? prev.WeeklyOff2Type,
              NotApplicableForMonths: e.NotApplicableForMonths ?? prev.NotApplicableForMonths
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
      'Loading WeekOff'
    );
  };
  //#endregion

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddWeekOffMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.WeekOffPolicyName?.trim()) {
      newErrors.WeekOffPolicyName = 'Weekoff Policy Name is required';

    } else if (formData.WeekOffPolicyName.trim().length > 50) {
      newErrors.WeekOffPolicyName = 'Week Off Name must be at most 50 characters';
    }

    if (!formData.WeekOffPolicyCode?.trim()) {
      newErrors.WeekOffPolicyCode = 'Week Off Code is required';

    } else if (formData.WeekOffPolicyCode.trim().length > 5) {
      newErrors.WeekOffPolicyCode = 'Week Off Code must be at most 4 characters';
    }

    if (!formData.WeekDays) {
      newErrors.WeekDays = 'Weekdays is required.';
    }

    if (!formData.WeeklyOff?.trim()) {
      newErrors.WeeklyOff = "Week Off  is required";
    }

    if (formData.WeeklyOff2) {
      if (!formData.WeeklyOff2Type?.trim()) {
        newErrors.WeeklyOff2Type = "Weekly Off2 Type is required";
      }

    }

    if (formData.WeeklyOff2 !== '' && formData.WeeklyOff?.trim() === formData.WeeklyOff2?.trim()) {
      newErrors.weeklyOff2 = "Weekly Off 2 must be different from Weekly Off 1";
    }

    if (!formData.WeekDaysStartsOn) {
      newErrors.WeekDaysStartsOn = "Weekdays Starts On is required";
    }


    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };
  //#endregion

  //#region PUSH DATA
  const PushWeekOffMasterFormData = (): AddUpdateWeekOffMasterRequest => {
    return {
      WeekOffPolicyMasterId: formData.WeekOffPolicyMasterId,
      Uniquekey: formData.Uniquekey,
      WeekOffPolicyCode: formData.WeekOffPolicyCode,
      WeekOffPolicyName: formData.WeekOffPolicyName,
      WeekDays: formData.WeekDays,
      WeekDaysStartsOn: formData.WeekDaysStartsOn,
      WeeklyOff: formData.WeeklyOff,
      WeeklyOff2: formData.WeeklyOff2,
      WeeklyOff2Type: formData.WeeklyOff2Type,
      NotApplicableForMonths: Array.isArray(formData.NotApplicableForMonths)
        ? formData.NotApplicableForMonths.join(",")
        : formData.NotApplicableForMonths,

    };
  }
  //#endregion

  //#region HANDLE ADD UPDATE WEEK OFF MASTER
  const handleAddUpdateWeekOffMaster = async () => {

    setErrors({});

    const validation = validateAddWeekOffMasterForm();

    if (!validation.isValid) {

      setErrors(validation.errors);

      return;
    }

    await runApiWithLoader(

      setIsLoading,

      setLoadingMessage,

      async () => {
        const payload = PushWeekOffMasterFormData();

        const response = await WeekOffMasterService.apiCallAddUpdateWeekOffMaster(payload);

        if (E.isRight(response)) {

          addToast({ type: "success", title: response.right.SuccessMessage[0] });

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

          navigate("/WeekOffMaster",
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
      isAddMode ? 'Add WeekOff' : 'Update WeekOff'
    );
  };
  //#endregion

  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      {/* Loader */}

      <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

      <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">

        <form onSubmit={handleAddUpdateWeekOffMaster}>

          {/* Basic WEEK OFF Details */}

          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">WeekOff Policy Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
              <div>
                <Input
                  type="text"
                  required
                  label='Week Off Name'
                  value={formData.WeekOffPolicyName ?? ""}
                  onChange={(e) => handleFieldChange("WeekOffPolicyName", e.target.value)}
                  placeholder="Enter Week Off Name"
                  maxLength={250}
                  error={errors.WeekOffPolicyName}
                />
              </div>

              <div>
                <Input
                  type="text"
                  required
                  label='Week Off Code'
                  value={formData.WeekOffPolicyCode.toUpperCase() ?? ""}
                  onChange={(e) => handleFieldChange("WeekOffPolicyCode", e.target.value)}
                  placeholder="Enter Week Off Code"
                  maxLength={4}
                  error={errors.WeekOffPolicyCode}
                />
              </div>
              <div>

                <SinglePageSelection
                  label="Weekdays"
                  placeholder="Select Weekdays"
                  value={formData.WeekDays}
                  onChange={(value) => handleFieldChange("WeekDays", value)}
                  options={WEEKDAYS.map(opt => ({ label: opt.name, value: opt.id }))}
                  error={errors.WeekDays}
                />
              </div>
              <div>
                <SinglePageSelection
                  label="Weekdays Starts On"
                  placeholder="Select Weekdays Starts On"
                  required
                  value={formData.WeekDaysStartsOn}
                  onChange={(value) => handleFieldChange("WeekDaysStartsOn", value)}
                  options={DAYS_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                  error={errors.WeekDaysStartsOn}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Week Off Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
              <div>
                <SinglePageSelection
                  label="Weekly Off 1"
                  required
                  value={formData.WeeklyOff}
                  onChange={(value) => handleFieldChange("WeeklyOff", value)}
                  options={DAYS_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                  error={errors.WeeklyOff}
                />
              </div>

              <div>
                <SinglePageSelection
                  label="Weekly Off 2"
                  value={formData.WeeklyOff2}
                  onChange={(value) => handleFieldChange("WeeklyOff2", value)}
                  options={DAYS_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                  error={errors.weeklyOff2}
                />
              </div>
              {formData.WeeklyOff2 && (
                <div>
                  <SinglePageSelection
                    label="Weekly Off 2 Type"
                    placeholder="Select Type"
                    value={formData.WeeklyOff2Type}
                    onChange={(value) => handleFieldChange("WeeklyOff2Type", value)}
                    options={WEEK_OFF_TYPE.map(opt => ({ label: opt.name, value: opt.id }))}
                    error={errors.WeeklyOff2Type}
                  />

                </div>
              )}
              <div>
                <MultiSelectDropdown
                  label="Not Applicable For Months"
                  options={MONTHS_OPTIONS.map(m => ({ label: m.name, value: m.id }))}
                  selectedValues={Array.isArray(formData.NotApplicableForMonths) ? formData.NotApplicableForMonths : []}
                  onChange={(values) => handleFieldChange("NotApplicableForMonths", values)}
                  error={errors.NotApplicableForMonths}
                />

              </div>
            </div>
          </div>
        </form >
      </div >

      <BottomActionBar
        cancelText="Cancel"
        saveText={formData.WeekOffPolicyMasterId ? "Update" : "Add"}
        onCancel={() => navigate(-1)}
        canAction={canAction}
        onSave={() => {
          handleAddUpdateWeekOffMaster();
        }}
        isLoading={isLoading}
      />
    </div >
  );
};

export default AddUpdateWeekOffMaster;
