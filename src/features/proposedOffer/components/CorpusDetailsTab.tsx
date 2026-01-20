import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ProposedOfferCorpusDetailsData,
  FilterWithPaginationProposedOfferCorpusDetailsRequest,
  AddUpdateProposedOfferCorpusDetailsRequest,
  ProposedOfferCorpusDetailsWithPaymentStageData,
  AddUpdateGenerateProposedOfferRequest,
} from '@/features/proposedOffer/models/ProposedOfferModel';
import { proposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { filterNumbersWithDecimal, isValidPercentage, allowPercentage, calculatePercentageAmount } from '@/core/utils/fileValidation';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { Modal } from '@/ui/components/Modal/Modal';
import { Edit, Trash2 } from 'lucide-react';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { FLAT_UNIT_TYPE } from '@/core/constants';
import {
  initialFormStateCorpusDetails,
  initialFormStateCorpusPaymentStage,
} from '../utils/initialStates';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

interface CorpusDetailsTabProps {
  projectId: number | null;
  buildingId: number;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

export const CorpusDetailsTab: React.FC<CorpusDetailsTabProps> = ({
  projectId,
  buildingId,
  isLoading,
  setIsLoading,
  setLoadingMessage,
}) => {
  const [, setCorpusDetailsData] = useState<ProposedOfferCorpusDetailsData | null>(null);
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions();
  const [errorsCorpusDetails, setErrorsCorpusDetails] = useState<{ [k: string]: string }>({});
  const [errorsCorpusPaymentStage, setErrorsCorpusPaymentStage] = useState<{ [k: string]: string }>({});
  const [formDataCorpusDetails, setFormDataCorpusDetails] = useState<AddUpdateProposedOfferCorpusDetailsRequest>(() => initialFormStateCorpusDetails());
  const [corpusPaymentStageList, setCorpusPaymentStageList] = useState<ProposedOfferCorpusDetailsWithPaymentStageData[]>([]);
  const [editingCorpusPaymentStageData, setEditingCorpusPaymentStageData] = useState<{ row: ProposedOfferCorpusDetailsWithPaymentStageData; index: number } | null>(null);
  const [isAddUpdateCorpusPaymentStageModalOpen, setIsAddUpdateCorpusPaymentStageModalOpen] = useState(false);
  const [formDataCorpusPaymentStage, setFormDataCorpusPaymentStage] = useState<ProposedOfferCorpusDetailsWithPaymentStageData>(() => initialFormStateCorpusPaymentStage());
  const [isConfirmationDialogBoxOpenCorpusPaymentStage, setIsConfirmationDialogBoxOpenCorpusPaymentStage] = useState(false);
  const [deleteCorpusPaymentStageData, setDeleteCorpusPaymentStageData] = useState<{ row: ProposedOfferCorpusDetailsWithPaymentStageData; index: number } | null>(null);
  const [generateCorpusDetailsData, setGenerateCorpusDetailsData] = useState<ProposedOfferCorpusDetailsData | null>(null);
  const [isConfirmationDialogBoxOpenGenerateCorpusDetails, setIsConfirmationDialogBoxOpenGenerateCorpusDetails] = useState(false);

  useEffect(() => {
    if (!projectId || !buildingId) return;
    setErrorsCorpusDetails({});
    fetchCorpusDetailsData();
  }, [projectId, buildingId]);

  const handleFieldChangeCorpusDetails = (field: keyof AddUpdateProposedOfferCorpusDetailsRequest, value: any) => {
    setFormDataCorpusDetails((prev) => ({ ...prev, [field]: value }));
    if (errorsCorpusDetails[field]) {
      setErrorsCorpusDetails((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFieldChangeCorpusPaymentStage = (field: keyof ProposedOfferCorpusDetailsWithPaymentStageData, value: any) => {
    setFormDataCorpusPaymentStage((prev) => ({ ...prev, [field]: value }));
    if (errorsCorpusPaymentStage[field]) {
      setErrorsCorpusPaymentStage((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const fetchCorpusDetailsData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferCorpusDetailsRequest = {
          ProjectId: Number(projectId),
          BuildingId: buildingId
        };

        const response = await proposedOfferService.apiCallPullCorpusDetails(params);

        if (E.isRight(response)) {
          const data = response.right.Data?.[0] || null;
          setCorpusDetailsData(data);

          if (data) {
            setFormDataCorpusDetails({
              ProposedOfferCorpusDetailsId: data.ProposedOfferCorpusDetailsId || 0,
              Uniquekey: data.Uniquekey || initialFormStateCorpusDetails().Uniquekey,
              BuildingId: buildingId,
              ProjectId: Number(projectId),
              CorpusOfferedToResidentialAmount: data.CorpusOfferedToResidentialAmount ?? 0,
              CorpusOfferedToCommercialAmount: data.CorpusOfferedToCommercialAmount ?? 0,
              CorpusDetailsWithPaymentStageJSON: ''
            });

            if (data.ProposedOfferCorpusDetailsWithPaymentStageData && data.ProposedOfferCorpusDetailsWithPaymentStageData.length > 0) {
              setCorpusPaymentStageList(data.ProposedOfferCorpusDetailsWithPaymentStageData);
            } else {
              setCorpusPaymentStageList([]);
            }
          } else {
            setFormDataCorpusDetails({
              ...initialFormStateCorpusDetails()
            });
            setCorpusPaymentStageList([]);
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
      'Loading Corpus Details'
    );
  };

  const validateCorpusDetailsForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataCorpusDetails.CorpusOfferedToResidentialAmount) {
      newErrors.CorpusOfferedToResidentialAmount = 'Residential Corpus Amount is required'
    }

    if (!formDataCorpusDetails.CorpusOfferedToCommercialAmount) {
      newErrors.CorpusOfferedToCommercialAmount = 'Commercial Corpus Amount is required'
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const validateCorpusTotals = ({
    stages,
    residentialCorpus,
    commercialCorpus
  }: {
    stages: typeof corpusPaymentStageList;
    residentialCorpus: number;
    commercialCorpus: number;
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
      residentialOk: residentialTotal <= (residentialCorpus ?? 0),
      commercialOk: commercialTotal <= (commercialCorpus ?? 0)
    };
  };

  const handleSaveCorpusDetails = async () => {
    const {
      residentialTotal,
      commercialTotal,
      residentialOk,
      commercialOk
    } = validateCorpusTotals({
      stages: corpusPaymentStageList,
      residentialCorpus: formDataCorpusDetails.CorpusOfferedToResidentialAmount ?? 0,
      commercialCorpus: formDataCorpusDetails.CorpusOfferedToCommercialAmount ?? 0
    });

    if (buildingId === 0) {
      addToast({ type: "error", title: "Please select proper building first" });
      return
    }

    else if (corpusPaymentStageList.length === 0) {
      addToast({ type: "error", title: "Please add atleast one corpus" });
      return
    }

    else if (!residentialOk) {
      addToast({
        type: "error",
        title: `Residential total (${residentialTotal}) cannot be greater than corpus amount (${formDataCorpusDetails.CorpusOfferedToResidentialAmount}).`
      });
      return;
    }

    else if (!commercialOk) {
      addToast({
        type: "error",
        title: `Commercial total (${commercialTotal}) cannot be greater than corpus amount (${formDataCorpusDetails.CorpusOfferedToCommercialAmount}).`
      });
      return;
    }

    setErrorsCorpusDetails({})

    const validation = validateCorpusDetailsForm()

    if (!validation.isValid) {
      setErrorsCorpusDetails(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const paymentStageJSON = JSON.stringify(corpusPaymentStageList.map(item => ({
          ProposedOfferCorpusDetailsWithPaymentStageId: item.ProposedOfferCorpusDetailsWithPaymentStageId ?? 0,
          Type: item.Type || '',
          Stage: item.Stage || '',
          StagePercentage: item.StagePercentage ?? 0,
          Amount: item.Amount ?? 0
        })));

        const payload: AddUpdateProposedOfferCorpusDetailsRequest = {
          ProposedOfferCorpusDetailsId: formDataCorpusDetails.ProposedOfferCorpusDetailsId,
          Uniquekey: formDataCorpusDetails.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          CorpusOfferedToResidentialAmount: formDataCorpusDetails.CorpusOfferedToResidentialAmount,
          CorpusOfferedToCommercialAmount: formDataCorpusDetails.CorpusOfferedToCommercialAmount,
          CorpusDetailsWithPaymentStageJSON: paymentStageJSON
        };

        const response = await proposedOfferService.apiCallAddUpdateCorpusDetails(payload);

        if (E.isRight(response)) {
          const isAdd = formDataCorpusDetails.ProposedOfferCorpusDetailsId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProposedOfferCorpusDetailsData;
            setCorpusDetailsData(newRecord);
            setFormDataCorpusDetails({
              ...formDataCorpusDetails,
              ProposedOfferCorpusDetailsId: newRecord.ProposedOfferCorpusDetailsId || 0,
              Uniquekey: newRecord.Uniquekey || formDataCorpusDetails.Uniquekey
            });

            if (newRecord.ProposedOfferCorpusDetailsWithPaymentStageData) {
              setCorpusPaymentStageList(newRecord.ProposedOfferCorpusDetailsWithPaymentStageData);
            }

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as ProposedOfferCorpusDetailsData;
            setCorpusDetailsData(updatedRecord);

            if (updatedRecord.ProposedOfferCorpusDetailsWithPaymentStageData) {
              setCorpusPaymentStageList(updatedRecord.ProposedOfferCorpusDetailsWithPaymentStageData);
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
      Number(formDataCorpusDetails.ProposedOfferCorpusDetailsId) === 0 ? 'Add Corpus Details' : 'Update Corpus Details'
    )
  };

  const handleAddCorpusPaymentStageModal = () => {
    setEditingCorpusPaymentStageData(null);
    setFormDataCorpusPaymentStage({
      ...initialFormStateCorpusPaymentStage()
    });
    setErrorsCorpusPaymentStage({});
    setIsAddUpdateCorpusPaymentStageModalOpen(true);
  };

  const handleEditCorpusPaymentStage = useCallback((row: ProposedOfferCorpusDetailsWithPaymentStageData, index: number) => {
    setEditingCorpusPaymentStageData({ row, index });
    setFormDataCorpusPaymentStage({
      ...row,
      Type: row.Type || '',
      Stage: row.Stage || '',
      StagePercentage: row.StagePercentage || 0,
      StagePercentageText: String(row.StagePercentage) || '',
      Amount: row.Amount || 0
    });
    setErrorsCorpusPaymentStage({});
    setIsAddUpdateCorpusPaymentStageModalOpen(true);
  }, []);

  const validateCorpusPaymentStageForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataCorpusPaymentStage.Type?.trim()) {
      newErrors.Type = "Type is required"
    }

    if (!formDataCorpusPaymentStage.Stage?.trim()) {
      newErrors.Stage = "Stage is required"
    }

    if (!formDataCorpusPaymentStage.StagePercentage) {
      newErrors.StagePercentage = 'Stage Percentage is required'
    } else if (!isValidPercentage(String(formDataCorpusPaymentStage.StagePercentage))) {
      newErrors.StagePercentage = 'Enter a valid percentage'
    } else if (formDataCorpusPaymentStage.StagePercentage === undefined) {
      newErrors.StagePercentage = 'Enter a valid percentage'
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleAddUpdateCorpusPaymentStage = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorsCorpusPaymentStage({});

    const validation = validateCorpusPaymentStageForm();

    if (formDataCorpusPaymentStage.Type?.toUpperCase() === 'RESIDENTIAL' &&
      (
        formDataCorpusDetails.CorpusOfferedToResidentialAmount == null ||
        formDataCorpusDetails.CorpusOfferedToResidentialAmount <= 0
      )
    ) {
      addToast({
        type: 'error',
        title: 'Residential Corpus Amount is required'
      });
      return;
    }

    else if (formDataCorpusPaymentStage.Type?.toUpperCase() === 'COMMERCIAL' &&
      (
        formDataCorpusDetails.CorpusOfferedToCommercialAmount == null ||
        formDataCorpusDetails.CorpusOfferedToCommercialAmount <= 0
      )
    ) {
      addToast({
        type: 'error',
        title: 'Commercial Corpus Amount is required'
      });
      return;
    }

    if (!validation.isValid) {
      setErrorsCorpusPaymentStage(validation.errors);
      return;
    }

    const paymentStageToSave: ProposedOfferCorpusDetailsWithPaymentStageData = {
      ...formDataCorpusPaymentStage,
      ProposedOfferCorpusDetailsWithPaymentStageId: editingCorpusPaymentStageData?.row.ProposedOfferCorpusDetailsWithPaymentStageId ?? 0,
      ProjectId: Number(projectId),
      BuildingId: Number(buildingId)
    };

    setCorpusPaymentStageList(prev => {
      if (editingCorpusPaymentStageData) {
        const updated = [...prev];
        updated[editingCorpusPaymentStageData.index] = paymentStageToSave;
        return updated;
      }

      return [...prev, paymentStageToSave];
    });

    setIsAddUpdateCorpusPaymentStageModalOpen(false);
    setEditingCorpusPaymentStageData(null);
    setFormDataCorpusPaymentStage(initialFormStateCorpusPaymentStage());
    setErrorsCorpusPaymentStage({});
  };

  const handleConfirmationDialogBoxOpenCorpusPaymentStage = useCallback((row: ProposedOfferCorpusDetailsWithPaymentStageData, index: number) => {
    setDeleteCorpusPaymentStageData({ row, index });
    setIsConfirmationDialogBoxOpenCorpusPaymentStage(true);
  }, []);

  const handleDeleteCorpusPaymentStage = () => {
    if (!deleteCorpusPaymentStageData) return;

    const removeIndex = deleteCorpusPaymentStageData.index;

    if (removeIndex < 0) {

      setIsConfirmationDialogBoxOpenCorpusPaymentStage(false);

      setDeleteCorpusPaymentStageData(null);

      addToast({ type: 'error', title: 'Unable to find the selected record to delete' });

      return;

    }

    setCorpusPaymentStageList(prev => prev.filter((_, i) => i !== removeIndex));

    setIsConfirmationDialogBoxOpenCorpusPaymentStage(false);

    setDeleteCorpusPaymentStageData(null);

    addToast({ type: 'success', title: 'Corpus Payment Stage Removed' });

  };

  const handleConfirmationDialogBoxOpenGenerateCorpusDetails = useCallback((row: ProposedOfferCorpusDetailsData) => {
    setGenerateCorpusDetailsData(row);
    setIsConfirmationDialogBoxOpenGenerateCorpusDetails(true);
  }, []);

  const handleGenerateCorpusDetails = async () => {
    if (!generateCorpusDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const payload: AddUpdateGenerateProposedOfferRequest = {
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          ChargeType: 'Corpus'
        };

        const response = await proposedOfferService.apiCallAddUpdateGenerateProposedOffer(payload);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsConfirmationDialogBoxOpenGenerateCorpusDetails(false);

          fetchCorpusDetailsData();

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

      'Generate Corpus Details'
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
        render: (value) => value || '-'
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
                    handleEditCorpusPaymentStage(row, index);
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
                    handleConfirmationDialogBoxOpenCorpusPaymentStage(row, index);
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
    [canAction, handleEditCorpusPaymentStage, handleConfirmationDialogBoxOpenCorpusPaymentStage]
  );

  const recalculateCorpusPaymentAmount = useCallback(
    (
      type: string | null | undefined,
      percentage: number | null | undefined
    ) => {
      if (!type || percentage == null) {
        handleFieldChangeCorpusPaymentStage('Amount', null);
        return;
      }

      const upperType = type.toUpperCase();

      const baseAmount =
        upperType === 'RESIDENTIAL'
          ? formDataCorpusDetails.CorpusOfferedToResidentialAmount
          : upperType === 'COMMERCIAL'
            ? formDataCorpusDetails.CorpusOfferedToCommercialAmount
            : null;

      if (!baseAmount || baseAmount <= 0) {
        handleFieldChangeCorpusPaymentStage('Amount', null);
        return;
      }

      const calculatedAmount = calculatePercentageAmount(
        baseAmount,
        percentage
      );

      handleFieldChangeCorpusPaymentStage('Amount', calculatedAmount);
    },
    [formDataCorpusDetails]
  );

  return (
    <>
      <div className="space-y-6">
        {/* Corpus Amount Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">
            Corpus Amount Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="Residential Corpus Amount (₹)"
                required
                type="text"
                rightIcon="₹"
                value={formDataCorpusDetails.CorpusOfferedToResidentialAmount || ''}
                onChange={(e) =>
                  handleFieldChangeCorpusDetails('CorpusOfferedToResidentialAmount',
                    e.target.value === ''
                      ? null
                      : Number(filterNumbersWithDecimal(e.target.value))
                  )
                }
                error={errorsCorpusDetails.CorpusOfferedToResidentialAmount}
                placeholder="Enter Residential Corpus Amount"
              />
            </div>

            <div>
              <Input
                label="Commercial Corpus Amount (₹)"
                required
                type="text"
                rightIcon="₹"
                value={formDataCorpusDetails.CorpusOfferedToCommercialAmount || ''}
                onChange={(e) => handleFieldChangeCorpusDetails('CorpusOfferedToCommercialAmount',
                  e.target.value === ''
                    ? null
                    : Number(filterNumbersWithDecimal(e.target.value)))}
                error={errorsCorpusDetails.CorpusOfferedToCommercialAmount}
                placeholder="Enter Commercial Corpus Amount"
              />
            </div>
          </div>
        </div>

        {/* Corpus List Section */}
        <div className="space-y-4 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex-1 border-b border-gray-300 pb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Corpus List
              </h3>
            </div>

            {canAction && buildingId > 0 && (
              <Button
                onClick={handleAddCorpusPaymentStageModal}
                color="blue"
                size="sm"
                title="Add Corpus"
              >
                Add Corpus
              </Button>
            )}

          </div>
          <DataTable
            data={corpusPaymentStageList}
            columns={corpusPaymentStageColumns}
            emptyMessage="No Corpus Details Found"
            fixedHeight={false}
            recordsPerPage={20}
            className="min-w-full"
          />
        </div>
      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={(formDataCorpusDetails.ProposedOfferCorpusDetailsId && formDataCorpusDetails.ProposedOfferCorpusDetailsId > 0) ? 'Update' : 'Add'}
        onCancel={() => {
          setFormDataCorpusDetails({
            ...initialFormStateCorpusDetails(),
          });
          setCorpusPaymentStageList([]);
          setErrorsCorpusDetails({});
          fetchCorpusDetailsData();
        }}
        canAction={buildingId > 0 && canAction}
        onSave={handleSaveCorpusDetails}
        onOtherActionText="Generate"
        onOtherAction={() =>
          handleConfirmationDialogBoxOpenGenerateCorpusDetails(formDataCorpusDetails as ProposedOfferCorpusDetailsData)
        }

        isLoading={isLoading}
      />

      {/* ADD UPDATE CORPUS PAYMENT STAGE MODAL */}
      <Modal
        isOpen={isAddUpdateCorpusPaymentStageModalOpen}
        onClose={() => {
          setIsAddUpdateCorpusPaymentStageModalOpen(false);
          setEditingCorpusPaymentStageData(null);
          setFormDataCorpusPaymentStage(initialFormStateCorpusPaymentStage());
          setErrorsCorpusPaymentStage({});
        }}
        onCancel={() => {
          setIsAddUpdateCorpusPaymentStageModalOpen(false);
          setEditingCorpusPaymentStageData(null);
          setFormDataCorpusPaymentStage(initialFormStateCorpusPaymentStage());
          setErrorsCorpusPaymentStage({});
        }}
        title={editingCorpusPaymentStageData ? 'Update Corpus Payment Stage' : 'Add Corpus Payment Stage'}
        onSubmit={handleAddUpdateCorpusPaymentStage}
        saveText={editingCorpusPaymentStageData ? 'Update' : 'Add'}
        cancelText="Cancel"
        loading={isLoading}
        size='lg'
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <SinglePageSelection
                label="Type"
                placeholder='Select Type'
                required
                value={formDataCorpusPaymentStage.Type || ''}
                onChange={(e) => {
                  const rawType = String(e);
                  handleFieldChangeCorpusPaymentStage('Type', rawType);
                  recalculateCorpusPaymentAmount(
                    rawType,
                    formDataCorpusPaymentStage.StagePercentage
                  );
                }}
                options={FLAT_UNIT_TYPE
                  .filter(opt => opt.id !== 'Gym' && opt.id !== 'Void')
                  .map(opt => ({
                    label: opt.name,
                    value: opt.id
                  }))
                }
                error={errorsCorpusPaymentStage.Type}
              />
            </div>

            <div>
              <Input
                label="Stage"
                required
                type="text"
                value={formDataCorpusPaymentStage.Stage || ''}
                onChange={(e) => handleFieldChangeCorpusPaymentStage('Stage', e.target.value)}
                error={errorsCorpusPaymentStage.Stage}
                placeholder="Enter Stage"
              />
            </div>

            <div>
              <Input
                label="Stage Percentage (%)"
                required
                type="text"
                rightIcon="%"
                value={
                  formDataCorpusPaymentStage.StagePercentageText ??
                  formDataCorpusPaymentStage.StagePercentage
                }
                onChange={(e) => {
                  const raw = filterNumbersWithDecimal(e.target.value);
                  const safeValue = allowPercentage(raw);
                  if (safeValue === null) return;

                  handleFieldChangeCorpusPaymentStage('StagePercentageText', raw);

                  if (raw === '') {
                    handleFieldChangeCorpusPaymentStage('StagePercentage', null);
                    handleFieldChangeCorpusPaymentStage('Amount', null);
                    return;
                  }

                  const percent = Number(raw);
                  handleFieldChangeCorpusPaymentStage('StagePercentage', percent);

                  recalculateCorpusPaymentAmount(
                    formDataCorpusPaymentStage.Type,
                    percent
                  );
                }}
                error={errorsCorpusPaymentStage.StagePercentage}
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
                value={formDataCorpusPaymentStage.Amount || ''}
                error={errorsCorpusPaymentStage.Amount}
                placeholder="Calculated Amount"
                onChange={(e) => handleFieldChangeCorpusPaymentStage('Amount', e.target.value)}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION CORPUS PAYMENT STAGE MODAL */}
      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenCorpusPaymentStage}
        onClose={() => {
          setIsConfirmationDialogBoxOpenCorpusPaymentStage(false);
          setDeleteCorpusPaymentStageData(null);
        }}
        onConfirm={handleDeleteCorpusPaymentStage}
        loading={isLoading}
        pageName='corpus payment stage'
      />

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenGenerateCorpusDetails}
        onClose={() => {
          setIsConfirmationDialogBoxOpenGenerateCorpusDetails(false);
          setGenerateCorpusDetailsData(null);
        }}
        onConfirm={handleGenerateCorpusDetails}
        loading={isLoading}
        pageName='rent'
        title='Are sure you want generate corpus?'
        message="Once the corpus is generated, it cannot be deleted"
        confirmText='Generate'
        variant='generate'
      />

    </>
  );
};

