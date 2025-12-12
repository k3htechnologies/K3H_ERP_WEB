import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react";
import React from "react";
import { filterNumbers, filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import type { AddUpdateTenantRequest, FilterWithPaginationTenantRequest } from "@/features/tenant/models/TenantModel";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { tenantService } from "../services/TenantService";

var ProjectId = 1;

const initialFormState = (): AddUpdateTenantRequest => ({
  TenantId: 0,
  Uniquekey: null,
  BuildingId: 0,
  ProjectId: ProjectId,
  FlatNumber: "",
  FlatCarpetAreaSqFt: null,
  Facing: "",
  FlatType: "",
  FlatConfiguration: "",
  FreeAreaOfferedPercent: null,
  ExtraAreaPurchasedSqFt: null,
  TotalAreaSqFt: null,
});

const AddUpdateTenant: React.FC = () => {

  //#region STATE MANAGEMENT
  const [formData, setFormData] = useState<AddUpdateTenantRequest>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // NAVIGATE
  const navigate = useNavigate();
  const location = useLocation();

  //GET VALUE FROM URL :TENANTID
  const { tenantId } = useParams<{ tenantId?: string }>();

  // TOAST
  const { addToast } = useToast();

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions('/tenant');
  //#endregion

  //#region HANDLE FILED CHNAGE EVENT
  const handleFieldChange = (field: keyof AddUpdateTenantRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region INITIALIZATION

  useEffect(() => {
    if (tenantId) {
      fetchTenantDetails();
      return;
    }

    handleFieldChange('ProjectId', ProjectId);

  }, [tenantId]);

  //#endregion

  //#region FETCH TENANT DETAILS
  const fetchTenantDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationTenantRequest = {
          PageNumber: 1,
          PageSize: 1,
          IsCheckPermission: false,
          TenantId: Number(tenantId),
          ProjectId: Number(ProjectId)
        }

        const response = await tenantService.apiCallPullTenant(params);

        if (E.isRight(response)) {

          const e = response.right.Data?.[0];

          if (e) {
            setFormData(prev => ({
              ...prev,
              TenantId: e.TenantId ?? prev.TenantId,
              Uniquekey: e.Uniquekey ?? prev.Uniquekey,
              BuildingId: e.BuildingId ?? prev.BuildingId,
              ProjectId: e.ProjectId ?? prev.ProjectId,
              FlatNumber: e.FlatNumber ?? prev.FlatNumber,
              FlatCarpetAreaSqFt: e.FlatCarpetAreaSqFt ?? prev.FlatCarpetAreaSqFt,
              Facing: e.Facing ?? prev.Facing,
              FlatType: e.FlatType ?? prev.FlatType,
              FlatConfiguration: e.FlatConfiguration ?? prev.FlatConfiguration,
              FreeAreaOfferedPercent: e.FreeAreaOfferedPercent ?? prev.FreeAreaOfferedPercent,
              ExtraAreaPurchasedSqFt: e.ExtraAreaPurchasedSqFt ?? prev.ExtraAreaPurchasedSqFt,
              TotalAreaSqFt: e.TotalAreaSqFt ?? prev.TotalAreaSqFt,
            }));
          }
        } else {

          addToast({ type: 'error', title: response.left.message });

        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Tenant Data'
    )
  }
  //#endregion

  //#region TENANT VALIDATION | ADD | UPDATE ACTION
  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddTenantForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (!formData.FlatNumber?.trim()) {
      newErrors.FlatNumber = 'Flat Number is required'
    }
    if (!formData.FlatType?.trim()) {
      newErrors.FlatType = 'Flat Type is required'
    }
    if (!formData.BuildingId) {
      newErrors.BuildingId = 'Building Id is required'
    }
    if (!formData.ProjectId) {
      newErrors.ProjectId = 'Project Id is required'
    }
    if (!formData.TotalAreaSqFt) {
      newErrors.TotalAreaSqFt = 'Total Area is required'
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushTenantFormData = (): AddUpdateTenantRequest => {
    return {
      TenantId: formData.TenantId,
      Uniquekey: formData.Uniquekey,
      BuildingId: formData.BuildingId,
      ProjectId: formData.ProjectId,
      FlatNumber: formData.FlatNumber,
      FlatCarpetAreaSqFt: formData.FlatCarpetAreaSqFt,
      Facing: formData.Facing,
      FlatType: formData.FlatType,
      FlatConfiguration: formData.FlatConfiguration,
      FreeAreaOfferedPercent: formData.FreeAreaOfferedPercent,
      ExtraAreaPurchasedSqFt: formData.ExtraAreaPurchasedSqFt,
      TotalAreaSqFt: formData.TotalAreaSqFt,
    };

  };

  const handleSubmit = async () => {

    setErrors({})


    const validation = validateAddTenantForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,
      async () => {

        const payload = PushTenantFormData();

        const response = await tenantService.apiCallAddUpdateTenant(payload);

        if (E.isRight(response)) {

          addToast({ type: "success", title: formData.TenantId ? "Tenant updated successfully" : "Tenant added successfully" });

          // Get list state from navigation if available, otherwise use defaults
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

          navigate("/tenant", {
            state: { listState }
          });

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

      Number(tenantId) === 0 ? 'Add Tenant' : 'Update Tenant'
    )

  };

  //#endregion
  return (


    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>


      <div className="flex-1 space-y-2 px-6 py-3 pb-20 overflow-y-auto thin-scroll ">
        <form onSubmit={handleSubmit}>
          {/* ============================================================= [BASIC TENANT DETAILS] ============================================================================================= */}
          <div className="space-y-4 pb-3">
           <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Basic Tenant Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Input
                  label="Flat Number"
                  value={formData.FlatNumber}
                  required
                  onChange={e => handleFieldChange('FlatNumber', e.target.value)}
                  error={errors.FlatNumber} />
              </div>
              <div>
                <Input
                  value={formData.FlatType}
                  label="Flat Type"
                  required
                  onChange={e => handleFieldChange('FlatType', e.target.value)}
                  error={errors.FlatType} />
              </div>
              <div>
                <Input
                  value={formData.FlatConfiguration}
                  label="Flat Configuration"
                  onChange={e => handleFieldChange('FlatConfiguration', e.target.value)}
                  error={errors.FlatConfiguration} />
              </div>
              <div>
                <Input
                  value={formData.Facing ?? ''}
                  label="Facing"
                  onChange={e => handleFieldChange('Facing', e.target.value)}
                  error={errors.Facing} />
              </div>
              <div>
                <Input
                  value={formData.BuildingId ?? ''}
                  label="Building Id"
                  required
                  onChange={e => handleFieldChange('BuildingId', Number(filterNumbers(e.target.value) || 0))}
                  error={errors.BuildingId} />
              </div>
              <div>
                <Input
                  value={formData.ProjectId ?? ''}
                  label="Project Id"
                  required
                  onChange={e => handleFieldChange('ProjectId', Number(filterNumbers(e.target.value) || 0))}
                  error={errors.ProjectId} />
              </div>
            </div>
          </div>
          {/* ============================================================= [AREA DETAILS] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Area Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Input
                  value={formData.FlatCarpetAreaSqFt ?? ''}
                  label="Carpet Area (sqft)"
                  onChange={e => handleFieldChange('FlatCarpetAreaSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                  error={errors.FlatCarpetAreaSqFt}
                />
              </div>
              <div>
                <Input
                  value={formData.TotalAreaSqFt ?? ''}
                  label="Total Area (sqft)"
                  required
                  onChange={e => handleFieldChange('TotalAreaSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                  error={errors.TotalAreaSqFt}
                />
              </div>
              <div>
                <Input
                  value={formData.FreeAreaOfferedPercent ?? ''}
                  label="Free Area Offered (%)"
                  onChange={e => handleFieldChange('FreeAreaOfferedPercent', filterNumbersWithDecimal(e.target.value) || 0)}
                  error={errors.FreeAreaOfferedPercent}
                />
              </div>
              <div>
                <Input
                  value={formData.ExtraAreaPurchasedSqFt ?? ''}
                  label="Extra Area Purchased (sqft)"
                  onChange={e => handleFieldChange('ExtraAreaPurchasedSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                  error={errors.ExtraAreaPurchasedSqFt}
                />
              </div>
            </div>
          </div>

        </form>
      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={formData.TenantId ? "Update Tenant" : "Add Tenant"}
        onCancel={() => navigate(-1)}
        canAction={canAction}
        onSave={() => {
          handleSubmit();
        }}
        isLoading={isLoading}
      />


    </div>
  );
};

export default AddUpdateTenant;
