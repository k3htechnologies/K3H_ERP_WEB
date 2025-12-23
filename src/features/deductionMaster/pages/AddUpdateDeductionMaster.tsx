import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react"
import React from "react";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import type { AddUpdateDeductionMasterRequest, FilterWithPaginationDeductionMasterRequest } from "../models/DeductionMasterModel";
import { DeductionMasterService } from "../services/DeductionMasterService";
import { fetchBranchMasterDropdown } from "@/features/branchMaster/branchMasterDropDown";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { DEDUCTION_TYPE_OPTIONS, GENDER_OPTIONS } from "@/core/constants";
import { useCountryStateCityDistrictVillageData } from "@/core/hooks/useCountryStateCityDistrictVillage";
import { MultiSelectDropdown } from "@/ui/components/DropDown/MultiSelectDropdown";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";

const initialFormState = (): AddUpdateDeductionMasterRequest => ({
  DeductionMasterId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  Name: "",
  Type: "",
  Value: 0,
  BranchMasterId: 0,
  MinSalary: 0,
  MaxSalary: 0,
  Gender: "",
  StateMasterId: 0,
  BranchName: "",
  StateName: ""
});

export const AddUpdateDeductionMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [formData, setFormData] = useState<AddUpdateDeductionMasterRequest>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [selectedCountryId] = React.useState<number | null>(1)
  const [selectedStateId, setSelectedStateId] = React.useState<number | null>(null)

  // NAVIGATE
  const navigate = useNavigate();
  const location = useLocation();

  // GET VALUE FROM URL DEDUCTION MASTER ID
  const { DeductionMasterId } = useParams<{ DeductionMasterId?: string }>();
  const DeductionId = DeductionMasterId ? Number(DeductionMasterId) : 0;
  const isAddMode = DeductionId === 0;

  // TOAST
  const { addToast } = useToast();

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions('/deductionMaster');
  //#endregion

  // ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  //#endregion

  //DROPDOWN SET UP
  const [dropdownLabels, setDropdownLabels] = useState<{
    branchName?: string;
    gender?: string;
    StateName?: string
  }>({});

  //#region HANDLE FIELD CHANGE EVENT
  const handleFieldChange = (field: keyof AddUpdateDeductionMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region INITIALIZATION
  useEffect(() => {
    if (!isAddMode) {
      fetchDeductionMasterDetails();
    }
  }, [DeductionId]);
  //#endregion

  //#region COUNTRY STATE  
  const { statesByCountryId
  } = useCountryStateCityDistrictVillageData()

  const stateOptions =
    selectedCountryId != null
      ? (statesByCountryId[selectedCountryId] || []).map(s => ({
        label: s.name,
        value: s.id,
      }))
      : []
  //#endregion

  //#region FETCH  DEDUCTION MASTER DETAILS
  const fetchDeductionMasterDetails = async () => {


    await runApiWithLoader(

      setIsLoading,

      setLoadingMessage,

      async () => {

        const params: FilterWithPaginationDeductionMasterRequest = {
          PageNumber: 1,
          PageSize: 1,
          DeductionMasterId: DeductionId,
          SortBy: ''
        };

        const response = await DeductionMasterService.apiCallPullDeductionMaster(params);

        if (E.isRight(response)) {

          const e = response.right.Data?.[0];

          if (e) {
            setFormData(prev => ({
              ...prev,
              DeductionMasterId: e.DeductionMasterId ?? prev.DeductionMasterId,
              Uniquekey: e.Uniquekey ?? prev.Uniquekey,
              Name: e.Name ?? prev.Name,
              Type: e.Type ?? prev.Type,
              Value: e.Value ?? prev.Value,
              BranchMasterId: e.BranchMasterId ?? prev.BranchMasterId,
              MinSalary: e.MinSalary ?? prev.MinSalary,
              MaxSalary: e.MaxSalary ?? prev.MaxSalary,
              Gender: e.Gender ?? prev.Gender,
              StateMasterId: e.StateMasterId ?? prev.StateMasterId,
              StateName: e.StateName ?? prev.StateName
            }));

            setDropdownLabels({
              branchName: e.BranchName || "",
              gender: e.Gender || "",
              StateName: e.StateName || ""
            });
            setSelectedStateId(e.StateMasterId || null);
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
      'Loading Deduction'
    );
  };
  //#endregion

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddDeductionMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.Name) {
      newErrors.Name = 'Deduction Name is required.';
    }else if (formData.Name.trim().length > 50) {
      newErrors.Name = 'Deduction Name must be at most 50 characters'
    }

    if (!formData.BranchMasterId) {
      newErrors.BranchMasterId = 'Branch Name is required.';
    }

    if (!formData.Type) {
      newErrors.Type = 'Type is required.';
    }

    if (!formData.Value || Number(formData.Value) <= 0) {
      newErrors.Value = "Value is required";
    }

    if (!formData.MaxSalary || Number(formData.MaxSalary) <= 0) {
      newErrors.MaxSalary = "Max Salary is required";
    }

    if (!formData.MinSalary || Number(formData.MinSalary) <= 0) {
      newErrors.MinSalary = "Min Salary is required";
    }

    if (!formData.Gender?.trim()) {
      newErrors.Gender = 'Gender is required.';
    }
    if (!formData.StateMasterId) {
      newErrors.StateMasterId = 'State Name is required.';
    }
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };
  //#endregion

  //#region PUSH DATA
  const PushDeductionMasterFormData = (): AddUpdateDeductionMasterRequest => {
    return {
      DeductionMasterId: formData.DeductionMasterId,
      Uniquekey: formData.Uniquekey,
      Name: formData.Name,
      Type: Array.isArray(formData.Type) ? formData.Type.join(',') : formData.Type,
      Value: formData.Value,
      BranchMasterId: formData.BranchMasterId,
      MinSalary: formData.MinSalary,
      MaxSalary: formData.MaxSalary,
      Gender: formData.Gender,
      StateMasterId: formData.StateMasterId,
      BranchName: formData.BranchName,
      StateName: formData.StateName
    };
  }
  //#endregion

  //#region HANDLE ADD AND UPDATE DEDUCTION MASTER
  const handleAddUpdateDeductionMaster = async () => {

    setErrors({});

    const validation = validateAddDeductionMasterForm();

    if (!validation.isValid) {

      setErrors(validation.errors);

      return;
    }

    await runApiWithLoader(

      setIsLoading,

      setLoadingMessage,

      async () => {
        const payload = PushDeductionMasterFormData();

        const response = await DeductionMasterService.apiCallAddUpdateDeductionMaster(payload);

        if (E.isRight(response)) {
          addToast({ type: "success", title: isAddMode ? "Deduction added successfully" : "Deduction updated successfully" });

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

          navigate("/deductionMaster",
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
      isAddMode ? 'Add Deduction' : 'Update Deduction'
    );
  };
  //#endregion

  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      {/* Loader */}

      <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

      <div className="flex-1 space-y-2 px-6 py-3 pb-10 overflow-y-auto thin-scroll ">

        <form onSubmit={handleAddUpdateDeductionMaster}>

          {/* Basic Deduction Details */}
          
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Deduction Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">

              <div>
                <Input
                  type="text"
                  required
                  label='Name'
                  value={formData.Name ?? ""}
                  onChange={(e) => handleFieldChange("Name", e.target.value)}
                  placeholder="Enter Deduction Name"
                  maxLength={250}
                  error={errors.Name}
                />
              </div>

              <div>
                <MultiSelectDropdown
                  label="Type"
                  options={DEDUCTION_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                  selectedValues={Array.isArray(formData.Type) ? formData.Type : formData.Type ? [formData.Type] : []}
                  onChange={(values) => handleFieldChange("Type", values)}
                  required
                  error={errors.Type}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
              <div>
                <Input
                  label='Value'
                  required
                  error={errors.Value}
                  type="text"
                  value={formData.Value ?? ''}
                  maxLength={10}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    handleFieldChange('Value', digits === '' ? 0 : Number(digits));
                  }}
                  placeholder="Enter Value"
                />
              </div>

              <div>
                <SinglePageSelection
                  label="Gender"
                  required
                  value={formData.Gender}
                  onChange={(value) => handleFieldChange("Gender", value)}
                  options={GENDER_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                  error={errors.Gender}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">

              <div>
                <SinglePageSelection
                  label="State Name"
                  value={selectedStateId ?? ''}
                  required
                  onChange={val => {
                    const id = Number(val)
                    setSelectedStateId(id)
                    handleFieldChange('StateMasterId', id)
                  }}
                  disabled={stateOptions.length === 0}
                  options={stateOptions}
                  error={errors.StateMasterId}
                />
              </div>

              <div>
                <SingleSelectDropdownWithPagination
                  label="Branch Name"
                  title="Select Branch"
                  size="lg"
                  required
                  dataFetchCallBack={fetchBranchMasterDropdown}
                  onSelected={(item) => handleFieldChange("BranchMasterId", Number(item.value))}
                  initialValue={createDropdownInitialValue(formData.BranchMasterId, dropdownLabels.branchName)}
                  error={errors.BranchMasterId}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">

              <div>
                <Input
                  label='Min Salary'
                  required
                  error={errors.MinSalary}
                  type="text"
                  value={formData.MinSalary ?? ''}
                  maxLength={10}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    handleFieldChange('MinSalary', digits === '' ? 0 : Number(digits));
                  }}
                  placeholder="Enter Min Salary"
                />
              </div>

              <div>
                <Input
                  label='Max Salary'
                  required
                  error={errors.MaxSalary}
                  type="text"
                  value={formData.MaxSalary ?? ''}
                  maxLength={10}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    handleFieldChange('MaxSalary', digits === '' ? 0 : Number(digits));
                  }}
                  placeholder="Enter Max Salary"
                />
              </div>

            </div>

          </div>
        </form>
      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={formData.DeductionMasterId ? "Update" : "Add"}
        onCancel={() => navigate(-1)}
        canAction={canAction}
        onSave={() => {
          handleAddUpdateDeductionMaster();
        }}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AddUpdateDeductionMaster;

