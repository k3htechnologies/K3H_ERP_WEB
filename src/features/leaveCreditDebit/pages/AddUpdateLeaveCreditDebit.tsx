import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Input } from '@/ui/components/forms';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchDepartmentMasterDropdown } from '@/features/departmentMaster/departmentMasterDropdown';
import { fetchEmployeeMasterDropdown } from '@/features/employeeMaster/employeeMasterDropDown';
import { fetchLeaveTypeMasterDropdown } from '@/features/leaveCreditDebit/leaveTypeMasterDropdown';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import type {
  AddUpdateLeaveCreditDebitRequest,
  LeaveBalanceType,
  LeaveCreditDebitData,
} from '@/features/leaveCreditDebit/models/LeaveCreditDebitModel';
import { leaveCreditDebitService } from '@/features/leaveCreditDebit/services/LeaveCreditDebitService';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { formatDate_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd } from '@/core/utils/dateFormat';
import { Loader } from '@/core/utils/loader';
import { Plus, X } from 'lucide-react';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';

const LEAVE_PERIOD_MODES = [
  { label: 'Yearly', value: 'Yearly' },
  { label: 'Monthly', value: 'Monthly' },
];

const MONTHS = [
  { label: 'January', value: 'January' },
  { label: 'February', value: 'February' },
  { label: 'March', value: 'March' },
  { label: 'April', value: 'April' },
  { label: 'May', value: 'May' },
  { label: 'June', value: 'June' },
  { label: 'July', value: 'July' },
  { label: 'August', value: 'August' },
  { label: 'September', value: 'September' },
  { label: 'October', value: 'October' },
  { label: 'November', value: 'November' },
  { label: 'December', value: 'December' },
];

const initialFormState = (): AddUpdateLeaveCreditDebitRequest => ({
  LeaveCreditDebitId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  LeavePeriodMode: '',
  FYyear: new Date().getFullYear(),
  Month: '',
  DepartmentMasterId: '',
  EmployeeId: '',
  LeaveTypebalanceJSONList: '',
});

