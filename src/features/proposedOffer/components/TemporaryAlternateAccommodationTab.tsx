import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ProposedOfferTemporaryAlternateAccommodationData,
  FilterWithPaginationProposedOfferTemporaryAlternateAccommodationRequest,
  AddUpdateProposedOfferTemporaryAlternateAccommodationRequest,
  DeleteProposedOfferTemporaryAlternateAccommodationRequest,
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
import { initialFormStateTemporaryAlternateAccommodation } from '../utils/initialStates';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { isToDateGreaterOrEqualFromDate } from '@/core/utils/comman';
import TooltipText from '@/ui/components/Tooltip/TooltipText';

interface TemporaryAlternateAccommodationTabProps {
  projectId: number | null;
  buildingId: number;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

export const TemporaryAlternateAccommodationTab: React.FC<TemporaryAlternateAccommodationTabProps> = ({
  projectId,
  buildingId,
  isLoading,
  setIsLoading,
  setLoadingMessage,
}) => {
  const [rentDetailsList, setTemporaryAlternateAccommodationList] = useState<ProposedOfferTemporaryAlternateAccommodationData[]>([]);
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions();
  const [errorsTemporaryAlternateAccommodation, setErrorsTemporaryAlternateAccommodation] = useState<{ [k: string]: string }>({});
  const [editingTemporaryAlternateAccommodationData, setEditingTemporaryAlternateAccommodationData] = useState<ProposedOfferTemporaryAlternateAccommodationData | null>(null);
  const [isAddUpdateTemporaryAlternateAccommodationModalOpen, setIsAddUpdateTemporaryAlternateAccommodationModalOpen] = useState(false);
  const [formDataTemporaryAlternateAccommodation, setFormDataTemporaryAlternateAccommodation] = useState<AddUpdateProposedOfferTemporaryAlternateAccommodationRequest>(() => initialFormStateTemporaryAlternateAccommodation());
  const [isConfirmationDialogBoxOpenTemporaryAlternateAccommodation, setIsConfirmationDialogBoxOpenTemporaryAlternateAccommodation] = useState(false);
  const [deleteTemporaryAlternateAccommodationData, setDeleteTemporaryAlternateAccommodationData] = useState<ProposedOfferTemporaryAlternateAccommodationData | null>(null);
  const [generateTemporaryAlternateAccommodationData, setGenerateTemporaryAlternateAccommodationData] = useState<ProposedOfferTemporaryAlternateAccommodationData | null>(null);
  const [isConfirmationDialogBoxOpenGenerateTemporaryAlternateAccommodation, setIsConfirmationDialogBoxOpenGenerateTemporaryAlternateAccommodation] = useState(false);

  useEffect(() => {
    if (!projectId || !buildingId) return;
    setErrorsTemporaryAlternateAccommodation({});
    fetchTemporaryAlternateAccommodationData();

  }, [projectId, buildingId]);

  const handleFieldChangeTemporaryAlternateAccommodation = (field: keyof AddUpdateProposedOfferTemporaryAlternateAccommodationRequest, value: any) => {
    setFormDataTemporaryAlternateAccommodation((prev) => ({ ...prev, [field]: value }));
    if (errorsTemporaryAlternateAccommodation[field]) {
      setErrorsTemporaryAlternateAccommodation((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const fetchTemporaryAlternateAccommodationData = async () => {

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationProposedOfferTemporaryAlternateAccommodationRequest = {
          ProjectId: Number(projectId),
          BuildingId: buildingId
        };

        const response = await proposedOfferService.apiCallPullTemporaryAlternateAccommodation(params);

        if (E.isRight(response)) {

          const data = response.right.Data || [];

          setTemporaryAlternateAccommodationList(data);

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

  const handleAddTemporaryAlternateAccommodationModal = () => {
    setEditingTemporaryAlternateAccommodationData(null);
    setFormDataTemporaryAlternateAccommodation({
      ...initialFormStateTemporaryAlternateAccommodation(),
      ProjectId: Number(projectId),
      BuildingId: buildingId
    });
    setErrorsTemporaryAlternateAccommodation({});
    setIsAddUpdateTemporaryAlternateAccommodationModalOpen(true);
  };

  const handleEditTemporaryAlternateAccommodation = useCallback((row: ProposedOfferTemporaryAlternateAccommodationData) => {
    setEditingTemporaryAlternateAccommodationData(row);
    setFormDataTemporaryAlternateAccommodation({
      ProposedOfferTemporaryAlternateAccommodationDetailsId: row.ProposedOfferTemporaryAlternateAccommodationDetailsId || 0,
      Uniquekey: row.Uniquekey || initialFormStateTemporaryAlternateAccommodation().Uniquekey,
      BuildingId: buildingId,
      ProjectId: Number(projectId),
      IsAdditionalTemporaryAlternateAccommodation: row.IsAdditionalTemporaryAlternateAccommodation ?? false,
      Type: row.Type || '',
      Tenure: row.Tenure || '',
      Amount: row.Amount ?? 0,
      UnitSqFtLumsum: row.UnitSqFtLumsum || '',
      CarpetAreaSqFt: row.CarpetAreaSqFt ?? 0,
      TemporaryAlternateAccommodationStartDate: row.TemporaryAlternateAccommodationStartDate || '',
      TemporaryAlternateAccommodationEndDate: row.TemporaryAlternateAccommodationEndDate || '',
      IsPayBrokerage: row.IsPayBrokerage ?? false,
      IsPayTAA: row.IsPayTAA ?? false
    });

    setErrorsTemporaryAlternateAccommodation({});
    setIsAddUpdateTemporaryAlternateAccommodationModalOpen(true);
  }, [projectId, buildingId]);

  const validateTemporaryAlternateAccommodationForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataTemporaryAlternateAccommodation.Type?.trim()) {
      newErrors.Type = "Type is required"
    }

    if (formDataTemporaryAlternateAccommodation.IsAdditionalTemporaryAlternateAccommodation === false && !formDataTemporaryAlternateAccommodation.Tenure?.trim()) {
      newErrors.Tenure = "Tenure is required"
    }

    if (!formDataTemporaryAlternateAccommodation.Amount) {
      newErrors.Amount = "Amount is required"
    }

    if (!formDataTemporaryAlternateAccommodation.UnitSqFtLumsum?.trim()) {
      newErrors.UnitSqFtLumsum = "Unit / SqFt / Lumpsum is required"
    }


    const hasFromDate = !!formDataTemporaryAlternateAccommodation.TemporaryAlternateAccommodationStartDate;
    const hasToDate = !!formDataTemporaryAlternateAccommodation.TemporaryAlternateAccommodationEndDate;

    if (hasFromDate && hasToDate) {
      const fromDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formDataTemporaryAlternateAccommodation.TemporaryAlternateAccommodationStartDate ? new Date(formDataTemporaryAlternateAccommodation.TemporaryAlternateAccommodationStartDate) : undefined);
      const toDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formDataTemporaryAlternateAccommodation.TemporaryAlternateAccommodationEndDate ? new Date(formDataTemporaryAlternateAccommodation.TemporaryAlternateAccommodationEndDate) : undefined);


      if (!formDataTemporaryAlternateAccommodation.TemporaryAlternateAccommodationStartDate || formDataTemporaryAlternateAccommodation.TemporaryAlternateAccommodationStartDate.trim() === "") {
        newErrors.TemporaryAlternateAccommodationStartDate = "TAA Start Date is required"
      }

      if (!formDataTemporaryAlternateAccommodation.TemporaryAlternateAccommodationEndDate || formDataTemporaryAlternateAccommodation.TemporaryAlternateAccommodationEndDate.trim() === "") {
        newErrors.TemporaryAlternateAccommodationEndDate = "TAA End Date is required"
      }

      if (hasFromDate && hasToDate) {
        if (!isToDateGreaterOrEqualFromDate(fromDate, toDate)) {
          newErrors.TemporaryAlternateAccommodationEndDate = "TAA To Date must be greater than or equal to TAA From Date.";
        }
      }
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleAddUpdateTemporaryAlternateAccommodation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorsTemporaryAlternateAccommodation({});

    const validation = validateTemporaryAlternateAccommodationForm();

    if (!validation.isValid) {
      setErrorsTemporaryAlternateAccommodation(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload: AddUpdateProposedOfferTemporaryAlternateAccommodationRequest = {
          ProposedOfferTemporaryAlternateAccommodationDetailsId: formDataTemporaryAlternateAccommodation.ProposedOfferTemporaryAlternateAccommodationDetailsId,
          Uniquekey: formDataTemporaryAlternateAccommodation.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          IsAdditionalTemporaryAlternateAccommodation: formDataTemporaryAlternateAccommodation.IsAdditionalTemporaryAlternateAccommodation || false,
          Type: formDataTemporaryAlternateAccommodation.Type || "",
          Tenure: formDataTemporaryAlternateAccommodation.Tenure || "",
          Amount: formDataTemporaryAlternateAccommodation.Amount || 0,
          UnitSqFtLumsum: formDataTemporaryAlternateAccommodation.UnitSqFtLumsum || "",
          CarpetAreaSqFt: formDataTemporaryAlternateAccommodation.CarpetAreaSqFt || 0,
          TemporaryAlternateAccommodationStartDate: formDataTemporaryAlternateAccommodation.TemporaryAlternateAccommodationStartDate === "" ? null : formDataTemporaryAlternateAccommodation.TemporaryAlternateAccommodationStartDate,
          TemporaryAlternateAccommodationEndDate: formDataTemporaryAlternateAccommodation.TemporaryAlternateAccommodationEndDate === "" ? null : formDataTemporaryAlternateAccommodation.TemporaryAlternateAccommodationEndDate,
          IsPayBrokerage: formDataTemporaryAlternateAccommodation.IsPayBrokerage || false,
          IsPayTAA: formDataTemporaryAlternateAccommodation.IsPayTAA || false
        };

        const response = await proposedOfferService.apiCallAddUpdateTemporaryAlternateAccommodation(payload);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsAddUpdateTemporaryAlternateAccommodationModalOpen(false);

          setEditingTemporaryAlternateAccommodationData(null);

          setFormDataTemporaryAlternateAccommodation(initialFormStateTemporaryAlternateAccommodation());

          setErrorsTemporaryAlternateAccommodation({});

          fetchTemporaryAlternateAccommodationData();

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
      Number(formDataTemporaryAlternateAccommodation.ProposedOfferTemporaryAlternateAccommodationDetailsId) === 0 ? 'Add TAA' : 'Update TAA'
    )
  };

  const handleConfirmationDialogBoxOpenTemporaryAlternateAccommodation = useCallback((row: ProposedOfferTemporaryAlternateAccommodationData) => {
    setDeleteTemporaryAlternateAccommodationData(row);
    setIsConfirmationDialogBoxOpenTemporaryAlternateAccommodation(true);
  }, []);

  const handleDeleteTemporaryAlternateAccommodation = async () => {
    if (!deleteTemporaryAlternateAccommodationData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const payload: DeleteProposedOfferTemporaryAlternateAccommodationRequest = {
          ProposedOfferTemporaryAlternateAccommodationDetailsId: deleteTemporaryAlternateAccommodationData.ProposedOfferTemporaryAlternateAccommodationDetailsId || 0,
          Uniquekey: deleteTemporaryAlternateAccommodationData.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId)
        };

        const response = await proposedOfferService.apiCallDeleteTemporaryAlternateAccommodation(payload);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsConfirmationDialogBoxOpenTemporaryAlternateAccommodation(false);

          setDeleteTemporaryAlternateAccommodationData(null);

          fetchTemporaryAlternateAccommodationData();

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


  const handleConfirmationDialogBoxOpenGenerateTemporaryAlternateAccommodation = useCallback((row: ProposedOfferTemporaryAlternateAccommodationData) => {
    setGenerateTemporaryAlternateAccommodationData(row);
    setIsConfirmationDialogBoxOpenGenerateTemporaryAlternateAccommodation(true);
  }, []);

  const handleGenerateTemporaryAlternateAccommodation = async () => {
    if (!generateTemporaryAlternateAccommodationData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const payload: AddUpdateGenerateProposedOfferRequest = {
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          ChargeType: 'TAA',
          Tenure: generateTemporaryAlternateAccommodationData.Tenure,
          IsPayBrokerage: generateTemporaryAlternateAccommodationData.IsPayBrokerage,
          IsPayTAA: generateTemporaryAlternateAccommodationData.IsPayTAA,
          IsAdditionalTemporaryAlternateAccommodation: generateTemporaryAlternateAccommodationData.IsAdditionalTemporaryAlternateAccommodation
        };

        const response = await proposedOfferService.apiCallAddUpdateGenerateProposedOffer(payload);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsConfirmationDialogBoxOpenGenerateTemporaryAlternateAccommodation(false);

          fetchTemporaryAlternateAccommodationData();

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

  const processedTemporaryAlternateAccommodationList = useMemo(() => {

    const tenureCount = new Map<string, number>();

    rentDetailsList.forEach(item => {
      if (!item.IsAdditionalTemporaryAlternateAccommodation && item.Tenure) {
        tenureCount.set(item.Tenure, (tenureCount.get(item.Tenure) || 0) + 1);
      }
    });

    const seenTenure = new Set<string>();

    let additionalTAAShown = false;

    return rentDetailsList.map(item => {
      let tenureRowSpan = 1;

      if (!item.IsAdditionalTemporaryAlternateAccommodation && item.Tenure) {
        if (!seenTenure.has(item.Tenure)) {
          seenTenure.add(item.Tenure);
          tenureRowSpan = tenureCount.get(item.Tenure)!;
        } else {
          tenureRowSpan = 0;
        }
      }

      const showAdditionalGenerate = item.IsAdditionalTemporaryAlternateAccommodation && !additionalTAAShown;

      if (showAdditionalGenerate) {
        additionalTAAShown = true;
      }

      return {
        ...item,
        _tenureRowSpan: tenureRowSpan,
        _showAdditionalGenerate: showAdditionalGenerate,
      };
    });
  }, [rentDetailsList]);

  const tenureGenerateMap = useMemo(() => {
    const map = new Map<string, boolean>();

    const groups = new Map<string, ProposedOfferTemporaryAlternateAccommodationData[]>();

    rentDetailsList.forEach(item => {
      if (!item.Tenure) return;

      if (!groups.has(item.Tenure)) {
        groups.set(item.Tenure, []);
      }

      groups.get(item.Tenure)!.push(item);
    });

    groups.forEach((rows, tenure) => {
      const canGenerate = rows.every(r =>
        !!r.TemporaryAlternateAccommodationStartDate &&
        !!r.TemporaryAlternateAccommodationEndDate
      );

      map.set(tenure, canGenerate);
    });

    return map;
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
        key: 'IsAdditionalTemporaryAlternateAccommodation',
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
        key: 'IsPayTAA',
        label: 'Pay TAA',
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
        label: 'Carpet Area (SqFt)',
        width: '15',
        sortable: false,
        align: 'right',
        render: (value) => value ? `${value}` : '-'
      },
      {
        key: 'TemporaryAlternateAccommodationStartDate',
        label: 'TAA Start Date',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'TemporaryAlternateAccommodationEndDate',
        label: 'TAA End Date',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: "ModifiedBy",
        label: "Last Modified By",
        width: "33",
        sortable: false,
        align: "left",
        render: (value, row) => <TooltipText text={value || row.CreatedBy || "-"} maxWidth="180px" tooltipThreshold={18} />,
      },
      {
        key: "ModifiedDate",
        label: "Last Modified Date",
        width: "33",
        sortable: false,
        align: "left",
        render: (value, row) =>
          value ? formatDate_dd_MonthName_yy(value) : row.CreatedDate ? formatDate_dd_MonthName_yy(row.CreatedDate) : "-",
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

            {canAction &&
              (
                (row.IsAdditionalTemporaryAlternateAccommodation && row.TemporaryAlternateAccommodationStartDate && row.TemporaryAlternateAccommodationEndDate && row._showAdditionalGenerate) ||

                (!row.IsAdditionalTemporaryAlternateAccommodation && row._tenureRowSpan !== 0 && tenureGenerateMap.get(row.Tenure ?? ""))
              ) ? (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleConfirmationDialogBoxOpenGenerateTemporaryAlternateAccommodation(row);
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
                    handleEditTemporaryAlternateAccommodation(row);
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
                    handleConfirmationDialogBoxOpenTemporaryAlternateAccommodation(row);
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
    [canAction, tenureGenerateMap, handleEditTemporaryAlternateAccommodation, handleConfirmationDialogBoxOpenTemporaryAlternateAccommodation, handleConfirmationDialogBoxOpenGenerateTemporaryAlternateAccommodation]
  );

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 border-b border-gray-500 pb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Temporary Alternate Accommodation List
              </h3>
            </div>
            {canAction && buildingId > 0 && (
              <Button
                onClick={handleAddTemporaryAlternateAccommodationModal}
                color="blue"
                variant="solid"
                colorMode="extraLight"
                style={{ width: '35px', height: '35px' }}
                centerIcon={<Plus className="h-4 w-4" />}>
              </Button>
            )}
          </div>

          <DataTable
            data={processedTemporaryAlternateAccommodationList}
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
        isOpen={isAddUpdateTemporaryAlternateAccommodationModalOpen}
        onClose={() => {
          setIsAddUpdateTemporaryAlternateAccommodationModalOpen(false);
          setEditingTemporaryAlternateAccommodationData(null);
          setFormDataTemporaryAlternateAccommodation(initialFormStateTemporaryAlternateAccommodation());
          setErrorsTemporaryAlternateAccommodation({});
        }}
        onCancel={() => {
          setIsAddUpdateTemporaryAlternateAccommodationModalOpen(false);
          setEditingTemporaryAlternateAccommodationData(null);
          setFormDataTemporaryAlternateAccommodation(initialFormStateTemporaryAlternateAccommodation());
          setErrorsTemporaryAlternateAccommodation({});
        }}
        title={editingTemporaryAlternateAccommodationData ? 'Update TAA Details' : 'Add TAA Details'}
        onSubmit={handleAddUpdateTemporaryAlternateAccommodation}
        saveText={editingTemporaryAlternateAccommodationData ? 'Update' : 'Add'}
        loading={isLoading}
        size='lg'
      >
        <div className="space-y-6 p-6 bg-blue-100">


          <div className="flex items-center">
            <Checkbox
              label="Dou You Want to Pay Temp Alternate Accom"
              checked={formDataTemporaryAlternateAccommodation.IsPayTAA ?? false}
              onChange={(e) => handleFieldChangeTemporaryAlternateAccommodation('IsPayTAA', e.target.checked)}
              disabled={formDataTemporaryAlternateAccommodation.IsAdditionalTemporaryAlternateAccommodation ?? false}
            />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Checkbox
                label="Additional TAA"
                checked={!!formDataTemporaryAlternateAccommodation.IsAdditionalTemporaryAlternateAccommodation}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormDataTemporaryAlternateAccommodation(prev => ({
                    ...prev,
                    IsAdditionalTemporaryAlternateAccommodation: checked,
                    IsPayBrokerage: checked ? false : prev.IsPayBrokerage
                  }));
                }}
                disabled={
                  (formDataTemporaryAlternateAccommodation.IsPayTAA ?? false) ||
                  (formDataTemporaryAlternateAccommodation.IsPayBrokerage ?? false)
                }
              />
            </div>

            <div className="flex items-center">
              <Checkbox
                label="Pay Brokerage"
                checked={!!formDataTemporaryAlternateAccommodation.IsPayBrokerage}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormDataTemporaryAlternateAccommodation(prev => ({
                    ...prev,
                    IsPayBrokerage: checked,
                    IsAdditionalTemporaryAlternateAccommodation: checked ? false : prev.IsAdditionalTemporaryAlternateAccommodation
                  }));
                }}
                disabled={formDataTemporaryAlternateAccommodation.IsAdditionalTemporaryAlternateAccommodation ?? false}
              />
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <SinglePageSelection
                label="Type"
                placeholder='Select Type'
                required
                value={formDataTemporaryAlternateAccommodation.Type || ''}
                onChange={(e) => handleFieldChangeTemporaryAlternateAccommodation('Type', String(e))}
                options={FLAT_UNIT_TYPE
                  .filter(opt => opt.id === 'Commercial' || opt.id === 'Residential')
                  .map(opt => ({
                    label: opt.name,
                    value: opt.id
                  }))
                }
                error={errorsTemporaryAlternateAccommodation.Type}
              />
            </div>

            {formDataTemporaryAlternateAccommodation.IsAdditionalTemporaryAlternateAccommodation ? "" :
              <div>
                <SinglePageSelection
                  label="Tenure"
                  placeholder='Select Tenure'
                  required
                  value={formDataTemporaryAlternateAccommodation.Tenure || ''}
                  onChange={(e) => handleFieldChangeTemporaryAlternateAccommodation('Tenure', String(e))}
                  options={TENURE.map((opt) => ({ label: opt.name, value: opt.id }))}
                  error={errorsTemporaryAlternateAccommodation.Tenure}
                />
              </div>
            }
            <div>
              <Input
                label="Amount (₹)"
                required
                type="text"
                rightIcon="₹"
                value={formDataTemporaryAlternateAccommodation.Amount || ''}
                onChange={(e) => {
                  const val = filterNumbersWithDecimal(e.target.value);
                  handleFieldChangeTemporaryAlternateAccommodation('Amount', val);
                }}
                error={errorsTemporaryAlternateAccommodation.Amount}
                placeholder="Enter Amount"
              />
            </div>
            <div>
              <SinglePageSelection
                label="Unit / SqFt / Lumpsum"
                placeholder='Select Unit / SqFt / Lumpsum'
                required
                value={formDataTemporaryAlternateAccommodation.UnitSqFtLumsum || ''}
                onChange={(e) => handleFieldChangeTemporaryAlternateAccommodation('UnitSqFtLumsum', String(e))}
                options={UNIT_SQFT_LUMPSUM.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errorsTemporaryAlternateAccommodation.UnitSqFtLumsum}
              />
            </div>
            <div>
              <Input
                label="Carpet Area (SqFt)"
                type="text"
                value={formDataTemporaryAlternateAccommodation.CarpetAreaSqFt || ''}
                onChange={(e) => {
                  const val = filterNumbersWithDecimal(e.target.value);
                  handleFieldChangeTemporaryAlternateAccommodation('CarpetAreaSqFt', val);
                }}
                error={errorsTemporaryAlternateAccommodation.CarpetAreaSqFt}
                rightIcon="SqFt"
                placeholder="Enter Carpet Area"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <DatePickerInput
                  label="TAA Start Date"
                  value={formatDate_dd_mm_yyyy(formDataTemporaryAlternateAccommodation.TemporaryAlternateAccommodationStartDate)}
                  error={errorsTemporaryAlternateAccommodation.TemporaryAlternateAccommodationStartDate}
                  onChange={(val) => handleFieldChangeTemporaryAlternateAccommodation('TemporaryAlternateAccommodationStartDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                />
              </div>
              <div>
                <DatePickerInput
                  label="TAA End Date"
                  value={formatDate_dd_mm_yyyy(formDataTemporaryAlternateAccommodation.TemporaryAlternateAccommodationEndDate)}
                  error={errorsTemporaryAlternateAccommodation.TemporaryAlternateAccommodationEndDate}
                  onChange={(val) => handleFieldChangeTemporaryAlternateAccommodation('TemporaryAlternateAccommodationEndDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenTemporaryAlternateAccommodation}
        onClose={() => {
          setIsConfirmationDialogBoxOpenTemporaryAlternateAccommodation(false);
          setDeleteTemporaryAlternateAccommodationData(null);
        }}
        onConfirm={handleDeleteTemporaryAlternateAccommodation}
        loading={isLoading}
        pageName='rent'
      />

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenGenerateTemporaryAlternateAccommodation}
        onClose={() => {
          setIsConfirmationDialogBoxOpenGenerateTemporaryAlternateAccommodation(false);
          setGenerateTemporaryAlternateAccommodationData(null);
        }}
        onConfirm={handleGenerateTemporaryAlternateAccommodation}
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

