import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input } from '@/ui/components/forms';
import { TextArea } from '@/ui/components/forms/Textarea';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchLeaveTypeMasterDropdown } from '@/features/leaveTypeMaster/leaveTypeMasterDropdown';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import { MultiFilePicker } from '@/ui/components/ImagePicker/MultiFilePicker';
import type { AddUpdateLeaveRequest, FilterWithPaginationLeaveRequest } from '@/features/leave/models/LeaveModel';
import { LeaveService } from '@/features/leave/services/LeaveService';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { formatDate_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd } from '@/core/utils/dateFormat';
import { DateRangePickerModal } from '@/ui/components/forms/DateRangePickerModel';
import { DateInput } from '@/ui/components/forms/DateInput';
import { Loader } from '@/core/utils/loader';
import { runApiWithLoader } from '@/core/utils';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useLeaveListState } from '@/features/leave/context/LeaveListStateContext';
import { parseDocumentUrls } from '@/core/utils/documentUtils';

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
    RemoveLeaveURL: '',
});

export const AddUpdateLeave: React.FC = () => {
    //#region STATE MANAGEMENT
    const [formData, setFormData] = useState<AddUpdateLeaveRequest>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // NAVIGATE
    const navigate = useNavigate();

    //GET VALUE FROM URL :ID
    const { id } = useParams<{ id?: string }>();

    // TOAST
    const { addToast } = useToast();

    //#region LEAVE LIST STATE CONTEXT
    const { resetFilters } = useLeaveListState();
    //#endregion

    //ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [dropdownLabels, setDropdownLabels] = useState<{ leaveTypeName?: string }>({});
    const [dateModalKey, setDateModalKey] = useState(0);
    const [leaveDocumentFiles, setLeaveDocumentFiles] = useState<(File | string)[]>([]);
    const [removedLeaveUrls, setRemovedLeaveUrls] = useState<string[]>([]);
    const [leaveDocumentURL, setLeaveDocumentURL] = useState<string>("");
    const initialLeaveUrlsRef = useRef<string[]>([]);
    //#endregion

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/leave');
    //#endregion

    //#region INITIALIZATION
    useEffect(() => {
        if (id) {
            fetchLeaveDetails();
            return;
        }

        setFormData(initialFormState());
        setDropdownLabels({});
        setErrors({});
        setLeaveDocumentFiles([]);
        setLeaveDocumentURL("");
        initialLeaveUrlsRef.current = [];
        setRemovedLeaveUrls([]);
    }, [id]);
    //#endregion

    //#region FETCH LEAVE DETAILS
    const fetchLeaveDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationLeaveRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    LeaveId: Number(id)
                };

                const response = await LeaveService.apiCallPullLeave(params);

                if (E.isRight(response)) {
                    const e = response.right.Data?.[0];

                    if (e) {
                        const existingUrls = parseDocumentUrls(e.LeaveDocumentURL || "");
                        initialLeaveUrlsRef.current = existingUrls;

                        setFormData(prev => ({
                            ...prev,
                            LeaveId: e.LeaveId ?? prev.LeaveId,
                            Uniquekey: e.Uniquekey ?? prev.Uniquekey,
                            LeaveTypeMasterId: e.LeaveTypeMasterId ?? prev.LeaveTypeMasterId,
                            StartDate: e.StartDate ?? prev.StartDate,
                            EndDate: e.EndDate ?? prev.EndDate,
                            StartDateLeaveDuration: e.StartDateLeaveDuration ?? prev.StartDateLeaveDuration,
                            EndDateLeaveDuration: e.EndDateLeaveDuration ?? prev.EndDateLeaveDuration,
                            Reason: e.Reason ?? prev.Reason,
                            RemoveLeaveURL: '',
                        }));

                        setLeaveDocumentFiles([]);
                        setLeaveDocumentURL(e.LeaveDocumentURL || "");
                        setRemovedLeaveUrls([]);

                        setDropdownLabels({
                            leaveTypeName: e.LeaveType || '',
                        });
                    }
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
            'Loading Leave'
        );
    };
    //#endregion

    //#region RESET DATE RANGE
    const handleResetDateRange = () => {
        setFormData((prev) => ({
            ...prev,
            StartDate: null,
            EndDate: null,
            StartDateLeaveDuration: 'Full',
            EndDateLeaveDuration: 'Full',
        }));
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.StartDate;
            delete newErrors.EndDate;
            delete newErrors.StartDateLeaveDuration;
            delete newErrors.EndDateLeaveDuration;
            return newErrors;
        });
        // Force modal to reset by incrementing key
        setDateModalKey((prev) => prev + 1);
    };
    //#endregion

    //#region LEAVE VALIDATION | ADD | UPDATE ACTION
    // ============================================================= [VALIDATION FUNCTION] =============================================================================================
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

    // ============================================================= [ADD UPDATE FUNCTION] =============================================================================================
    const handleSave = async () => {
        setErrors({});

        const validation = validateLeaveForm();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload: AddUpdateLeaveRequest = {
                    ...formData,
                    StartDate: formData.StartDate,
                    EndDate: formData.EndDate,
                    LeaveDocumentFiles: leaveDocumentFiles || [],
                    RemoveLeaveURL: removedLeaveUrls.join(','),
                };
                const respEither = await LeaveService.apiCallAddUpdateLeave(payload);

                if (E.isRight(respEither)) {
                    const response = respEither.right;

                    // Check backend ErrorMessage first
                    if (response.ErrorMessage && response.ErrorMessage.length > 0) {
                        addToast({ type: 'error', title: response.ErrorMessage[0] });
                    } else if (response.WarningMessage && response.WarningMessage.length > 0) {
                        addToast({ type: 'warning', title: response.WarningMessage[0] });
                        resetFilters();
                        navigate('/leave');
                    } else {
                        // Success - use backend SuccessMessage
                        addToast({ type: 'success', title: response.SuccessMessage?.[0] });
                        resetFilters();
                        navigate('/leave');
                    }
                } else {
                    addToast({ type: 'error', title: respEither.left.message });
                }

                return respEither;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Saving Leave...'
        );
    };
    //#endregion

    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div />
            </Loader>

            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll">
                <form onSubmit={(e) => { e.preventDefault(); void handleSave(); }}>
                    {/* ============================================================= [LEAVE DETAILS] ============================================================================================= */}
                    <div className="space-y-4 pb-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">Leave Details</h3>

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
                                    value={leaveDocumentFiles}
                                    onChange={setLeaveDocumentFiles}
                                    availableFilesURL={leaveDocumentURL ?? ""}
                                    allowedTypes={["image/jpeg", "image/png", "application/pdf"]}
                                    maxFiles={5}
                                    maxSizeMB={10}
                                    onRemoveExisting={(url) => {
                                        setRemovedLeaveUrls((prev) => [...prev, url]);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <BottomActionBar
                cancelText="Cancel"
                saveText={formData.LeaveId && formData.LeaveId > 0 ? "Update" : "Add"}
                onCancel={() => navigate(-1)}
                canAction={canAction}
                onSave={() => {
                    void handleSave();
                }}
                isLoading={isLoading}
            />

            <DateRangePickerModal
                key={dateModalKey}
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
                onReset={handleResetDateRange}
                resetText="Reset"
                startDate={formData.StartDate || null}
                endDate={formData.EndDate || null}
                title="Select Leave Date Range"
                confirmText="Confirm Dates"
                cancelText=""
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
                                openCalendarOnClick={false}
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
                                openCalendarOnClick={false}
                            />
                        </div>

                        <div>
                            <SingleSelectDropdownWithPagination
                                label="Start Date Duration"
                                title="Select Duration"
                                size="lg"
                                required
                                isShowClearSelection={false}
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
                                isShowClearSelection={false}
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