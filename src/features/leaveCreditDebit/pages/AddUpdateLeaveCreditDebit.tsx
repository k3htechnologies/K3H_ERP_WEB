import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Input } from '@/ui/components/forms';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import MultiSelectPagination from '@/ui/components/DropDown/Multiselectpagination';
import { fetchDepartmentMasterDropdown } from '@/features/departmentMaster/departmentMasterDropdown';
import { fetchDesignationMasterDropdown } from '@/features/designationMaster/designationMasterDropDown';
import { fetchLeaveTypeMasterDropdown } from '@/features/leaveTypeMaster/leaveTypeMasterDropdown';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import { useMultiSelectDropdown } from '@/core/hooks/useMultiSelectDropdown';
import type {
  AddUpdateLeaveCreditDebitRequest,
  LeaveBalanceType,
  LeaveCreditDebitData,
} from '@/features/leaveCreditDebit/models/LeaveCreditDebitModel';
import { leaveCreditDebitService } from '@/features/leaveCreditDebit/services/LeaveCreditDebitService';
import { MONTHS_OPTIONS } from '@/core/constants/staticData';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import { Plus, Trash, ChevronLeft } from 'lucide-react';
const LEAVE_PERIOD_MODES = [
  { label: 'Yearly', value: 'Yearly' },
  { label: 'Monthly', value: 'Monthly' },
];

const initialFormState = (): AddUpdateLeaveCreditDebitRequest => ({
  LeaveCreditDebitId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  LeavePeriodMode: '',
  FYyear: new Date().getFullYear(),
  Month: '',
  DepartmentMasterId: '',
  LeaveTypebalanceJSONList: '',
});

