import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as E from 'fp-ts/Either';
import { Input, Button } from '@/ui/components/forms';
import { Modal } from '@/ui/components/Modal/Modal';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { inventoryService } from '@/features/inventory/services/InventoryServices';
import type {
  InventoryFlatData,
  UpdateInventoryFlatRequest,
  AddInventoryFlatRequest,
  AddInventoryFlatSpecificationData
} from '@/features/inventory/models/InventoryMasterModel';
import useToast from '@/core/hooks/useToast';
import { runApiWithLoader } from '@/core/utils';
import { Loader } from '@/core/utils/loader';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { Edit, Trash2 } from 'lucide-react';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { TextArea } from "@/ui/components/forms/Textarea";
import { COMMERCIAL_FLAT_CONFIGURATION, FLAT_UNIT_FACING, FLAT_UNIT_TYPE, INVENTORY_FLAT_STATUS, RESIDENTIAL_FLAT_CONFIGURATION, UNIT_LAYOUT } from '@/core/constants';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { filterNumbersWithDecimal } from '@/core/utils/fileValidation';
import Checkbox from '@/ui/components/forms/Checkbox';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';

interface FormDataInventoryFlat {
  InventoryFlatId: number;
  Uniquekey: string;
  InventoryBuildingId: number;
  InventoryFlatFloorBasementPodiumWingId: number;
  InventoryFloorId: number;
  Flat: string;
  FlatType: string;
  RERACarpetAreaSqFt: number | null;
  FlatConfiguration: string;
  FlatStatus: InventoryFlatData['FlatStatus'] | '';
  FlatFacing: string;
  InventoryFlatSpecificationJSON: string;
  IsSameInventoryFlatSpecificationForSameRERACarpetAreaSqFt: boolean
}

interface FormDataInventoryFlatSpecification {
  FlatLayout: string;
  FlatLayoutAreaSqFt: number | null;
  FlatLayoutLengthSqFt: number | null;
  FlatLayoutWidthSqFt: number | null;
  Note: string;
}

const initialFormStateInventoryFlat = (flatData?: InventoryFlatData): FormDataInventoryFlat => ({

  InventoryFlatId: flatData?.InventoryFlatId || 0,
  Uniquekey: flatData?.Uniquekey || '',
  InventoryBuildingId: flatData?.InventoryBuildingId || 0,
  InventoryFlatFloorBasementPodiumWingId: flatData?.InventoryFlatFloorBasementPodiumWingId || 0,
  InventoryFloorId: flatData?.InventoryFloorId || 0,
  Flat: flatData?.Flat || '',
  FlatType: flatData?.FlatType || '',
  RERACarpetAreaSqFt: flatData?.RERACarpetAreaSqFt ?? null,
  FlatConfiguration: flatData?.FlatConfiguration || '',
  FlatStatus: flatData?.FlatStatus || '',
  FlatFacing: flatData?.FlatFacing || '',
  InventoryFlatSpecificationJSON: '',
  IsSameInventoryFlatSpecificationForSameRERACarpetAreaSqFt: false
});

const initialFormStateInventoryFlatSpecification = (): FormDataInventoryFlatSpecification => ({
  FlatLayout: '',
  FlatLayoutAreaSqFt: null,
  FlatLayoutLengthSqFt: null,
  FlatLayoutWidthSqFt: null,
  Note: '',
});

