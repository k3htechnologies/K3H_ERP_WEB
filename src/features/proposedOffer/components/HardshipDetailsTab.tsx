import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ProposedOfferHardshipDetailsData,
  FilterWithPaginationProposedOfferHardshipDetailsRequest,
  AddUpdateProposedOfferHardshipDetailsRequest,
  ProposedOfferHardshipDetailsWithPaymentStageData,
  AddUpdateGenerateProposedOfferRequest,
  DeleteProposedOfferHardshipDetailsRequest,
} from '@/features/proposedOffer/models/ProposedOfferModel';
import { proposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { filterNumbersWithDecimal, isValidPercentage, allowPercentage, calculatePercentageAmount } from '@/core/utils/fileValidation';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { Modal } from '@/ui/components/Modal/Modal';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { FLAT_UNIT_TYPE, UNIT_SQFT_LUMPSUM } from '@/core/constants';
import {
  initialFormStateHardshipDetails,
  initialFormStateHardshipPaymentStage,
} from '@/features/proposedOffer/utils/initialStates';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { TextArea } from '@/ui/components/forms/Textarea';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { getInputValue, isEmpty } from '@/core/utils/comman';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';

interface HardshipDetailsTabProps {
  projectId: number | null;
  buildingId: number;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

export const HardshipDetailsTab: React.FC<HardshipDetailsTabProps> = ({
  projectId,
  buildingId,
  isLoading,
  setIsLoading,
  setLoadingMessage,
}) => {
  const [hardshipDetailsData, setHardshipDetailsData] = useState<ProposedOfferHardshipDetailsData | null>(null);
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions();
  const [errorsHardshipDetails, setErrorsHardshipDetails] = useState<{ [k: string]: string }>({});
  const [errorsHardshipPaymentStage, setErrorsHardshipPaymentStage] = useState<{ [k: string]: string }>({});
  const [formDataHardshipDetails, setFormDataHardshipDetails] = useState<AddUpdateProposedOfferHardshipDetailsRequest>(() => initialFormStateHardshipDetails());
  const [corpusPaymentStageList, setHardshipPaymentStageList] = useState<ProposedOfferHardshipDetailsWithPaymentStageData[]>([]);
  const [editingHardshipPaymentStageData, setEditingHardshipPaymentStageData] = useState<{ row: ProposedOfferHardshipDetailsWithPaymentStageData; index: number } | null>(null);
  const [isAddUpdateHardshipPaymentStageModalOpen, setIsAddUpdateHardshipPaymentStageModalOpen] = useState(false);
  const [formDataHardshipPaymentStage, setFormDataHardshipPaymentStage] = useState<ProposedOfferHardshipDetailsWithPaymentStageData>(() => initialFormStateHardshipPaymentStage());
  const [isConfirmationDialogBoxOpenHardshipPaymentStage, setIsConfirmationDialogBoxOpenHardshipPaymentStage] = useState(false);
  const [deleteHardshipPaymentStageData, setDeleteHardshipPaymentStageData] = useState<{ row: ProposedOfferHardshipDetailsWithPaymentStageData; index: number } | null>(null);
  const [generateHardshipDetailsData, setGenerateHardshipDetailsData] = useState<ProposedOfferHardshipDetailsData | null>(null);
  const [isConfirmationDialogBoxOpenGenerateHardshipDetails, setIsConfirmationDialogBoxOpenGenerateHardshipDetails] = useState(false);
  const [isConfirmationDialogBoxOpenDeleteAllHardshipDetails, setIsConfirmationDialogBoxOpenDeleteAllHardshipDetails] = useState(false);

  useEffect(() => {
    if (!projectId || !buildingId) return;
    setErrorsHardshipDetails({});
    fetchHardshipDetailsData();
  }, [projectId, buildingId]);

  const handleFieldChangeHardshipDetails = (field: keyof AddUpdateProposedOfferHardshipDetailsRequest, value: any) => {
    setFormDataHardshipDetails((prev) => ({ ...prev, [field]: value }));
    if (errorsHardshipDetails[field]) {
      setErrorsHardshipDetails((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFieldChangeHardshipPaymentStage = (field: keyof ProposedOfferHardshipDetailsWithPaymentStageData, value: any) => {
    setFormDataHardshipPaymentStage((prev) => ({ ...prev, [field]: value }));
    if (errorsHardshipPaymentStage[field]) {
      setErrorsHardshipPaymentStage((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const fetchHardshipDetailsData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferHardshipDetailsRequest = {
          ProjectId: Number(projectId),
          BuildingId: buildingId
        };

        const response = await proposedOfferService.apiCallPullHardshipDetails(params);

        if (E.isRight(response)) {
          const data = response.right.Data?.[0] || null;
          setHardshipDetailsData(data);

          if (data) {
            setFormDataHardshipDetails({
              ProposedOfferHardshipDetailsId: data.ProposedOfferHardshipDetailsId || 0,
              Uniquekey: data.Uniquekey || initialFormStateHardshipDetails().Uniquekey,
              BuildingId: buildingId,
              ProjectId: Number(projectId),
              HardshipOfferedToResidentialAmount: data.HardshipOfferedToResidentialAmount ?? 0,
              HardshipOfferedToCommercialAmount: data.HardshipOfferedToCommercialAmount ?? 0,
              HardshipDetailsWithPaymentStageJSON: '',
              Remark: data.Remark ?? "",
            });

            if (data.ProposedOfferHardshipDetailsWithPaymentStageData && data.ProposedOfferHardshipDetailsWithPaymentStageData.length > 0) {
              setHardshipPaymentStageList(data.ProposedOfferHardshipDetailsWithPaymentStageData);
            } else {
              setHardshipPaymentStageList([]);
            }
          } else {
            setFormDataHardshipDetails({
              ...initialFormStateHardshipDetails()
            });
            setHardshipPaymentStageList([]);
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
      'Loading Hardship Details'
    );
  };

  const validateHardshipDetailsForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (isEmpty(formDataHardshipDetails.HardshipOfferedToResidentialAmount)) {
      newErrors.HardshipOfferedToResidentialAmount = 'Residential Hardship Offer Amount is required'
    }

    if (isEmpty(formDataHardshipDetails.HardshipOfferedToCommercialAmount)) {
      newErrors.HardshipOfferedToCommercialAmount = 'Commercial Hardship Offer Amount is required'
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const validateHardshipTotals = ({
    stages,
    residentialHardship,
    commercialHardship
  }: {
    stages: typeof corpusPaymentStageList;
    residentialHardship: number;
    commercialHardship: number;
  }) => {
    const residentialTotal = stages
      .filter(x => x.Type === "Residential")
      .reduce((sum, cur) => sum + (cur.Amount ?? 0), 0);

    const commercialTotal = stages
      .filter(x => x.Type === "Commercial")
      .reduce((sum, cur) => sum + (cur.Amount ?? 0), 0);

    return {
      residentialTotal,
      commercialTotal,
      residentialOk: residentialTotal <= (residentialHardship ?? 0),
      commercialOk: commercialTotal <= (commercialHardship ?? 0)
    };
  };

  const handleSaveHardshipDetails = async () => {
    const {
      residentialTotal,
      commercialTotal,
      residentialOk,
      commercialOk
    } = validateHardshipTotals({
      stages: corpusPaymentStageList,
      residentialHardship: formDataHardshipDetails.HardshipOfferedToResidentialAmount ?? 0,
      commercialHardship: formDataHardshipDetails.HardshipOfferedToCommercialAmount ?? 0
    });


    if (buildingId === 0) {
      addToast({ type: "error", title: "Please select proper building first" });
      return
    }

    setErrorsHardshipDetails({})

    const validation = validateHardshipDetailsForm()

    if (!validation.isValid) {
      setErrorsHardshipDetails(validation.errors)
      return
    }

    if (corpusPaymentStageList.length === 0) {
      addToast({ type: "error", title: "Please add atleast one Hardship Offer" });
      return
    }

    else if (!residentialOk) {
      addToast({
        type: "error",
        title: `Residential total (${residentialTotal}) cannot be greater than Hardship amount (${formDataHardshipDetails.HardshipOfferedToResidentialAmount}).`
      });
      return;
    }

    else if (!commercialOk) {
      addToast({
        type: "error",
        title: `Commercial total (${commercialTotal}) cannot be greater than Hardship amount (${formDataHardshipDetails.HardshipOfferedToCommercialAmount}).`
      });
      return;
    }


    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const paymentStageJSON = JSON.stringify(corpusPaymentStageList.map(item => ({
          ProposedOfferHardshipDetailsWithPaymentStageId: item.ProposedOfferHardshipDetailsWithPaymentStageId ?? 0,
          Type: item.Type || '',
          Stage: item.Stage || '',
          StagePercentage: item.StagePercentage ?? 0,
          Amount: item.Amount ?? 0,
          UnitSqFtLumsum: item.UnitSqFtLumsum || '',
          CarpetAreaSqFt: item.CarpetAreaSqFt ?? 0,
        })));

        const payload: AddUpdateProposedOfferHardshipDetailsRequest = {
          ProposedOfferHardshipDetailsId: formDataHardshipDetails.ProposedOfferHardshipDetailsId,
          Uniquekey: formDataHardshipDetails.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          HardshipOfferedToResidentialAmount: formDataHardshipDetails.HardshipOfferedToResidentialAmount,
          HardshipOfferedToCommercialAmount: formDataHardshipDetails.HardshipOfferedToCommercialAmount,
          HardshipDetailsWithPaymentStageJSON: paymentStageJSON,
          Remark: formDataHardshipDetails.Remark,
        };

        const response = await proposedOfferService.apiCallAddUpdateHardshipDetails(payload);

        if (E.isRight(response)) {
          const isAdd = formDataHardshipDetails.ProposedOfferHardshipDetailsId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProposedOfferHardshipDetailsData;
            setHardshipDetailsData(newRecord);
            setFormDataHardshipDetails({
              ...formDataHardshipDetails,
              ProposedOfferHardshipDetailsId: newRecord.ProposedOfferHardshipDetailsId || 0,
              Uniquekey: newRecord.Uniquekey || formDataHardshipDetails.Uniquekey
            });

            if (newRecord.ProposedOfferHardshipDetailsWithPaymentStageData) {
              setHardshipPaymentStageList(newRecord.ProposedOfferHardshipDetailsWithPaymentStageData);
            }

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as ProposedOfferHardshipDetailsData;
            setHardshipDetailsData(updatedRecord);

            if (updatedRecord.ProposedOfferHardshipDetailsWithPaymentStageData) {
              setHardshipPaymentStageList(updatedRecord.ProposedOfferHardshipDetailsWithPaymentStageData);
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
      Number(formDataHardshipDetails.ProposedOfferHardshipDetailsId) === 0 ? 'Add Hardship Details' : 'Update Hardship Details'
    )
  };

  const handleAddHardshipPaymentStageModal = () => {
    setEditingHardshipPaymentStageData(null);
    setFormDataHardshipPaymentStage({
      ...initialFormStateHardshipPaymentStage()
    });
    setErrorsHardshipPaymentStage({});
    setIsAddUpdateHardshipPaymentStageModalOpen(true);
  };

  const handleEditHardshipPaymentStage = useCallback((row: ProposedOfferHardshipDetailsWithPaymentStageData, index: number) => {
    setEditingHardshipPaymentStageData({ row, index });
    setFormDataHardshipPaymentStage({
      ...row,
      Type: row.Type || '',
      Stage: row.Stage || '',
      StagePercentage: row.StagePercentage || 0,
      StagePercentageText: String(row.StagePercentage) || '',
      Amount: row.Amount || 0,
      UnitSqFtLumsum: row.UnitSqFtLumsum || '',
      CarpetAreaSqFt: row.CarpetAreaSqFt ?? 0,
    });
    setErrorsHardshipPaymentStage({});
    setIsAddUpdateHardshipPaymentStageModalOpen(true);
  }, []);

  const validateHardshipPaymentStageForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataHardshipPaymentStage.Type?.trim()) {
      newErrors.Type = "Type is required"
    }

    if (!formDataHardshipPaymentStage.Stage?.trim()) {
      newErrors.Stage = "Stage is required"
    }

    if (!formDataHardshipPaymentStage.StagePercentage) {
      newErrors.StagePercentage = 'Stage Percentage is required'
    } else if (!isValidPercentage(String(formDataHardshipPaymentStage.StagePercentage))) {
      newErrors.StagePercentage = 'Enter a valid percentage'
    } else if (formDataHardshipPaymentStage.StagePercentage === undefined) {
      newErrors.StagePercentage = 'Enter a valid percentage'
    }

    if (!formDataHardshipPaymentStage.UnitSqFtLumsum?.trim()) {
      newErrors.UnitSqFtLumsum = "Unit / SqFt / Lumsum is required"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleAddUpdateHardshipPaymentStage = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorsHardshipPaymentStage({});

    const validation = validateHardshipPaymentStageForm();

    if (formDataHardshipPaymentStage.Type?.toUpperCase() === 'RESIDENTIAL' &&
      (
        formDataHardshipDetails.HardshipOfferedToResidentialAmount == null ||
        formDataHardshipDetails.HardshipOfferedToResidentialAmount <= 0
      )
    ) {
      addToast({
        type: 'error',
        title: 'Residential Hardship Amount is required'
      });
      return;
    }

    else if (formDataHardshipPaymentStage.Type?.toUpperCase() === 'COMMERCIAL' &&
      (
        formDataHardshipDetails.HardshipOfferedToCommercialAmount == null ||
        formDataHardshipDetails.HardshipOfferedToCommercialAmount <= 0
      )
    ) {
      addToast({
        type: 'error',
        title: 'Commercial Hardship Amount is required'
      });
      return;
    }

    if (!validation.isValid) {
      setErrorsHardshipPaymentStage(validation.errors);
      return;
    }

    const paymentStageToSave: ProposedOfferHardshipDetailsWithPaymentStageData = {
      ...formDataHardshipPaymentStage,
      ProposedOfferHardshipDetailsWithPaymentStageId: editingHardshipPaymentStageData?.row.ProposedOfferHardshipDetailsWithPaymentStageId ?? 0,
      ProjectId: Number(projectId),
      BuildingId: Number(buildingId)
    };

    setHardshipPaymentStageList(prev => {
      if (editingHardshipPaymentStageData) {
        const updated = [...prev];
        updated[editingHardshipPaymentStageData.index] = paymentStageToSave;
        return updated;
      }

      return [...prev, paymentStageToSave];
    });

    setIsAddUpdateHardshipPaymentStageModalOpen(false);
    setEditingHardshipPaymentStageData(null);
    setFormDataHardshipPaymentStage(initialFormStateHardshipPaymentStage());
    setErrorsHardshipPaymentStage({});
  };

  const handleConfirmationDialogBoxOpenHardshipPaymentStage = useCallback((row: ProposedOfferHardshipDetailsWithPaymentStageData, index: number) => {
    setDeleteHardshipPaymentStageData({ row, index });
    setIsConfirmationDialogBoxOpenHardshipPaymentStage(true);
  }, []);

  const handleDeleteHardshipPaymentStage = () => {
    if (!deleteHardshipPaymentStageData) return;

    const removeIndex = deleteHardshipPaymentStageData.index;

    if (removeIndex < 0) {

      setIsConfirmationDialogBoxOpenHardshipPaymentStage(false);

      setDeleteHardshipPaymentStageData(null);

      addToast({ type: 'error', title: 'Unable to find the selected record to delete' });

      return;

    }

    setHardshipPaymentStageList(prev => prev.filter((_, i) => i !== removeIndex));

    setIsConfirmationDialogBoxOpenHardshipPaymentStage(false);

    setDeleteHardshipPaymentStageData(null);

    addToast({ type: 'success', title: 'Hardship Payment Stage Removed' });

  };

  const handleConfirmationDialogBoxOpenGenerateHardshipDetails = useCallback((row: ProposedOfferHardshipDetailsData) => {
    setGenerateHardshipDetailsData(row);
    setIsConfirmationDialogBoxOpenGenerateHardshipDetails(true);
  }, []);

  const handleGenerateHardshipDetails = async () => {
    if (!generateHardshipDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const payload: AddUpdateGenerateProposedOfferRequest = {
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          ChargeType: 'Hardship'
        };

        const response = await proposedOfferService.apiCallAddUpdateGenerateProposedOffer(payload);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsConfirmationDialogBoxOpenGenerateHardshipDetails(false);

          fetchHardshipDetailsData();

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

      'Generate Hardship Details'
    )
  };

  const corpusPaymentStageColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'Type',
        label: 'Type',
        width: '20',
        sortable: false,
        align: 'left',
        fixed: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'Stage',
        label: 'Stage',
        width: '20',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || '-'}
            maxWidth="180px"
            tooltipThreshold={18}
          />
        )
      },
      {
        key: 'StagePercentage',
        label: 'Stage %',
        width: '20',
        sortable: false,
        align: 'right',
        render: (value) => value ? `${value} %` : 0
      },
      {
        key: 'Amount',
        label: 'Amount (₹)',
        width: '20',
        sortable: false,
        align: 'right',
        render: (value) => value ? `₹${value}` : 0
      },
      {
        key: 'UnitSqFtLumsum',
        label: 'Unit / SqFt / Lumpsum',
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
        key: 'Action',
        label: 'Action',
        width: '20',
        sortable: false,
        fixed: 'right',
        align: 'center',
        render: (_value, row, index) => (
          <div className="flex items-center justify-center gap-2">
            {canAction && (
              <>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditHardshipPaymentStage(row, index);
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
                    handleConfirmationDialogBoxOpenHardshipPaymentStage(row, index);
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
    [canAction, handleEditHardshipPaymentStage, handleConfirmationDialogBoxOpenHardshipPaymentStage]
  );

  const recalculateHardshipPaymentAmount = useCallback(
    (
      type: string | null | undefined,
      percentage: number | null | undefined
    ) => {
      if (!type || percentage == null) {
        handleFieldChangeHardshipPaymentStage('Amount', null);
        return;
      }

      const upperType = type.toUpperCase();

      const baseAmount =
        upperType === 'RESIDENTIAL'
          ? formDataHardshipDetails.HardshipOfferedToResidentialAmount
          : upperType === 'COMMERCIAL'
            ? formDataHardshipDetails.HardshipOfferedToCommercialAmount
            : null;

      if (!baseAmount || baseAmount <= 0) {
        handleFieldChangeHardshipPaymentStage('Amount', null);
        return;
      }

      const calculatedAmount = calculatePercentageAmount(
        baseAmount,
        percentage
      );

      handleFieldChangeHardshipPaymentStage('Amount', calculatedAmount);
    },
    [formDataHardshipDetails]
  );

  const handleConfirmationDialogBoxOpenHardshipDetails = useCallback(() => {
    setIsConfirmationDialogBoxOpenDeleteAllHardshipDetails(true);
  }, []);

  const handleDeleteAllHardshipDetails = async () => {

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const payload: DeleteProposedOfferHardshipDetailsRequest = {
          BuildingId: buildingId,
          ProjectId: Number(projectId)
        };

        const response = await proposedOfferService.apiCallDeleteHardshipDetails(payload);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsConfirmationDialogBoxOpenDeleteAllHardshipDetails(false);

          fetchHardshipDetailsData();

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

      'Delete All Hardship Details'
    )
  };

  const isBuildingSelected = buildingId > 0;

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-500 pb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Hardship Offer Amount Details
            </h3>

            {canAction && buildingId > 0 && formDataHardshipDetails.ProposedOfferHardshipDetailsId > 0 && (
              <Button
                onClick={handleConfirmationDialogBoxOpenHardshipDetails}
                color="red"
                variant="solid"
                colorMode="extraLight"
                style={{ width: '35px', height: '35px' }}
                centerIcon={<Trash2 className="h-4 w-4" />}
                title="Delete"
              >
              </Button>
            )}

          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="Residential Hardship Offer Amount (₹)"
                required
                type="text"
                rightIcon="₹"
                value={getInputValue(formDataHardshipDetails.ProposedOfferHardshipDetailsId, formDataHardshipDetails.HardshipOfferedToResidentialAmount)}
                onChange={(e) => handleFieldChangeHardshipDetails('HardshipOfferedToResidentialAmount', filterNumbersWithDecimal(e.target.value))}
                
                error={errorsHardshipDetails.HardshipOfferedToResidentialAmount}
                placeholder="Enter Residential Hardship Amount"
                disabled={!isBuildingSelected || corpusPaymentStageList.some(x => x.Type?.toUpperCase() === "RESIDENTIAL")}
              />
            </div>

            <div>
              <Input
                label="Commercial Hardship Offer Amount (₹)"
                required
                type="text"
                rightIcon="₹"
                value={getInputValue(formDataHardshipDetails.ProposedOfferHardshipDetailsId, formDataHardshipDetails.HardshipOfferedToCommercialAmount)}
                onChange={(e) => handleFieldChangeHardshipDetails('HardshipOfferedToCommercialAmount', filterNumbersWithDecimal(e.target.value))}
                
                error={errorsHardshipDetails.HardshipOfferedToCommercialAmount}
                placeholder="Enter Commercial Hardship Amount"
                disabled={!isBuildingSelected || corpusPaymentStageList.some(x => x.Type?.toUpperCase() === "COMMERCIAL")}
              />
            </div>
          </div>
          <div>
            <TextArea
              label="Remarks"
              className='thin-scroll'
              value={formDataHardshipDetails.Remark ?? ""}
              placeholder="Enter Remarks"
              onChange={(e) => handleFieldChangeHardshipDetails("Remark", e.target.value)}
              disabled={!isBuildingSelected}
            />
          </div>
        </div>

        <div className="space-y-4 pb-5">
          <div className="flex items-center justify-between border-b border-gray-300 pb-2">

            <h3 className="text-lg font-semibold text-gray-900">
              Hardship Offer List
            </h3>

            {canAction && buildingId > 0 && (Number(formDataHardshipDetails.HardshipOfferedToResidentialAmount) > 0 || Number(formDataHardshipDetails.HardshipOfferedToCommercialAmount) > 0) && (
              <Button
                onClick={handleAddHardshipPaymentStageModal}
                color="blue"
                variant="solid"
                colorMode="extraLight"
                style={{ width: '35px', height: '35px' }}
                centerIcon={<Plus className="h-4 w-4" />}
              >
              </Button>
            )}

          </div>

          <DataTable
            data={corpusPaymentStageList}
            columns={corpusPaymentStageColumns}
            emptyMessage="No Hardship Details Found"
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
                <FieldItem label="Created By" value={hardshipDetailsData?.CreatedBy ?? '-'} />
                <FieldItem
                  label="Created Date"
                  value={formatDate_dd_MonthName_yy_hh_mm(hardshipDetailsData?.CreatedDate ?? '-')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pt-4">
                <FieldItem label="Modified By" value={hardshipDetailsData?.ModifiedBy ?? '-'} />
                <FieldItem
                  label="Modified Date"
                  value={formatDate_dd_MonthName_yy_hh_mm(hardshipDetailsData?.ModifiedDate ?? '-')}
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      <BottomActionBar
        saveText={(formDataHardshipDetails.ProposedOfferHardshipDetailsId && formDataHardshipDetails.ProposedOfferHardshipDetailsId > 0) ? 'Update' : 'Add'}
        canAction={buildingId > 0 && canAction}
        onSave={handleSaveHardshipDetails}
        leftActionText={buildingId > 0 && canAction && formDataHardshipDetails.ProposedOfferHardshipDetailsId > 0 ? "Generate" : ""}
        onLeftAction={() =>
          handleConfirmationDialogBoxOpenGenerateHardshipDetails(formDataHardshipDetails as ProposedOfferHardshipDetailsData)
        }
        isLoading={isLoading}
      />

      {/* ADD UPDATE CORPUS PAYMENT STAGE MODAL */}
      <Modal
        isOpen={isAddUpdateHardshipPaymentStageModalOpen}
        onClose={() => {
          setIsAddUpdateHardshipPaymentStageModalOpen(false);
          setEditingHardshipPaymentStageData(null);
          setFormDataHardshipPaymentStage(initialFormStateHardshipPaymentStage());
          setErrorsHardshipPaymentStage({});
        }}
        onCancel={() => {
          setIsAddUpdateHardshipPaymentStageModalOpen(false);
          setEditingHardshipPaymentStageData(null);
          setFormDataHardshipPaymentStage(initialFormStateHardshipPaymentStage());
          setErrorsHardshipPaymentStage({});
        }}
        title={editingHardshipPaymentStageData ? 'Update Hardship Payment Stage' : 'Add Hardship Payment Stage'}
        onSubmit={handleAddUpdateHardshipPaymentStage}
        saveText={editingHardshipPaymentStageData ? 'Update' : 'Add'}
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
                value={formDataHardshipPaymentStage.Type || ''}
                onChange={(e) => {
                  const rawType = String(e);
                  handleFieldChangeHardshipPaymentStage('Type', rawType);
                  recalculateHardshipPaymentAmount(
                    rawType,
                    formDataHardshipPaymentStage.StagePercentage
                  );
                }}
                options={FLAT_UNIT_TYPE
                  .filter(opt => {
                    if (opt.id === "Residential" && Number(formDataHardshipDetails.HardshipOfferedToResidentialAmount) > 0) {
                      return true;
                    }

                    if (opt.id === "Commercial" && Number(formDataHardshipDetails.HardshipOfferedToCommercialAmount) > 0) {
                      return true;
                    }

                    return false;
                  })
                  .map(opt => ({
                    label: opt.name,
                    value: opt.id
                  }))
                }
                error={errorsHardshipPaymentStage.Type}
              />
            </div>

            <div>
              <Input
                label="Stage"
                required
                type="text"
                value={formDataHardshipPaymentStage.Stage || ''}
                onChange={(e) => handleFieldChangeHardshipPaymentStage('Stage', e.target.value)}
                error={errorsHardshipPaymentStage.Stage}
                placeholder="Enter Stage"
                maxLength={100}
              />
            </div>

            <div>
              <Input
                label="Stage Percentage (%)"
                required
                type="text"
                rightIcon="%"
                value={
                  formDataHardshipPaymentStage.StagePercentageText ??
                  formDataHardshipPaymentStage.StagePercentage
                }
                onChange={(e) => {
                  const raw = filterNumbersWithDecimal(e.target.value);
                  const safeValue = allowPercentage(raw);
                  if (safeValue === null) return;

                  handleFieldChangeHardshipPaymentStage('StagePercentageText', raw);

                  if (raw === '') {
                    handleFieldChangeHardshipPaymentStage('StagePercentage', null);
                    handleFieldChangeHardshipPaymentStage('Amount', null);
                    return;
                  }

                  const percent = Number(raw);
                  handleFieldChangeHardshipPaymentStage('StagePercentage', percent);

                  recalculateHardshipPaymentAmount(
                    formDataHardshipPaymentStage.Type,
                    percent
                  );
                }}
                error={errorsHardshipPaymentStage.StagePercentage}
                placeholder="Enter Stage Percentage"
              />
            </div>
            <div>
              <Input
                label="Amount (₹)"
                required
                type="text"
                rightIcon="₹"
                disabled
                value={formDataHardshipPaymentStage.Amount || ''}
                error={errorsHardshipPaymentStage.Amount}
                placeholder="Calculated Amount"
                onChange={(e) => handleFieldChangeHardshipPaymentStage('Amount', e.target.value)}
              />
            </div>
            <div>
              <SinglePageSelection
                label="Unit / SqFt / Lumpsum"
                placeholder='Select Unit / SqFt / Lumpsum'
                required
                value={formDataHardshipPaymentStage.UnitSqFtLumsum || ''}
                onChange={(e) => handleFieldChangeHardshipPaymentStage('UnitSqFtLumsum', String(e))}
                options={UNIT_SQFT_LUMPSUM.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errorsHardshipPaymentStage.UnitSqFtLumsum}
              />
            </div>

            <div>
              <Input
                label="Carpet Area (SqFt)"
                type="text"
                value={formDataHardshipPaymentStage.CarpetAreaSqFt || ''}
                onChange={(e) => {
                  const val = filterNumbersWithDecimal(e.target.value);
                  handleFieldChangeHardshipPaymentStage('CarpetAreaSqFt', val);
                }}
                error={errorsHardshipPaymentStage.CarpetAreaSqFt}
                rightIcon="SqFt"
                placeholder="Enter Carpet Area"
              />
            </div>

          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION CORPUS PAYMENT STAGE MODAL */}
      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenHardshipPaymentStage}
        onClose={() => {
          setIsConfirmationDialogBoxOpenHardshipPaymentStage(false);
          setDeleteHardshipPaymentStageData(null);
        }}
        onConfirm={handleDeleteHardshipPaymentStage}
        loading={isLoading}
        pageName='corpus payment stage'
      />

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenGenerateHardshipDetails}
        onClose={() => {
          setIsConfirmationDialogBoxOpenGenerateHardshipDetails(false);
          setGenerateHardshipDetailsData(null);
        }}
        onConfirm={handleGenerateHardshipDetails}
        loading={isLoading}
        pageName='rent'
        title='Are sure you want generate hardship?'
        message="Once the hardship is generated, it cannot be deleted"
        confirmText='Generate'
        variant='generate'
      />

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenDeleteAllHardshipDetails}
        onClose={() => { setIsConfirmationDialogBoxOpenDeleteAllHardshipDetails(false); }}
        onConfirm={handleDeleteAllHardshipDetails}
        loading={isLoading}
        pageName='hardship'
        title='Are sure you want delete hardship amount?'
        confirmText='Delete All'
      />

    </>
  );
};

