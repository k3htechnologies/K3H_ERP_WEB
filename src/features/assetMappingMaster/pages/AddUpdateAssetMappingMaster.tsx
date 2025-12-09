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
import type { AddUpdateAssetMappingMasterRequest, FilterWithPaginationAssetMappingMasterRequest } from "../models/AssetMappingMasterModel";
import { assetMappingMasterService } from "../services/AssetMappingMasterService";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { fetchAssetMasterDropdown } from "@/features/assetMaster/assetMasterDropDown";

const initialFormState = (): AddUpdateAssetMappingMasterRequest => ({
  AssetMasterMappingId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  AssetMasterId: 0,
  AssignedDate: "",
  EmployeeId: 0,
  ReturnDate: "",
  ConditionOnIssue: "",
  ConditionOnReturn: "",
  Remarks: ""
});

export const AddUpdateAssetMappingMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [formData, setFormData] = useState<AddUpdateAssetMappingMasterRequest>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // NAVIGATE
  const navigate = useNavigate();
  const location = useLocation();

  // GET VALUE FROM URL AssetMappingMasterId
  const { AssetMasterMappingId } = useParams<{ AssetMasterMappingId?: string }>();
  const AssetMappingId = AssetMasterMappingId ? Number(AssetMasterMappingId) : 0;
  const isAddMode = AssetMappingId === 0;

  // TOAST
  const { toasts, removeToast, addToast } = useToast();

  // ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  //#endregion

  const [dropdownLabels, setDropdownLabels] = useState<{
    employeeName?: string;
    assetName?: string;
  }>({});

  //#region HANDLE FIELD CHANGE EVENT
  const handleFieldChange = (field: keyof AddUpdateAssetMappingMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region INITIALIZATION
  useEffect(() => {
    if (!isAddMode) {
      fetchAssetMappingMasterDetails();
    }
  }, [AssetMappingId]);
  //#endregion

  //#region FETCH ASSET MAPPING MASTER DETAILS
  const fetchAssetMappingMasterDetails = async () => {
    await runApiWithLoader(

      setIsLoading,

      setLoadingMessage,

      async () => {

        const params: FilterWithPaginationAssetMappingMasterRequest = {
          PageNumber: 1,
          PageSize: 1,
          AssetMasterMappingId: AssetMappingId
        };

        const response = await assetMappingMasterService.apiCallPullAssetMappingMaster(params);

        if (E.isRight(response)) {

          const e = response.right.Data?.[0];

          if (e) {
            setFormData(prev => ({
              ...prev,
              AssetMasterMappingId: e.AssetMasterMappingId ?? prev.AssetMasterMappingId,
              Uniquekey: e.Uniquekey ?? prev.Uniquekey,
              AssetMasterId: e.AssetMasterId ?? prev.AssetMasterId,
              AssignedDate: e.AssignedDate ? e.AssignedDate.split("T")[0] : "",
              EmployeeId: e.EmployeeId ?? prev.EmployeeId,
              ReturnDate: e.ReturnDate ? e.ReturnDate.split("T")[0] : "",
              ConditionOnIssue: e.ConditionOnIssue ?? prev.ConditionOnIssue,
              ConditionOnReturn: e.ConditionOnReturn ?? prev.ConditionOnReturn,
              Remarks: e.Remarks ?? prev.Remarks
            }));

            setDropdownLabels({
              employeeName: e.EmployeeName || "",
              assetName: e.AssetName || ""
            });

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
      'Loading Asset Mapping Data'
    );
  };
  //#endregion

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddAssetMappingMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.AssetMasterId) {
      newErrors.AssetMasterId = 'Asset Name is required.';
    }
    if (!formData.EmployeeId) {
      newErrors.EmployeeId = 'Employee Name is required.';
    }

    if (!formData.ConditionOnIssue?.trim()) {
      newErrors.ConditionOnIssue = 'Condition On Issue is required.';
    }

    if (!formData.ConditionOnReturn?.trim()) {
      newErrors.ConditionOnReturn = "Condition On Return is required";
    }

    if (!formData.ReturnDate) {
      newErrors.ReturnDate = "Return Date is required";
    }

    if (!formData.AssignedDate?.trim()) {
      newErrors.AssignedDate = 'Assigned Date is required.';
    }

    if (!formData.Remarks?.trim()) {
      newErrors.Remarks = 'Remarks is required.';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };
  //#endregion

  //#region PUSH DATA
  const PushAssetMappingMasterFormData = (): AddUpdateAssetMappingMasterRequest => {
    return {
      AssetMasterMappingId: formData.AssetMasterMappingId,
      Uniquekey: formData.Uniquekey,
      AssetMasterId: formData.AssetMasterId,
      AssignedDate: formData.AssignedDate,
      EmployeeId: formData.EmployeeId,
      ReturnDate: formData.ReturnDate,
      ConditionOnIssue: formData.ConditionOnIssue,
      ConditionOnReturn: formData.ConditionOnReturn,
      Remarks: formData.Remarks
    };
  }
  //#endregion

  //#region HANDLE ADD AND UPDATE ASSET MAPPING MASTER
  const handleAddUpdateAssetMappingMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    const validation = validateAddAssetMappingMasterForm();

    if (!validation.isValid) {

      setErrors(validation.errors);

      return;
    }

    await runApiWithLoader(

      setIsLoading,

      setLoadingMessage,

      async () => {
        const payload = PushAssetMappingMasterFormData();

        const response = await assetMappingMasterService.apiCallAddUpdateAssetMappingMaster(payload);

        if (E.isRight(response)) {
          addToast({ type: "success", title: isAddMode ? "AssetMapping added successfully" : "AssetMapping updated successfully" });

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

          navigate("/assetMappingMaster",
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
      isAddMode ? 'Add Asset' : 'Update Asset'
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

          <form onSubmit={handleAddUpdateAssetMappingMaster}>

            {/* Basic AssetMapping Details */}

            <div className="space-y-4 pb-3">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic AssetMapping Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                
                <div>
                  <SingleSelectDropdownWithPagination
                    label="Asset"
                    title="Select Asset"
                    size="lg"
                    required
                    dataFetchCallBack={fetchAssetMasterDropdown}
                    onSelected={(item) => handleFieldChange("AssetMasterId", Number(item.value))}
                    initialValue={createDropdownInitialValue(formData.AssetMasterId, dropdownLabels.assetName)}
                    error={errors.AssetMasterId}
                  />
                </div>
                <div>
                  <SingleSelectDropdownWithPagination
                    label="Employee"
                    title="Select Employee"
                    size="lg"
                    required
                    dataFetchCallBack={fetchEmployeeMasterDropdown}
                    onSelected={(item) => handleFieldChange("EmployeeId", Number(item.value))}
                    initialValue={createDropdownInitialValue(formData.EmployeeId, dropdownLabels.employeeName)}
                    error={errors.EmployeeId}
                  />
                </div>

              </div>
              <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                <div>
                  <Input
                    type="text"
                    required
                    label='Condition On Issue'
                    value={formData.ConditionOnIssue ?? ""}
                    onChange={(e) => handleFieldChange("ConditionOnIssue", e.target.value)}
                    placeholder="Enter Condition On Issue"
                    maxLength={250}
                    error={errors.ConditionOnIssue}
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    required
                    label='Condition On Return'
                    value={formData.ConditionOnReturn ?? ""}
                    onChange={(e) => handleFieldChange("ConditionOnReturn", e.target.value)}
                    placeholder="Enter Condition On Return"
                    maxLength={250}
                    error={errors.ConditionOnReturn}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                <div>
                  <Input
                    type="date"
                    required
                    label='Assigned Date '
                    value={formData.AssignedDate ?? ""}
                    onChange={(e) => handleFieldChange("AssignedDate", e.target.value)}
                    placeholder="Enter Assigned Date"
                    maxLength={250}
                    error={errors.AssignedDate}
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    required
                    label='Return Date'
                    value={formData.ReturnDate ?? ""}
                    onChange={(e) => handleFieldChange("ReturnDate", e.target.value)}
                    placeholder="Enter Return Date"
                    maxLength={250}
                    error={errors.ReturnDate}
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
              handleAddUpdateAssetMappingMaster(e);
            }}
            className="px-6"
            disabled={isLoading}
          >
            {isAddMode ? "Add Asset" : "Update Asset"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default AddUpdateAssetMappingMaster;
