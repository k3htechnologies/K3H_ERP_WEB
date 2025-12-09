import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/ui/components/forms/Button";
import { Loader } from "@/core/utils/loader";
import ToastContainer from "@/ui/components/Toast/ToastContainer";
import { useEffect, useState } from "react";
import React from "react";
import type { AddUpdateWeekOffMasterRequest, FilterWithPaginationWeekOffMasterRequest } from "../models/WeekOffMasterModel";
import { WeekOffMasterService } from "../services/WeekOffMasterService";
import { MultiSelectDropdown } from "@/ui/components/DropDown/MultiSelectDropdown";
import { MONTHS_OPTIONS } from "@/core/constants";

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
  const { toasts, removeToast, addToast } = useToast();

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
      'Loading WeekOff Data'
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
      newErrors.WeekOffPolicyName = 'WeekOff Name is required.';
    } else if (formData.WeekOffPolicyName.trim().length > 50) {
      newErrors.WeekOffPolicyName = 'WeekOff Name must be at most 50 characters';
    }

    if (!formData.WeekOffPolicyCode?.trim()) {
      newErrors.WeekOffPolicyCode = 'WeekOff Code is required.';
    } else if (formData.WeekOffPolicyCode.trim().length > 5) {
      newErrors.WeekOffPolicyCode = 'WeekOff Code must be at most 4 characters';
    }

    if (!formData.WeekDays) {
      newErrors.WeekDays = 'WeekOff Day is required.';
    }

    if (!formData.WeeklyOff?.trim()) {
      newErrors.WeeklyOff = "WeekOff  is required";
    }

    if (!formData.WeekDaysStartsOn) {
      newErrors.WeekDaysStartsOn = "Week Days Starts On is required";
    }

    if (!formData.WeeklyOff2?.trim()) {
      newErrors.WeeklyOff2 = 'Weekly Off2 is required.';
    }

    if (!formData.WeeklyOff2Type?.trim()) {
      newErrors.WeeklyOff2Type = "Weekly Off2 Type is required";
    }

    if (!formData.NotApplicableForMonths) {
      newErrors.NotApplicableForMonths = "Not Applicable For Months is required";
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
  const handleAddUpdateWeekOffMaster = async (e: React.FormEvent) => {
    e.preventDefault();

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
          addToast({ type: "success", title: isAddMode ? "WeekOff added successfully" : "WeekOff updated successfully" });

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
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

        {/* Loader */}

        <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

        <div className="flex-1 space-y-2 px-6 py-3 pb-20 overflow-y-auto thin-scroll ">

          <form onSubmit={handleAddUpdateWeekOffMaster}>

            {/* Basic WEEK OFF Details */}

            <div className="space-y-4 pb-3">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic WeekOff Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                <div>
                  <Input
                    type="text"
                    required
                    label='Week Off Name'
                    value={formData.WeekOffPolicyName ?? ""}
                    onChange={(e) => handleFieldChange("WeekOffPolicyName", e.target.value)}
                    placeholder="Enter WeekOff Name"
                    maxLength={250}
                    error={errors.WeekOffPolicyName}
                  />
                </div>

                <div>
                  <Input
                    type="text"
                    required
                    label='Week Off Code'
                    value={formData.WeekOffPolicyCode ?? ""}
                    onChange={(e) => handleFieldChange("WeekOffPolicyCode", e.target.value)}
                    placeholder="Enter WeekOff Code"
                    maxLength={250}
                    error={errors.WeekOffPolicyCode}
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                <div>
                  <Input
                    type="text"
                    required
                    label='Week Days'
                    value={formData.WeekDays ?? ""}
                    onChange={(e) => handleFieldChange("WeekDays", e.target.value)}
                    placeholder="Enter Week Days"
                    maxLength={250}
                    error={errors.WeekDays}
                  />
                </div>

                <div>
                  <Input
                    type="text"
                    required
                    label='Weekly Off'
                    value={formData.WeeklyOff ?? ""}
                    onChange={(e) => handleFieldChange("WeeklyOff", e.target.value)}
                    placeholder="Enter Weekly Off"
                    maxLength={250}
                    error={errors.WeeklyOff}
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                <div>
                  <Input
                    type="text"
                    required
                    label='Week Off2'
                    value={formData.WeeklyOff2 ?? ""}
                    onChange={(e) => handleFieldChange("WeeklyOff2", e.target.value)}
                    placeholder="Enter Weekly Off2"
                    maxLength={250}
                    error={errors.WeeklyOff2}
                  />
                </div>

                <div>
                  <Input
                    type="text"
                    required
                    label='Weekly Off2 Type'
                    value={formData.WeeklyOff2Type ?? ""}
                    onChange={(e) => handleFieldChange("WeeklyOff2Type", e.target.value)}
                    placeholder="Enter Weekly Off2 Type"
                    maxLength={250}
                    error={errors.WeeklyOff2Type}
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                <div>
                  <Input
                    type="text"
                    required
                    label='Week Days Starts On'
                    value={formData.WeekDaysStartsOn ?? ""}
                    onChange={(e) => handleFieldChange("WeekDaysStartsOn", e.target.value)}
                    placeholder="Enter Week Days Starts On"
                    maxLength={250}
                    error={errors.WeekDaysStartsOn}
                  />
                </div>

                <div>
                  <MultiSelectDropdown
                    label="Not Applicable For Months"
                    title="Select"
                    required
                    dataList={MONTHS_OPTIONS.map(opt => ({ label: opt.name, value: opt.id, }))}
                    initialValues={Array.isArray(formData.NotApplicableForMonths)? MONTHS_OPTIONS
                          .filter(opt =>
                            formData.NotApplicableForMonths.includes(opt.name)
                          )  
                          .map(opt => ({label: opt.name, value: opt.id}))
                        : []
                    }
                    onSelected={(selectedItems) => {
                      handleFieldChange("NotApplicableForMonths", selectedItems.map(item => item.value))
                    }}
                    error={errors.NotApplicableForMonths}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

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
              handleAddUpdateWeekOffMaster(e);
            }}
            className="px-6"
            disabled={isLoading}
          >
            {isAddMode ? "Add WeekOff" : "Update WeekOff"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default AddUpdateWeekOffMaster;
