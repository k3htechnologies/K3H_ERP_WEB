import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ProposedOfferShiftingDetailsData,
  FilterWithPaginationProposedOfferShiftingDetailsRequest,
  AddUpdateProposedOfferShiftingDetailsRequest,
  ProposedOfferShiftingDetailsWithPaymentStageData,
  AddUpdateGenerateProposedOfferRequest,
  DeleteProposedOfferShiftingDetailsRequest,
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
import { FLAT_UNIT_TYPE } from '@/core/constants';
import {
  initialFormStateShiftingDetails,
  initialFormStateShiftingPaymentStage,
} from '../utils/initialStates';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { TextArea } from '@/ui/components/forms/Textarea';
import { isEmpty } from '@/core/utils/comman';

interface ShiftingDetailsTabProps {
  projectId: number | null;
  buildingId: number;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

export const ShiftingDetailsTab: React.FC<ShiftingDetailsTabProps> = ({
  projectId,
  buildingId,
  isLoading,
  setIsLoading,
  setLoadingMessage,
}) => {
  const [, setShiftingDetailsData] = useState<ProposedOfferShiftingDetailsData | null>(null);
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions();
  const [errorsShiftingDetails, setErrorsShiftingDetails] = useState<{ [k: string]: string }>({});
  const [errorsShiftingPaymentStage, setErrorsShiftingPaymentStage] = useState<{ [k: string]: string }>({});
  const [formDataShiftingDetails, setFormDataShiftingDetails] = useState<AddUpdateProposedOfferShiftingDetailsRequest>(() => initialFormStateShiftingDetails());
  const [shiftingPaymentStageList, setShiftingPaymentStageList] = useState<ProposedOfferShiftingDetailsWithPaymentStageData[]>([]);
  const [editingShiftingPaymentStageData, setEditingShiftingPaymentStageData] = useState<{ row: ProposedOfferShiftingDetailsWithPaymentStageData; index: number } | null>(null);
  const [isAddUpdateShiftingPaymentStageModalOpen, setIsAddUpdateShiftingPaymentStageModalOpen] = useState(false);
  const [formDataShiftingPaymentStage, setFormDataShiftingPaymentStage] = useState<ProposedOfferShiftingDetailsWithPaymentStageData>(() => initialFormStateShiftingPaymentStage());
  const [isConfirmationDialogBoxOpenShiftingPaymentStage, setIsConfirmationDialogBoxOpenShiftingPaymentStage] = useState(false);
  const [deleteShiftingPaymentStageData, setDeleteShiftingPaymentStageData] = useState<{ row: ProposedOfferShiftingDetailsWithPaymentStageData; index: number } | null>(null);
  const [generateShiftingDetailsData, setGenerateShiftingDetailsData] = useState<ProposedOfferShiftingDetailsData | null>(null);
  const [isConfirmationDialogBoxOpenGenerateShiftingDetails, setIsConfirmationDialogBoxOpenGenerateShiftingDetails] = useState(false);
  const [isConfirmationDialogBoxOpenDeleteAllShiftingDetails, setIsConfirmationDialogBoxOpenDeleteAllShiftingDetails] = useState(false);
  useEffect(() => {
    if (!projectId || !buildingId) return;
    setErrorsShiftingDetails({});
    setErrorsShiftingPaymentStage({});
    fetchShiftingDetailsData();
  }, [projectId, buildingId]);

  const handleFieldChangeShiftingDetails = (field: keyof AddUpdateProposedOfferShiftingDetailsRequest, value: any) => {
    setFormDataShiftingDetails((prev) => ({ ...prev, [field]: value }));
    if (errorsShiftingDetails[field]) {
      setErrorsShiftingDetails((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFieldChangeShiftingPaymentStage = (field: keyof ProposedOfferShiftingDetailsWithPaymentStageData, value: any) => {
    setFormDataShiftingPaymentStage((prev) => ({ ...prev, [field]: value }));
    if (errorsShiftingPaymentStage[field]) {
      setErrorsShiftingPaymentStage((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const fetchShiftingDetailsData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferShiftingDetailsRequest = {
          ProjectId: projectId ?? undefined,
          BuildingId: buildingId
        };

        const response = await proposedOfferService.apiCallPullShiftingDetails(params);

        if (E.isRight(response)) {
          const data = response.right.Data?.[0] || null;
          setShiftingDetailsData(data);

          if (data) {
            setFormDataShiftingDetails({
              ProposedOfferShiftingDetailsId: data.ProposedOfferShiftingDetailsId || 0,
              Uniquekey: data.Uniquekey || initialFormStateShiftingDetails().Uniquekey,
              BuildingId: buildingId,
              ProjectId: Number(projectId),
              ShiftingOfferedToResidentialAmount: data.ShiftingOfferedToResidentialAmount ?? 0,
              ShiftingOfferedToCommercialAmount: data.ShiftingOfferedToCommercialAmount ?? 0,
              Remark: data.Remark ?? "",
              ShiftingDetailsWithPaymentStageJSON: ''
            });

            if (data.ProposedOfferShiftingDetailsWithPaymentStageData && data.ProposedOfferShiftingDetailsWithPaymentStageData.length > 0) {
              setShiftingPaymentStageList(data.ProposedOfferShiftingDetailsWithPaymentStageData);
            } else {
              setShiftingPaymentStageList([]);
            }
          } else {
            setFormDataShiftingDetails({
              ...initialFormStateShiftingDetails(),
              ProjectId: Number(projectId)
            });
            setShiftingPaymentStageList([]);
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
      'Loading Shifting Details'
    );
  };

  const validateShiftingDetailsForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (isEmpty(formDataShiftingDetails.ShiftingOfferedToResidentialAmount)) {
      newErrors.ShiftingOfferedToResidentialAmount = "Residential Shifting Amount is required "
    }

    if (isEmpty(formDataShiftingDetails.ShiftingOfferedToCommercialAmount)) {
      newErrors.ShiftingOfferedToCommercialAmount = "Commercial Shifting Amount is required"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const validateShiftingDetailsTotals = ({
    stages,
    residentialShiftingAmount,
    commercialShiftingAmount
  }: {
    stages: typeof shiftingPaymentStageList;
    residentialShiftingAmount: number;
    commercialShiftingAmount: number;
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
      residentialOk: residentialTotal <= (residentialShiftingAmount ?? 0),
      commercialOk: commercialTotal <= (commercialShiftingAmount ?? 0)
    };
  };

  const handleSaveShiftingDetails = async () => {
    const {
      residentialTotal,
      commercialTotal,
      residentialOk,
      commercialOk
    } = validateShiftingDetailsTotals({
      stages: shiftingPaymentStageList,
      residentialShiftingAmount: formDataShiftingDetails.ShiftingOfferedToResidentialAmount ?? 0,
      commercialShiftingAmount: formDataShiftingDetails.ShiftingOfferedToCommercialAmount ?? 0
    });

    if (buildingId === 0) {
      addToast({ type: "error", title: "Please select proper building first" });
      return
    }

    setErrorsShiftingDetails({})

    const validation = validateShiftingDetailsForm()

    if (!validation.isValid) {
      setErrorsShiftingDetails(validation.errors)
      return
    }

    if (shiftingPaymentStageList.length === 0) {
      addToast({ type: "error", title: "Please add atleast one Shifting details" });
      return
    }

    if (!residentialOk) {
      addToast({
        type: "error",
        title: `Residential total (${residentialTotal}) cannot be greater than Residential shifting amount (${formDataShiftingDetails.ShiftingOfferedToResidentialAmount}).`
      });
      return;
    }

    if (!commercialOk) {
      addToast({
        type: "error",
        title: `Commercial total (${commercialTotal}) cannot be greater than Commercial shifting amount (${formDataShiftingDetails.ShiftingOfferedToCommercialAmount}).`
      });
      return;
    }



    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const paymentStageJSON = JSON.stringify(shiftingPaymentStageList.map(item => ({
          ProposedOfferShiftingDetailsWithPaymentStageId: item.ProposedOfferShiftingDetailsWithPaymentStageId ?? 0,
          Type: item.Type || '',
          Stage: item.Stage || '',
          StagePercentage: item.StagePercentage ?? 0,
          Amount: item.Amount ?? 0
        })));

        const payload: AddUpdateProposedOfferShiftingDetailsRequest = {
          ProposedOfferShiftingDetailsId: formDataShiftingDetails.ProposedOfferShiftingDetailsId,
          Uniquekey: formDataShiftingDetails.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          ShiftingOfferedToResidentialAmount: formDataShiftingDetails.ShiftingOfferedToResidentialAmount,
          ShiftingOfferedToCommercialAmount: formDataShiftingDetails.ShiftingOfferedToCommercialAmount,
          Remark: formDataShiftingDetails.Remark,
          ShiftingDetailsWithPaymentStageJSON: paymentStageJSON
        };

        const response = await proposedOfferService.apiCallAddUpdateShiftingDetails(payload);

        if (E.isRight(response)) {
          const isAdd = formDataShiftingDetails.ProposedOfferShiftingDetailsId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProposedOfferShiftingDetailsData;
            setShiftingDetailsData(newRecord);
            setFormDataShiftingDetails({
              ...formDataShiftingDetails,
              ProposedOfferShiftingDetailsId: newRecord.ProposedOfferShiftingDetailsId || 0,
              Uniquekey: newRecord.Uniquekey || formDataShiftingDetails.Uniquekey
            });

            if (newRecord.ProposedOfferShiftingDetailsWithPaymentStageData) {
              setShiftingPaymentStageList(newRecord.ProposedOfferShiftingDetailsWithPaymentStageData);
            }

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as ProposedOfferShiftingDetailsData;
            setShiftingDetailsData(updatedRecord);

            if (updatedRecord.ProposedOfferShiftingDetailsWithPaymentStageData) {
              setShiftingPaymentStageList(updatedRecord.ProposedOfferShiftingDetailsWithPaymentStageData);
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
      Number(formDataShiftingDetails.ProposedOfferShiftingDetailsId) === 0 ? 'Add Shifting Details' : 'Update Shifting Details'
    )
  };

  const validateShiftingPaymentStageForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataShiftingPaymentStage.Type?.trim()) {
      newErrors.Type = "Type is required"
    }

    if (!formDataShiftingPaymentStage.Stage?.trim()) {
      newErrors.Stage = "Stage is required"
    }

    if (!formDataShiftingPaymentStage.StagePercentage) {
      newErrors.StagePercentage = 'Stage Percentage is required'
    } else if (!isValidPercentage(String(formDataShiftingPaymentStage.StagePercentage))) {
      newErrors.StagePercentage = 'Enter a valid percentage'
    } else if (formDataShiftingPaymentStage.StagePercentage === undefined) {
      newErrors.StagePercentage = 'Enter a valid percentage'
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleAddShiftingPaymentStageModal = () => {
    setEditingShiftingPaymentStageData(null);
    setFormDataShiftingPaymentStage({
      ...initialFormStateShiftingPaymentStage(),
      ProjectId: Number(projectId),
      BuildingId: formDataShiftingDetails.BuildingId || 0
    });
    setErrorsShiftingPaymentStage({});
    setIsAddUpdateShiftingPaymentStageModalOpen(true);
  };

  const handleEditShiftingPaymentStage = useCallback((row: ProposedOfferShiftingDetailsWithPaymentStageData, index: number) => {
    setEditingShiftingPaymentStageData({ row, index });
    setFormDataShiftingPaymentStage({
      ...row,
      Type: row.Type || '',
      Stage: row.Stage || '',
      StagePercentage: row.StagePercentage || 0,
      StagePercentageText: String(row.StagePercentage) || '',
      Amount: row.Amount || 0
    });
    setErrorsShiftingPaymentStage({});
    setIsAddUpdateShiftingPaymentStageModalOpen(true);
  }, []);

  const handleAddUpdateShiftingPaymentStage = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorsShiftingPaymentStage({});

    if (formDataShiftingPaymentStage.Type?.toUpperCase() === 'RESIDENTIAL' &&
      (
        formDataShiftingDetails.ShiftingOfferedToResidentialAmount == null ||
        formDataShiftingDetails.ShiftingOfferedToResidentialAmount <= 0
      )
    ) {
      addToast({
        type: 'error',
        title: 'Residential Shifting Amount is required'
      });
      return;
    }

    else if (formDataShiftingPaymentStage.Type?.toUpperCase() === 'COMMERCIAL' &&
      (
        formDataShiftingDetails.ShiftingOfferedToCommercialAmount == null ||
        formDataShiftingDetails.ShiftingOfferedToCommercialAmount <= 0
      )
    ) {
      addToast({
        type: 'error',
        title: 'Commercial Shifting Amount is required'
      });
      return;
    }

    const validation = validateShiftingPaymentStageForm();

    if (!validation.isValid) {
      setErrorsShiftingPaymentStage(validation.errors);
      return;
    }

    const paymentStageToSave: ProposedOfferShiftingDetailsWithPaymentStageData = {
      ...formDataShiftingPaymentStage,
      ProposedOfferShiftingDetailsWithPaymentStageId: editingShiftingPaymentStageData?.row.ProposedOfferShiftingDetailsWithPaymentStageId ?? 0,
      ProjectId: Number(projectId),
      BuildingId: Number(buildingId)
    };

    setShiftingPaymentStageList(prevList => {
      if (editingShiftingPaymentStageData) {
        const updated = [...prevList];
        updated[editingShiftingPaymentStageData.index] = paymentStageToSave;
        return updated;
      }

      return [...prevList, paymentStageToSave];
    });

    setIsAddUpdateShiftingPaymentStageModalOpen(false);
    setEditingShiftingPaymentStageData(null);
    setFormDataShiftingPaymentStage(initialFormStateShiftingPaymentStage());
    setErrorsShiftingPaymentStage({});
  };

  const handleConfirmationDialogBoxOpenShiftingPaymentStage = useCallback((row: ProposedOfferShiftingDetailsWithPaymentStageData, index: number) => {
    setDeleteShiftingPaymentStageData({ row, index });
    setIsConfirmationDialogBoxOpenShiftingPaymentStage(true);
  }, []);

  const handleDeleteShiftingPaymentStage = () => {
    if (!deleteShiftingPaymentStageData) return;

    const removeIndex = deleteShiftingPaymentStageData.index;

    if (removeIndex < 0) {
      setIsConfirmationDialogBoxOpenShiftingPaymentStage(false);
      setDeleteShiftingPaymentStageData(null);
      addToast({ type: 'error', title: 'Unable to find the selected record to delete' });
      return;
    }

    setShiftingPaymentStageList(prev => prev.filter((_, i) => i !== removeIndex));

    setIsConfirmationDialogBoxOpenShiftingPaymentStage(false);
    setDeleteShiftingPaymentStageData(null);
    addToast({ type: 'success', title: 'Shifting Payment Stage Removed' });
  };

  const handleConfirmationDialogBoxOpenGenerateShiftingDetails = useCallback((row: ProposedOfferShiftingDetailsData) => {
    setGenerateShiftingDetailsData(row);
    setIsConfirmationDialogBoxOpenGenerateShiftingDetails(true);
  }, []);

  const handleGenerateShiftingDetails = async () => {
    if (!generateShiftingDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const payload: AddUpdateGenerateProposedOfferRequest = {
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          ChargeType: 'Shifting'
        };

        const response = await proposedOfferService.apiCallAddUpdateGenerateProposedOffer(payload);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsConfirmationDialogBoxOpenGenerateShiftingDetails(false);

          fetchShiftingDetailsData();

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

      'Generate Shifting Details'
    )
  };

  const shiftingPaymentStageColumns = useMemo<TableColumn[]>(
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
        key: 'StagePercentage',
        label: 'Stage %',
        width: '20',
        sortable: false,
        align: 'right',
        render: (value) => value ? `${value}%` : '-'
      },
      {
        key: 'Amount',
        label: 'Amount (₹)',
        width: '20',
        sortable: false,
        align: 'right',
        render: (value) => value ? `₹${value}` : '-'
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
                    handleEditShiftingPaymentStage(row, index);
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
                    handleConfirmationDialogBoxOpenShiftingPaymentStage(row, index);
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
            )
            }
          </div >
        )
      }
    ],
    [canAction, handleEditShiftingPaymentStage, handleConfirmationDialogBoxOpenShiftingPaymentStage]
  );

  const recalculateShiftingPaymentAmount = useCallback(
    (
      type: string | null | undefined,
      percentage: number | null | undefined
    ) => {
      if (!type || percentage == null) {
        handleFieldChangeShiftingPaymentStage('Amount', null);
        return;
      }

      const upperType = type.toUpperCase();

      const baseAmount =
        upperType === 'RESIDENTIAL'
          ? formDataShiftingDetails.ShiftingOfferedToResidentialAmount
          : upperType === 'COMMERCIAL'
            ? formDataShiftingDetails.ShiftingOfferedToCommercialAmount
            : null;

      if (!baseAmount || baseAmount <= 0) {
        handleFieldChangeShiftingPaymentStage('Amount', null);
        return;
      }

      const calculatedAmount = calculatePercentageAmount(
        baseAmount,
        percentage
      );

      handleFieldChangeShiftingPaymentStage('Amount', calculatedAmount);
    },
    [formDataShiftingDetails]
  );


  const handleConfirmationDialogBoxOpenShiftingDetails = useCallback(() => {
    setIsConfirmationDialogBoxOpenDeleteAllShiftingDetails(true);
  }, []);

  const handleDeleteAllShiftingDetails = async () => {

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const payload: DeleteProposedOfferShiftingDetailsRequest = {
          BuildingId: buildingId,
          ProjectId: Number(projectId)
        };

        const response = await proposedOfferService.apiCallDeleteShiftingDetails(payload);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsConfirmationDialogBoxOpenDeleteAllShiftingDetails(false);

          fetchShiftingDetailsData();

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

      'Delete All Shifting Details'
    )
  };

  const isBuildingSelected = buildingId > 0;

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">

          <div className="flex items-center justify-between border-b border-gray-500 pb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Shifting Amount Details
            </h3>

            {canAction && buildingId > 0 && formDataShiftingDetails.ProposedOfferShiftingDetailsId > 0 && (
              <Button
                onClick={handleConfirmationDialogBoxOpenShiftingDetails}
                color="red"
                variant="solid"
                colorMode="extraLight"
                style={{ width: '35px', height: '35px' }}
                centerIcon={<Trash2 className="h-4 w-4" />}
              >
              </Button>
            )}

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="Residential Shifting Amount (₹)"
                required
                type="text"
                rightIcon="₹"
                value={formDataShiftingDetails.ShiftingOfferedToResidentialAmount || 0}
                onChange={(e) => handleFieldChangeShiftingDetails('ShiftingOfferedToResidentialAmount', filterNumbersWithDecimal(e.target.value))}
                error={errorsShiftingDetails.ShiftingOfferedToResidentialAmount}
                placeholder="Enter Residential Shifting Amount"
                disabled={!isBuildingSelected || shiftingPaymentStageList.some(x => x.Type?.toUpperCase() === "RESIDENTIAL")}
              />
            </div>
            <div>
              <Input
                label="Commercial Shifting Amount (₹)"
                required
                type="text"
                rightIcon="₹"
                value={formDataShiftingDetails.ShiftingOfferedToCommercialAmount || 0}
                onChange={(e) => handleFieldChangeShiftingDetails('ShiftingOfferedToCommercialAmount', filterNumbersWithDecimal(e.target.value))}
                error={errorsShiftingDetails.ShiftingOfferedToCommercialAmount}
                placeholder="Enter Commercial Shifting Amount"
                disabled={!isBuildingSelected || shiftingPaymentStageList.some(x => x.Type?.toUpperCase() === "COMMERCIAL")}
              />
            </div>
          </div>
          <div>
            <div>
              <TextArea
                label="Remarks"
                className='thin-scroll'
                value={formDataShiftingDetails.Remark ?? ""}
                placeholder="Enter Remarks"
                onChange={(e) => handleFieldChangeShiftingDetails("Remark", e.target.value)}
                disabled={!isBuildingSelected}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pb-5">
          <div className="flex items-center justify-between border-b border-gray-300 pb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Shifting List
            </h3>
            {canAction && buildingId > 0 && (Number(formDataShiftingDetails.ShiftingOfferedToResidentialAmount) > 0 || Number(formDataShiftingDetails.ShiftingOfferedToCommercialAmount) > 0) && (
              <Button
                onClick={handleAddShiftingPaymentStageModal}
                color="blue"
                variant="solid"
                colorMode="extraLight"
                style={{ width: '35px', height: '35px' }}
                centerIcon={<Plus className="h-4 w-4" />}>
                title="Delete"
              </Button>
            )}
          </div>
          <DataTable
            data={shiftingPaymentStageList}
            columns={shiftingPaymentStageColumns}
            emptyMessage="No Shifting Details Found"
            fixedHeight={false}
            recordsPerPage={20}
            className="min-w-full"
          />
        </div>
      </div>
      <BottomActionBar
        saveText={(formDataShiftingDetails.ProposedOfferShiftingDetailsId && formDataShiftingDetails.ProposedOfferShiftingDetailsId > 0) ? 'Update' : 'Add'}
        canAction={canAction && buildingId > 0}
        onSave={handleSaveShiftingDetails}
        leftActionText={buildingId > 0 && formDataShiftingDetails.ProposedOfferShiftingDetailsId > 0 ? "Generate" : ""}
        onLeftAction={() =>
          handleConfirmationDialogBoxOpenGenerateShiftingDetails(formDataShiftingDetails as ProposedOfferShiftingDetailsData)
        }
        isLoading={isLoading}
      />

      <Modal
        isOpen={isAddUpdateShiftingPaymentStageModalOpen}
        onClose={() => {
          setIsAddUpdateShiftingPaymentStageModalOpen(false);
          setEditingShiftingPaymentStageData(null);
          setFormDataShiftingPaymentStage(initialFormStateShiftingPaymentStage());
          setErrorsShiftingPaymentStage({});
        }}
        onCancel={() => {
          setIsAddUpdateShiftingPaymentStageModalOpen(false);
          setEditingShiftingPaymentStageData(null);
          setFormDataShiftingPaymentStage(initialFormStateShiftingPaymentStage());
          setErrorsShiftingPaymentStage({});
        }}
        title={editingShiftingPaymentStageData ? 'Update Shifting Payment Stage' : 'Add Shifting Payment Stage'}
        onSubmit={handleAddUpdateShiftingPaymentStage}
        saveText={editingShiftingPaymentStageData ? 'Update' : 'Add'}
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
                value={formDataShiftingPaymentStage.Type || ''}
                onChange={(e) => {
                  const rawType = String(e);
                  handleFieldChangeShiftingPaymentStage('Type', rawType);
                  recalculateShiftingPaymentAmount(rawType,formDataShiftingPaymentStage.StagePercentage);
                }}
                options={FLAT_UNIT_TYPE
                  .filter(opt => {
                    if (opt.id === "Residential" && Number(formDataShiftingDetails.ShiftingOfferedToResidentialAmount) > 0) {
                      return true;
                    }

                    if (opt.id === "Commercial" && Number(formDataShiftingDetails.ShiftingOfferedToCommercialAmount) > 0) {
                      return true;
                    }

                    return false;
                  })
                  .map(opt => ({
                    label: opt.name,
                    value: opt.id
                  }))
                }
                error={errorsShiftingPaymentStage.Type}
              />
            </div>
            <div>
              <Input
                label="Stage"
                required
                type="text"
                value={formDataShiftingPaymentStage.Stage || ''}
                onChange={(e) => handleFieldChangeShiftingPaymentStage('Stage', e.target.value)}
                error={errorsShiftingPaymentStage.Stage}
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
                value={formDataShiftingPaymentStage.StagePercentageText ?? formDataShiftingPaymentStage.StagePercentage}

                onChange={(e) => {

                  const raw = filterNumbersWithDecimal(e.target.value);
                  const safeValue = allowPercentage(raw);
                  if (safeValue === null) return;

                  handleFieldChangeShiftingPaymentStage('StagePercentageText', raw);

                  if (raw === '') {
                    handleFieldChangeShiftingPaymentStage('StagePercentage', null);
                    handleFieldChangeShiftingPaymentStage('Amount', null);
                    return;
                  }

                  const percent = Number(raw);
                  handleFieldChangeShiftingPaymentStage('StagePercentage', percent);

                  recalculateShiftingPaymentAmount(formDataShiftingPaymentStage.Type,percent);

                }}
                error={errorsShiftingPaymentStage.StagePercentage}
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
                value={formDataShiftingPaymentStage.Amount || ''}
                onChange={(e) => handleFieldChangeShiftingPaymentStage('Amount', e.target.value)}
                error={errorsShiftingDetails.Amount}
                placeholder="Calculated Amount"
              />
            </div>

          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION SHIFTING PAYMENT STAGE MODAL */}
      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenShiftingPaymentStage}
        onClose={() => {
          setIsConfirmationDialogBoxOpenShiftingPaymentStage(false);
          setDeleteShiftingPaymentStageData(null);
        }}
        onConfirm={handleDeleteShiftingPaymentStage}
        loading={isLoading}
        pageName='shifting payment stage'
      />

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenGenerateShiftingDetails}
        onClose={() => {
          setIsConfirmationDialogBoxOpenGenerateShiftingDetails(false);
          setGenerateShiftingDetailsData(null);
        }}
        onConfirm={handleGenerateShiftingDetails}
        loading={isLoading}
        pageName='rent'
        title='Are sure you want generate shifting?'
        message="Once the shifting is generated, it cannot be deleted"
        confirmText='Generate'
        variant='generate'
      />

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenDeleteAllShiftingDetails}
        onClose={() => { setIsConfirmationDialogBoxOpenDeleteAllShiftingDetails(false); }}
        onConfirm={handleDeleteAllShiftingDetails}
        loading={isLoading}
        pageName='shifting'
        title='Are sure you want delete Shifting Amount?'
        confirmText='Delete All'
      />

    </>
  );
};

