import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Input, Button } from '@/ui/components/forms';
import { TextArea } from '@/ui/components/forms/Textarea';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { useLocation } from 'react-router-dom';
import type { InventoryFlatData } from '../models/InventoryMasterModel';
import { InventoryService } from '../services/InventoryServices';
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { ToastContainer } from "@/ui/components/Toast";
import { Modal } from '@/ui/components/Modal/Modal';

interface UnitLayout {
  id: string;
  unitLayout: string;
  area: string;
  length: string;
  width: string;
  note: string;
}

const InventorySpecification: React.FC = () => {
  const [unitLayouts, setUnitLayouts] = useState<UnitLayout[]>([
    { id: '1', unitLayout: 'Bedroom 1', area: '0.00', length: '0.00', width: '0.00', note: '' },
    { id: '2', unitLayout: 'Kitchen', area: '0.00', length: '0.00', width: '0.00', note: '' },
    { id: '3', unitLayout: 'Common Toilet', area: '0.00', length: '0.00', width: '0.00', note: '' },
    { id: '4', unitLayout: 'Bedroom 2', area: '0.00', length: '0.00', width: '0.00', note: '' },
  ]);

  // Modal state
  const [isAddUnitSpecificationModalOpen, setIsAddUnitSpecificationModalOpen] = useState(false);
  const [unitSpecificationForm, setUnitSpecificationForm] = useState<UnitLayout>({
    id: '',
    unitLayout: '',
    area: '0.00',
    length: '0.00',
    width: '0.00',
    note: '',
  });

  // TOAST
  const { toasts, addToast, removeToast } = useToast();

  interface LocationState {
    flat: InventoryFlatData;
    projectId: number;
  }

  // useLocation executes FIRST (during render phase - synchronously)
  const { state } = useLocation() as unknown as { state: LocationState };

  // Use useState to store the entire flatData object - this allows React to track changes
  const [flatData, setFlatData] = useState<InventoryFlatData>(state.flat);
  const projectId: number = state.projectId;

  // Initialize flatData from state when component mounts
  useEffect(() => {
    setFlatData(state.flat);
  }, [state.flat])

  // Mock options for dropdowns
  const typeOptions = [
    { label: 'Residential', value: 'Residential' },
    { label: 'Commercial', value: 'Commercial' },
  ];

  const facingOptions = [
    { label: 'North', value: 'North' },
    { label: 'South', value: 'South' },
    { label: 'East', value: 'East' },
    { label: 'West', value: 'West' },
  ];

  const statusOptions = [
    { label: 'Available', value: 'Available' },
    { label: 'Sold', value: 'sold' },
    { label: 'Hold', value: 'hold' },
    { label: 'Block', value: 'Blocked' },
  ];

  const handleAddUnitSpecification = () => {
    setUnitSpecificationForm({
      id: '',
      unitLayout: '',
      area: '0.00',
      length: '0.00',
      width: '0.00',
      note: '',
    });
    setIsAddUnitSpecificationModalOpen(true);
  };

  const handleSaveUnitSpecification = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required field
    if (!unitSpecificationForm.unitLayout.trim()) {
      addToast({ type: 'error', title: 'Unit Layout is required' });
      return;
    }

    const newLayout: UnitLayout = {
      ...unitSpecificationForm,
      id: Date.now().toString(),
    };
    setUnitLayouts([...unitLayouts, newLayout]);
    setIsAddUnitSpecificationModalOpen(false);
    addToast({ type: 'success', title: 'Unit specification added successfully' });
    
    // Reset form
    setUnitSpecificationForm({
      id: '',
      unitLayout: '',
      area: '0.00',
      length: '0.00',
      width: '0.00',
      note: '',
    });
  };

  const handleCloseUnitSpecificationModal = () => {
    setIsAddUnitSpecificationModalOpen(false);
    setUnitSpecificationForm({
      id: '',
      unitLayout: '',
      area: '0.00',
      length: '0.00',
      width: '0.00',
      note: '',
    });
  };

  const handleEditUnitLayout = (id: string) => {
    console.log('Edit unit layout:', id);
  };

  const handleDeleteUnitLayout = (id: string) => {
    setUnitLayouts(unitLayouts.filter(layout => layout.id !== id));
  };

  const handleSave = async () => {
    // flatData is already updated through state, so we can use it directly
    const result = await InventoryService.apiCallUpdateInventoryFlat(projectId, flatData);
    if (E.isRight(result)) {
      // Handle success
      addToast({ type: 'success', title: result.right.SuccessMessage[0] });
    } else {
      // Handle error
      addToast({ type: "error", title: result.left?.message });
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  // Define table columns for unit layouts
  const unitLayoutColumns = useMemo<TableColumn[]>(() => [
    {
      key: 'unitLayout',
      label: 'Unit Layout',
      width: '20',
      sortable: false,
      align: 'left',
      render: (value) => value || '—'
    },
    {
      key: 'area',
      label: 'Area (sq.ft)',
      width: '15',
      sortable: false,
      align: 'left',
      render: (value) => value || '0.00'
    },
    {
      key: 'length',
      label: 'Length (sq.ft)',
      width: '15',
      sortable: false,
      align: 'left',
      render: (value) => value || '0.00'
    },
    {
      key: 'width',
      label: 'Width (sq.ft)',
      width: '15',
      sortable: false,
      align: 'left',
      render: (value) => value || '0.00'
    },
    {
      key: 'note',
      label: 'Note',
      width: '20',
      sortable: false,
      align: 'left',
      render: (value) => value || '—'
    },
    {
      key: 'action',
      label: 'Action',
      width: '15',
      sortable: false,
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleEditUnitLayout(row.id);
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
              handleDeleteUnitLayout(row.id);
            }}
            color="transparent"
            isborderRadius
            size="sm"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ], []);

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast}></ToastContainer>
      
      {/* Form Fields */}
      <div className="space-y-6">
        {/* First Row: Unit and Area */}
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Header with back arrow and title */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
              type="button"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Inventory Specification Form</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Unit"
                type="text"
                value={flatData.Flat}
                onChange={(e) => {
                  setFlatData({ ...flatData, Flat: e.target.value });
                }}
                placeholder="Enter unit"
              />
            </div>
            <div>
              <Input
                label="Area (sq.ft)"
                type="text"
                value={flatData.RERACarpetAreaSqFt.toString()}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  // Allow only numbers and a single decimal point
                  // Regex: allows digits, single decimal point, and empty string
                  if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
                    const value = inputValue === '' ? 0 : parseFloat(inputValue) || 0;
                    setFlatData({ ...flatData, RERACarpetAreaSqFt: value });
                  }
                }}
                onKeyPress={(e) => {
                  // Prevent non-numeric characters
                  const char = e.key;
                  const currentValue = (e.target as HTMLInputElement).value;
                  
                  // Allow: numbers, single decimal point (if not already present), and control keys
                  if (char === '.' && currentValue.includes('.')) {
                    e.preventDefault(); // Prevent multiple decimal points
                  } else if (!/[0-9.]/.test(char) && 
                             char !== 'Backspace' && 
                             char !== 'Delete' && 
                             char !== 'ArrowLeft' && 
                             char !== 'ArrowRight' &&
                             char !== 'Tab') {
                    e.preventDefault(); // Prevent letters and special characters
                  }
                }}
                placeholder="Enter area"
              />
            </div>
          </div>

          <div className='h-5'></div>

          {/* Second Row: Type, Facing, Status */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <SinglePageSelection
                label="Type"
                options={typeOptions}
                value={flatData.FlatType}
                onChange={(value) => {
                  setFlatData({ ...flatData, FlatType: value as string });
                }}
                placeholder="Select Type"
                required
              />
            </div>
            <div>
              <SinglePageSelection
                label="Facing"
                options={facingOptions}
                value={flatData.FlatFacing}
                onChange={(value) => {
                  setFlatData({ ...flatData, FlatFacing: value as string });
                }}
                placeholder="Select Facing"
              />
            </div>
            <div>
              <SinglePageSelection
                label="Status"
                options={statusOptions}
                value={flatData.FlatStatus}
                onChange={(value) => {
                  setFlatData({ ...flatData, FlatStatus: value as InventoryFlatData['FlatStatus'] });
                }}
                placeholder="Select Status"
              />
            </div>
          </div>
        </div>

        {/* Unit Layout Form Section */}
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Unit Layout Form</h2>
              <Button
                onClick={handleAddUnitSpecification}
                color="blue"
                size="sm"

              >
                Add Unit Specification
              </Button>
            </div>

            {/* Table */}
            <DataTable
              data={unitLayouts}
              columns={unitLayoutColumns}
              emptyMessage="No unit layouts added"
              fixedHeight={false}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            onClick={handleSave}
            color="blue"
            size="md"
          >
            Save
          </Button>
        </div>
      </div>

      {/* Add Unit Specification Modal */}
      <Modal
        isOpen={isAddUnitSpecificationModalOpen}
        onClose={handleCloseUnitSpecificationModal}
        onCancel={handleCloseUnitSpecificationModal}
        title="Add Flat Specification"
        onSubmit={handleSaveUnitSpecification}
        saveText="Save"
        cancelText="Cancel"
        size="md"
      >
        <div className="space-y-6">
          <div className="text-sm text-gray-500 font-medium">Details</div>
          <div className="bg-blue-50 rounded-lg p-6 space-y-4">
            <div>
              <Input
                label="Unit Layout"
                type="text"
                value={unitSpecificationForm.unitLayout}
                onChange={(e) => {
                  setUnitSpecificationForm({ ...unitSpecificationForm, unitLayout: e.target.value });
                }}
                placeholder="Enter unit layout"
                required
              />
            </div>
            <div>
              <Input
                label="Area (sq.ft)"
                type="text"
                value={unitSpecificationForm.area}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
                    setUnitSpecificationForm({ ...unitSpecificationForm, area: inputValue });
                  }
                }}
                placeholder="Enter area"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Length (sq.ft)"
                  type="text"
                  value={unitSpecificationForm.length}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
                      setUnitSpecificationForm({ ...unitSpecificationForm, length: inputValue });
                    }
                  }}
                  placeholder="Enter length"
                />
              </div>
              <div>
                <Input
                  label="Width (sq.ft)"
                  type="text"
                  value={unitSpecificationForm.width}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
                      setUnitSpecificationForm({ ...unitSpecificationForm, width: inputValue });
                    }
                  }}
                  placeholder="Enter width"
                />
              </div>
            </div>
            <div>
              <TextArea
                label="Notes"
                value={unitSpecificationForm.note}
                onChange={(e) => {
                  setUnitSpecificationForm({ ...unitSpecificationForm, note: e.target.value });
                }}
                placeholder="Enter notes"
                rows={4}
              />
            </div>
          </div>
        </div>
      </Modal>
      
      </>
  );
};

export default InventorySpecification;

