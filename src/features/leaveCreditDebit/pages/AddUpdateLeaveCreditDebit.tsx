import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Input } from '@/ui/components/forms';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import MultiSelectPagination from '@/ui/components/DropDown/Multiselectpagination';
import { fetchDepartmentMasterDropdown } from '@/features/departmentMaster/departmentMasterDropdown';
import { fetchDesignationMasterDropdown } from '@/features/designationMaster/designationMasterDropDown';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import { useMultiSelectDropdown } from '@/core/hooks/useMultiSelectDropdown';
import type {
    AddUpdateLeaveCreditDebitRequest,
    LeaveBalanceType,
    FilterWithPaginationLeaveCreditDebitRequest
} from '@/features/leaveCreditDebit/models/leaveCreditDebit';
import { leaveCreditDebitService } from '@/features/leaveCreditDebit/services/LeaveCreditDebitService';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import { runApiWithLoader } from '@/core/utils';
import { Plus, Trash2 } from 'lucide-react';
import { fetchLeaveTypeMasterDropdown } from '@/features/leaveTypeMaster/leaveTypeMasterDropdown';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
const LEAVE_PERIOD_MODES = [
    { label: 'Yearly', value: 'Yearly' },
    { label: 'Monthly', value: 'Monthly' },
];

const initialFormState = (): AddUpdateLeaveCreditDebitRequest => ({
    LeaveCreditDebitId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    LeavePeriodMode: '',
    FYyear: new Date().getFullYear(),
    DepartmentMasterId: 0,
    DesignationId: '',
    LeaveTypebalanceJSONList: '',
});