export const AddUpdateLeaveCreditDebit: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation() as { state?: { data?: LeaveCreditDebitData | null } };
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const [formData, setFormData] = useState<AddUpdateLeaveCreditDebitRequest>(initialFormState());
  const [leaveBalanceTypes, setLeaveBalanceTypes] = useState<LeaveBalanceType[]>([]);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [dropdownLabels, setDropdownLabels] = useState<{ departmentName?: string; employeeName?: string }>({});

  useEffect(() => {
    const incoming = location.state?.data;
    if (id && incoming) {
      setFormData({
        LeaveCreditDebitId: incoming.LeaveCreditDebitId,
        Uniquekey: incoming.Uniquekey || initialFormState().Uniquekey,
        LeavePeriodMode: incoming.LeavePeriodMode || '',
        FYyear: incoming.FYyear || new Date().getFullYear(),
        Month: incoming.Month || '',
        DepartmentMasterId: incoming.DepartmentMasterId || '',
        EmployeeId: incoming.EmployeeId || '',
        LeaveTypebalanceJSONList: '',
      });
      setLeaveBalanceTypes(incoming.LeaveBalanceType || []);
      setDropdownLabels({
        departmentName: incoming.DepartmentMasterId || '',
        employeeName: incoming.EmployeeId || '',
      });
    } else {
      setFormData(initialFormState());
      setLeaveBalanceTypes([]);
      setDropdownLabels({});
    }
  }, [id, location.state]);

  const handleFieldChange = (field: keyof AddUpdateLeaveCreditDebitRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleAddLeaveBalanceType = () => {
    setLeaveBalanceTypes((prev) => [
      ...prev,
      { LeaveTypeBalanceId: 0, LeaveTypeId: 0, LeaveCredit: 0, LeaveCreditDebitId: 0 },
    ]);
  };

  const handleRemoveLeaveBalanceType = (index: number) => {
    setLeaveBalanceTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateLeaveBalanceType = (index: number, field: keyof LeaveBalanceType, value: any) => {
    setLeaveBalanceTypes((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const validateForm = () => {
    const newErrors: { [k: string]: string } = {};
    if (!formData.LeavePeriodMode) newErrors.LeavePeriodMode = 'Leave Period Mode is required';
    if (!formData.FYyear || formData.FYyear === 0) newErrors.FYyear = 'Financial Year is required';
    if (formData.LeavePeriodMode === 'Monthly' && (!formData.Month || formData.Month.trim() === '')) {
      newErrors.Month = 'Month is required for Monthly mode';
    }
    if (!formData.DepartmentMasterId || formData.DepartmentMasterId.trim() === '') {
      newErrors.DepartmentMasterId = 'Department is required';
    }
    if (!formData.EmployeeId || formData.EmployeeId.trim() === '') {
      newErrors.EmployeeId = 'Employee is required';
    }
    if (leaveBalanceTypes.length === 0) newErrors.LeaveBalanceTypes = 'Add at least one Leave Balance Type';
    leaveBalanceTypes.forEach((item, index) => {
      if (!item.LeaveTypeId || item.LeaveTypeId === 0) {
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
    const payload: AddUpdateLeaveCreditDebitRequest = {
      ...formData,
      LeaveTypebalanceJSONList: JSON.stringify(
        leaveBalanceTypes.map((item) => ({
          LeaveTypeBalanceId: item.LeaveTypeBalanceId || 0,
          LeaveTypeId: item.LeaveTypeId || 0,
          LeaveCredit: item.LeaveCredit || 0,
          LeaveCreditDebitId: item.LeaveCreditDebitId || 0,
        })),
      ),
    };
    const responseEither = await leaveCreditDebitService.apiCallAddUpdateLeaveCreditDebit(payload);
    if (E.isRight(responseEither)) {
      addToast({ type: 'success', title: 'Saved', message: 'Leave Credit/Debit saved successfully' });
      navigate(-1);
    } else {
      addToast({ type: 'error', title: 'Failed', message: responseEither.left.message });
    }
    setIsLoading(false);
    setIsLoadingMessage('');
  };

  const fetchEmployeeMasterDropdownWithDepartment = useCallback(
    async (pageNumber: number, params?: { value?: string }) => {
      return fetchEmployeeMasterDropdown(pageNumber, {
        ...params,
        departmentName: dropdownLabels.departmentName || '',
      });
    },
    [dropdownLabels.departmentName],
  );

  return (
    <div className="p-6">
      <Loader loading={isLoading} title={loadingMessage}>
        <div />
      </Loader>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            {formData.LeaveCreditDebitId ? 'Update Leave Credit/Debit' : 'Add Leave Credit/Debit'}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)} size="sm">
              Back
            </Button>
            {canAction && (
              <Button color="blue" onClick={handleSave} size="sm">
                Save
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SingleSelectDropdownWithPagination
              label="Leave Period Mode"
              title="Select Leave Period Mode"
              required
              size="lg"
              dataFetchCallBack={async () => ({
                totalNumberOfRecord: LEAVE_PERIOD_MODES.length,
                itemList: LEAVE_PERIOD_MODES,
              })}
              onSelected={(item) => {
                handleFieldChange('LeavePeriodMode', item.value);
                if (item.value !== 'Monthly') handleFieldChange('Month', '');
              }}
              initialValue={
                formData.LeavePeriodMode
                  ? { label: formData.LeavePeriodMode, value: formData.LeavePeriodMode }
                  : null
              }
              error={errors.LeavePeriodMode}
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

            {formData.LeavePeriodMode === 'Monthly' && (
              <SingleSelectDropdownWithPagination
                label="Month"
                title="Select Month"
                required
                size="lg"
                dataFetchCallBack={async () => ({
                  totalNumberOfRecord: MONTHS.length,
                  itemList: MONTHS,
                })}
                onSelected={(item) => handleFieldChange('Month', item.value)}
                initialValue={formData.Month ? { label: formData.Month, value: formData.Month } : null}
                error={errors.Month}
              />
            )}

            <SingleSelectDropdownWithPagination
              label="Department"
              title="Select Department"
              required
              size="lg"
              dataFetchCallBack={fetchDepartmentMasterDropdown}
              onSelected={(item) => {
                handleFieldChange('DepartmentMasterId', item.value);
                setDropdownLabels((prev) => ({ ...prev, departmentName: item.label }));
                handleFieldChange('EmployeeId', '');
                setDropdownLabels((prev) => ({ ...prev, employeeName: '' }));
              }}
              initialValue={createDropdownInitialValue(
                formData.DepartmentMasterId ? String(formData.DepartmentMasterId) : null,
                dropdownLabels.departmentName,
              )}
              error={errors.DepartmentMasterId}
            />

            <SingleSelectDropdownWithPagination
              label="Employee"
              title="Select Employee"
              required
              size="lg"
              dataFetchCallBack={fetchEmployeeMasterDropdownWithDepartment}
              onSelected={(item) => {
                handleFieldChange('EmployeeId', item.value);
                setDropdownLabels((prev) => ({ ...prev, employeeName: item.label }));
              }}
              initialValue={createDropdownInitialValue(
                formData.EmployeeId ? String(formData.EmployeeId) : null,
                dropdownLabels.employeeName,
              )}
              error={errors.EmployeeId}
              disabled={!formData.DepartmentMasterId}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Leave Balance Types</h4>
              <Button type="button" color="blue" size="sm" onClick={handleAddLeaveBalanceType} leftIcon={<Plus className="h-4 w-4" />}>
                Add Leave Type
              </Button>
            </div>
            {errors.LeaveBalanceTypes && <p className="text-sm text-red-600">{errors.LeaveBalanceTypes}</p>}

            {leaveBalanceTypes.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">No leave balance types added.</div>
            ) : (
              <div className="space-y-3">
                {leaveBalanceTypes.map((item, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="text-sm font-medium text-gray-700">Leave Balance Type #{index + 1}</h5>
                      <Button
                        type="button"
                        color="red"
                        variant="solid"
                        colorMode="light"
                        size="sm"
                        onClick={() => handleRemoveLeaveBalanceType(index)}
                        leftIcon={<X className="h-4 w-4" />}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SingleSelectDropdownWithPagination
                        label="Leave Type"
                        title="Select Leave Type"
                        size="md"
                        required
                        dataFetchCallBack={fetchLeaveTypeMasterDropdown}
                        onSelected={(selectedItem) => handleUpdateLeaveBalanceType(index, 'LeaveTypeId', Number(selectedItem.value))}
                        initialValue={
                          item.LeaveTypeId
                            ? createDropdownInitialValue(String(item.LeaveTypeId), '')
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
        </div>
      </div>
    </div>
  );
};

export default AddUpdateLeaveCreditDebit;

