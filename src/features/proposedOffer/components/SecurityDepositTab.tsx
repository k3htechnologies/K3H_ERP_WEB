import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ProposedOfferSecurityDepositDetailsData,
  FilterWithPaginationProposedOfferSecurityDepositDetailsRequest,
  AddUpdateProposedOfferSecurityDepositDetailsRequest,
  ProposedOfferSecurityDepositDetailsWithPaymentStageData,
} from '@/features/proposedOffer/models/ProposedOfferModel';
import { proposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { filterNumbersWithDecimal } from '@/core/utils/fileValidation';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { Modal } from '@/ui/components/Modal/Modal';
import { Edit, Trash2 } from 'lucide-react';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { FLAT_UNIT_TYPE } from '@/core/constants';
import {
  initialFormStateSecurityDepositDetails,
  initialFormStateSecurityDepositPaymentStage,
} from '../utils/initialStates';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

interface SecurityDepositTabProps {
  projectId: number | null;
  buildingId: number;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

export const SecurityDepositTab: React.FC<SecurityDepositTabProps> = ({
  projectId,
  buildingId,
  isLoading,
  setIsLoading,
  setLoadingMessage,
}) => {
  const [, setSecurityDepositDetailsData] = useState<ProposedOfferSecurityDepositDetailsData | null>(null);
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions();
  const [errorsSecurityDepositDetails, setErrorsSecurityDepositDetails] = useState<{ [k: string]: string }>({});
  const [errorsSecurityDepositPaymentStage, setErrorsSecurityDepositPaymentStage] = useState<{ [k: string]: string }>({});
  const [formDataSecurityDepositDetails, setFormDataSecurityDepositDetails] = useState<AddUpdateProposedOfferSecurityDepositDetailsRequest>(() => initialFormStateSecurityDepositDetails());
  const [securityDepositPaymentStageList, setSecurityDepositPaymentStageList] = useState<ProposedOfferSecurityDepositDetailsWithPaymentStageData[]>([]);
  const [editingSecurityDepositPaymentStageData, setEditingSecurityDepositPaymentStageData] = useState<{ row: ProposedOfferSecurityDepositDetailsWithPaymentStageData; index: number } | null>(null);
  const [isAddUpdateSecurityDepositPaymentStageModalOpen, setIsAddUpdateSecurityDepositPaymentStageModalOpen] = useState(false);
  const [formDataSecurityDepositPaymentStage, setFormDataSecurityDepositPaymentStage] = useState<ProposedOfferSecurityDepositDetailsWithPaymentStageData>(() => initialFormStateSecurityDepositPaymentStage());
  const [isConfirmationDialogBoxOpenSecurityDepositPaymentStage, setIsConfirmationDialogBoxOpenSecurityDepositPaymentStage] = useState(false);
  const [deleteSecurityDepositPaymentStageData, setDeleteSecurityDepositPaymentStageData] = useState<{ row: ProposedOfferSecurityDepositDetailsWithPaymentStageData; index: number } | null>(null);

  useEffect(() => {
    if (!projectId || !buildingId) return;
    setErrorsSecurityDepositDetails({});
    setErrorsSecurityDepositPaymentStage({});
    fetchSecurityDepositDetailsData();
  }, [projectId, buildingId]);

  const handleFieldChangeSecurityDepositDetails = (field: keyof AddUpdateProposedOfferSecurityDepositDetailsRequest, value: any) => {
    setFormDataSecurityDepositDetails((prev) => ({ ...prev, [field]: value }));
    if (errorsSecurityDepositDetails[field]) {
      setErrorsSecurityDepositDetails((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFieldChangeSecurityDepositPaymentStage = (field: keyof ProposedOfferSecurityDepositDetailsWithPaymentStageData, value: any) => {
    setFormDataSecurityDepositPaymentStage((prev) => ({ ...prev, [field]: value }));
    if (errorsSecurityDepositPaymentStage[field]) {
      setErrorsSecurityDepositPaymentStage((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const fetchSecurityDepositDetailsData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferSecurityDepositDetailsRequest = {
          ProjectId: projectId ?? undefined,
          BuildingId: buildingId
        };

        const response = await proposedOfferService.apiCallPullSecurityDepositDetails(params);

        if (E.isRight(response)) {
          const data = response.right.Data?.[0] || null;
          setSecurityDepositDetailsData(data);

          if (data) {
            setFormDataSecurityDepositDetails({
              ProposedOfferSecurityDepositDetailsId: data.ProposedOfferSecurityDepositDetailsId || 0,
              Uniquekey: data.Uniquekey || initialFormStateSecurityDepositDetails().Uniquekey,
              BuildingId: buildingId,
              ProjectId: Number(projectId),
              SecurityDepositToSocietyAmount: data.SecurityDepositToSocietyAmount ?? 0,
              SecurityDepositToSocietyWithPaymentStageJSON: ''
            });

            if (data.ProposedOfferSecurityDepositDetailsWithPaymentStageData && data.ProposedOfferSecurityDepositDetailsWithPaymentStageData.length > 0) {
              setSecurityDepositPaymentStageList(data.ProposedOfferSecurityDepositDetailsWithPaymentStageData);
            } else {
              setSecurityDepositPaymentStageList([]);
            }
          } else {
            setFormDataSecurityDepositDetails({
              ...initialFormStateSecurityDepositDetails(),
              ProjectId: Number(projectId)
            });
            setSecurityDepositPaymentStageList([]);
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
      'Loading Security Deposit Details'
    );
  };

  const validateSecurityDepositDetailsForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataSecurityDepositDetails.SecurityDepositToSocietyAmount) {
      newErrors.SecurityDepositToSocietyAmount = 'Security Deposit Amount is required'
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const validateSecurityDepositTotals = ({
    stages,
    securityDepositAmount,
  }: {
    stages: typeof securityDepositPaymentStageList;
    securityDepositAmount: number;
  }) => {
    const total = stages.reduce(
      (sum, cur) => sum + (Number(cur.Amount) || 0),
      0
    );

    return {
      total,
      ok: total <= (securityDepositAmount ?? 0)
    };
  };

  const handleSaveSecurityDepositDetails = async () => {
    const { total, ok } = validateSecurityDepositTotals({
      stages: securityDepositPaymentStageList,
      securityDepositAmount: formDataSecurityDepositDetails.SecurityDepositToSocietyAmount ?? 0
    });
    if (buildingId === 0) {
      addToast({ type: "error", title: "Please select proper building first" });
      return
    }

    else if (securityDepositPaymentStageList.length === 0) {
      addToast({ type: "error", title: "Please add atleast one security deposit" });
      return
    }

    else if (!ok) {
      addToast({
        type: "error",
        title: `Total security deposit amount (${total}) cannot be greater than Security Deposit Amount (${formDataSecurityDepositDetails.SecurityDepositToSocietyAmount}).`
      });
      return;
    }

    setErrorsSecurityDepositDetails({})

    const validation = validateSecurityDepositDetailsForm()

    if (!validation.isValid) {
      setErrorsSecurityDepositDetails(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const paymentStageJSON = JSON.stringify(securityDepositPaymentStageList.map(item => ({
          ProposedOfferSecurityDepositDetailsWithPaymentStageId: item.ProposedOfferSecurityDepositDetailsWithPaymentStageId ?? 0,
          Type: item.Type || '',
          Stage: item.Stage || '',
          Amount: item.Amount ?? 0
        })));

        const payload: AddUpdateProposedOfferSecurityDepositDetailsRequest = {
          ProposedOfferSecurityDepositDetailsId: formDataSecurityDepositDetails.ProposedOfferSecurityDepositDetailsId,
          Uniquekey: formDataSecurityDepositDetails.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          SecurityDepositToSocietyAmount: formDataSecurityDepositDetails.SecurityDepositToSocietyAmount,
          SecurityDepositToSocietyWithPaymentStageJSON: paymentStageJSON
        };

        const response = await proposedOfferService.apiCallAddUpdateSecurityDepositDetails(payload);

        if (E.isRight(response)) {
          const isAdd = formDataSecurityDepositDetails.ProposedOfferSecurityDepositDetailsId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProposedOfferSecurityDepositDetailsData;
            setSecurityDepositDetailsData(newRecord);
            setFormDataSecurityDepositDetails({
              ...formDataSecurityDepositDetails,
              ProposedOfferSecurityDepositDetailsId: newRecord.ProposedOfferSecurityDepositDetailsId || 0,
              Uniquekey: newRecord.Uniquekey || formDataSecurityDepositDetails.Uniquekey
            });
            if (newRecord.ProposedOfferSecurityDepositDetailsWithPaymentStageData) {
              setSecurityDepositPaymentStageList(newRecord.ProposedOfferSecurityDepositDetailsWithPaymentStageData);
            }
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as ProposedOfferSecurityDepositDetailsData;
            setSecurityDepositDetailsData(updatedRecord);
            if (updatedRecord.ProposedOfferSecurityDepositDetailsWithPaymentStageData) {
              setSecurityDepositPaymentStageList(updatedRecord.ProposedOfferSecurityDepositDetailsWithPaymentStageData);
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
      Number(formDataSecurityDepositDetails.ProposedOfferSecurityDepositDetailsId) === 0 ? 'Add Security Deposit Details' : 'Update Security Deposit Details'
    )
  };

  const validateSecurityDepositPaymentStageForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataSecurityDepositPaymentStage.Type?.trim()) {
      newErrors.Type = "Type is required"
    }

    if (!formDataSecurityDepositPaymentStage.Stage?.trim()) {
      newErrors.Stage = "Stage is required"
    }

    if (!formDataSecurityDepositPaymentStage.Amount) {
      newErrors.Amount = "Amount is required"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleAddSecurityDepositPaymentStageModal = () => {
    setEditingSecurityDepositPaymentStageData(null);
    setFormDataSecurityDepositPaymentStage({
      ...initialFormStateSecurityDepositPaymentStage(),
      ProjectId: Number(projectId),
      BuildingId: formDataSecurityDepositDetails.BuildingId || 0
    });
    setErrorsSecurityDepositPaymentStage({});
    setIsAddUpdateSecurityDepositPaymentStageModalOpen(true);
  };

  const handleEditSecurityDepositPaymentStage = useCallback((row: ProposedOfferSecurityDepositDetailsWithPaymentStageData, index: number) => {
    setEditingSecurityDepositPaymentStageData({ row, index });
    setFormDataSecurityDepositPaymentStage({
      ...row,
      Type: row.Type || '',
      Stage: row.Stage || '',
      Amount: row.Amount || 0
    });
    setErrorsSecurityDepositPaymentStage({});
    setIsAddUpdateSecurityDepositPaymentStageModalOpen(true);
  }, []);

  const handleAddUpdateSecurityDepositPaymentStage = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorsSecurityDepositPaymentStage({});

    const validation = validateSecurityDepositPaymentStageForm();

    if (!validation.isValid) {
      setErrorsSecurityDepositPaymentStage(validation.errors);
      return;
    }

    const paymentStageToSave: ProposedOfferSecurityDepositDetailsWithPaymentStageData = {
      ...formDataSecurityDepositPaymentStage,
      ProposedOfferSecurityDepositDetailsWithPaymentStageId: editingSecurityDepositPaymentStageData?.row.ProposedOfferSecurityDepositDetailsWithPaymentStageId ?? 0,
      ProjectId: Number(projectId),
      BuildingId: buildingId
    };

    setSecurityDepositPaymentStageList(prev => {
      if (editingSecurityDepositPaymentStageData) {
        const updated = [...prev];
        updated[editingSecurityDepositPaymentStageData.index] = paymentStageToSave;
        return updated;
      }

      return [...prev, paymentStageToSave];
    });

    setIsAddUpdateSecurityDepositPaymentStageModalOpen(false);
    setEditingSecurityDepositPaymentStageData(null);
    setFormDataSecurityDepositPaymentStage(initialFormStateSecurityDepositPaymentStage());
    setErrorsSecurityDepositPaymentStage({});
  };

  const handleConfirmationDialogBoxOpenSecurityDepositPaymentStage = useCallback((row: ProposedOfferSecurityDepositDetailsWithPaymentStageData, index: number) => {
    setDeleteSecurityDepositPaymentStageData({ row, index });
    setIsConfirmationDialogBoxOpenSecurityDepositPaymentStage(true);
  }, []);

  const handleDeleteSecurityDepositPaymentStage = () => {
    if (!deleteSecurityDepositPaymentStageData) return;

    const removeIndex = deleteSecurityDepositPaymentStageData.index;

    if (removeIndex < 0) {
      setIsConfirmationDialogBoxOpenSecurityDepositPaymentStage(false);
      setDeleteSecurityDepositPaymentStageData(null);
      addToast({ type: 'error', title: 'Unable to find the selected record to delete' });
      return;
    }

    setSecurityDepositPaymentStageList(prev => prev.filter((_, i) => i !== removeIndex));

    setIsConfirmationDialogBoxOpenSecurityDepositPaymentStage(false);
    setDeleteSecurityDepositPaymentStageData(null);
    addToast({ type: 'success', title: 'Security Deposit Payment Stage Removed' });
  };

  const securityDepositPaymentStageColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'Type',
        label: 'Type',
        width: '25',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'Stage',
        label: 'Stage',
        width: '25',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'Amount',
        label: 'Amount (₹)',
        width: '25',
        sortable: false,
        align: 'right',
        render: (value) => value ? `₹${value}` : '-'
      },
      {
        key: 'Action',
        label: 'Action',
        width: '25',
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
                    handleEditSecurityDepositPaymentStage(row, index);
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
                    handleConfirmationDialogBoxOpenSecurityDepositPaymentStage(row, index);
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
    [canAction, handleEditSecurityDepositPaymentStage, handleConfirmationDialogBoxOpenSecurityDepositPaymentStage]
  );

  return (
    <>
      <div className="space-y-6">
        {/* Security Deposit Amount Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">
            Security Deposit Amount Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="Security Deposit Amount (₹)"
                required
                type="text"
                value={formDataSecurityDepositDetails.SecurityDepositToSocietyAmount || ''}
                onChange={(e) => handleFieldChangeSecurityDepositDetails('SecurityDepositToSocietyAmount', filterNumbersWithDecimal(e.target.value))}
                error={errorsSecurityDepositDetails.SecurityDepositToSocietyAmount}
                placeholder="Enter Security Deposit Amount"
                rightIcon="₹"
                disabled={securityDepositPaymentStageList.length > 0 ? true : false}
              />
            </div>
          </div>
        </div>

        {/* Security Deposit List Section */}
        <div className="space-y-4 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex-1 border-b border-gray-300 pb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Security Deposit List
              </h3>
            </div>
            {canAction && buildingId > 0 && (
              <Button
                onClick={handleAddSecurityDepositPaymentStageModal}
                color="blue"
                size="sm"
                title="Add Security Deposit"
              >
                Add Security Deposit
              </Button>
            )}
          </div>
          <DataTable
            data={securityDepositPaymentStageList}
            columns={securityDepositPaymentStageColumns}
            emptyMessage="No Security Deposit Details Found"
            fixedHeight={false}
            recordsPerPage={20}
            className="min-w-full"
          />
        </div>
      </div>
      <BottomActionBar
        cancelText="Cancel"
        saveText={(formDataSecurityDepositDetails.ProposedOfferSecurityDepositDetailsId && formDataSecurityDepositDetails.ProposedOfferSecurityDepositDetailsId > 0) ? 'Update' : 'Add'}
        onCancel={() => {
          setFormDataSecurityDepositDetails({
            ...initialFormStateSecurityDepositDetails(),
            ProjectId: Number(projectId)
          });
          setSecurityDepositPaymentStageList([]);
          setErrorsSecurityDepositDetails({});
          fetchSecurityDepositDetailsData();
        }}
        canAction={canAction && buildingId > 0}
        onSave={handleSaveSecurityDepositDetails}
        isLoading={isLoading}
      />

      {/* ADD UPDATE SECURITY DEPOSIT PAYMENT STAGE MODAL */}
      <Modal
        isOpen={isAddUpdateSecurityDepositPaymentStageModalOpen}
        onClose={() => {
          setIsAddUpdateSecurityDepositPaymentStageModalOpen(false);
          setEditingSecurityDepositPaymentStageData(null);
          setFormDataSecurityDepositPaymentStage(initialFormStateSecurityDepositPaymentStage());
          setErrorsSecurityDepositPaymentStage({});
        }}
        onCancel={() => {
          setIsAddUpdateSecurityDepositPaymentStageModalOpen(false);
          setEditingSecurityDepositPaymentStageData(null);
          setFormDataSecurityDepositPaymentStage(initialFormStateSecurityDepositPaymentStage());
          setErrorsSecurityDepositPaymentStage({});
        }}
        title={editingSecurityDepositPaymentStageData ? 'Update Security Deposit Payment Stage' : 'Add Security Deposit Payment Stage'}
        onSubmit={handleAddUpdateSecurityDepositPaymentStage}
        saveText={editingSecurityDepositPaymentStageData ? 'Update' : 'Add'}
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
                value={formDataSecurityDepositPaymentStage.Type || ''}
                onChange={(e) => handleFieldChangeSecurityDepositPaymentStage('Type', String(e))}
                options={FLAT_UNIT_TYPE
                  .filter(opt => opt.id !== 'Gym' && opt.id !== 'Void')
                  .map(opt => ({
                    label: opt.name,
                    value: opt.id
                  }))
                }
                error={errorsSecurityDepositPaymentStage.Type}
              />
            </div>
            <div>
              <Input
                label="Stage"
                required
                type="text"
                value={formDataSecurityDepositPaymentStage.Stage || ''}
                onChange={(e) => handleFieldChangeSecurityDepositPaymentStage('Stage', e.target.value)}
                error={errorsSecurityDepositPaymentStage.Stage}
                placeholder="Enter Stage"
              />
            </div>
            <div>
              <Input
                label="Amount (₹)"
                required
                type="text"
                value={formDataSecurityDepositPaymentStage.Amount}
                onChange={(e) => {
                  const val = filterNumbersWithDecimal(e.target.value);
                  handleFieldChangeSecurityDepositPaymentStage('Amount', val);
                }}
                error={errorsSecurityDepositPaymentStage.Amount}
                placeholder="Enter Amount"
                rightIcon="₹"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION SECURITY DEPOSIT PAYMENT STAGE MODAL */}

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenSecurityDepositPaymentStage}
        onClose={() => {
          setIsConfirmationDialogBoxOpenSecurityDepositPaymentStage(false);
          setDeleteSecurityDepositPaymentStageData(null);
        }}
        onConfirm={handleDeleteSecurityDepositPaymentStage}
        loading={isLoading}
        pageName='security deposit payment stage'
      />
    </>
  );
};

