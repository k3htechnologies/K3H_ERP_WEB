import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Input } from '@/ui/components/forms';
import { TextArea } from '@/ui/components/forms/Textarea';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchLeaveTypeMasterDropdown } from '@/features/leaveTypeMaster/leaveTypeMasterDropdown';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import { MultiFilePicker } from '@/ui/components/ImagePicker/MultiFilePicker';
import type { AddUpdateLeaveRequest, LeaveData } from '@/features/leave/models/LeaveModel';
import { LeaveService } from '@/features/leave/services/LeaveService';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { formatDate_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd } from '@/core/utils/dateFormat';
import { DateRangePickerModal } from '@/ui/components/forms/DateRangePickerModel';
import { DateInput } from '@/ui/components/forms/DateInput';
import { Loader } from '@/core/utils/loader';
import { runApiWithLoader } from '@/core/utils';
import { ChevronLeft } from 'lucide-react';

const LEAVE_DURATION_OPTIONS = [
    { label: 'Full Day', value: 'Full' },
    { label: 'Half Day (First Half)', value: 'HalfFirst' },
    { label: 'Half Day (Second Half)', value: 'HalfSecond' },
];

const initialFormState = (): AddUpdateLeaveRequest => ({
    LeaveId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    LeaveTypeMasterId: 0,
    StartDate: null,
    EndDate: null,
    StartDateLeaveDuration: 'Full',
    EndDateLeaveDuration: 'Full',
    Reason: '',
    LeaveDocumentFiles: [],
});