export const AddUpdateLeaveCreditDebit: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation() as { state?: { data?: LeaveCreditDebitData | null } };
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const [formData, setFormData] = useState<AddUpdateLeaveCreditDebitRequest>(initialFormState());
  const [leaveBalanceTypes, setLeaveBalanceTypes] = useState<LeaveBalanceType[]>([]);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [leaveTypeLabels, setLeaveTypeLabels] = useState<{ [index: number]: string }>({});
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | number | null>(null);
  const [departmentLabel, setDepartmentLabel] = useState<string>('');
  const [designationValue, setDesignationValue] = useState<string | number | null>(null);
  const leaveBalanceTypeRefs = useRef<{ [index: number]: HTMLDivElement | null }>({});
  
  // Use the multi-select hook for designations
  const designationDropdown = useMultiSelectDropdown({
    value: designationValue,
    fetchCallback: fetchDesignationMasterDropdown,
    autoFetchOptions: true,
  });

  useEffect(() => {
    const incoming = location.state?.data;
    if (id && incoming) {
      const formDataUpdate: AddUpdateLeaveCreditDebitRequest = {
        LeaveCreditDebitId: incoming.LeaveCreditDebitId,
        Uniquekey: incoming.Uniquekey || initialFormState().Uniquekey,
        LeavePeriodMode: incoming.LeavePeriodMode || '',
        FYyear: incoming.FYyear || new Date().getFullYear(),
        Month: incoming.Month || '',
        DepartmentMasterId: String(incoming.DepartmentMasterId || ''),
        LeaveTypebalanceJSONList: '',
      };
      setFormData(formDataUpdate);
      setLeaveBalanceTypes(incoming.LeaveBalanceType || []);
      
      // Initialize department (take first value if comma-separated, for backward compatibility)
      if (incoming.DepartmentMasterId) {
        const deptId = String(incoming.DepartmentMasterId).split(',')[0].trim();
        if (deptId) {
          setSelectedDepartmentId(deptId);
          if (incoming.DepartmentName) {
            setDepartmentLabel(incoming.DepartmentName);
          }
          // Fetch department label
          const fetchDepartmentLabel = async () => {
            try {
              const result = await fetchDepartmentMasterDropdown(1, { value: '' });
              const found = result.itemList.find(item => String(item.value) === String(deptId));
              if (found) {
                setDepartmentLabel(found.label);
              }
            } catch (error) {
              console.error('Failed to fetch department label:', error);
            }
          };
          void fetchDepartmentLabel();
        }
      }
      // Set designation value for the hook (use DesignationId from model)
      // Convert to string to handle both number and comma-separated string formats
      // The hook will automatically parse and fetch options for the selected values
      if (incoming.DesignationId) {
        const designationIdValue = typeof incoming.DesignationId === 'string' 
          ? incoming.DesignationId 
          : String(incoming.DesignationId);
        setDesignationValue(designationIdValue);
      } else {
        setDesignationValue(null);
      }

      // Fetch Leave Type labels for existing items
      const fetchLeaveTypeLabels = async () => {
        const labels: { [index: number]: string } = {};
        if (incoming.LeaveBalanceType && incoming.LeaveBalanceType.length > 0) {
          // Collect unique Leave Type IDs
          const uniqueLeaveTypeIds = Array.from(
            new Set(
              incoming.LeaveBalanceType
                .map((item) => item.LeaveTypeId)
                .filter((id) => id && id > 0)
            )
          );

          // Fetch all pages to find the labels
          const allOptions: { label: string; value: string }[] = [];
          let page = 1;
          let hasMore = true;
          while (hasMore && uniqueLeaveTypeIds.length > 0) {
            try {
              const result = await fetchLeaveTypeMasterDropdown(page, { value: '' });
              allOptions.push(...result.itemList);
              hasMore = allOptions.length < result.totalNumberOfRecord;
              page++;
              // Stop if we've found all the labels we need
              const foundIds = allOptions.map((opt) => Number(opt.value));
              if (uniqueLeaveTypeIds.every((id) => foundIds.includes(id))) {
                break;
              }
            } catch (error) {
              console.error(`Failed to fetch Leave Type labels:`, error);
              break;
            }
          }

          // Map labels to indices
          incoming.LeaveBalanceType.forEach((item, index) => {
            if (item.LeaveTypeId && item.LeaveTypeId > 0) {
              const found = allOptions.find(
                (opt) => String(opt.value) === String(item.LeaveTypeId)
              );
              if (found) {
                labels[index] = found.label;
              }
            }
          });
        }
        setLeaveTypeLabels(labels);
      };
      void fetchLeaveTypeLabels();
    } else {
      setFormData(initialFormState());
      setLeaveBalanceTypes([]);
      setLeaveTypeLabels({});
      setSelectedDepartmentId(null);
      setDepartmentLabel('');
      setDesignationValue(null);
    }
  }, [id, location.state]);

  const handleFieldChange = (field: keyof AddUpdateLeaveCreditDebitRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleAddLeaveBalanceType = () => {
    // Clear the "Add at least one Leave Balance Type" error if it exists
    if (errors.LeaveBalanceTypes) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.LeaveBalanceTypes;
        return next;
      });
    }

    const newIndex = leaveBalanceTypes.length;
    setLeaveBalanceTypes((prev) => [
      ...prev,
      { LeaveTypeBalanceId: 0, LeaveTypeId: 0, LeaveCredit: 0, LeaveCreditDebitId: 0, LeaveTypeName: '' },
    ]);

    // Scroll to the newly added item after it's rendered
    setTimeout(() => {
      const element = leaveBalanceTypeRefs.current[newIndex];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const handleRemoveLeaveBalanceType = (index: number) => {
    setLeaveBalanceTypes((prev) => prev.filter((_, i) => i !== index));
    setLeaveTypeLabels((prev) => {
      const reindexed: { [index: number]: string } = {};
      Object.keys(prev).forEach((key) => {
        const oldIndex = Number(key);
        if (oldIndex < index) {
          // Keep indices before the removed one
          reindexed[oldIndex] = prev[oldIndex];
        } else if (oldIndex > index) {
          // Shift indices after the removed one down by 1
          reindexed[oldIndex - 1] = prev[oldIndex];
        }
        // Skip the removed index
      });
      return reindexed;
    });
    // Clean up refs
    const newRefs: { [index: number]: HTMLDivElement | null } = {};
    Object.keys(leaveBalanceTypeRefs.current).forEach((key) => {
      const oldIndex = Number(key);
      if (oldIndex < index) {
        newRefs[oldIndex] = leaveBalanceTypeRefs.current[oldIndex];
      } else if (oldIndex > index) {
        newRefs[oldIndex - 1] = leaveBalanceTypeRefs.current[oldIndex];
      }
    });
    leaveBalanceTypeRefs.current = newRefs;
  };

  const handleUpdateLeaveBalanceType = (index: number, field: keyof LeaveBalanceType, value: any) => {
    // Clear related validation error if this field was previously invalid
    setErrors((prev) => {
      const next = { ...prev };
      if (field === 'LeaveTypeId') delete next[`LeaveBalanceType_${index}_LeaveTypeId`];
      if (field === 'LeaveCredit') delete next[`LeaveBalanceType_${index}_LeaveCredit`];
      return next;
    });

    setLeaveBalanceTypes((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const validateForm = () => {
    const newErrors: { [k: string]: string } = {};
    if (!formData.LeavePeriodMode) newErrors.LeavePeriodMode = 'Leave Period Mode is required';
    if (!formData.FYyear || formData.FYyear === 0) newErrors.FYyear = 'Financial Year is required';
    if (formData.LeavePeriodMode === 'Monthly' && (!formData.Month || formData.Month.trim() === '')) {
      newErrors.Month = 'Month is required for Monthly mode';
    }
    if (!selectedDepartmentId) {
      newErrors.DepartmentMasterId = 'Department is required';
    }
    if (leaveBalanceTypes.length === 0) newErrors.LeaveBalanceTypes = 'Add at least one Leave Balance Type';
    leaveBalanceTypes.forEach((item, index) => {
      const leaveTypeId = Number(item.LeaveTypeId);
      if (!leaveTypeId || leaveTypeId === 0 || isNaN(leaveTypeId)) {
        newErrors[`LeaveBalanceType_${index}_LeaveTypeId`] = 'Leave Type is required';
      }
      if (item.LeaveCredit === undefined || item.LeaveCredit === null || item.LeaveCredit < 0) {
        newErrors[`LeaveBalanceType_${index}_LeaveCredit`] = 'Leave Credit must be valid';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setIsLoadingMessage('Saving...');
    try {
      // Get designation IDs from the hook
      const designationIdsString = designationDropdown.selectedValues.length > 0
        ? designationDropdown.selectedValues.join(',')
        : '';
      
      const payload: any = {
        ...formData,
        DepartmentMasterId: selectedDepartmentId ? String(selectedDepartmentId) : undefined,
        DesignationMasterId: designationIdsString,
        LeaveTypebalanceJSONList: JSON.stringify(
          leaveBalanceTypes.map((item) => ({
            LeaveTypeBalanceId: item.LeaveTypeBalanceId || 0,
            LeaveTypeId: item.LeaveTypeId || 0,
            LeaveCredit: item.LeaveCredit || 0,
            LeaveCreditDebitId: item.LeaveCreditDebitId || formData.LeaveCreditDebitId || 0,
          })),
        ),
      };

      const responseEither = await leaveCreditDebitService.apiCallAddUpdateLeaveCreditDebit(payload);
      if (E.isRight(responseEither)) {
        addToast({ type: 'success', title: 'Saved', message: 'Leave Credit/Debit saved successfully' });
        navigate('/leaveCreditDebit');
      } else {
        addToast({ type: 'error', title: 'Failed', message: responseEither.left.message });
      }
    } catch (error: any) {
      addToast({ type: 'error', title: 'Failed', message: error?.message || 'Unable to save' });
    } finally {
      setIsLoading(false);
      setIsLoadingMessage('');
    }
  };

  return (
    <div className="p-6" style={{ backgroundColor: '#F9FAFB' }}>
      <Loader loading={isLoading} title={loadingMessage}>
        <div />
      </Loader>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ChevronLeft 
            className="w-6 h-6 text-blue-600 cursor-pointer hover:text-blue-800 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(-1);
            }}
          />
          <h2 className="text-2xl font-semibold text-gray-900">
            {formData.LeaveCreditDebitId ? 'Update Leave Credit/Debit' : 'Add Leave Credit/Debit'}
          </h2>
        </div>

        {/* Details Card */}
        <div className="rounded-lg shadow-sm border border-gray-200 p-6" style={{ backgroundColor: '#FFFFFF' }}>
          <h3 className="text-md font-medium text-gray-500 mb-4">Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SinglePageSelection
              label="Leave Period Mode"
              required
              options={LEAVE_PERIOD_MODES}
              value={formData.LeavePeriodMode || ''}
              onChange={(value) => {
                handleFieldChange('LeavePeriodMode', String(value));
                if (value !== 'Monthly') handleFieldChange('Month', '');
              }}
              error={errors.LeavePeriodMode}
              placeholder="Select Leave Period Mode"
              searchable
              size="md"
            />

            <Input
              label="Financial Year"
              required
              type="number"
              value={formData.FYyear?.toString() || ''}
              onChange={(e) => handleFieldChange('FYyear', Number(e.target.value))}
              error={errors.FYyear}
              min={1950}
              max={2100}
            />
          </div>

          {formData.LeavePeriodMode === 'Monthly' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SinglePageSelection
                  label="Month"
                  required
                  options={MONTHS_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                  value={formData.Month || ''}
                  onChange={(value) => handleFieldChange('Month', String(value))}
                  error={errors.Month}
                  placeholder="Select month"
                  searchable
                  size="md"
                />
                <div>
                  <SingleSelectDropdownWithPagination
                    label="Department"
                    title="Select Department"
                    required
                    size="md"
                    dataFetchCallBack={fetchDepartmentMasterDropdown}
                    onSelected={(selectedItem) => {
                      setSelectedDepartmentId(selectedItem?.value || null);
                      setDepartmentLabel(selectedItem?.label || '');
                      if (errors.DepartmentMasterId) {
                        setErrors((prev) => ({ ...prev, DepartmentMasterId: '' }));
                      }
                    }}
                    initialValue={selectedDepartmentId ? createDropdownInitialValue(selectedDepartmentId, departmentLabel) : null}
                    error={errors.DepartmentMasterId}
                  />
                  {errors.DepartmentMasterId && (
                    <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
                      {errors.DepartmentMasterId}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Designation</label>
                  <MultiSelectPagination
                    label=""
                    dataFetchCallBack={fetchDesignationMasterDropdown}
                    selectedValues={designationDropdown.selectedValues}
                    options={designationDropdown.initialOptions}
                    onChange={(values) => {
                      const { idsString } = designationDropdown.handleChange(values);
                      setDesignationValue(idsString || null);
                      if (errors.DesignationMasterId) {
                        setErrors((prev) => ({ ...prev, DesignationMasterId: '' }));
                      }
                    }}
                  />
                  {errors.DesignationMasterId && (
                    <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
                      {errors.DesignationMasterId}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <SingleSelectDropdownWithPagination
                  label="Department"
                  title="Select Department"
                  required
                  size="md"
                  dataFetchCallBack={fetchDepartmentMasterDropdown}
                  onSelected={(selectedItem) => {
                    setSelectedDepartmentId(selectedItem?.value || null);
                    setDepartmentLabel(selectedItem?.label || '');
                    if (errors.DepartmentMasterId) {
                      setErrors((prev) => ({ ...prev, DepartmentMasterId: '' }));
                    }
                  }}
                  initialValue={selectedDepartmentId ? createDropdownInitialValue(selectedDepartmentId, departmentLabel) : null}
                  error={errors.DepartmentMasterId}
                />
                {errors.DepartmentMasterId && (
                  <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
                    {errors.DepartmentMasterId}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Designation</label>
                <MultiSelectPagination
                  label=""
                  dataFetchCallBack={fetchDesignationMasterDropdown}
                  selectedValues={designationDropdown.selectedValues}
                  options={designationDropdown.initialOptions}
                  onChange={(values) => {
                    const { idsString } = designationDropdown.handleChange(values);
                    setDesignationValue(idsString || null);
                    if (errors.DesignationMasterId) {
                      setErrors((prev) => ({ ...prev, DesignationMasterId: '' }));
                    }
                  }}
                />
                {errors.DesignationMasterId && (
                  <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
                    {errors.DesignationMasterId}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Leave Balance Type Card */}
        <div
          className="rounded-lg shadow-sm border border-gray-200 p-6"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-medium text-gray-500">Leave Balance Type</h3>
            <Button 
              type="button" 
              color="blue" 
              size="sm" 
              onClick={handleAddLeaveBalanceType}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Leave Type
            </Button>
          </div>
          {errors.LeaveBalanceTypes && <p className="text-sm text-red-600 mb-3">{errors.LeaveBalanceTypes}</p>}
          {leaveBalanceTypes.length > 0 && (
            <div className="space-y-3">
              {leaveBalanceTypes.map((item, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    leaveBalanceTypeRefs.current[index] = el;
                  }}
                  className="relative"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveLeaveBalanceType(index)}
                    title="Remove"
                    className="absolute -top-2 right-2 bg-transparent border border-transparent text-red-500 hover:bg-red-100 transition-colors duration-200 rounded p-1"
                  >
                    <Trash className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SingleSelectDropdownWithPagination
                      key={`leave-type-${index}-${item.LeaveTypeId}`}
                      label="Leave Type"
                      title="Select Leave Type"
                      size="lg"
                      required
                      dataFetchCallBack={fetchLeaveTypeMasterDropdown}
                      onSelected={(selectedItem) => {
                        const leaveTypeId = Number(selectedItem.value);
                        if (leaveTypeId && leaveTypeId > 0) {
                          handleUpdateLeaveBalanceType(index, 'LeaveTypeId', leaveTypeId);
                          setLeaveTypeLabels((prev) => ({ ...prev, [index]: selectedItem.label }));
                        }
                      }}
                      initialValue={
                        item.LeaveTypeId && item.LeaveTypeId > 0
                          ? createDropdownInitialValue(String(item.LeaveTypeId), leaveTypeLabels[index] || '')
                          : null
                      }
                      error={errors[`LeaveBalanceType_${index}_LeaveTypeId`]}
                    />
                    <Input
                      label="Leave Credit"
                      required
                      type="number"
                      value={item.LeaveCredit?.toString() || '0'}
                      onChange={(e) => handleUpdateLeaveBalanceType(index, 'LeaveCredit', Number(e.target.value))}
                      placeholder="Enter Leave Credit"
                      error={errors[`LeaveBalanceType_${index}_LeaveCredit`]}
                      min={0}
                      step={0.5}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end items-center gap-3 pt-4">
          <Button
            color="blue"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              void handleSave();
            }}
            disabled={isLoading}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddUpdateLeaveCreditDebit;

