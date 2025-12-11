import React, { useState, useMemo } from 'react';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import { Input, Button } from '@/ui/components/forms';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { useParams ,useLocation} from 'react-router-dom';
import type { InventoryFlatData } from '../models/InventoryMasterModel';

interface UnitLayout {
  id: string;
  unitLayout: string;
  area: string;
  length: string;
  width: string;
  note: string;
}

const InventorySpecification: React.FC = () => {
  const [unit, setUnit] = useState('1203');
  const [area, setArea] = useState('0.00');
  const [type, setType] = useState<string | number>('');
  const [facing, setFacing] = useState<string | number>('');
  const [status, setStatus] = useState<string | number>('');
  const [unitLayouts, setUnitLayouts] = useState<UnitLayout[]>([
    { id: '1', unitLayout: 'Bedroom 1', area: '0.00', length: '0.00', width: '0.00', note: '' },
    { id: '2', unitLayout: 'Kitchen', area: '0.00', length: '0.00', width: '0.00', note: '' },
    { id: '3', unitLayout: 'Common Toilet', area: '0.00', length: '0.00', width: '0.00', note: '' },
    { id: '4', unitLayout: 'Bedroom 2', area: '0.00', length: '0.00', width: '0.00', note: '' },
  ]);

  interface LocationState {
    flat: InventoryFlatData;
  }
  

const { state } = useLocation() as unknown as { state: LocationState };

const flatData = state.flat;


  // Mock options for dropdowns
  const typeOptions = [
    { label: 'Type 1', value: 'type1' },
    { label: 'Type 2', value: 'type2' },
    { label: 'Type 3', value: 'type3' },
  ];

  const facingOptions = [
    { label: 'North', value: 'north' },
    { label: 'South', value: 'south' },
    { label: 'East', value: 'east' },
    { label: 'West', value: 'west' },
  ];

  const statusOptions = [
    { label: 'Available', value: 'available' },
    { label: 'Sold', value: 'sold' },
    { label: 'Hold', value: 'hold' },
  ];

  const handleAddUnitSpecification = () => {
    const newLayout: UnitLayout = {
      id: Date.now().toString(),
      unitLayout: '',
      area: '0.00',
      length: '0.00',
      width: '0.00',
      note: '',
    };
    setUnitLayouts([...unitLayouts, newLayout]);
  };

  const handleEditUnitLayout = (id: string) => {
    // Handle edit logic here
    console.log('Edit unit layout:', id);
  };

  const handleDeleteUnitLayout = (id: string) => {
    setUnitLayouts(unitLayouts.filter(layout => layout.id !== id));
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Save form');
  };

  const handleBack = () => {
    // Handle back navigation
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

      {/* Form Fields */}
      <div className="space-y-6">
        {/* First Row: Unit and Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Unit"
              type="text"
              value={flatData.Flat}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Enter unit"
            />
          </div>
          <div>
            <Input
              label="Area (sq.ft)"
              type="text"
              value={flatData.RERACarpetAreaSqFt}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Enter area"
            />
          </div>
        </div>

        {/* Second Row: Type, Facing, Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <SinglePageSelection
              label="Type"
              options={typeOptions}
              value={flatData.FlatType}
              onChange={(value) => setType(value)}
              placeholder="Select Type"
              required
            />
          </div>
          <div>
            <SinglePageSelection
              label="Facing"
              options={facingOptions}
              value={facing}
              onChange={(value) => setFacing(value)}
              placeholder="Select Facing"
            />
          </div>
          <div>
            <SinglePageSelection
              label="Status"
              options={statusOptions}
              value={status}
              onChange={(value) => setStatus(value)}
              placeholder="Select Status"
            />
          </div>
        </div>

        {/* Unit Layout Form Section */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Unit Layout Form</h2>
            <Button
              onClick={handleAddUnitSpecification}
              color="blue"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
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
    </div>
  );
};

export default InventorySpecification;