export const AddUpdateLeaveCreditDebit: React.FC = () => {

    //#region STATE MANAGEMENT
    const [formData, setFormData] = useState<AddUpdateLeaveCreditDebitRequest>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const [leaveBalanceTypes, setLeaveBalanceTypes] = useState<LeaveBalanceType[]>([]);
    const [leaveTypeLabels, setLeaveTypeLabels] = useState<{ [index: number]: string }>({});
    const [designationValue, setDesignationValue] = useState<string | number | null>(null);

    //SET DROP DOWN LABELS
    const [dropdownLabels, setDropdownLabels] = useState<{
        departmentName?: string;
    }>({});
    const leaveBalanceTypeRefs = useRef<{ [index: number]: HTMLDivElement | null }>({});

    // NAVIGATE
    const navigate = useNavigate();
    const location = useLocation();

    //GET VALUE FROM URL :ID
    const { id } = useParams<{ id?: string }>();

    // TOAST
    const { addToast } = useToast();

    //ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    // Only auto-fetch options on initial load, not on every selection change
    const [shouldAutoFetch, setShouldAutoFetch] = useState(true);
    
    const designationDropdown = useMultiSelectDropdown({
        value: formData.DesignationId || designationValue,
        fetchCallback: fetchDesignationMasterDropdown,
        autoFetchOptions: shouldAutoFetch && (!!formData.DesignationId || !!designationValue),
    });

    //#endregion

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/leaveCreditDebit');
    //#endregion

    //#region HANDLE CHNAGE EVENT WHEN INPUT BOX ANY OTHER
    const handleFieldChange = (field: keyof AddUpdateLeaveCreditDebitRequest, value: any) => {

        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    //#endregion

    //#region LOAD LEAVE CREDIT DEBIT DATA
    const fetchLeaveCreditDebitDetails = useCallback(async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationLeaveCreditDebitRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    IsCheckPermission: false,
                    LeaveCreditDebitId: Number(id)
                }

                const response = await leaveCreditDebitService.apiCallPullLeaveCreditDebit(params);

                if (E.isRight(response)) {

                    const row = response.right.Data?.[0];

                    if (row) {
                        setFormData(prev => ({
                            ...prev,
                            LeaveCreditDebitId: row.LeaveCreditDebitId ?? prev.LeaveCreditDebitId,
                            Uniquekey: row.Uniquekey ?? prev.Uniquekey,
                            LeavePeriodMode: row.LeavePeriodMode ?? prev.LeavePeriodMode ?? '',
                            FYyear: row.FYyear ?? prev.FYyear ?? new Date().getFullYear(),
                            DesignationId: row.DesignationId ?? prev.DesignationId ?? '',
                            DepartmentMasterId: row.DepartmentMasterId ?? prev.DepartmentMasterId ?? 0,
                            LeaveTypebalanceJSONList: '',
                        }));
                        setLeaveBalanceTypes(row.LeaveBalanceType || []);

                        setDropdownLabels({
                            departmentName: row.DepartmentName || ''
                        });

                        if (row.LeaveBalanceType && row.LeaveBalanceType.length > 0) {
                            const labels: { [index: number]: string } = {};
                            row.LeaveBalanceType.forEach((item, index) => {
                                if (item.LeaveTypeName) {
                                    labels[index] = item.LeaveTypeName;
                                }
                            });
                            setLeaveTypeLabels(labels);
                        }

                        if (row.DesignationId) {
                            const designationIdValue = typeof row.DesignationId === 'string'
                                ? row.DesignationId
                                : String(row.DesignationId);
                            setDesignationValue(designationIdValue);
                            setShouldAutoFetch(true); // Enable auto-fetch to load selected options
                        } else {
                            setDesignationValue(null);
                            setShouldAutoFetch(false);
                        }
                    }

                } else {

                    addToast({ type: 'error', title: response.left.message });

                }
                return response;
            },
            undefined,
            (error: any) => {

                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Loading Leave Credit Debit Data'
        );
    }, [id, addToast]);
    //#endregion

    //#region INITIALIZATION
    useEffect(() => {

        if (id) {
            setShouldAutoFetch(true); // Enable auto-fetch when loading existing data
            fetchLeaveCreditDebitDetails();
            return;
        }

        setFormData(initialFormState());
        setLeaveBalanceTypes([]);
        setLeaveTypeLabels({});
        setDropdownLabels({});
        setDesignationValue(null);
        setShouldAutoFetch(false); // Disable auto-fetch for new entries
    }, [id, fetchLeaveCreditDebitDetails]);

    // Disable auto-fetch after initial load to prevent re-fetching on every selection
    useEffect(() => {
        if (shouldAutoFetch && (formData.DesignationId || designationValue)) {
            // After initial options are loaded, disable auto-fetch
            const timer = setTimeout(() => {
                setShouldAutoFetch(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [shouldAutoFetch, formData.DesignationId, designationValue]);

    //#endregion

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

    //#region [VALIDATION FUNCTION]

    const validateAddLeaveCreditDebitForm = (): {

        isValid: boolean

        errors: { [key: string]: string }

    } => {

        const newErrors: { [key: string]: string } = {}

        if (!formData.LeavePeriodMode?.trim()) {
            newErrors.LeavePeriodMode = "Leave Period Mode is required.";
        }

        if (!formData.FYyear || formData.FYyear === 0) {
            newErrors.FYyear = "Financial Year is required.";
        }

        if (!formData.DepartmentMasterId || formData.DepartmentMasterId === 0) {
            newErrors.DepartmentMasterId = "Department is required.";
        }

        if (leaveBalanceTypes.length === 0) {
            newErrors.LeaveBalanceTypes = "Add at least one Leave Balance Type.";
        }

        leaveBalanceTypes.forEach((item, index) => {
            const leaveTypeId = Number(item.LeaveTypeId);
            if (!leaveTypeId || leaveTypeId === 0 || isNaN(leaveTypeId)) {
                newErrors[`LeaveBalanceType_${index}_LeaveTypeId`] = "Leave Type is required.";
            }
            if (item.LeaveCredit === undefined || item.LeaveCredit === null || item.LeaveCredit < 0) {
                newErrors[`LeaveBalanceType_${index}_LeaveCredit`] = "Leave Credit must be valid.";
            }
        });

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }
    //#endregion

    //#region ADD UPDATE LEAVE CREDIT DEBIT
    const PushLeaveCreditDebitFormData = (): AddUpdateLeaveCreditDebitRequest => {
        // Get designation IDs from the hook
        const designationIdsString = designationDropdown.selectedValues.length > 0
            ? designationDropdown.selectedValues.join(',')
            : '';

        return {
            ...formData,
            DepartmentMasterId: formData.DepartmentMasterId || 0,
            DesignationId: designationIdsString,
            LeaveTypebalanceJSONList: JSON.stringify(
                leaveBalanceTypes.map((item) => ({
                    LeaveTypeBalanceId: item.LeaveTypeBalanceId || 0,
                    LeaveTypeId: item.LeaveTypeId || 0,
                    LeaveCredit: item.LeaveCredit || 0,
                    LeaveCreditDebitId: item.LeaveCreditDebitId || formData.LeaveCreditDebitId || 0,
                })),
            ),
        };
    }

    const handleSubmit = async () => {

        setErrors({})


        const validation = validateAddLeaveCreditDebitForm()

        if (!validation.isValid) {

            setErrors(validation.errors)

            return
        }

        await runApiWithLoader(
            setIsLoading,

            setLoadingMessage,
            async () => {

                const payload = PushLeaveCreditDebitFormData();

                const response = await leaveCreditDebitService.apiCallAddUpdateLeaveCreditDebit(payload);

                if (E.isRight(response)) {
                    const apiResponse = response.right;
                    
                    // Check backend ErrorMessage first
                    if (apiResponse.ErrorMessage && apiResponse.ErrorMessage.length > 0) {
                        addToast({ type: "error", title: apiResponse.ErrorMessage[0] });
                    } else if (apiResponse.WarningMessage && apiResponse.WarningMessage.length > 0) {
                        addToast({ type: "warning", title: apiResponse.WarningMessage[0] });
                        // Get list state from navigation if available, otherwise use defaults
                        const locationState = location.state as {
                            listState?: {
                                page?: number;
                                filters?: any;
                                sortInfo?: any;
                                searchTerm?: string;
                            };
                        } | null;

                        const listState = locationState?.listState || {
                            page: 1,
                            filters: {},
                            sortInfo: undefined,
                            searchTerm: '',
                        };

                        navigate("/leaveCreditDebit", {
                            state: { listState }
                        });
                    } else {
                        // Success - use backend SuccessMessage
                        addToast({ type: "success", title: apiResponse.SuccessMessage?.[0] });

                        // Get list state from navigation if available, otherwise use defaults
                        const locationState = location.state as {
                            listState?: {
                                page?: number;
                                filters?: any;
                                sortInfo?: any;
                                searchTerm?: string;
                            };
                        } | null;

                        const listState = locationState?.listState || {
                            page: 1,
                            filters: {},
                            sortInfo: undefined,
                            searchTerm: '',
                        };

                        navigate("/leaveCreditDebit", {
                            state: { listState }
                        });
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

            Number(id) === 0 ? 'Add' : 'Update'
        )

    };

    //#endregion

    return (
        <div className="p-6" style={{ backgroundColor: '#F9FAFB' }}>
            <Loader loading={isLoading} title={loadingMessage}>
                <div />
            </Loader>
            <div className="space-y-6">
                <HeaderActionBar
                    titleText={formData.LeaveCreditDebitId && formData.LeaveCreditDebitId > 0 ? 'Update' : 'Add'}
                    cancelText="Cancel"
                    onCancel={() => navigate(-1)}
                    canAction={false}
                    isLoading={isLoading}
                />

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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <SingleSelectDropdownWithPagination
                            label="Department"
                            title="Select Department"
                            required
                            size="md"
                            dataFetchCallBack={fetchDepartmentMasterDropdown}
                            onSelected={(selectedItem) => {
                                const deptId = selectedItem?.value ? Number(selectedItem.value) : null;
                                handleFieldChange('DepartmentMasterId', deptId || 0);
                                setDropdownLabels(prev => ({ ...prev, departmentName: selectedItem?.label || '' }));
                                if (errors.DepartmentMasterId) {
                                    setErrors((prev) => ({ ...prev, DepartmentMasterId: '' }));
                                }
                            }}
                            initialValue={formData.DepartmentMasterId ? createDropdownInitialValue(String(formData.DepartmentMasterId), dropdownLabels.departmentName || '') : null}
                            error={errors.DepartmentMasterId}
                        />
                        <MultiSelectPagination
                            label="Designation"
                            dataFetchCallBack={fetchDesignationMasterDropdown}
                            selectedValues={designationDropdown.selectedValues}
                            options={designationDropdown.initialOptions}
                            onChange={(values) => {
                                const { idsString } = designationDropdown.handleChange(values);
                                const newValue = idsString || null;
                                setDesignationValue(newValue);
                                handleFieldChange('DesignationId', idsString || '');
                                setShouldAutoFetch(false); // Disable auto-fetch after user selection
                                if (errors.DesignationId) {
                                    setErrors((prev) => ({ ...prev, DesignationId: '' }));
                                }
                            }}
                        />
                    </div>
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
                    {errors.LeaveBalanceTypes && (
                        <div className="mb-3">
                            <p className="text-sm text-red-600">{errors.LeaveBalanceTypes}</p>
                        </div>
                    )}
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
                                    <Button
                                        type="button"
                                        color='red'
                                        size='xs'
                                        onClick={() => handleRemoveLeaveBalanceType(index)}
                                        title="Remove"
                                        className="absolute -top-2 right-2 bg-transparent border border-transparent text-red-500 hover:bg-red-100 transition-colors duration-200 rounded p-1"

                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
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
                                                    setLeaveTypeLabels((prev) => ({ ...prev, [index]: selectedItem.label || '' }));
                                                    if (errors[`LeaveBalanceType_${index}_LeaveTypeId`]) {
                                                        setErrors((prev) => ({ ...prev, [`LeaveBalanceType_${index}_LeaveTypeId`]: '' }));
                                                    }
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
                                            value={item.LeaveCredit}
                                            onChange={(e) =>
                                                handleUpdateLeaveBalanceType(
                                                    index,
                                                    'LeaveCredit',
                                                    e.target.value === '' ? 0 : Number(e.target.value)
                                                )
                                            }
                                            placeholder="Enter Leave Credit"
                                            error={errors[`LeaveBalanceType_${index}_LeaveCredit`]}
                                            min={0}
                                            step={1}
                                        />

                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <BottomActionBar
                    cancelText="Cancel"
                    saveText={formData.LeaveCreditDebitId ? "Update" : "Add"}
                    onCancel={() => navigate(-1)}
                    onSave={() => {
                        handleSubmit();
                    }}
                    canAction={canAction}
                    isLoading={isLoading}
                />

            </div>

        </div>
    );
};

export default AddUpdateLeaveCreditDebit;
