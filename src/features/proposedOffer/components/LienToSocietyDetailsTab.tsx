import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ProposedOfferLienToSocietyDetailsData,
  FilterWithPaginationProposedOfferLienToSocietyDetailsRequest,
  AddUpdateProposedOfferLienToSocietyDetailsRequest,
  ProposedOfferLienToSocietyDetailsWithPaymentStageData,
} from '@/features/proposedOffer/models/ProposedOfferModel';
import { proposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { filterNumbers, filterNumbersWithDecimal } from '@/core/utils/fileValidation';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { Modal } from '@/ui/components/Modal/Modal';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { Checkbox } from '@/ui/components/forms/Checkbox';
import { FLAT_UNIT_TYPE } from '@/core/constants';
import {
  initialFormStateLienToSocietyDetails,
  initialFormStateLienToSocietyPaymentStage,
} from '../utils/initialStates';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { TextArea } from '@/ui/components/forms/Textarea';
import MultiSelectPagination from '@/ui/components/DropDown/Multiselectpagination';
import { useMultiSelectDropdown } from '@/core/hooks/useMultiSelectDropdown';
import { fetchPaginatedCommercialFlatsDropdown, fetchPaginatedResidentialFlatsDropdown } from '@/features/inventory/PaginatedFlatsDropDown';
import { getInputValue, isEmpty } from '@/core/utils/comman';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';

interface LienToSocietyDetailsTabProps {
  projectId: number | null;
  buildingId: number;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

export const LienToSocietyDetailsTab: React.FC<LienToSocietyDetailsTabProps> = ({
  projectId,
  buildingId,
  isLoading,
  setIsLoading,
  setLoadingMessage,
}) => {
  const [lienToSocietyDetailsData, setLienToSocietyDetailsData] = useState<ProposedOfferLienToSocietyDetailsData | null>(null);
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions();
  const [errorsLienToSocietyDetails, setErrorsLienToSocietyDetails] = useState<{ [k: string]: string }>({});
  const [errorsLienToSocietyPaymentStage, setErrorsLienToSocietyPaymentStage] = useState<{ [k: string]: string }>({});
  const [formDataLienToSocietyDetails, setFormDataLienToSocietyDetails] = useState<AddUpdateProposedOfferLienToSocietyDetailsRequest>(() => initialFormStateLienToSocietyDetails());
  const [lienToSocietyPaymentStageList, setLienToSocietyPaymentStageList] = useState<ProposedOfferLienToSocietyDetailsWithPaymentStageData[]>([]);
  const [editingLienToSocietyPaymentStageData, setEditingLienToSocietyPaymentStageData] = useState<{ row: ProposedOfferLienToSocietyDetailsWithPaymentStageData; index: number } | null>(null);
  const [isAddUpdateLienToSocietyPaymentStageModalOpen, setIsAddUpdateLienToSocietyPaymentStageModalOpen] = useState(false);
  const [formDataLienToSocietyPaymentStage, setFormDataLienToSocietyPaymentStage] = useState<ProposedOfferLienToSocietyDetailsWithPaymentStageData>(() => initialFormStateLienToSocietyPaymentStage());
  const [isConfirmationDialogBoxOpenLienToSocietyPaymentStage, setIsConfirmationDialogBoxOpenLienToSocietyPaymentStage] = useState(false);
  const [deleteLienToSocietyPaymentStageData, setDeleteLienToSocietyPaymentStageData] = useState<{ row: ProposedOfferLienToSocietyDetailsWithPaymentStageData; index: number } | null>(null);
  const [selectResidentialFlatValues, setSelectResidentialFlatValues] = useState<string  | null>(null);
  const [selectCommercialFlatValues, setSelectCommercialFlatValues] = useState<string  | null>(null);

  useEffect(() => {
    if (!projectId || !buildingId) return;
    setErrorsLienToSocietyDetails({});
    setErrorsLienToSocietyPaymentStage({});
    fetchLienToSocietyDetailsData();
  }, [projectId, buildingId]);

  const fetchResidentialFlats = useCallback(async (pageNumber: number, params?: { value?: string }) => {

    return fetchPaginatedResidentialFlatsDropdown(pageNumber, {
      ...params,
      value: params?.value || "",
      projectId: projectId || 0,
      flat: params?.value || "",
      displayInventoryFlatId: selectResidentialFlatValues || "",
    });
  }, [projectId,selectResidentialFlatValues]);


  const ResidentialFlatDropDown = useMultiSelectDropdown({
    value: selectResidentialFlatValues, fetchCallback: fetchPaginatedResidentialFlatsDropdown,
    fetchParams: {
      projectId: String(projectId),
    },
    autoFetchOptions: true,
  });

  const fetchCommercialFlats = useCallback(async (pageNumber: number, params?: { value?: string }) => {

    return fetchPaginatedCommercialFlatsDropdown(pageNumber, {
      ...params,
      value: params?.value || "",
      projectId: projectId || 0,
      flat: params?.value || "",
      displayInventoryFlatId: selectCommercialFlatValues || "",
    });
  }, [projectId,selectCommercialFlatValues]);

  const CommercialFlatDropDown = useMultiSelectDropdown({
    value: selectCommercialFlatValues,
    fetchCallback: fetchPaginatedCommercialFlatsDropdown,
    fetchParams: {
      projectId: String(projectId),
    },
    autoFetchOptions: true,
  });

  const handleFieldChangeLienToSocietyDetails = (field: keyof AddUpdateProposedOfferLienToSocietyDetailsRequest, value: any) => {
    setFormDataLienToSocietyDetails((prev) => ({ ...prev, [field]: value }));
    if (errorsLienToSocietyDetails[field]) {
      setErrorsLienToSocietyDetails((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFieldChangeLienToSocietyPaymentStage = (field: keyof ProposedOfferLienToSocietyDetailsWithPaymentStageData, value: any) => {
    setFormDataLienToSocietyPaymentStage((prev) => ({ ...prev, [field]: value }));
    if (errorsLienToSocietyPaymentStage[field]) {
      setErrorsLienToSocietyPaymentStage((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const fetchLienToSocietyDetailsData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferLienToSocietyDetailsRequest = {
          ProjectId: projectId ?? undefined,
          BuildingId: buildingId
        };

        const response = await proposedOfferService.apiCallPullLienToSocietyDetails(params);

        if (E.isRight(response)) {
          const data = response.right.Data?.[0] || null;
          setLienToSocietyDetailsData(data);

          if (data) {
            setFormDataLienToSocietyDetails({
              ProposedOfferLienToSocietyDetailsId: data.ProposedOfferLienToSocietyDetailsId || 0,
              Uniquekey: data.Uniquekey || initialFormStateLienToSocietyDetails().Uniquekey,
              BuildingId: buildingId,
              ProjectId: Number(projectId),
              ResidentialAreaSqFt: data.ResidentialAreaSqFt ?? 0,
              CommercialAreaSqFt: data.CommercialAreaSqFt ?? 0,
              NumberOfResidentialLienUnits: data.NumberOfResidentialLienUnits ?? 0,
              NumberOfCommercialLienUnits: data.NumberOfCommercialLienUnits ?? 0,
              Remark: data.Remark ?? "",
              ResidentialInventoryFlatId: data.ResidentialInventoryFlatId ?? "",
              CommercialInventoryFlatId: data.CommercialInventoryFlatId ?? "",
              LienToSocietyWithPaymentStageJSON: ''
            });

            setSelectResidentialFlatValues(data.ResidentialInventoryFlatId || null);
            setSelectCommercialFlatValues(data.CommercialInventoryFlatId || null);



            if (data.ProposedOfferSecurityDepositDetailsWithPaymentStageData && data.ProposedOfferSecurityDepositDetailsWithPaymentStageData.length > 0) {
              setLienToSocietyPaymentStageList(data.ProposedOfferSecurityDepositDetailsWithPaymentStageData);
            } else {
              setLienToSocietyPaymentStageList([]);
            }
          } else {
            setFormDataLienToSocietyDetails({
              ...initialFormStateLienToSocietyDetails(),
              ProjectId: Number(projectId)
            });
            setLienToSocietyPaymentStageList([]);
            setSelectCommercialFlatValues("");
            setSelectResidentialFlatValues("");
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
      'Loading Lien to Society Details'
    );
  };

  const validateLienToSocietyDetailsForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (isEmpty(formDataLienToSocietyDetails.ResidentialAreaSqFt)) {
      newErrors.ResidentialAreaSqFt = "Residential Area is required"
    }

    const selectedResidentialCount = (formDataLienToSocietyDetails.ResidentialInventoryFlatId ?? "").split(",").filter(x => x.trim() !== "").length;

    if (selectedResidentialCount!==0 && Number(formDataLienToSocietyDetails.NumberOfResidentialLienUnits) !== selectedResidentialCount) {
      newErrors.ResidentialInventoryFlatId = `${formDataLienToSocietyDetails.NumberOfResidentialLienUnits} Residential Lien Units are required.`
    }

    if (isEmpty(formDataLienToSocietyDetails.CommercialAreaSqFt)) {
      newErrors.CommercialAreaSqFt = "Commercial Area is required"
    }

    const selectedCommercialCount = (formDataLienToSocietyDetails.CommercialInventoryFlatId ?? "").split(",").filter(x => x.trim() !== "").length;

    if (selectedCommercialCount!==0 && Number(formDataLienToSocietyDetails.NumberOfCommercialLienUnits) !== selectedCommercialCount) {
      newErrors.CommercialInventoryFlatId = `${formDataLienToSocietyDetails.NumberOfCommercialLienUnits} Commercial Lien Units are required.`
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleSaveLienToSocietyDetails = async () => {
    if (buildingId === 0) {
      addToast({ type: "error", title: "Please select proper building first" });
      return
    }

    setErrorsLienToSocietyDetails({})

    const validation = validateLienToSocietyDetailsForm()

    if (!validation.isValid) {
      setErrorsLienToSocietyDetails(validation.errors)
      return
    }

    if (lienToSocietyPaymentStageList.length === 0) {
      addToast({ type: "error", title: "Please add atleast one Lien to Society details" });
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const paymentStageJSON = JSON.stringify(lienToSocietyPaymentStageList.map(item => ({
          ProposedOfferLienToSocietyDetailsWithPaymentStageId: item.ProposedOfferLienToSocietyDetailsWithPaymentStageId ?? 0,
          Type: item.Type || '',
          Stage: item.Stage || '',
          CarpetAreaSqFt: item.CarpetAreaSqFt ?? 0,
          IsRelease: item.IsRelease ?? false
        })));

        const payload: AddUpdateProposedOfferLienToSocietyDetailsRequest = {
          ProposedOfferLienToSocietyDetailsId: formDataLienToSocietyDetails.ProposedOfferLienToSocietyDetailsId,
          Uniquekey: formDataLienToSocietyDetails.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          ResidentialAreaSqFt: formDataLienToSocietyDetails.ResidentialAreaSqFt,
          CommercialAreaSqFt: formDataLienToSocietyDetails.CommercialAreaSqFt,
          NumberOfResidentialLienUnits: formDataLienToSocietyDetails.NumberOfResidentialLienUnits,
          ResidentialInventoryFlatId: formDataLienToSocietyDetails.ResidentialInventoryFlatId,
          NumberOfCommercialLienUnits: formDataLienToSocietyDetails.NumberOfCommercialLienUnits,
          CommercialInventoryFlatId: formDataLienToSocietyDetails.CommercialInventoryFlatId,
          Remark: formDataLienToSocietyDetails.Remark,
          LienToSocietyWithPaymentStageJSON: paymentStageJSON
        };

        const response = await proposedOfferService.apiCallAddUpdateLienToSocietyDetails(payload);

        if (E.isRight(response)) {
          const isAdd = formDataLienToSocietyDetails.ProposedOfferLienToSocietyDetailsId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProposedOfferLienToSocietyDetailsData;
            setLienToSocietyDetailsData(newRecord);
            setFormDataLienToSocietyDetails({
              ...formDataLienToSocietyDetails,
              ProposedOfferLienToSocietyDetailsId: newRecord.ProposedOfferLienToSocietyDetailsId || 0,
              Uniquekey: newRecord.Uniquekey || formDataLienToSocietyDetails.Uniquekey
            });
            if (newRecord.ProposedOfferSecurityDepositDetailsWithPaymentStageData) {
              setLienToSocietyPaymentStageList(newRecord.ProposedOfferSecurityDepositDetailsWithPaymentStageData);
            }
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as ProposedOfferLienToSocietyDetailsData;
            setLienToSocietyDetailsData(updatedRecord);
            if (updatedRecord.ProposedOfferSecurityDepositDetailsWithPaymentStageData) {
              setLienToSocietyPaymentStageList(updatedRecord.ProposedOfferSecurityDepositDetailsWithPaymentStageData);
            }
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }
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
      Number(formDataLienToSocietyDetails.ProposedOfferLienToSocietyDetailsId) === 0 ? 'Add Lien to Society Details' : 'Update Lien to Society Details'
    )
  };

  const handleAddLienToSocietyPaymentStageModal = () => {
    setEditingLienToSocietyPaymentStageData(null);
    setFormDataLienToSocietyPaymentStage({
      ...initialFormStateLienToSocietyPaymentStage(),
      ProjectId: Number(projectId),
      BuildingId: formDataLienToSocietyDetails.BuildingId || 0
    });
    setErrorsLienToSocietyPaymentStage({});
    setIsAddUpdateLienToSocietyPaymentStageModalOpen(true);
  };

  const handleEditLienToSocietyPaymentStage = useCallback((row: ProposedOfferLienToSocietyDetailsWithPaymentStageData, index: number) => {
    setEditingLienToSocietyPaymentStageData({ row, index });
    setFormDataLienToSocietyPaymentStage({
      ...row,
      Type: row.Type || '',
      Stage: row.Stage || '',
      CarpetAreaSqFt: row.CarpetAreaSqFt || 0,
      IsRelease: row.IsRelease ?? false
    });
    setErrorsLienToSocietyPaymentStage({});
    setIsAddUpdateLienToSocietyPaymentStageModalOpen(true);
  }, []);

  const validateLienToSocietyPaymentStageForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataLienToSocietyPaymentStage.Type?.trim()) {
      newErrors.Type = "Type is required"
    }

    if (!formDataLienToSocietyPaymentStage.Stage?.trim()) {
      newErrors.Stage = "Stage is required"
    }

    if (!formDataLienToSocietyPaymentStage.CarpetAreaSqFt) {
      newErrors.CarpetAreaSqFt = "Carpet Area is required"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleAddUpdateLienToSocietyPaymentStage = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorsLienToSocietyPaymentStage({});

    const validation = validateLienToSocietyPaymentStageForm();

    if (!validation.isValid) {
      setErrorsLienToSocietyPaymentStage(validation.errors);
      return;
    }

    const paymentStageToSave: ProposedOfferLienToSocietyDetailsWithPaymentStageData = {
      ...formDataLienToSocietyPaymentStage,
      ProposedOfferLienToSocietyDetailsWithPaymentStageId: editingLienToSocietyPaymentStageData?.row.ProposedOfferLienToSocietyDetailsWithPaymentStageId ?? 0,
      ProjectId: Number(projectId),
      BuildingId: Number(buildingId)
    };

    setLienToSocietyPaymentStageList(prevList => {
      if (editingLienToSocietyPaymentStageData) {
        const updated = [...prevList];
        updated[editingLienToSocietyPaymentStageData.index] = paymentStageToSave;
        return updated;
      }

      return [...prevList, paymentStageToSave];
    });

    setIsAddUpdateLienToSocietyPaymentStageModalOpen(false);
    setEditingLienToSocietyPaymentStageData(null);
    setFormDataLienToSocietyPaymentStage(initialFormStateLienToSocietyPaymentStage());
    setErrorsLienToSocietyPaymentStage({});
  };

  const handleConfirmationDialogBoxOpenLienToSocietyPaymentStage = useCallback((row: ProposedOfferLienToSocietyDetailsWithPaymentStageData, index: number) => {
    setDeleteLienToSocietyPaymentStageData({ row, index });
    setIsConfirmationDialogBoxOpenLienToSocietyPaymentStage(true);
  }, []);

  const handleDeleteLienToSocietyPaymentStage = () => {
    if (!deleteLienToSocietyPaymentStageData) return;

    const removeIndex = deleteLienToSocietyPaymentStageData.index;

    if (removeIndex < 0) {
      setIsConfirmationDialogBoxOpenLienToSocietyPaymentStage(false);
      setDeleteLienToSocietyPaymentStageData(null);
      addToast({ type: 'error', title: 'Unable to find the selected record to delete' });
      return;
    }

    setLienToSocietyPaymentStageList(prev => prev.filter((_, i) => i !== removeIndex));

    setIsConfirmationDialogBoxOpenLienToSocietyPaymentStage(false);
    setDeleteLienToSocietyPaymentStageData(null);
    addToast({ type: 'success', title: 'Lien to Society Payment Stage Removed' });
  };

  const lienToSocietyPaymentStageColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'Type',
        label: 'Type',
        width: '20',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'Stage',
        label: 'Stage',
        width: '20',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'CarpetAreaSqFt',
        label: 'Carpet Area (SqFt)',
        width: '20',
        sortable: false,
        align: 'right',
        render: (value) => value ? `${value}` : '-'
      },
      {
        key: 'IsRelease',
        label: 'Is Release',
        width: '20',
        sortable: false,
        align: 'center',
        render: (value) => value ? 'Yes' : 'No'
      },
      {
        key: 'Action',
        label: 'Action',
        width: '20',
        sortable: false,
        align: 'center',
        render: (_value, row, index) => (
          <div className="flex items-center justify-center gap-2">
            {canAction && (
              <>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditLienToSocietyPaymentStage(row, index);
                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleConfirmationDialogBoxOpenLienToSocietyPaymentStage(row, index);
                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  style={{ color: 'red' }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )
      }
    ],
    [canAction, handleEditLienToSocietyPaymentStage, handleConfirmationDialogBoxOpenLienToSocietyPaymentStage]
  );

  const isBuildingSelected = buildingId > 0;

  return (
    <>
      <div className="space-y-6">
        {/* Lien to Society Area Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">
            Lien to Society Area Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="Residential Area (SqFt)"
                required
                type="text"
                value={getInputValue(formDataLienToSocietyDetails.ProposedOfferLienToSocietyDetailsId, formDataLienToSocietyDetails.ResidentialAreaSqFt)}
                onChange={(e) => handleFieldChangeLienToSocietyDetails('ResidentialAreaSqFt', filterNumbersWithDecimal(e.target.value))}
                error={errorsLienToSocietyDetails.ResidentialAreaSqFt}
                placeholder="Enter Residential Area"
                rightIcon="SqFt"
                disabled={!isBuildingSelected || lienToSocietyPaymentStageList.some(x => x.Type?.toUpperCase() === "RESIDENTIAL")}
              />
            </div>
            <div>
              <Input
                label="Number of Residential Lien Units"
                type="text"
                value={formDataLienToSocietyDetails.NumberOfResidentialLienUnits || 0}
                onChange={(e) => handleFieldChangeLienToSocietyDetails('NumberOfResidentialLienUnits', filterNumbers(e.target.value))}
                error={errorsLienToSocietyDetails.NumberOfResidentialLienUnits}
                placeholder="Enter Number of Residential Lien Units"
                disabled={!isBuildingSelected}
                maxLength={5}
              />
            </div>
            <div>
              <MultiSelectPagination
                key={projectId}
                label="Residential Lien Units"
                title="Select Residential Lien Units"
                size="md"
                dataFetchCallBack={fetchResidentialFlats}
                selectedValues={ResidentialFlatDropDown.selectedValues}
                options={ResidentialFlatDropDown.initialOptions}
                onChange={(values) => {
                  const { idsString } = ResidentialFlatDropDown.handleChange(values);
                  setSelectResidentialFlatValues(idsString || null);
                  handleFieldChangeLienToSocietyDetails("ResidentialInventoryFlatId", idsString);
                  if (errorsLienToSocietyDetails.ResidentialInventoryFlatId) {
                    setErrorsLienToSocietyDetails((prev) => ({ ...prev, ResidentialInventoryFlatId: "" }));
                  }
                }}
                error={errorsLienToSocietyDetails.ResidentialInventoryFlatId}
                disabled={!isBuildingSelected}
              />


            </div>
            <div>
              <Input
                label="Commercial Area (SqFt)"
                required
                type="text"
                value={getInputValue(formDataLienToSocietyDetails.ProposedOfferLienToSocietyDetailsId, formDataLienToSocietyDetails.CommercialAreaSqFt)}
                onChange={(e) => handleFieldChangeLienToSocietyDetails('CommercialAreaSqFt', filterNumbersWithDecimal(e.target.value))}
                error={errorsLienToSocietyDetails.CommercialAreaSqFt}
                placeholder="Enter Commercial Area"
                rightIcon="SqFt"
                disabled={!isBuildingSelected || lienToSocietyPaymentStageList.some(x => x.Type?.toUpperCase() === "COMMERCIAL")}
              />
            </div>
            <div>
              <Input
                label="Number of Commercial Lien Units"
                type="text"
                value={formDataLienToSocietyDetails.NumberOfCommercialLienUnits || 0}
                onChange={(e) => handleFieldChangeLienToSocietyDetails('NumberOfCommercialLienUnits', filterNumbers(e.target.value))}
                error={errorsLienToSocietyDetails.NumberOfCommercialLienUnits}
                placeholder="Enter Number of Commercial Lien Units"
                disabled={!isBuildingSelected}
                maxLength={5}
              />
            </div>
            <div>
              <MultiSelectPagination
                key={projectId}
                label="Commercial Lien Units"
                title="Select Commercial Lien Units"
                size="md"
                dataFetchCallBack={fetchCommercialFlats}
                selectedValues={CommercialFlatDropDown.selectedValues}
                options={CommercialFlatDropDown.initialOptions}
                onChange={(values) => {
                  const { idsString } = CommercialFlatDropDown.handleChange(values);
                  setSelectCommercialFlatValues(idsString || null);
                  handleFieldChangeLienToSocietyDetails("CommercialInventoryFlatId", idsString);
                  if (errorsLienToSocietyDetails.CommercialInventoryFlatId) {
                    setErrorsLienToSocietyDetails((prev) => ({ ...prev, CommercialInventoryFlatId: "" }));
                  }
                }}
                error={errorsLienToSocietyDetails.CommercialInventoryFlatId}
                disabled={!isBuildingSelected}
              />
            </div>

          </div>
          <div>
            <TextArea
              label="Remark"
              className='thin-scroll'
              value={formDataLienToSocietyDetails.Remark ?? ""}
              placeholder="Enter Remark"
              onChange={(e) => handleFieldChangeLienToSocietyDetails("Remark", e.target.value)}
              disabled={!isBuildingSelected}
            />
          </div>
        </div>

        {/* Lien to Society List Section */}
        <div className="space-y-4 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex-1 border-b border-gray-300 pb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Lien to Society List
              </h3>
            </div>
            {canAction && buildingId > 0 && (Number(formDataLienToSocietyDetails.ResidentialAreaSqFt) > 0 || Number(formDataLienToSocietyDetails.CommercialAreaSqFt) > 0) && (
              <Button
                onClick={handleAddLienToSocietyPaymentStageModal}
                color="blue"
                variant="solid"
                colorMode="extraLight"
                style={{ width: '35px', height: '35px' }}
                centerIcon={<Plus className="h-4 w-4" />}>

              </Button>
            )}
          </div>

          <DataTable
            data={lienToSocietyPaymentStageList}
            columns={lienToSocietyPaymentStageColumns}
            emptyMessage="No Lien to Society Details Found"
            fixedHeight={false}
            recordsPerPage={20}
            className="min-w-full"
          />
          <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">
            <div className="bg-[#E1E2E4] px-3 py-2 border-b border-[#D0D7DE]">
              <h4 className="text-sm font-semibold text-[#333333]">
                Action Details
              </h4>
            </div>
            <div className="p-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 border-b border-[#135bec2e] pb-4">
                <FieldItem label="Created By" value={lienToSocietyDetailsData?.CreatedBy ?? '-'} />
                <FieldItem
                  label="Created Date"
                  value={formatDate_dd_MonthName_yy_hh_mm(lienToSocietyDetailsData?.CreatedDate ?? '-')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pt-4">
                <FieldItem label="Modified By" value={lienToSocietyDetailsData?.ModifiedBy ?? '-'} />
                <FieldItem
                  label="Modified Date"
                  value={formatDate_dd_MonthName_yy_hh_mm(lienToSocietyDetailsData?.ModifiedDate ?? '-')}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
      <BottomActionBar
        saveText={(formDataLienToSocietyDetails.ProposedOfferLienToSocietyDetailsId && formDataLienToSocietyDetails.ProposedOfferLienToSocietyDetailsId > 0) ? 'Update' : 'Add'}
        canAction={canAction && buildingId > 0}
        onSave={handleSaveLienToSocietyDetails}
        isLoading={isLoading}
      />

      {/* ADD UPDATE LIEN TO SOCIETY PAYMENT STAGE MODAL */}
      <Modal
        isOpen={isAddUpdateLienToSocietyPaymentStageModalOpen}
        onClose={() => {
          setIsAddUpdateLienToSocietyPaymentStageModalOpen(false);
          setEditingLienToSocietyPaymentStageData(null);
          setFormDataLienToSocietyPaymentStage(initialFormStateLienToSocietyPaymentStage());
          setErrorsLienToSocietyPaymentStage({});
        }}
        onCancel={() => {
          setIsAddUpdateLienToSocietyPaymentStageModalOpen(false);
          setEditingLienToSocietyPaymentStageData(null);
          setFormDataLienToSocietyPaymentStage(initialFormStateLienToSocietyPaymentStage());
          setErrorsLienToSocietyPaymentStage({});
        }}
        title={editingLienToSocietyPaymentStageData ? 'Update Lien to Society Payment Stage' : 'Add Lien to Society Payment Stage'}
        onSubmit={handleAddUpdateLienToSocietyPaymentStage}
        saveText={editingLienToSocietyPaymentStageData ? 'Update' : 'Add'}
        loading={isLoading}
        size='lg'
      >
        <div className="space-y-6 p-6 bg-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <SinglePageSelection
                label="Type"
                placeholder='Select Type'
                required
                value={formDataLienToSocietyPaymentStage.Type || ''}
                onChange={(e) => handleFieldChangeLienToSocietyPaymentStage('Type', String(e))}
                options={FLAT_UNIT_TYPE
                  .filter(opt => {
                    if (opt.id === "Residential" && Number(formDataLienToSocietyDetails.ResidentialAreaSqFt) > 0) {
                      return true;
                    }

                    if (opt.id === "Commercial" && Number(formDataLienToSocietyDetails.CommercialAreaSqFt) > 0) {
                      return true;
                    }

                    return false;
                  })
                  .map(opt => ({
                    label: opt.name,
                    value: opt.id
                  }))
                }
                error={errorsLienToSocietyPaymentStage.Type}
              />
            </div>
            <div>
              <Input
                label="Stage"
                required
                type="text"
                value={formDataLienToSocietyPaymentStage.Stage || ''}
                onChange={(e) => handleFieldChangeLienToSocietyPaymentStage('Stage', e.target.value)}
                error={errorsLienToSocietyPaymentStage.Stage}
                placeholder="Enter Stage"
                maxLength={100}
              />
            </div>
            <div>
              <Input
                label="Carpet Area (SqFt)"
                required
                type="text"
                value={formDataLienToSocietyPaymentStage.CarpetAreaSqFt || ''}
                onChange={(e) => {
                  const val = filterNumbersWithDecimal(e.target.value);
                  handleFieldChangeLienToSocietyPaymentStage('CarpetAreaSqFt', val);
                }}
                error={errorsLienToSocietyPaymentStage.CarpetAreaSqFt}
                placeholder="Enter Carpet Area"
                rightIcon="SqFt"
              />
            </div>
            <div className="flex items-center">
              <Checkbox
                label="Is Release"
                checked={formDataLienToSocietyPaymentStage.IsRelease ?? false}
                onChange={(e) => handleFieldChangeLienToSocietyPaymentStage('IsRelease', e.target.checked)}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION LIEN TO SOCIETY PAYMENT STAGE MODAL */}
      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenLienToSocietyPaymentStage}
        onClose={() => {
          setIsConfirmationDialogBoxOpenLienToSocietyPaymentStage(false);
          setDeleteLienToSocietyPaymentStageData(null);
        }}
        onConfirm={handleDeleteLienToSocietyPaymentStage}
        loading={isLoading}
        pageName='lien to society payment stage'
      />
    </>
  );
};