export const AddUpdateLeave: React.FC = () => {
    //#region STATE MANAGEMENT
    const { id } = useParams<{ id?: string }>();
    const location = useLocation() as { state?: { data?: LeaveData | null } };
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [formData, setFormData] = useState<AddUpdateLeaveRequest>(initialFormState());
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [dropdownLabels, setDropdownLabels] = useState<{ leaveTypeName?: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    //#endregion

    //#region INIT
    useEffect(() => {
        const incoming = location.state?.data;
        if (id && incoming) {
            setFormData({
                LeaveId: incoming.LeaveId,
                Uniquekey: incoming.Uniquekey || initialFormState().Uniquekey,
                LeaveTypeMasterId: incoming.LeaveTypeMasterId,
                StartDate: incoming.StartDate,
                EndDate: incoming.EndDate,
                StartDateLeaveDuration: incoming.StartDateLeaveDuration || 'Full',
                EndDateLeaveDuration: incoming.EndDateLeaveDuration || 'Full',
                Reason: incoming.Reason || '',
                LeaveDocumentFiles: [],
            });
            setDropdownLabels({
                leaveTypeName: incoming.LeaveType || '',
            });
        } else {
            setFormData(initialFormState());
            setDropdownLabels({});
        }
        setErrors({});
    }, [id, location.state]);
    //#endregion

    //#region RESET FORM
    const handleReset = () => {
        const incoming = location.state?.data;
        if (id && incoming) {
            setFormData({
                LeaveId: incoming.LeaveId,
                Uniquekey: incoming.Uniquekey || initialFormState().Uniquekey,
                LeaveTypeMasterId: incoming.LeaveTypeMasterId,
                StartDate: incoming.StartDate,
                EndDate: incoming.EndDate,
                StartDateLeaveDuration: incoming.StartDateLeaveDuration || 'Full',
                EndDateLeaveDuration: incoming.EndDateLeaveDuration || 'Full',
                Reason: incoming.Reason || '',
                LeaveDocumentFiles: [],
            });
            setDropdownLabels({
                leaveTypeName: incoming.LeaveType || '',
            });
        } else {
            setFormData(initialFormState());
            setDropdownLabels({});
        }
        setErrors({});
        setIsDateModalOpen(false);
    };
    //#endregion

    //#region VALIDATION
    const validateLeaveForm = (): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [k: string]: string } = {};
        if (!formData.LeaveTypeMasterId) newErrors.LeaveTypeMasterId = 'Leave Type is required';
        const finalStart = formData.StartDate;
        const finalEnd = formData.EndDate;
        if (!finalStart) newErrors.StartDate = 'Start Date is required';
        if (!finalEnd) newErrors.EndDate = 'End Date is required';
        if (!formData.StartDateLeaveDuration) newErrors.StartDateLeaveDuration = 'Start duration required';
        if (!formData.EndDateLeaveDuration) newErrors.EndDateLeaveDuration = 'End duration required';
        if (!formData.Reason || formData.Reason.trim() === '') newErrors.Reason = 'Reason is required';

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };
    //#endregion

    //#region ADD UPDATE LEAVE
    const handleSave = async () => {
        setErrors({});

        const validation = validateLeaveForm();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setIsSaving(true);
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload: AddUpdateLeaveRequest = {
                    ...formData,
                    StartDate: formData.StartDate,
                    EndDate: formData.EndDate,
                    LeaveDocumentFiles: formData.LeaveDocumentFiles || [],
                };
                const respEither = await LeaveService.apiCallAddUpdateLeave(payload);

                if (E.isRight(respEither)) {
                    const response = respEither.right;

                    // Check backend ErrorMessage first
                    if (response.ErrorMessage && response.ErrorMessage.length > 0) {
                        addToast({ type: 'error', title: response.ErrorMessage[0] });
                    } else if (response.WarningMessage && response.WarningMessage.length > 0) {
                        addToast({ type: 'warning', title: response.WarningMessage[0] });
                        navigate(-1);
                    } else {
                        // Success - use backend SuccessMessage
                        addToast({ type: 'success', title: response.SuccessMessage?.[0] });
                        navigate(-1);
                    }
                } else {
                    addToast({ type: 'error', title: respEither.left.message });
                }

                return respEither;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error?.message });
            },
            undefined,
            'Saving Leave...'
        );
        setIsSaving(false);
    };
    //#endregion

    return (
        <div className="p-6" style={{ backgroundColor: '#F9FAFB' }}>
            <Loader loading={isLoading} title={loadingMessage}>
                <div />
            </Loader>
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <ChevronLeft
                        className="w-6 h-6 text-blue-800 cursor-pointer hover:text-blue-800 transition-colors"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(-1);
                        }}
                    />
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {formData.LeaveId ? 'Update Leave' : 'Add Leave'}
                    </h2>
                </div>

                {/* Details Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex-1 space-y-2 px-6 py-3 pb-20 overflow-y-auto thin-scroll">
                        <form onSubmit={(e) => { e.preventDefault(); void handleSave(); }} className="space-y-4">
                            <div className="space-y-4 pb-3">
                                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Leave Details</h3>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <SingleSelectDropdownWithPagination
                                            label="Leave Type"
                                            title="Select Leave Type"
                                            size="md"
                                            required
                                            dataFetchCallBack={async (pageNumber: number, params?: { value?: string }) =>
                                                fetchLeaveTypeMasterDropdown(pageNumber, params)
                                            }
                                            onSelected={(item) => {
                                                setFormData((prev) => ({ ...prev, LeaveTypeMasterId: Number(item.value) }));
                                                setDropdownLabels((prev) => ({ ...prev, leaveTypeName: item.label }));
                                            }}
                                            initialValue={createDropdownInitialValue(
                                                formData.LeaveTypeMasterId ? String(formData.LeaveTypeMasterId) : null,
                                                dropdownLabels.leaveTypeName,
                                            )}
                                            error={errors.LeaveTypeMasterId}
                                        />

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date Range <span className="text-red-500">*</span>
                                            </label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsDateModalOpen(true)}
                                                className="w-full justify-start hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                                fullWidth
                                            >
                                                {formData.StartDate && formData.EndDate
                                                    ? `${formatDate_dd_mm_yyyy(formData.StartDate)} - ${formatDate_dd_mm_yyyy(formData.EndDate)}`
                                                    : 'Select Date Range'}
                                            </Button>
                                            {(errors.StartDate || errors.EndDate) && (
                                                <p className="text-sm text-red-600 mt-1">{errors.StartDate || errors.EndDate}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <TextArea
                                            label="Reason"
                                            required
                                            value={formData.Reason || ''}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                                setFormData((prev) => ({ ...prev, Reason: e.target.value }))
                                            }
                                            error={errors.Reason}
                                            placeholder="Enter reason"
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <MultiFilePicker
                                            label="Leave Documents"
                                            value={formData.LeaveDocumentFiles || []}
                                            onChange={(files) => setFormData((prev) => ({ ...prev, LeaveDocumentFiles: files }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end items-center gap-3 pt-4">
                                <Button
                                    color="blue"
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        void handleSave();
                                    }}
                                    disabled={isSaving}
                                >
                                    Save
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <DateRangePickerModal
                isOpen={isDateModalOpen}
                onClose={() => setIsDateModalOpen(false)}
                onConfirm={(startDate, endDate) => {
                    setFormData((prev) => ({
                        ...prev,
                        StartDate: startDate,
                        EndDate: endDate,
                    }));
                    setIsDateModalOpen(false);
                    if (errors.StartDate || errors.EndDate) {
                        setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.StartDate;
                            delete newErrors.EndDate;
                            return newErrors;
                        });
                    }
                }}
                startDate={formData.StartDate || null}
                endDate={formData.EndDate || null}
                title="Select Leave Date Range"
                confirmText="Confirm Dates"
                cancelText="Cancel"
                showSummary={false}
                renderChildren={({ startDate, endDate, onSelectField, onClearField, editingField }) => (
                    <div className="space-y-4">
                        <div>
                            <DateInput
                                label="Start Date"
                                required
                                value={startDate ? formatDate_dd_mm_yyyy(startDate) : null}
                                onChange={(value) => {
                                    if (value) {
                                        const converted = convert_dd_mm_yyyy_To_Yyyy_mm_dd(value);
                                        if (converted) {
                                            onSelectField?.('start');
                                        }
                                    } else {
                                        onClearField?.('start');
                                    }
                                }}
                                onClear={() => {
                                    onClearField?.('start');
                                }}
                                isActive={editingField === 'start'}
                                showClearButton={true}
                            />
                        </div>

                        <div>
                            <DateInput
                                label="End Date"
                                required
                                value={endDate ? formatDate_dd_mm_yyyy(endDate) : null}
                                onChange={(value) => {
                                    if (value) {
                                        const converted = convert_dd_mm_yyyy_To_Yyyy_mm_dd(value);
                                        if (converted) {
                                            onSelectField?.('end');
                                        }
                                    } else {
                                        onClearField?.('end');
                                    }
                                }}
                                onClear={() => {
                                    onClearField?.('end');
                                }}
                                isActive={editingField === 'end'}
                                showClearButton={true}
                            />
                        </div>

                        <div>
                            <SingleSelectDropdownWithPagination
                                label="Start Date Duration"
                                title="Select Duration"
                                size="lg"
                                required
                                dataFetchCallBack={async () => ({
                                    totalNumberOfRecord: LEAVE_DURATION_OPTIONS.length,
                                    itemList: LEAVE_DURATION_OPTIONS,
                                })}
                                onSelected={(item) => setFormData((prev) => ({ ...prev, StartDateLeaveDuration: String(item.value) }))}
                                initialValue={
                                    formData.StartDateLeaveDuration
                                        ? {
                                            label:
                                                LEAVE_DURATION_OPTIONS.find((d) => d.value === formData.StartDateLeaveDuration)?.label ||
                                                formData.StartDateLeaveDuration,
                                            value: formData.StartDateLeaveDuration,
                                        }
                                        : null
                                }
                                error={errors.StartDateLeaveDuration}
                            />
                        </div>

                        <div>
                            <SingleSelectDropdownWithPagination
                                label="End Date Duration"
                                title="Select Duration"
                                size="lg"
                                required
                                dataFetchCallBack={async () => ({
                                    totalNumberOfRecord: LEAVE_DURATION_OPTIONS.length,
                                    itemList: LEAVE_DURATION_OPTIONS,
                                })}
                                onSelected={(item) => setFormData((prev) => ({ ...prev, EndDateLeaveDuration: String(item.value) }))}
                                initialValue={
                                    formData.EndDateLeaveDuration
                                        ? {
                                            label:
                                                LEAVE_DURATION_OPTIONS.find((d) => d.value === formData.EndDateLeaveDuration)?.label ||
                                                formData.EndDateLeaveDuration,
                                            value: formData.EndDateLeaveDuration,
                                        }
                                        : null
                                }
                                error={errors.EndDateLeaveDuration}
                            />
                        </div>

                        <Input
                            label="Total Days (auto)"
                            disabled
                            value={
                                startDate && endDate
                                    ? (() => {
                                        const start = new Date(startDate);
                                        const end = new Date(endDate);
                                        if (isNaN(start.getTime()) || isNaN(end.getTime())) return '0';
                                        const diff = end.getTime() - start.getTime();
                                        const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
                                        const startHalf = formData.StartDateLeaveDuration?.startsWith('Half') ? 0.5 : 1;
                                        const endHalf = formData.EndDateLeaveDuration?.startsWith('Half') ? 0.5 : 1;
                                        if (days <= 1) {
                                            return Math.max(startHalf, endHalf).toString();
                                        }
                                        return ((days - 2) + startHalf + endHalf).toString();
                                    })()
                                    : '0'
                            }
                            readOnly
                        />
                    </div>
                )}
            />
        </div>
    );
};

export default AddUpdateLeave;