import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react";
import React from "react";
import type { AddUpdateAssetMasterRequest, FilterWithPaginationAssetMasterRequest } from "../models/AssetMasterModel";
import { assetMasterService } from "@/features/assetMaster/services/AssetMasterService";
import { DatePickerInput } from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { filterNumbersWithDecimal } from "@/core/utils/fileValidation";

const initialFormState = (): AddUpdateAssetMasterRequest => ({
  AssetMasterId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  AssetCode: '',
  AssetName: '',
  AssetType: '',
  AssetModel: '',
  AssetBrand: '',
  SerialNumber: '',
  PurchaseDate: '',
  WarrantyExpiryDate: '',
  AssetCost: 0,
  SupplierName: ''
});

export const AddUpdateAssetMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [formData, setFormData] = useState<AddUpdateAssetMasterRequest>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // NAVIGATE
  const navigate = useNavigate();

  // GET VALUE FROM URL ASSET MASTER ID
  const { AssetMasterId } = useParams<{ AssetMasterId?: string }>();
  const assetId = AssetMasterId ? Number(AssetMasterId) : 0;
  const isAddMode = assetId === 0;

  // TOAST
  const { addToast } = useToast();

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions('/assetMaster');
  //#endregion

  // ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  //#endregion

  //#region HANDLE FIELD CHANGE EVENT
  const handleFieldChange = (field: keyof AddUpdateAssetMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region INITIALIZATION
  useEffect(() => {
    if (!isAddMode) {
      fetchAssetMasterDetails();
    }
  }, [assetId]);
  //#endregion

  //#region FETCH ASSET MASTER DETAILS
  const fetchAssetMasterDetails = async () => {
    await runApiWithLoader(

      setIsLoading,

      setLoadingMessage,

      async () => {

        const params: FilterWithPaginationAssetMasterRequest = {
          PageNumber: 1,
          PageSize: 1,
          AssetMasterId: assetId
        };

        const response = await assetMasterService.apiCallPullAssetMaster(params);

        if (E.isRight(response)) {

          const e = response.right.Data?.[0];

          if (e) {
            setFormData(prev => ({
              ...prev,
              AssetMasterId: e.AssetMasterId ?? prev.AssetMasterId,
              Uniquekey: e.Uniquekey ?? prev.Uniquekey,
              AssetName: e.AssetName ?? prev.AssetName,
              AssetCode: e.AssetCode ?? prev.AssetCode,
              AssetBrand: e.AssetBrand ?? prev.AssetBrand,
              AssetCost: e.AssetCost ?? prev.AssetCost,
              AssetModel: e.AssetModel ?? prev.AssetModel,
              SerialNumber: e.SerialNumber ?? prev.SerialNumber,
              SupplierName: e.SupplierName ?? prev.SupplierName,
              PurchaseDate: e.PurchaseDate ?? prev.PurchaseDate,
              WarrantyExpiryDate: e.WarrantyExpiryDate ?? prev.WarrantyExpiryDate,
              AssetType: e.AssetType ?? prev.AssetType
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
      'Loading Asset'
    );
  };
  //#endregion

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddAssetMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.AssetName?.trim()) {
      newErrors.AssetName = 'Asset Name is required.';
    } else if (formData.AssetName.trim().length > 50) {
      newErrors.AssetName = 'Asset Name must be at most 50 characters';
    }

    if (!formData.AssetCode?.trim()) {
      newErrors.AssetCode = 'Asset Code is required.';
    } else if (formData.AssetCode.trim().length > 5) {
      newErrors.AssetCode = 'Asset Code must be at most 4 characters';
    }

    if (!formData.AssetModel?.trim()) {
      newErrors.AssetModel = 'Asset Model is required.';
    }

    if (!formData.AssetType?.trim()) {
      newErrors.AssetType = "Asset Type is required";
    }

    if (!formData.AssetCost || Number(formData.AssetCost) <= 0) {
      newErrors.AssetCost = "Asset Cost is required";
    }

    if (!formData.SerialNumber) {
      newErrors.SerialNumber = 'Serial Number is required.';
    }

    if (!formData.SupplierName?.trim()) {
      newErrors.SupplierName = "Supplier Name is required";
    }

    if (!formData.AssetBrand) {
      newErrors.AssetBrand = "Asset Brand is required";
    }

    if (!formData.PurchaseDate) {
      newErrors.PurchaseDate = "Purchase Date is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };
  //#endregion

  //#region PUSH DATA
  const PushAssetMasterFormData = (): AddUpdateAssetMasterRequest => {
    return {
      AssetMasterId: formData.AssetMasterId,
      Uniquekey: formData.Uniquekey,
      AssetCode: formData.AssetCode,
      AssetName: formData.AssetName,
      AssetType: formData.AssetType,
      AssetModel: formData.AssetModel,
      AssetBrand: formData.AssetBrand,
      SerialNumber: formData.SerialNumber,
      PurchaseDate: formData.PurchaseDate,
      WarrantyExpiryDate: formData.WarrantyExpiryDate=="" ? null :formData.WarrantyExpiryDate,
      AssetCost: formData.AssetCost,
      SupplierName: formData.SupplierName
    };
  }
  //#endregion

  //#region HANDLE SUBMIT
  const handleAddUpdateAssetMaster = async () => {

    setErrors({});

    const validation = validateAddAssetMasterForm();

    if (!validation.isValid) {

      setErrors(validation.errors);

      return;
    }

    await runApiWithLoader(

      setIsLoading,

      setLoadingMessage,

      async () => {
        const payload = PushAssetMasterFormData();

        const response = await assetMasterService.apiCallAddUpdateAssetMaster(payload);

        if (E.isRight(response)) {

          addToast({ type: "success", title: response.right.SuccessMessage[0] });

          navigate("/assetMaster");

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


    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      {/* Loader */}

      <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

      <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">

        <form onSubmit={handleAddUpdateAssetMaster}>

          {/* Basic Asset Details */}

          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Asset Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Input
                  type="text"
                  required
                  label='Asset Name'
                  value={formData.AssetName ?? ""}
                  onChange={(e) => handleFieldChange("AssetName", e.target.value)}
                  placeholder="Enter Asset Name"
                  maxLength={250}
                  error={errors.AssetName}
                />
              </div>
              <div>
                <Input
                  type="text"
                  required
                  label='Asset Code'
                  value={formData.AssetCode?.toUpperCase() ?? ""}
                  onChange={(e) => handleFieldChange("AssetCode", e.target.value)}
                  placeholder="Enter Asset Code"
                  maxLength={4}
                  error={errors.AssetCode}
                />
              </div>
              
              <div>
                <Input
                  type="text"
                  required
                  label='Asset Brand'
                  value={formData.AssetBrand ?? ""}
                  onChange={(e) => handleFieldChange("AssetBrand", e.target.value)}
                  placeholder="Enter Asset Brand"
                  maxLength={100}
                  error={errors.AssetBrand}
                />
              </div>
              <div>
                <Input
                  type="text"
                  required
                  label='Asset Model'
                  value={formData.AssetModel ?? ""}
                  onChange={(e) => handleFieldChange("AssetModel", e.target.value)}
                  placeholder="Enter Asset Model"
                  maxLength={250}
                  error={errors.AssetModel}
                />
              </div>
              <div>
                <Input
                  type="text"
                  required
                  label='Asset Type'
                  value={formData.AssetType ?? ""}
                  onChange={(e) => handleFieldChange("AssetType", e.target.value)}
                  placeholder="Enter Asset Type"
                  maxLength={250}
                  error={errors.AssetType}
                />
              </div>
              <div>
                <DatePickerInput
                  label="Purchase Date"
                  value={formatDate_dd_mm_yyyy(formData.PurchaseDate)}
                  onChange={(val) => handleFieldChange('PurchaseDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                  required
                  error={errors.PurchaseDate}
                />
              </div>
              <div>
                <Input
                  type="text"
                  required
                  label='Supplier Name'
                  value={formData.SupplierName ?? ""}
                  onChange={(e) => handleFieldChange("SupplierName", e.target.value)}
                  placeholder="Enter Supplier Name"
                  maxLength={250}
                  error={errors.SupplierName}
                />
              </div>
              <div>
                <Input
                  type="text"
                  required
                  label='Serial Number'
                  value={formData.SerialNumber?.toUpperCase() ?? ""}
                  onChange={(e) => handleFieldChange("SerialNumber", e.target.value)}
                  placeholder="Enter Serial Number"
                  maxLength={100}
                  error={errors.SerialNumber}
                />
              </div>
              
              <div>
                <Input
                  label='Asset Cost (₹)'
                  required
                  error={errors.AssetCost}
                  type="text"
                  value={formData.AssetCost ?? ''}
                  rightIcon="₹"
                  onChange={e => handleFieldChange('AssetCost', filterNumbersWithDecimal(e.target.value) || 0)}
                  
                  placeholder="Enter Asset Cost"
                />
              </div>

              <div>
                <DatePickerInput
                  label="Warranty Expiry Date"
                  value={formatDate_dd_mm_yyyy(formData.WarrantyExpiryDate)}
                  onChange={(val) => handleFieldChange('WarrantyExpiryDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                  
                  error={errors.WarrantyExpiryDate}
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={formData.AssetMasterId ? "Update" : "Add"}
        onCancel={() => navigate(-1)}
        canAction={canAction}
        onSave={() => {
          handleAddUpdateAssetMaster();
        }}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AddUpdateAssetMaster;
