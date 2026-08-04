import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ProposedOfferRentDetailsData,
  FilterWithPaginationProposedOfferRentDetailsRequest,
  AddUpdateProposedOfferRentDetailsRequest,
  DeleteProposedOfferRentDetailsRequest,
  AddUpdateGenerateProposedOfferRequest,
} from '@/features/proposedOffer/models/ProposedOfferModel';
import { proposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { filterNumbersWithDecimal } from '@/core/utils/fileValidation';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { Modal } from '@/ui/components/Modal/Modal';
import { Edit, Trash2 } from 'lucide-react';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { Checkbox } from '@/ui/components/forms/Checkbox';
import { BROKERAGE_OPTIONS, FLAT_UNIT_TYPE, MODE_OPTIONS, TENURE, UNIT_SQFT_LUMPSUM } from '@/core/constants';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import DatePickerInput from '@/ui/components/forms/Datepicker';
import { initialFormStateRentDetails, initialFormStateRentOfferedDetails } from '../utils/initialStates';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { TextArea } from '@/ui/components/forms/Textarea';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';

interface RentDetailsTabProps {
  projectId: number | null;
  buildingId: number;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

export const RentDetailsTab: React.FC<RentDetailsTabProps> = ({
  projectId,
  buildingId,
  isLoading,
  setIsLoading,
  setLoadingMessage,
}) => {
  const [rentDetailsList, setRentDetailsList] = useState<ProposedOfferRentDetailsData[]>([]);
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions();
  const [errorsRentDetails, setErrorsRentDetails] = useState<{ [k: string]: string }>({});
  const [editingRentDetailsData, setEditingRentDetailsData] = useState<ProposedOfferRentDetailsData | null>(null);
  const [isAddUpdateRentDetailsModalOpen, setIsAddUpdateRentDetailsModalOpen] = useState(false);
  const [formDataRentDetails, setFormDataRentDetails] = useState<AddUpdateProposedOfferRentDetailsRequest>(() => initialFormStateRentDetails());

  const [formDataRentOfferedDetails, setFormDataRentOfferedDetails] = useState<ProposedOfferRentDetailsData>(() => initialFormStateRentOfferedDetails());
  const [errorsRentOfferedDetails, setErrorsRentOfferedDetails] = useState<{ [k: string]: string }>({});

  const [isConfirmationDialogBoxOpenRentDetails, setIsConfirmationDialogBoxOpenRentDetails] = useState(false);
  const [deleteRentDetailsData, setDeleteRentDetailsData] = useState<ProposedOfferRentDetailsData | null>(null);
  const [generateRentDetailsData, setGenerateRentDetailsData] = useState<ProposedOfferRentDetailsData | null>(null);
  const [isConfirmationDialogBoxOpenGenerateRentDetails, setIsConfirmationDialogBoxOpenGenerateRentDetails] = useState(false);

  useEffect(() => {
    if (!projectId || !buildingId) return;
    setErrorsRentDetails({});
    fetchRentDetailsData();

  }, [projectId, buildingId]);

  const handleFieldChangeRentDetails = (field: keyof AddUpdateProposedOfferRentDetailsRequest, value: any) => {
    setFormDataRentDetails((prev) => ({ ...prev, [field]: value }));
    if (errorsRentDetails[field]) {
      setErrorsRentDetails((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFieldChangeRentOfferedDetails = (field: keyof ProposedOfferRentDetailsData, value: any) => {
    setFormDataRentOfferedDetails((prev) => ({ ...prev, [field]: value }));
    if (errorsRentOfferedDetails[field]) {
      setErrorsRentOfferedDetails((prev) => ({ ...prev, [field]: "" }));
    }
  };



  const fetchRentDetailsData = async () => {

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationProposedOfferRentDetailsRequest = {
          ProjectId: Number(projectId),
          BuildingId: buildingId
        };

        const response = await proposedOfferService.apiCallPullRentDetails(params);

        if (E.isRight(response)) {

          const data = response.right.Data || [];

          setRentDetailsList(data);

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
      'Loading Rent Details'
    );
  };

  const handleAddRentDetailsModal = () => {
    setEditingRentDetailsData(null);
    setFormDataRentDetails({
      ...initialFormStateRentDetails(),
      ProjectId: Number(projectId),
      BuildingId: buildingId
    });
    setErrorsRentDetails({});
    setIsAddUpdateRentDetailsModalOpen(true);
  };

  const handleEditRentDetails = useCallback((row: ProposedOfferRentDetailsData) => {
    setEditingRentDetailsData(row);
    setFormDataRentDetails({
      ProposedOfferRentDetailsId: row.ProposedOfferRentDetailsId || 0,
      Uniquekey: row.Uniquekey || initialFormStateRentDetails().Uniquekey,
      BuildingId: buildingId,
      ProjectId: Number(projectId),
      IsAdditionalRent: row.IsAdditionalRent ?? false,
      Type: row.Type || '',
      Tenure: row.Tenure || '',
      Amount: row.Amount ?? 0,
      UnitSqFtLumsum: row.UnitSqFtLumsum || '',
      CarpetAreaSqFt: row.CarpetAreaSqFt ?? 0,
      RentStartDate: row.RentStartDate || '',
      RentEndDate: row.RentEndDate || '',
      IsPayBrokerage: row.IsPayBrokerage ?? false
    });

    setErrorsRentDetails({});
    setIsAddUpdateRentDetailsModalOpen(true);
  }, [projectId, buildingId]);





  const validateRentOfferedDetailsForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataRentOfferedDetails.RentOfferedToResidential) {
      newErrors.RentOfferedToResidential = "Rent Offered To Residential (in Rs. /Sq.ft) is required "
    }

    if (!formDataRentOfferedDetails.RentOfferedToCommercial) {
      newErrors.RentOfferedToCommercial = "Rent Offered To Commercial (in Rs. /Sq.ft) is required"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const validateRentDetailsForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataRentDetails.Type?.trim()) {
      newErrors.Type = "Type is required"
    }

    if (formDataRentDetails.IsAdditionalRent === false && !formDataRentDetails.Tenure?.trim()) {
      newErrors.Tenure = "Tenure is required"
    }

    if (!formDataRentDetails.Amount) {
      newErrors.Amount = "Amount is required"
    }

    if (!formDataRentDetails.UnitSqFtLumsum?.trim()) {
      newErrors.UnitSqFtLumsum = "Unit / SqFt / Lumsum is required"
    }
    if (!formDataRentDetails.Mode || formDataRentDetails.Mode?.trim() === "") {
      newErrors.Mode = "Mode is required"
    }
    if (!formDataRentDetails.Brokerage) {
      newErrors.Brokerage = "Brokerage is required"
    }

    if (!formDataRentDetails.RentStartDate || formDataRentDetails.RentStartDate.trim() === "") {
      newErrors.RentStartDate = "Rent Start Date is required"
    }

    if (!formDataRentDetails.RentEndDate || formDataRentDetails.RentEndDate.trim() === "") {
      newErrors.RentEndDate = "Rent End Date is required"
    }

    if (!formDataRentDetails.CarpetAreaSqFt) {
      newErrors.CarpetAreaSqFt = "Carpet Area Sq Ft is required"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleSaveRentOfferedDetails = async () => {

    const validation = validateRentOfferedDetailsForm()

    if (!validation.isValid) {
      setErrorsRentOfferedDetails(validation.errors)
      return
    }

  }

  const handleAddUpdateRentDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorsRentDetails({});

    const validation = validateRentDetailsForm();

    if (!validation.isValid) {
      setErrorsRentDetails(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload: AddUpdateProposedOfferRentDetailsRequest = {
          ProposedOfferRentDetailsId: formDataRentDetails.ProposedOfferRentDetailsId,
          Uniquekey: formDataRentDetails.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          IsAdditionalRent: formDataRentDetails.IsAdditionalRent || false,
          Type: formDataRentDetails.Type || "",
          Tenure: formDataRentDetails.Tenure || "",
          Amount: formDataRentDetails.Amount || 0,
          UnitSqFtLumsum: formDataRentDetails.UnitSqFtLumsum || "",
          CarpetAreaSqFt: formDataRentDetails.CarpetAreaSqFt || 0,
          RentStartDate: formDataRentDetails.RentStartDate,
          RentEndDate: formDataRentDetails.RentEndDate,
          IsPayBrokerage: formDataRentDetails.IsPayBrokerage || false
        };

        const response = await proposedOfferService.apiCallAddUpdateRentDetails(payload);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsAddUpdateRentDetailsModalOpen(false);

          setEditingRentDetailsData(null);

          setFormDataRentDetails(initialFormStateRentDetails());

          setErrorsRentDetails({});

          fetchRentDetailsData();

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
      Number(formDataRentDetails.ProposedOfferRentDetailsId) === 0 ? 'Add Rent Details' : 'Update Rent Details'
    )
  };

  const handleConfirmationDialogBoxOpenRentDetails = useCallback((row: ProposedOfferRentDetailsData) => {
    setDeleteRentDetailsData(row);
    setIsConfirmationDialogBoxOpenRentDetails(true);
  }, []);

  const handleDeleteRentDetails = async () => {
    if (!deleteRentDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const payload: DeleteProposedOfferRentDetailsRequest = {
          ProposedOfferRentDetailsId: deleteRentDetailsData.ProposedOfferRentDetailsId || 0,
          Uniquekey: deleteRentDetailsData.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId)
        };

        const response = await proposedOfferService.apiCallDeleteRentDetails(payload);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsConfirmationDialogBoxOpenRentDetails(false);

          setDeleteRentDetailsData(null);

          fetchRentDetailsData();

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
      'Delete Rent Details'
    )
  };


  const handleConfirmationDialogBoxOpenGenerateRentDetails = useCallback((row: ProposedOfferRentDetailsData) => {
    setGenerateRentDetailsData(row);
    setIsConfirmationDialogBoxOpenGenerateRentDetails(true);
  }, []);

  const handleGenerateRentDetails = async () => {
    if (!generateRentDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const payload: AddUpdateGenerateProposedOfferRequest = {
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          ChargeType: 'Rent',
          Tenure: generateRentDetailsData.Tenure,
          IsPayBrokerage: generateRentDetailsData.IsPayBrokerage,
          IsAdditionalRent: generateRentDetailsData.IsAdditionalRent
        };

        const response = await proposedOfferService.apiCallAddUpdateGenerateProposedOffer(payload);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsConfirmationDialogBoxOpenGenerateRentDetails(false);

          fetchRentDetailsData();

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

      'Generate Rent Details'
    )
  };

  const processedRentDetailsList = useMemo(() => {
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
        key: 'Amount',
        label: 'Amount (₹)',
        width: '15',
        sortable: false,
        align: 'right',
        render: (value) => value ? `₹${value}` : '-'
      },
      {
        key: 'UnitSqFtLumsum',
        label: 'Unit / Sq Ft / Lumsum',
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
        key: 'RentStartDate',
        label: 'Rent Start Date',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'RentEndDate',
        label: 'Rent End Date',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'IsAdditionalRent',
        label: 'Additional Rent',
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
                  handleConfirmationDialogBoxOpenGenerateRentDetails(row);
                }}
                color="blue"
                size="sm"
                title="Generate"
              >
                Generate
              </Button>
            ) : (
              <div className="w-[88px]" />
            )}

            {/* Edit */}
            {canAction && (
              <>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditRentDetails(row);
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
                    handleConfirmationDialogBoxOpenRentDetails(row);
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
    [canAction, handleEditRentDetails, handleConfirmationDialogBoxOpenRentDetails, handleConfirmationDialogBoxOpenGenerateRentDetails]
  );

  return (
    <>
      <div className="space-y-6">
        {/* Rent Details List Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">
            Rent Offered Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="Rent Offered To Residential (in Rs. /Sq.ft)"
                required
                type="text"
                rightIcon="₹"
                value={formDataRentOfferedDetails.RentOfferedToResidential || ''}
                onChange={(e) => handleFieldChangeRentOfferedDetails('RentOfferedToResidential', filterNumbersWithDecimal(e.target.value))}
                error={errorsRentOfferedDetails.RentOfferedToResidential}
                placeholder="Enter Residential Rent Amount"
              />
            </div>

            <div>
              <Input
                label="Rent Offered To Commercial (in Rs. /Sq.ft)"
                required
                type="text"
                rightIcon="₹"
                value={formDataRentOfferedDetails.RentOfferedToCommercial || ''}
                onChange={(e) => handleFieldChangeRentOfferedDetails('RentOfferedToCommercial', filterNumbersWithDecimal(e.target.value))}
                error={errorsRentOfferedDetails.RentOfferedToCommercial}
                placeholder="Enter Commercial Rent Amount"
              />
            </div>
          </div>

          <div>
            <TextArea
              label="Remarks"
              className='thin-scroll'
              value={formDataRentOfferedDetails.Remark ?? ""}
              placeholder="Enter Remarks"
              onChange={(e) => handleFieldChangeRentOfferedDetails("Remark", e.target.value)}
              error={errorsRentOfferedDetails.Remark} />

          </div>



          <div className="flex items-center justify-between">
            <div className="flex-1 border-b border-gray-500 pb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Rent Details List
              </h3>

            </div>
            {canAction && buildingId > 0 && (
              <Button
                onClick={handleAddRentDetailsModal}
                color="blue"
                size="sm"
                title="Add Rent"
              >
                Add Rent
              </Button>
            )}
          </div>

          <DataTable
            data={processedRentDetailsList}
            columns={rentDetailsColumns}
            emptyMessage="No Rent Details Found"
            fixedHeight={false}
            recordsPerPage={20}
            className="min-w-full"
          />
        </div>
      </div>

      {/* ADD UPDATE RENT DETAILS MODAL */}
      <Modal
        isOpen={isAddUpdateRentDetailsModalOpen}
        onClose={() => {
          setIsAddUpdateRentDetailsModalOpen(false);
          setEditingRentDetailsData(null);
          setFormDataRentDetails(initialFormStateRentDetails());
          setErrorsRentDetails({});
        }}
        onCancel={() => {
          setIsAddUpdateRentDetailsModalOpen(false);
          setEditingRentDetailsData(null);
          setFormDataRentDetails(initialFormStateRentDetails());
          setErrorsRentDetails({});
        }}
        title={editingRentDetailsData ? 'Update Rent Details' : 'Add Rent Details'}
        onSubmit={handleAddUpdateRentDetails}
        saveText={editingRentDetailsData ? 'Update' : 'Add'}
        loading={isLoading}
        size='lg'
      >
        <div className="space-y-6 p-6 bg-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Checkbox
                label="Additional Rent"
                checked={!!formDataRentDetails.IsAdditionalRent}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormDataRentDetails(prev => ({
                    ...prev,
                    IsAdditionalRent: checked,
                    IsPayBrokerage: checked ? false : prev.IsPayBrokerage
                  }));
                }}
              />
            </div>
            <div className="flex items-center">
              <Checkbox
                label="Pay Brokerage"
                checked={!!formDataRentDetails.IsPayBrokerage}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormDataRentDetails(prev => ({
                    ...prev,
                    IsPayBrokerage: checked,
                    IsAdditionalRent: checked ? false : prev.IsAdditionalRent
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
                value={formDataRentDetails.Type || ''}
                onChange={(e) => handleFieldChangeRentDetails('Type', String(e))}
                options={FLAT_UNIT_TYPE
                  .filter(opt => opt.id !== 'Gym' && opt.id !== 'Void')
                  .map(opt => ({
                    label: opt.name,
                    value: opt.id
                  }))
                }
                error={errorsRentDetails.Type}
              />
            </div>

            {formDataRentDetails.IsAdditionalRent ? "" :
              <div>
                <SinglePageSelection
                  label="Tenure"
                  placeholder='Select Tenure'
                  required
                  value={formDataRentDetails.Tenure || ''}
                  onChange={(e) => handleFieldChangeRentDetails('Tenure', String(e))}
                  options={TENURE.map((opt) => ({ label: opt.name, value: opt.id }))}
                  error={errorsRentDetails.Tenure}
                />
              </div>
            }
            <div>
              <Input
                label="Amount (₹)"
                required
                type="text"
                rightIcon="₹"
                value={formDataRentDetails.Amount || ''}
                onChange={(e) => {
                  const val = filterNumbersWithDecimal(e.target.value);
                  handleFieldChangeRentDetails('Amount', val);
                }}
                error={errorsRentDetails.Amount}
                placeholder="Enter Amount"
              />
            </div>
            <div>
              <SinglePageSelection
                label="Unit / Sq Ft / Lumsum"
                placeholder='Select Unit / Sq Ft / Lumsum'
                required
                value={formDataRentDetails.UnitSqFtLumsum || ''}
                onChange={(e) => handleFieldChangeRentDetails('UnitSqFtLumsum', String(e))}
                options={UNIT_SQFT_LUMPSUM.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errorsRentDetails.UnitSqFtLumsum}
              />
            </div>
            <div>
              <SinglePageSelection
                label="Mode"
                placeholder='Select Mode'
                required
                value={formDataRentDetails.Mode || ''}
                onChange={(e) => handleFieldChangeRentDetails('Mode', String(e))}
                options={MODE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errorsRentDetails.Mode}
              />
            </div>
            <div>
              <SinglePageSelection
                label="Brokerage"
                placeholder='Select Brokerage'
                required
                value={formDataRentDetails.Brokerage || ''}
                onChange={(e) => handleFieldChangeRentDetails('Brokerage', String(e))}
                options={BROKERAGE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errorsRentDetails.Brokerage}
              />
            </div>
            <div>
              <Input
                label="Carpet Area (Sq Ft)"
                required
                type="text"
                value={formDataRentDetails.CarpetAreaSqFt || ''}
                onChange={(e) => {
                  const val = filterNumbersWithDecimal(e.target.value);
                  handleFieldChangeRentDetails('CarpetAreaSqFt', val);
                }}
                error={errorsRentDetails.CarpetAreaSqFt}
                placeholder="Enter Carpet Area"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <DatePickerInput
                  label="Rent Start Date *"
                  value={formatDate_dd_mm_yyyy(formDataRentDetails.RentStartDate)}
                  error={errorsRentDetails.RentStartDate}
                  onChange={(val) => handleFieldChangeRentDetails('RentStartDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                />
              </div>
              <div>
                <DatePickerInput
                  label="Rent End Date *"
                  value={formatDate_dd_mm_yyyy(formDataRentDetails.RentEndDate)}
                  error={errorsRentDetails.RentEndDate}
                  onChange={(val) => handleFieldChangeRentDetails('RentEndDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                />
              </div>

            </div>

          </div>
        </div>
      </Modal>

      <div className='mt-5'>
        <BottomActionBar
          cancelText="Cancel"
          saveText={(formDataRentOfferedDetails.ProposedOfferRentDetailsId && formDataRentOfferedDetails.ProposedOfferRentDetailsId > 0) ? 'Update' : 'Add'}
          onCancel={() => {
            setFormDataRentOfferedDetails({
              ...initialFormStateRentOfferedDetails(),
              ProjectId: Number(projectId)
            });
            setErrorsRentOfferedDetails({});
          }}
          canAction={canAction}
          onSave={handleSaveRentOfferedDetails}
          isLoading={isLoading}
        />
      </div>


      {/* DELETE CONFIRMATION RENT DETAILS MODAL */}
      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenRentDetails}
        onClose={() => {
          setIsConfirmationDialogBoxOpenRentDetails(false);
          setDeleteRentDetailsData(null);
        }}
        onConfirm={handleDeleteRentDetails}
        loading={isLoading}
        pageName='rent'
      />

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenGenerateRentDetails}
        onClose={() => {
          setIsConfirmationDialogBoxOpenGenerateRentDetails(false);
          setGenerateRentDetailsData(null);
        }}
        onConfirm={handleGenerateRentDetails}
        loading={isLoading}
        pageName='rent'
        title='Are sure you want generate rent?'
        message="Once the rent is generated, it cannot be deleted"
        confirmText='Generate'
        variant='generate'
      />


    </>
  );
};

