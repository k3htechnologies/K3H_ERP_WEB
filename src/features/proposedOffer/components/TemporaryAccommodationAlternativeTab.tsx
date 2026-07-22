import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ProposedOfferTemporaryAccommodationAlternativeData,
  FilterWithPaginationProposedOfferTemporaryAccommodationAlternativeRequest,
  AddUpdateProposedOfferTemporaryAccommodationAlternativeRequest,
  DeleteProposedOfferTemporaryAccommodationAlternativeRequest,
  AddUpdateGenerateProposedOfferRequest,
} from '@/features/proposedOffer/models/ProposedOfferModel';
import { proposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { filterNumbersWithDecimal } from '@/core/utils/fileValidation';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { Modal } from '@/ui/components/Modal/Modal';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { Checkbox } from '@/ui/components/forms/Checkbox';
import { FLAT_UNIT_TYPE, TENURE, UNIT_SQFT_LUMPSUM } from '@/core/constants';
import { convert_date_yy_mm_dd_To_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import DatePickerInput from '@/ui/components/forms/Datepicker';
import { initialFormStateTemporaryAccommodationAlternative } from '../utils/initialStates';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { isToDateGreaterOrEqualFromDate } from '@/core/utils/comman';

interface TemporaryAccommodationAlternativeTabProps {
  projectId: number | null;
  buildingId: number;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

export const TemporaryAccommodationAlternativeTab: React.FC<TemporaryAccommodationAlternativeTabProps> = ({
  projectId,
  buildingId,
  isLoading,
  setIsLoading,
  setLoadingMessage,
}) => {
  const [rentDetailsList, setTemporaryAccommodationAlternativeList] = useState<ProposedOfferTemporaryAccommodationAlternativeData[]>([]);
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions();
  const [errorsTemporaryAccommodationAlternative, setErrorsTemporaryAccommodationAlternative] = useState<{ [k: string]: string }>({});
  const [editingTemporaryAccommodationAlternativeData, setEditingTemporaryAccommodationAlternativeData] = useState<ProposedOfferTemporaryAccommodationAlternativeData | null>(null);
  const [isAddUpdateTemporaryAccommodationAlternativeModalOpen, setIsAddUpdateTemporaryAccommodationAlternativeModalOpen] = useState(false);
  const [formDataTemporaryAccommodationAlternative, setFormDataTemporaryAccommodationAlternative] = useState<AddUpdateProposedOfferTemporaryAccommodationAlternativeRequest>(() => initialFormStateTemporaryAccommodationAlternative());
  const [isConfirmationDialogBoxOpenTemporaryAccommodationAlternative, setIsConfirmationDialogBoxOpenTemporaryAccommodationAlternative] = useState(false);
  const [deleteTemporaryAccommodationAlternativeData, setDeleteTemporaryAccommodationAlternativeData] = useState<ProposedOfferTemporaryAccommodationAlternativeData | null>(null);
  const [generateTemporaryAccommodationAlternativeData, setGenerateTemporaryAccommodationAlternativeData] = useState<ProposedOfferTemporaryAccommodationAlternativeData | null>(null);
  const [isConfirmationDialogBoxOpenGenerateTemporaryAccommodationAlternative, setIsConfirmationDialogBoxOpenGenerateTemporaryAccommodationAlternative] = useState(false);

  useEffect(() => {
    if (!projectId || !buildingId) return;
    setErrorsTemporaryAccommodationAlternative({});
    fetchTemporaryAccommodationAlternativeData();

  }, [projectId, buildingId]);

  const handleFieldChangeTemporaryAccommodationAlternative = (field: keyof AddUpdateProposedOfferTemporaryAccommodationAlternativeRequest, value: any) => {
    setFormDataTemporaryAccommodationAlternative((prev) => ({ ...prev, [field]: value }));
    if (errorsTemporaryAccommodationAlternative[field]) {
      setErrorsTemporaryAccommodationAlternative((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const fetchTemporaryAccommodationAlternativeData = async () => {

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationProposedOfferTemporaryAccommodationAlternativeRequest = {
          ProjectId: Number(projectId),
          BuildingId: buildingId
        };

        const response = await proposedOfferService.apiCallPullTemporaryAccommodationAlternative(params);

        if (E.isRight(response)) {

          const data = response.right.Data || [];

          setTemporaryAccommodationAlternativeList(data);

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
      'Loading TAA Details'
    );
  };

  const handleAddTemporaryAccommodationAlternativeModal = () => {
    setEditingTemporaryAccommodationAlternativeData(null);
    setFormDataTemporaryAccommodationAlternative({
      ...initialFormStateTemporaryAccommodationAlternative(),
      ProjectId: Number(projectId),
      BuildingId: buildingId
    });
    setErrorsTemporaryAccommodationAlternative({});
    setIsAddUpdateTemporaryAccommodationAlternativeModalOpen(true);
  };

  const handleEditTemporaryAccommodationAlternative = useCallback((row: ProposedOfferTemporaryAccommodationAlternativeData) => {
    setEditingTemporaryAccommodationAlternativeData(row);
    setFormDataTemporaryAccommodationAlternative({
      ProposedOfferTemporaryAccommodationAlternativeDetailsId: row.ProposedOfferTemporaryAccommodationAlternativeDetailsId || 0,
      Uniquekey: row.Uniquekey || initialFormStateTemporaryAccommodationAlternative().Uniquekey,
      BuildingId: buildingId,
      ProjectId: Number(projectId),
      IsAdditionalTemporaryAccommodationAlternative: row.IsAdditionalTemporaryAccommodationAlternative ?? false,
      Type: row.Type || '',
      Tenure: row.Tenure || '',
      Amount: row.Amount ?? 0,
      UnitSqFtLumsum: row.UnitSqFtLumsum || '',
      CarpetAreaSqFt: row.CarpetAreaSqFt ?? 0,
      TemporaryAccommodationAlternativeStartDate: row.TemporaryAccommodationAlternativeStartDate || '',
      TemporaryAccommodationAlternativeEndDate: row.TemporaryAccommodationAlternativeEndDate || '',
      IsPayBrokerage: row.IsPayBrokerage ?? false
    });

    setErrorsTemporaryAccommodationAlternative({});
    setIsAddUpdateTemporaryAccommodationAlternativeModalOpen(true);
  }, [projectId, buildingId]);

  const validateTemporaryAccommodationAlternativeForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataTemporaryAccommodationAlternative.Type?.trim()) {
      newErrors.Type = "Type is required"
    }

    if (formDataTemporaryAccommodationAlternative.IsAdditionalTemporaryAccommodationAlternative === false && !formDataTemporaryAccommodationAlternative.Tenure?.trim()) {
      newErrors.Tenure = "Tenure is required"
    }

    if (!formDataTemporaryAccommodationAlternative.Amount) {
      newErrors.Amount = "Amount is required"
    }

    if (!formDataTemporaryAccommodationAlternative.UnitSqFtLumsum?.trim()) {
      newErrors.UnitSqFtLumsum = "Unit / SqFt / Lumpsum is required"
    }


    const hasFromDate = !!formDataTemporaryAccommodationAlternative.TemporaryAccommodationAlternativeStartDate;
    const hasToDate = !!formDataTemporaryAccommodationAlternative.TemporaryAccommodationAlternativeEndDate;

    const fromDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formDataTemporaryAccommodationAlternative.TemporaryAccommodationAlternativeStartDate ? new Date(formDataTemporaryAccommodationAlternative.TemporaryAccommodationAlternativeStartDate) : undefined);
    const toDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formDataTemporaryAccommodationAlternative.TemporaryAccommodationAlternativeEndDate ? new Date(formDataTemporaryAccommodationAlternative.TemporaryAccommodationAlternativeEndDate) : undefined);


    if (!formDataTemporaryAccommodationAlternative.TemporaryAccommodationAlternativeStartDate || formDataTemporaryAccommodationAlternative.TemporaryAccommodationAlternativeStartDate.trim() === "") {
      newErrors.TemporaryAccommodationAlternativeStartDate = "TAA Start Date is required"
    }

    if (!formDataTemporaryAccommodationAlternative.TemporaryAccommodationAlternativeEndDate || formDataTemporaryAccommodationAlternative.TemporaryAccommodationAlternativeEndDate.trim() === "") {
      newErrors.TemporaryAccommodationAlternativeEndDate = "TAA End Date is required"
    }

    if (hasFromDate && hasToDate) {
      if (!isToDateGreaterOrEqualFromDate(fromDate, toDate)) {
        newErrors.TemporaryAccommodationAlternativeEndDate = "TAA To Date must be greater than or equal to TAA From Date.";
      }
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleAddUpdateTemporaryAccommodationAlternative = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorsTemporaryAccommodationAlternative({});

    const validation = validateTemporaryAccommodationAlternativeForm();

    if (!validation.isValid) {
      setErrorsTemporaryAccommodationAlternative(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload: AddUpdateProposedOfferTemporaryAccommodationAlternativeRequest = {
          ProposedOfferTemporaryAccommodationAlternativeDetailsId: formDataTemporaryAccommodationAlternative.ProposedOfferTemporaryAccommodationAlternativeDetailsId,
          Uniquekey: formDataTemporaryAccommodationAlternative.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          IsAdditionalTemporaryAccommodationAlternative: formDataTemporaryAccommodationAlternative.IsAdditionalTemporaryAccommodationAlternative || false,
          Type: formDataTemporaryAccommodationAlternative.Type || "",
          Tenure: formDataTemporaryAccommodationAlternative.Tenure || "",
          Amount: formDataTemporaryAccommodationAlternative.Amount || 0,
          UnitSqFtLumsum: formDataTemporaryAccommodationAlternative.UnitSqFtLumsum || "",
          CarpetAreaSqFt: formDataTemporaryAccommodationAlternative.CarpetAreaSqFt || 0,
          TemporaryAccommodationAlternativeStartDate: formDataTemporaryAccommodationAlternative.TemporaryAccommodationAlternativeStartDate,
          TemporaryAccommodationAlternativeEndDate: formDataTemporaryAccommodationAlternative.TemporaryAccommodationAlternativeEndDate,
          IsPayBrokerage: formDataTemporaryAccommodationAlternative.IsPayBrokerage || false
        };

        const response = await proposedOfferService.apiCallAddUpdateTemporaryAccommodationAlternative(payload);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsAddUpdateTemporaryAccommodationAlternativeModalOpen(false);

          setEditingTemporaryAccommodationAlternativeData(null);

          setFormDataTemporaryAccommodationAlternative(initialFormStateTemporaryAccommodationAlternative());

          setErrorsTemporaryAccommodationAlternative({});

          fetchTemporaryAccommodationAlternativeData();

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
      Number(formDataTemporaryAccommodationAlternative.ProposedOfferTemporaryAccommodationAlternativeDetailsId) === 0 ? 'Add TAA' : 'Update TAA'
    )
  };

  const handleConfirmationDialogBoxOpenTemporaryAccommodationAlternative = useCallback((row: ProposedOfferTemporaryAccommodationAlternativeData) => {
    setDeleteTemporaryAccommodationAlternativeData(row);
    setIsConfirmationDialogBoxOpenTemporaryAccommodationAlternative(true);
  }, []);

  const handleDeleteTemporaryAccommodationAlternative = async () => {
    if (!deleteTemporaryAccommodationAlternativeData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const payload: DeleteProposedOfferTemporaryAccommodationAlternativeRequest = {
          ProposedOfferTemporaryAccommodationAlternativeDetailsId: deleteTemporaryAccommodationAlternativeData.ProposedOfferTemporaryAccommodationAlternativeDetailsId || 0,
          Uniquekey: deleteTemporaryAccommodationAlternativeData.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId)
        };

        const response = await proposedOfferService.apiCallDeleteTemporaryAccommodationAlternative(payload);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsConfirmationDialogBoxOpenTemporaryAccommodationAlternative(false);

          setDeleteTemporaryAccommodationAlternativeData(null);

          fetchTemporaryAccommodationAlternativeData();

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
      'Delete TAA Details'
    )
  };


  const handleConfirmationDialogBoxOpenGenerateTemporaryAccommodationAlternative = useCallback((row: ProposedOfferTemporaryAccommodationAlternativeData) => {
    setGenerateTemporaryAccommodationAlternativeData(row);
    setIsConfirmationDialogBoxOpenGenerateTemporaryAccommodationAlternative(true);
  }, []);

  const handleGenerateTemporaryAccommodationAlternative = async () => {
    if (!generateTemporaryAccommodationAlternativeData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const payload: AddUpdateGenerateProposedOfferRequest = {
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          ChargeType: 'TAA',
          Tenure: generateTemporaryAccommodationAlternativeData.Tenure,
          IsPayBrokerage: generateTemporaryAccommodationAlternativeData.IsPayBrokerage,
          IsAdditionalTemporaryAccommodationAlternative: generateTemporaryAccommodationAlternativeData.IsAdditionalTemporaryAccommodationAlternative
        };

        const response = await proposedOfferService.apiCallAddUpdateGenerateProposedOffer(payload);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsConfirmationDialogBoxOpenGenerateTemporaryAccommodationAlternative(false);

          fetchTemporaryAccommodationAlternativeData();

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

      'Generate TAA Details'
    )
  };

  const processedTemporaryAccommodationAlternativeList = useMemo(() => {
    const tenureCount = new Map<string, number>();

    rentDetailsList.forEach(item => {
      if (!item.Tenure) return;
      tenureCount.set(item.Tenure, (tenureCount.get(item.Tenure) || 0) + 1);
    });

    const seen = new Set<string>();

    return rentDetailsList.map(item => {
      if (!item.Tenure) return { ...item, _tenureRowSpan: 1 };

      if (!seen.has(item.Tenure)) {
        seen.add(item.Tenure);
        return { ...item, _tenureRowSpan: tenureCount.get(item.Tenure) };
      }

      return { ...item, _tenureRowSpan: 0 };
    });
  }, [rentDetailsList]);


  const rentDetailsColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'Type',
        label: 'Type',
        width: '15',
        sortable: false,
        align: 'left',
        fixed: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'Tenure',
        label: 'Tenure',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'IsAdditionalTemporaryAccommodationAlternative',
        label: 'Additional TAA',
        width: '10',
        sortable: false,
        align: 'center',
        render: (value) => value ? 'Yes' : 'No'
      },
      {
        key: 'IsPayBrokerage',
        label: 'Pay Brokerage',
        width: '10',
        sortable: false,
        align: 'center',
        render: (value) => value ? 'Yes' : 'No'
      },
      {
        key: 'Amount',
        label: 'Amount (₹)',
        width: '15',
        sortable: false,
        align: 'right',
        render: (value) => value ? `₹${value}` : '-'
      },
      {
        key: 'UnitSqFtLumsum',
        label: 'Unit / SqFt / Lumpsum',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'CarpetAreaSqFt',
        label: 'Carpet Area (Sq Ft)',
        width: '15',
        sortable: false,
        align: 'right',
        render: (value) => value ? `${value}` : '-'
      },
      {
        key: 'TemporaryAccommodationAlternativeStartDate',
        label: 'TAA Start Date',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'TemporaryAccommodationAlternativeEndDate',
        label: 'TAA End Date',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      
      {
        key: 'Action',
        label: 'Action',
        width: '15',
        sortable: false,
        align: 'center',
        fixed: 'right',
        render: (_value, row) => (
          <div className="flex items-center justify-center gap-1 min-w-[100px]">

            {canAction && row._tenureRowSpan !== 0 ? (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleConfirmationDialogBoxOpenGenerateTemporaryAccommodationAlternative(row);
                }}
                color="red"
                size="sm"
                title="Generate"
              >
                Generate
              </Button>
            ) : (
              <div className="w-[88px]" />
            )}

            {canAction && (
              <>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditTemporaryAccommodationAlternative(row);
                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>

                {/* Delete */}
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleConfirmationDialogBoxOpenTemporaryAccommodationAlternative(row);
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
    [canAction, handleEditTemporaryAccommodationAlternative, handleConfirmationDialogBoxOpenTemporaryAccommodationAlternative, handleConfirmationDialogBoxOpenGenerateTemporaryAccommodationAlternative]
  );

  return (
    <>
      <div className="space-y-6">
        {/* TemporaryAccommodationAlternative Details List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 border-b border-gray-500 pb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Temporary Accommodation Alternative Details List
              </h3>
            </div>
            {canAction && buildingId > 0 && (
              <Button
                onClick={handleAddTemporaryAccommodationAlternativeModal}
                 color="blue"
                variant="solid"
                colorMode="extraLight"
                style={{ width: '35px', height: '35px' }}
                centerIcon={<Plus className="h-4 w-4" />}>
              </Button>
            )}
          </div>

          <DataTable
            data={processedTemporaryAccommodationAlternativeList}
            columns={rentDetailsColumns}
            emptyMessage="No TAA Details Found"
            fixedHeight={false}
            recordsPerPage={20}
            className="min-w-full"
          />
        </div>
      </div>

      {/* ADD UPDATE RENT DETAILS MODAL */}
      <Modal
        isOpen={isAddUpdateTemporaryAccommodationAlternativeModalOpen}
        onClose={() => {
          setIsAddUpdateTemporaryAccommodationAlternativeModalOpen(false);
          setEditingTemporaryAccommodationAlternativeData(null);
          setFormDataTemporaryAccommodationAlternative(initialFormStateTemporaryAccommodationAlternative());
          setErrorsTemporaryAccommodationAlternative({});
        }}
        onCancel={() => {
          setIsAddUpdateTemporaryAccommodationAlternativeModalOpen(false);
          setEditingTemporaryAccommodationAlternativeData(null);
          setFormDataTemporaryAccommodationAlternative(initialFormStateTemporaryAccommodationAlternative());
          setErrorsTemporaryAccommodationAlternative({});
        }}
        title={editingTemporaryAccommodationAlternativeData ? 'Update TAA Details' : 'Add TAA Details'}
        onSubmit={handleAddUpdateTemporaryAccommodationAlternative}
        saveText={editingTemporaryAccommodationAlternativeData ? 'Update' : 'Add'}
        loading={isLoading}
        size='lg'
      >
        <div className="space-y-6 p-6 bg-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Checkbox
                label="Additional TAA"
                checked={!!formDataTemporaryAccommodationAlternative.IsAdditionalTemporaryAccommodationAlternative}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormDataTemporaryAccommodationAlternative(prev => ({
                    ...prev,
                    IsAdditionalTemporaryAccommodationAlternative: checked,
                    IsPayBrokerage: checked ? false : prev.IsPayBrokerage
                  }));
                }}
              />
            </div>
            <div className="flex items-center">
              <Checkbox
                label="Pay Brokerage"
                checked={!!formDataTemporaryAccommodationAlternative.IsPayBrokerage}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormDataTemporaryAccommodationAlternative(prev => ({
                    ...prev,
                    IsPayBrokerage: checked,
                    IsAdditionalTemporaryAccommodationAlternative: checked ? false : prev.IsAdditionalTemporaryAccommodationAlternative
                  }));
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <SinglePageSelection
                label="Type"
                placeholder='Select Type'
                required
                value={formDataTemporaryAccommodationAlternative.Type || ''}
                onChange={(e) => handleFieldChangeTemporaryAccommodationAlternative('Type', String(e))}
                options={FLAT_UNIT_TYPE
                  .filter(opt => opt.id === 'Commercial' || opt.id === 'Residential')
                  .map(opt => ({
                    label: opt.name,
                    value: opt.id
                  }))
                }
                error={errorsTemporaryAccommodationAlternative.Type}
              />
            </div>

            {formDataTemporaryAccommodationAlternative.IsAdditionalTemporaryAccommodationAlternative ? "" :
              <div>
                <SinglePageSelection
                  label="Tenure"
                  placeholder='Select Tenure'
                  required
                  value={formDataTemporaryAccommodationAlternative.Tenure || ''}
                  onChange={(e) => handleFieldChangeTemporaryAccommodationAlternative('Tenure', String(e))}
                  options={TENURE.map((opt) => ({ label: opt.name, value: opt.id }))}
                  error={errorsTemporaryAccommodationAlternative.Tenure}
                />
              </div>
            }
            <div>
              <Input
                label="Amount (₹)"
                required
                type="text"
                rightIcon="₹"
                value={formDataTemporaryAccommodationAlternative.Amount || ''}
                onChange={(e) => {
                  const val = filterNumbersWithDecimal(e.target.value);
                  handleFieldChangeTemporaryAccommodationAlternative('Amount', val);
                }}
                error={errorsTemporaryAccommodationAlternative.Amount}
                placeholder="Enter Amount"
              />
            </div>
            <div>
              <SinglePageSelection
                label="Unit / SqFt / Lumpsum"
                placeholder='Select Unit / SqFt / Lumpsum'
                required
                value={formDataTemporaryAccommodationAlternative.UnitSqFtLumsum || ''}
                onChange={(e) => handleFieldChangeTemporaryAccommodationAlternative('UnitSqFtLumsum', String(e))}
                options={UNIT_SQFT_LUMPSUM.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errorsTemporaryAccommodationAlternative.UnitSqFtLumsum}
              />
            </div>
            <div>
              <Input
                label="Carpet Area (Sq Ft)"
                type="text"
                value={formDataTemporaryAccommodationAlternative.CarpetAreaSqFt || ''}
                onChange={(e) => {
                  const val = filterNumbersWithDecimal(e.target.value);
                  handleFieldChangeTemporaryAccommodationAlternative('CarpetAreaSqFt', val);
                }}
                error={errorsTemporaryAccommodationAlternative.CarpetAreaSqFt}
                placeholder="Enter Carpet Area"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <DatePickerInput
                  label="TAA Start Date *"
                  value={formatDate_dd_mm_yyyy(formDataTemporaryAccommodationAlternative.TemporaryAccommodationAlternativeStartDate)}
                  error={errorsTemporaryAccommodationAlternative.TemporaryAccommodationAlternativeStartDate}
                  onChange={(val) => handleFieldChangeTemporaryAccommodationAlternative('TemporaryAccommodationAlternativeStartDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                />
              </div>
              <div>
                <DatePickerInput
                  label="TAA End Date *"
                  value={formatDate_dd_mm_yyyy(formDataTemporaryAccommodationAlternative.TemporaryAccommodationAlternativeEndDate)}
                  error={errorsTemporaryAccommodationAlternative.TemporaryAccommodationAlternativeEndDate}
                  onChange={(val) => handleFieldChangeTemporaryAccommodationAlternative('TemporaryAccommodationAlternativeEndDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenTemporaryAccommodationAlternative}
        onClose={() => {
          setIsConfirmationDialogBoxOpenTemporaryAccommodationAlternative(false);
          setDeleteTemporaryAccommodationAlternativeData(null);
        }}
        onConfirm={handleDeleteTemporaryAccommodationAlternative}
        loading={isLoading}
        pageName='rent'
      />

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenGenerateTemporaryAccommodationAlternative}
        onClose={() => {
          setIsConfirmationDialogBoxOpenGenerateTemporaryAccommodationAlternative(false);
          setGenerateTemporaryAccommodationAlternativeData(null);
        }}
        onConfirm={handleGenerateTemporaryAccommodationAlternative}
        loading={isLoading}
        pageName='Temporary Accommodation Alternative'
        title='Are sure you want generate TAA?'
        message="Once the Temporary Accommodation Alternative is generated, it cannot be deleted"
        confirmText='Generate'
        variant='generate'
      />


    </>
  );
};

