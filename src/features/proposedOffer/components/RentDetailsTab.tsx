import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ProposedOfferRentDetailsData,
  FilterWithPaginationProposedOfferRentDetailsRequest,
  AddUpdateProposedOfferRentDetailsRequest,
  DeleteProposedOfferRentDetailsRequest,
} from '@/features/proposedOffer/models/ProposedOfferModel';
import { ProposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { filterNumbersWithDecimal } from '@/core/utils/fileValidation';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { Modal } from '@/ui/components/Modal/Modal';
import { Edit, Trash2 } from 'lucide-react';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { Checkbox } from '@/ui/components/forms/Checkbox';
import { FLAT_UNIT_TYPE, TENURE, UNIT_SQFT_LUMPSUM } from '@/core/constants';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import DatePickerInput from '@/ui/components/forms/Datepicker';
import { initialFormStateRentDetails } from '../utils/initialStates';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

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
  const [isConfirmationDialogBoxOpenRentDetails, setIsConfirmationDialogBoxOpenRentDetails] = useState(false);
  const [deleteRentDetailsData, setDeleteRentDetailsData] = useState<ProposedOfferRentDetailsData | null>(null);

  useEffect(() => {
    if (!projectId || !buildingId) return;

    fetchRentDetailsData();

  }, [projectId, buildingId]);

  const handleFieldChangeRentDetails = (field: keyof AddUpdateProposedOfferRentDetailsRequest, value: any) => {
    setFormDataRentDetails((prev) => ({ ...prev, [field]: value }));
    if (errorsRentDetails[field]) {
      setErrorsRentDetails((prev) => ({ ...prev, [field]: "" }));
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

        const response = await ProposedOfferService.apiCallPullRentDetails(params);

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

    if (!formDataRentDetails.RentStartDate || formDataRentDetails.RentStartDate.trim() === "") {
      newErrors.RentStartDate = "Rent Start Date is required"
    }

    if (!formDataRentDetails.RentEndDate || formDataRentDetails.RentEndDate.trim() === "") {
      newErrors.RentEndDate = "Rent End Date is required"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
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

        const response = await ProposedOfferService.apiCallAddUpdateRentDetails(payload);

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

        const response = await ProposedOfferService.apiCallDeleteRentDetails(payload);

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
        width: '10',
        sortable: false,
        align: 'center',
        fixed: 'right',
        render: (_value, row) => (
          <div className="flex items-center justify-center gap-2">
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
    [canAction, handleEditRentDetails, handleConfirmationDialogBoxOpenRentDetails]
  );

  return (
    <>
      <div className="space-y-6">
        {/* Rent Details List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 border-b border-gray-500 pb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Rent Details List
              </h3>
            </div>
            {canAction && (
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
            data={rentDetailsList}
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
        cancelText="Cancel"
        loading={isLoading}
        size='lg'
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Checkbox
                label="Is Additional Rent"
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
                label="Is Pay Brokerage"
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

    </>
  );
};