const InventorySpecification: React.FC = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const { canAction } = useMenuPermissions('/inventory');
  const { canAction: canBookingAction } = useMenuPermissions('/booking');

  const flatData = (location.state as { flat?: InventoryFlatData; projectId?: number })?.flat;
  const projectId = (location.state as { flat?: InventoryFlatData; projectId?: number })?.projectId;

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [, setInventoryFlatData] = useState<InventoryFlatData | null>(null);
  const [errorsInventoryFlat, setErrorsInventoryFlat] = useState<{ [k: string]: string }>({});
  const [errorsInventoryFlatSpecification, setErrorsInventoryFlatSpecification] = useState<{ [k: string]: string }>({});
  const [formDataInventoryFlat, setFormDataInventoryFlat] = useState<FormDataInventoryFlat>(() => initialFormStateInventoryFlat(flatData));
  const [specifications, setSpecifications] = useState<AddInventoryFlatSpecificationData[]>(flatData?.InventoryFlatSpecificationData || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<{ row: AddInventoryFlatSpecificationData; index: number } | null>(null);
  const [formDataInventoryFlatSpecification, setFormDataInventoryFlatSpecification] = useState<FormDataInventoryFlatSpecification>(() => initialFormStateInventoryFlatSpecification());

  // Delete confirmation dialog state
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [specificationToDelete, setSpecificationToDelete] = useState<{ index: number; layout: string } | null>(null);

  useEffect(() => {
    if (flatData) {
      setInventoryFlatData(flatData);
      setFormDataInventoryFlat(initialFormStateInventoryFlat(flatData));
      setSpecifications(flatData.InventoryFlatSpecificationData || []);
    } else {
      // If no flatData, initialize with empty form for new flat
      setFormDataInventoryFlat(initialFormStateInventoryFlat());
      setSpecifications([]);
    }
  }, [flatData, projectId]);

  const handleFieldChangeInventoryFlat = (field: keyof FormDataInventoryFlat, value: any) => {
    setFormDataInventoryFlat((prev) => ({ ...prev, [field]: value }));
    if (errorsInventoryFlat[field]) {
      setErrorsInventoryFlat((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFieldChangeInventoryFlatSpecification = (field: keyof FormDataInventoryFlatSpecification, value: any) => {
    setFormDataInventoryFlatSpecification((prev) => ({ ...prev, [field]: value }));
    if (errorsInventoryFlatSpecification[field]) {
      setErrorsInventoryFlatSpecification((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateInventoryFlatForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataInventoryFlat.Flat?.trim()) {
      newErrors.Flat = 'Unit is required'
    }

    if (!formDataInventoryFlat.FlatType?.trim()) {
      newErrors.FlatType = 'Unit Type is required'
    }

    if ((formDataInventoryFlat.FlatType?.trim().toUpperCase() === "RESIDENTIAL" || formDataInventoryFlat.FlatType?.trim().toUpperCase() === "COMMERCIAL") && !formDataInventoryFlat.FlatConfiguration?.trim()) {
      newErrors.FlatConfiguration = 'Unit Configuration is required'
    }

    if (!formDataInventoryFlat.FlatFacing) {
      newErrors.Facing = 'Facing is required'
    }

    if (!formDataInventoryFlat.FlatStatus) {
      newErrors.FlatStatus = 'Status is required'
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const validateInventoryFlatSpecificationForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataInventoryFlatSpecification.FlatLayout?.trim()) {
      newErrors.FlatLayout = 'Unit Layout is required'
    }

    if (!formDataInventoryFlatSpecification.FlatLayoutAreaSqFt) {
      newErrors.FlatLayoutAreaSqFt = 'Area (Sq.Ft) is required'
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleAddSpecification = () => {
    setEditingSpec(null);
    setFormDataInventoryFlatSpecification(initialFormStateInventoryFlatSpecification());
    setErrorsInventoryFlatSpecification({});
    setIsModalOpen(true);
  };

  const handleEditSpecification = useCallback((row: AddInventoryFlatSpecificationData, index: number) => {
    setEditingSpec({ row, index });
    setFormDataInventoryFlatSpecification({
      FlatLayout: row.FlatLayout || '',
      FlatLayoutAreaSqFt: row.FlatLayoutAreaSqFt ?? null,
      FlatLayoutLengthSqFt: row.FlatLayoutLengthSqFt ?? null,
      FlatLayoutWidthSqFt: row.FlatLayoutWidthSqFt ?? null,
      Note: row.Note || '',
    });
    setErrorsInventoryFlatSpecification({});
    setIsModalOpen(true);
  }, []);

  const handleDeleteSpecification = useCallback((index: number) => {
    const spec = specifications[index];
    if (spec) {
      setSpecificationToDelete({ index, layout: spec.FlatLayout || 'this specification' });
      setIsDeleteConfirmationOpen(true);
    }
  }, [specifications]);

  const handleConfirmDeleteSpecification = useCallback(() => {
    if (specificationToDelete !== null) {
      const updated = specifications.filter((_, i) => i !== specificationToDelete.index);
      setSpecifications(updated);
      setIsDeleteConfirmationOpen(false);
      setSpecificationToDelete(null);
      addToast({ type: 'success', title: 'Unit Specification Removed' });
    }
  }, [specificationToDelete, specifications, addToast]);

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorsInventoryFlatSpecification({});

    const validation = validateInventoryFlatSpecificationForm();

    if (!validation.isValid) {

      setErrorsInventoryFlatSpecification(validation.errors);

      return;

    }

    const newSpec: AddInventoryFlatSpecificationData = {

      InventoryFlatSpecificationId: editingSpec?.row.InventoryFlatSpecificationId ?? 0,
      Uniquekey: editingSpec?.row.Uniquekey || '',
      FlatLayout: formDataInventoryFlatSpecification.FlatLayout,
      FlatLayoutAreaSqFt: formDataInventoryFlatSpecification.FlatLayoutAreaSqFt ?? 0,
      FlatLayoutLengthSqFt: formDataInventoryFlatSpecification.FlatLayoutLengthSqFt ?? 0,
      FlatLayoutWidthSqFt: formDataInventoryFlatSpecification.FlatLayoutWidthSqFt ?? 0,
      Note: formDataInventoryFlatSpecification.Note,

    };

    setSpecifications(prev => {
      if (editingSpec) {

        const updated = [...prev];
        updated[editingSpec.index] = newSpec;
        return updated;

      }

      return [...prev, newSpec];
    });

    setIsModalOpen(false);
    setEditingSpec(null);
    setFormDataInventoryFlatSpecification(initialFormStateInventoryFlatSpecification());
    setErrorsInventoryFlatSpecification({});
  };

  const handleSave = async () => {

    const flatContext = flatData || {
      InventoryBuildingId: formDataInventoryFlat.InventoryBuildingId,
      InventoryFlatFloorBasementPodiumWingId: formDataInventoryFlat.InventoryFlatFloorBasementPodiumWingId,
      InventoryFloorId: formDataInventoryFlat.InventoryFloorId,
    };

    setErrorsInventoryFlat({});

    const validation = validateInventoryFlatForm();

    if (!validation.isValid) {
      setErrorsInventoryFlat(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const specificationsJSON = JSON.stringify(specifications.map(item => ({
          InventoryFlatSpecificationId: item.InventoryFlatSpecificationId ?? 0,
          FlatLayout: item.FlatLayout || '',
          FlatLayoutAreaSqFt: item.FlatLayoutAreaSqFt ?? 0,
          FlatLayoutLengthSqFt: item.FlatLayoutLengthSqFt ?? 0,
          FlatLayoutWidthSqFt: item.FlatLayoutWidthSqFt ?? 0,
          Note: item.Note || ''
        })));

        const isAdd = formDataInventoryFlat.InventoryFlatId === 0;

        if (isAdd) {

          const params: AddInventoryFlatRequest = {
            ProjectId: projectId,
            InventoryBuildingId: flatContext.InventoryBuildingId,
            InventoryFlatFloorBasementPodiumWingId: flatContext.InventoryFlatFloorBasementPodiumWingId,
            InventoryFloorId: flatContext.InventoryFloorId,
            Flat: formDataInventoryFlat.Flat.replace(/^[A-Za-z\s]+-\s*/, ''),
            FlatType: formDataInventoryFlat.FlatType,
            RERACarpetAreaSqFt: totalUnitArea ?? 0,
            FlatConfiguration: formDataInventoryFlat.FlatConfiguration,
            FlatStatus: formDataInventoryFlat.FlatStatus,
            FlatFacing: formDataInventoryFlat.FlatFacing,
            InventoryFlatSpecificationJSON: specificationsJSON,
            IsSameInventoryFlatSpecificationForSameRERACarpetAreaSqFt: formDataInventoryFlat.IsSameInventoryFlatSpecificationForSameRERACarpetAreaSqFt,
          };

          const response = await inventoryService.apiCallAddInventoryFlat(params);

          if (E.isRight(response)) {


            const newRecord = response.right.Data?.[0] as InventoryFlatData;

            if (newRecord) {
              setInventoryFlatData(newRecord);
              setFormDataInventoryFlat({
                ...formDataInventoryFlat,
                InventoryFlatId: newRecord.InventoryFlatId || 0,
                Uniquekey: newRecord.Uniquekey || formDataInventoryFlat.Uniquekey
              });

              if (newRecord.InventoryFlatSpecificationData) {
                setSpecifications(newRecord.InventoryFlatSpecificationData);
              }
            }

            addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });


            navigate('/inventory');

          } else {

            addToast({ type: 'error', title: response.left.message });
          }

          return response;
        } else {

          const params: UpdateInventoryFlatRequest = {

            ProjectId: projectId,
            InventoryBuildingId: flatContext.InventoryBuildingId,
            InventoryFlatFloorBasementPodiumWingId: flatContext.InventoryFlatFloorBasementPodiumWingId,
            InventoryFlatId: formDataInventoryFlat.InventoryFlatId,
            Flat: formDataInventoryFlat.Flat.replace(/^[A-Za-z\s]+-\s*/, ''),
            FlatType: formDataInventoryFlat.FlatType,
            RERACarpetAreaSqFt: totalUnitArea ?? 0,
            FlatConfiguration: formDataInventoryFlat.FlatConfiguration,
            FlatStatus: formDataInventoryFlat.FlatStatus,
            FlatFacing: formDataInventoryFlat.FlatFacing,
            InventoryFlatSpecificationJSON: specificationsJSON,
            IsSameInventoryFlatSpecificationForSameRERACarpetAreaSqFt: formDataInventoryFlat.IsSameInventoryFlatSpecificationForSameRERACarpetAreaSqFt,
          };

          const response = await inventoryService.apiCallUpdateInventoryFlat(params);

          if (E.isRight(response)) {

            const updatedRecord = response.right.Data?.[0] as InventoryFlatData;

            if (updatedRecord) {

              setInventoryFlatData(updatedRecord);

              if (updatedRecord.InventoryFlatSpecificationData) {

                setSpecifications(updatedRecord.InventoryFlatSpecificationData);

              }
            }

            addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });

            navigate(-1);


          } else {

            addToast({ type: 'error', title: response.left.message });

          }

          return response;
        }
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error?.message || 'An error occurred' });
      },
      undefined,
      formDataInventoryFlat.InventoryFlatId === 0 ? 'Adding Inventory Flat' : 'Updating Inventory Flat'
    );
  };

  // Table columns for Unit Layout
  const unitLayoutColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'FlatLayout',
        label: 'Unit Layout',
        sortable: false,
        align: 'left',
        render: (value) => value || '-',
      },
      {
        key: 'FlatLayoutAreaSqFt',
        label: 'Area (Sq.Ft)',
        sortable: false,
        align: 'right',
        render: (value) => value || '0',
      },
      {
        key: 'FlatLayoutLengthSqFt',
        label: 'Length (Sq.Ft)',
        sortable: false,
        align: 'right',
        render: (value) => value || '0',
      },
      {
        key: 'FlatLayoutWidthSqFt',
        label: 'Width (Sq.Ft)',
        sortable: false,
        align: 'right',
        render: (value) => value || '0',
      },
      {
        key: 'Note',
        label: 'Note',
        sortable: false,
        align: 'left',
        render: (value: string) => value || '—',
      },
      {
        key: 'Action',
        label: 'Action',
        sortable: false,
        fixed: 'right',
        align: 'center',
        render: (_value, row, index) => (
          <div className="flex items-center justify-center gap-2">
            {isChange && (
              <>

                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditSpecification(row, index);
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
                    handleDeleteSpecification(index);
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
        ),
      },
    ],
    [handleEditSpecification, handleDeleteSpecification]
  );

  const totalUnitArea = useMemo(() => {
    return specifications.reduce((sum, item) => {
      return sum + (Number(item.FlatLayoutAreaSqFt) || 0);
    }, 0);
  }, [specifications]);

  const isFlatLocked = ["Alloted", "Booked"].includes(
    formDataInventoryFlat.FlatStatus
  );

  const canFullEdit = canAction && !isFlatLocked;

  const canStatusEditOnly = !canAction && canBookingAction && !isFlatLocked;

  const isChange = canFullEdit;

  const disabled = !canFullEdit;

  const statusDisabled = !(canFullEdit || canStatusEditOnly);


  return (
    <>
      <Loader loading={isLoading} title={loadingMessage}>  <div></div></Loader>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2"> Inventory Specification Form  </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              <Input
                label="Unit"
                required
                value={formDataInventoryFlat.Flat.replace(/^[A-Za-z\s]+-\s*/, '')}
                onChange={(e) => handleFieldChangeInventoryFlat('Flat', e.target.value)}
                disabled={disabled}
              />

              <Input
                label="Unit Area (Sq.Ft)"
                type="text"
                value={totalUnitArea?.toString() || ''}
                onChange={(e) => handleFieldChangeInventoryFlat('RERACarpetAreaSqFt', e.target.value === '' ? null : Number(e.target.value))}
                placeholder="0.00"
                disabled
                error={errorsInventoryFlat.RERACarpetAreaSqFt}
              />

              <SinglePageSelection
                label="Type"
                onChange={(e) => {
                  handleFieldChangeInventoryFlat('FlatType', String(e));
                  handleFieldChangeInventoryFlat('FlatConfiguration', '');
                }}
                options={FLAT_UNIT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                value={formDataInventoryFlat.FlatType}
                placeholder="Select Type"
                required
                error={errorsInventoryFlat.FlatType}
                disabled={disabled}
              />
              {formDataInventoryFlat.FlatType.toUpperCase() === "RESIDENTIAL" ?
                <div>
                  <SinglePageSelection
                    label="Unit Configuration"
                    required
                    value={formDataInventoryFlat.FlatConfiguration ?? ""}
                    onChange={(e) => handleFieldChangeInventoryFlat('FlatConfiguration', String(e))}
                    options={RESIDENTIAL_FLAT_CONFIGURATION.map((opt) => ({ label: opt.name, value: opt.id }))}
                    disabled={disabled}
                    error={errorsInventoryFlat.FlatConfiguration}
                  />
                </div>
                : ""}

              {formDataInventoryFlat.FlatType.toUpperCase() === "COMMERCIAL" ?
                <div>
                  <SinglePageSelection
                    label="Unit Configuration"
                    required
                    value={formDataInventoryFlat.FlatConfiguration ?? ""}
                    onChange={(e) => handleFieldChangeInventoryFlat('FlatConfiguration', String(e))}
                    options={COMMERCIAL_FLAT_CONFIGURATION.map((opt) => ({ label: opt.name, value: opt.id }))}
                    disabled={disabled}
                    error={errorsInventoryFlat.FlatConfiguration}
                  />
                </div>
                : ""}

              <SinglePageSelection
                label="Facing"
                options={FLAT_UNIT_FACING.map((opt) => ({ label: opt.name, value: opt.id }))}
                value={formDataInventoryFlat.FlatFacing}
                onChange={(value) => handleFieldChangeInventoryFlat('FlatFacing', value as string)}
                placeholder="Select Facing"
                error={errorsInventoryFlat.Facing}
                disabled={disabled}
                required
              />

              <SinglePageSelection
                label="Status"
                options={INVENTORY_FLAT_STATUS.map((opt) => ({ label: opt.name, value: opt.id }))}
                value={formDataInventoryFlat.FlatStatus}
                onChange={(value) => handleFieldChangeInventoryFlat('FlatStatus', value as InventoryFlatData['FlatStatus'])}
                placeholder="Select Status"
                required
                error={errorsInventoryFlat.FlatStatus}
                disabled={statusDisabled}
              />
            </div>
          </div>


          <div className="space-y-4 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex-1 border-b border-gray-300 pb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Unit Layout Form
                </h3>
              </div>

              {canFullEdit  && (
                <Button
                  onClick={handleAddSpecification}
                  color="blue"
                  size="sm"
                  title="Add Unit Specification"

                >
                  Add Unit Specification
                </Button>

              )}
            </div>

            <DataTable
              data={specifications}
              columns={unitLayoutColumns}
              emptyMessage="No Unit Specifications Found"
              fixedHeight={false}
              recordsPerPage={20}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
              {/* Redevelopment Checkbox */}
              <div className="space-y-4 pb-4">
                <Checkbox
                  label="Apply the same flat specifications for all units in the inventory with the same RERA carpet area?"
                  checked={formDataInventoryFlat.IsSameInventoryFlatSpecificationForSameRERACarpetAreaSqFt === true}
                  onChange={(e) => handleFieldChangeInventoryFlat('IsSameInventoryFlatSpecificationForSameRERACarpetAreaSqFt', e.target.checked ? true : false)}
                  disabled={disabled}
                />
              </div>
            </div>
          </div>

        </div>

        <BottomActionBar
          cancelText="Cancel"
          saveText={(formDataInventoryFlat.InventoryFlatId && formDataInventoryFlat.InventoryFlatId > 0) ? 'Update' : 'Add'}
          onCancel={() => {
            setFormDataInventoryFlat(initialFormStateInventoryFlat(flatData));
            setSpecifications(flatData?.InventoryFlatSpecificationData || []);
            setErrorsInventoryFlat({});
            navigate(-1);
          }}
          canAction={canFullEdit || canStatusEditOnly}
          onSave={handleSave}
          isLoading={isLoading}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSpec(null);
          setFormDataInventoryFlatSpecification(initialFormStateInventoryFlatSpecification());
          setErrorsInventoryFlatSpecification({});
        }}
        title={editingSpec ? 'Edit Flat Specification' : 'Add Flat Specification'}
        onSubmit={handleSaveModal}
        saveText={editingSpec ? 'Update' : 'Add'}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingSpec(null);
          setFormDataInventoryFlatSpecification(initialFormStateInventoryFlatSpecification());
          setErrorsInventoryFlatSpecification({});
        }}
        size="md"
        loading={isLoading}
      >
        <div className="space-y-10 p-6 bg-blue-100">
          <div className="space-y-4">

            <div>

              <SinglePageSelection
                label="Layout"
                required
                value={formDataInventoryFlatSpecification.FlatLayout ?? ""}
                onChange={(e) => handleFieldChangeInventoryFlatSpecification('FlatLayout', String(e))}
                options={UNIT_LAYOUT.map((opt) => ({ label: opt.name, value: opt.id }))}
                disabled={disabled}
                error={errorsInventoryFlatSpecification.FlatLayout}
              />
            </div>

            <div>
              <Input
                label="Area (Sq.Ft)"
                required
                value={formDataInventoryFlatSpecification.FlatLayoutAreaSqFt?.toString() || ''}
                onChange={e => handleFieldChangeInventoryFlatSpecification('FlatLayoutAreaSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                placeholder="Enter Area (Sq.Ft)"
                error={errorsInventoryFlatSpecification.FlatLayoutAreaSqFt}
              />
            </div>

            <div>
              <Input
                label="Length (Sq.Ft)"
                value={formDataInventoryFlatSpecification.FlatLayoutLengthSqFt?.toString() || ''}
                onChange={e => handleFieldChangeInventoryFlatSpecification('FlatLayoutLengthSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                placeholder="Enter Length (Sq.Ft)"
              />
            </div>

            <div>
              <Input
                label="Width (Sq.Ft)"
                value={formDataInventoryFlatSpecification.FlatLayoutWidthSqFt?.toString() || ''}
                onChange={e => handleFieldChangeInventoryFlatSpecification('FlatLayoutWidthSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                placeholder="Enter Width (Sq.Ft)"
              />
            </div>

            <div>
              <TextArea
                label="Notes"
                placeholder="Enter Notes"
                className='thin-scroll'
                value={formDataInventoryFlatSpecification.Note || ''}
                onChange={(e) => handleFieldChangeInventoryFlatSpecification("Note", e.target.value)} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}

      <DeleteDialog
        isOpen={isDeleteConfirmationOpen}
        onClose={() => {
          setIsDeleteConfirmationOpen(false);
          setSpecificationToDelete(null);
        }}
        onConfirm={handleConfirmDeleteSpecification}
        loading={isLoading}
        title="Delete Unit Specification"
        message={`Are you sure you want to delete "${specificationToDelete?.layout || 'this specification'}"? This action cannot be undone.`}
      />
    </>
  );
};

export default InventorySpecification;
