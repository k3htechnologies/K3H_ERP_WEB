import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { formatDate_dd_MonthName_yy, formatDate_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd } from '@/core/utils/dateFormat';
import { runApiWithLoader } from '@/core/utils';
import type { FilterWithPaginationAttendanceRequest, AttendanceData, AddUpdateAttendanceRegularization, AttendanceRegularizationData, FilterWithPaginationAttendanceRegularizationRequest } from '../models/AttendanceModel';
import { attendanceService } from '../services/AttendanceService';
import { attendanceRegularizationService } from '../services/AttendanceRegularizationService';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import AttendanceMonthView from '@/ui/components/AttendanceCalendar/AttendanceMonthView';
import type { AttendanceCalendarEvent } from '@/ui/components/AttendanceCalendar/AttendanceCalendarEvent';

import { buildEventDateTime, convertToISO, getStatusColor, matchesFilter, normalizeStatus, extractTimeFromDateTime, convertTimeTo24Hour, combineDateAndTime, } from '../utils/attendanceUtils';

import { CalendarHeader } from '../components/CalendarHeader';
import { AttendanceDetailsCard } from '../components/AttendanceDetailsCard';
import { RegularizeModal, type RegularizeFormData } from '../components/RegularizeModal';
import { ClockCheck } from 'lucide-react';
import { Button } from '@/ui/components/forms/Button';


const AttendanceCalendar: React.FC = () => {

  //#region STATE
  const [displayAttendanceList, setDisplayAttendanceList] = useState<AttendanceData[]>([]);
  const [regularizationList, setRegularizationList] = useState<AttendanceRegularizationData[]>([]);
  const [displayedMonth, setDisplayedMonth] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('All');
  const [isRegularizeModalOpen, setIsRegularizeModalOpen] = useState(false);
  const [selectedAttendanceForRegularize, setSelectedAttendanceForRegularize] = useState<AttendanceData | null>(null);

  const initialRegularizeFormState = (): RegularizeFormData => ({
    AttendanceRegularizationId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    AttendanceDate: null,
    PunchInTime: '00:00',
    PunchOutTime: '00:00',
    Reason: null,
  });

  const [regularizeFormData, setRegularizeFormData] = useState<RegularizeFormData>(() => initialRegularizeFormState());
  const [regularizeErrors, setRegularizeErrors] = useState<{ [k: string]: string }>({});
  const [isRegularizeLoading, setIsRegularizeLoading] = useState(false);
  const [_regularizeLoadingMessage, setRegularizeLoadingMessage] = useState('');
  const { addToast } = useToast();
  const isMonthChangingRef = useRef(false);
  const previousDayEventsRef = useRef<AttendanceData[]>([]);
  //#endregion

  //#region HELPERS
  /** Timezone-safe local date key (FIX for Jan-1 inclusion) */
  const getLocalDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;

  const monthKey = useMemo(
    () => `${currentDate.getFullYear()}-${currentDate.getMonth()}`,
    [currentDate]
  );

  const getMonthDateRange = useCallback((date: Date) => {
    const fromDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const toDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    return { fromDate, toDate };
  }, []);
  //#endregion

  //#region LOAD ATTENDANCE
  const loadAttendance = useCallback(async () => {
    await runApiWithLoader(
      () => { },
      () => { },
      async () => {
        const { fromDate, toDate } = getMonthDateRange(currentDate);

        const params: FilterWithPaginationAttendanceRequest = {
          PageSize: 1000,
          PageNumber: 1,
          AttendanceId: 0,
          StartDate: fromDate.toISOString(),
          EndDate: toDate.toISOString(),
          IsReport: false,
          CanApprove: false
        };

        const response = await attendanceService.apiCallPullAttendance(params);

        if (E.isRight(response)) {
          setDisplayAttendanceList(response.right.Data);
          setDisplayedMonth(new Date(currentDate));
          isMonthChangingRef.current = false;
        } else {
          addToast({ type: 'error', title: response.left.message });
          isMonthChangingRef.current = false;
        }
      },
      undefined,
      undefined,
      undefined,
      'Loading Attendance'
    );
  }, [currentDate, getMonthDateRange, addToast]);

  //#region LOAD REGULARIZATION
  const loadRegularization = useCallback(async () => {
    await runApiWithLoader(
      () => { },
      () => { },
      async () => {
        const { fromDate, toDate } = getMonthDateRange(currentDate);

        const params: FilterWithPaginationAttendanceRegularizationRequest = {
          PageSize: 1000,
          PageNumber: 1,
          StartDate: fromDate.toISOString(),
          EndDate: toDate.toISOString(),
          IsReport: false,
          CanApprove: false
        };

        const response = await attendanceRegularizationService.apiCallPullAttendanceRegularization(params);

        if (E.isRight(response)) {
          setRegularizationList(response.right.Data || []);
        } else {
          console.error('Failed to load regularization data:', response.left.message);
        }
      },
      undefined,
      undefined,
      undefined,
      undefined,
    );
  }, [currentDate, getMonthDateRange]);

  useEffect(() => {
    isMonthChangingRef.current = true;
    loadAttendance();
    loadRegularization();
  }, [monthKey, loadAttendance, loadRegularization]);
  //#endregion

  //#region CALENDAR EVENTS
  const calendarEvents: AttendanceCalendarEvent[] = useMemo(() => {
    return displayAttendanceList
      .map(att => {
        if (!att.AttendanceDate) return null;

        const start = buildEventDateTime(att.AttendanceDate, att.PunchIn);
        if (!start) return null;

        return {
          id: String(att.AttendanceId ?? att.EmployeeId ?? ''),
          type: att.AttendanceStatus,
          title: att.FullName || '',
          start,
          end: buildEventDateTime(att.AttendanceDate, att.PunchOut) ?? start,
          employeeName: att.FullName,
          employeeId: String(att.EmployeeId ?? ''),
          status: att.AttendanceStatus,
        };
      })
      .filter(Boolean) as AttendanceCalendarEvent[];
  }, [displayAttendanceList]);

  const filteredCalendarEvents = useMemo(
    () => calendarEvents.filter(ev => matchesFilter(ev.type, activeTab)),
    [calendarEvents, activeTab]
  );
  //#endregion

  //#region SELECTED DATE EVENTS (FIXED)
  const eventsForSelectedDate = useMemo(() => {
    const key = getLocalDateKey(selectedDate);
    const result = displayAttendanceList.filter(att => {
      if (!att.AttendanceDate) return false;
      const attDate = convertToISO(att.AttendanceDate);
      return attDate?.slice(0, 10) === key;
    });
    previousDayEventsRef.current = result;
    return result;
  }, [displayAttendanceList, selectedDate]);

  const stableEventsForSelectedDate = useMemo(() => {
    if (isMonthChangingRef.current && previousDayEventsRef.current.length > 0) {
      return previousDayEventsRef.current;
    }
    return eventsForSelectedDate;
  }, [eventsForSelectedDate]);
  //#endregion

  //#region CALLBACKS

  const handleDateChange = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      const newKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (newKey !== monthKey) setCurrentDate(date);
    },
    [monthKey]
  );

  const handleEventClick = useCallback(
    (event: AttendanceCalendarEvent) => {
      const [y, m, d] = event.start.split('T')[0].split('-').map(Number);
      handleDateChange(new Date(y, m - 1, d));
    },
    [handleDateChange]
  );
  //#endregion

  const handlePreviousMonth = useCallback(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(date);
    setSelectedDate(date);
  }, [currentDate]);
  //#endregion

  const handleNextMonth = useCallback(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(date);
    setSelectedDate(date);
  }, [currentDate]);
  //#endregion

  // Check if attendance status allows regularization (only Absent and Checkout Missing)
  const canRegularize = useCallback((status?: string | null): boolean => {
    if (!status) return false;
    const normalized = normalizeStatus(status);
    return normalized === 'ABSENT' || normalized === 'CHECKOUT_MISSING' ||
      normalized.includes('CHECKOUT') || normalized.includes('MISSING');
  }, []);
  //#endregion

  // Get regularization data for a given attendance date
  const getRegularizationForDate = useCallback((attendanceDate?: string | null): AttendanceRegularizationData | null => {
    if (!attendanceDate || regularizationList.length === 0) return null;

    // Convert attendance date to ISO and extract date part
    const attIsoDate = convertToISO(attendanceDate);
    if (!attIsoDate) return null;
    const attDateKey = attIsoDate.split('T')[0]; // YYYY-MM-DD

    // Find matching regularization
    return regularizationList.find(reg => {
      if (!reg.AttendanceDate) return false;

      // Try multiple date format conversions
      let regDateKey: string | null = null;

      // If already in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
      if (reg.AttendanceDate.includes('T')) {
        regDateKey = reg.AttendanceDate.split('T')[0];
      } else {
        // Try converting from other formats
        const regIsoDate = convertToISO(reg.AttendanceDate);
        if (regIsoDate) {
          regDateKey = regIsoDate.split('T')[0];
        }
      }

      return regDateKey === attDateKey;
    }) || null;
  }, [regularizationList]);

  // Check if regularization already exists for a given attendance date
  const hasRegularization = useCallback((attendanceDate?: string | null): boolean => {
    return getRegularizationForDate(attendanceDate) !== null;
  }, [getRegularizationForDate]);

  const handleRegularize = useCallback((attendance: AttendanceData) => {
    setSelectedAttendanceForRegularize(attendance);

    // Initialize form with attendance data
    const attendanceDate = convertToISO(attendance.AttendanceDate);

    // Check if status is checkout missing
    const normalizedStatus = normalizeStatus(attendance.AttendanceStatus);
    const isCheckoutMissing = normalizedStatus === 'CHECKOUT_MISSING' ||
      normalizedStatus.includes('CHECKOUT') ||
      normalizedStatus.includes('MISSING');

    // Extract time from punch in/out using centralized utility
    let punchInTime = extractTimeFromDateTime(attendance.PunchIn);
    let punchOutTime = extractTimeFromDateTime(attendance.PunchOut);

    // For checkout missing: bind the actual punch in time from attendance record (like attendance status)
    // For other statuses: use extracted time or default to 00:00
    if (isCheckoutMissing) {
      // For checkout missing, use the actual punch in time if it exists, otherwise 00:00
      punchInTime = punchInTime || '00:00';
      // Punch out will be missing for checkout missing, so default to 00:00
      punchOutTime = punchOutTime || '00:00';
    } else {
      // For other statuses (like absent), default to 00:00 if not available
      punchInTime = punchInTime || '00:00';
      punchOutTime = punchOutTime || '00:00';
    }

    setRegularizeFormData({
      AttendanceRegularizationId: 0,
      Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      AttendanceDate: attendanceDate ? formatDate_dd_mm_yyyy(attendanceDate) : null,
      PunchInTime: punchInTime,
      PunchOutTime: punchOutTime,
      Reason: null,
    });
    setRegularizeErrors({});
    setIsRegularizeModalOpen(true);
  }, []);
  //#endregion

  const handleCloseRegularizeModal = useCallback(() => {
    setIsRegularizeModalOpen(false);
    setSelectedAttendanceForRegularize(null);
    setRegularizeFormData(initialRegularizeFormState());
    setRegularizeErrors({});
  }, []);
  //#endregion

  const handleResetRegularizeForm = useCallback(() => {
    if (!selectedAttendanceForRegularize) return;

    // Re-initialize form with attendance data (same as handleRegularize)
    const attendanceDate = convertToISO(selectedAttendanceForRegularize.AttendanceDate);

    // Check if status is checkout missing
    const normalizedStatus = normalizeStatus(selectedAttendanceForRegularize.AttendanceStatus);
    const isCheckoutMissing = normalizedStatus === 'CHECKOUT_MISSING' ||
      normalizedStatus.includes('CHECKOUT') ||
      normalizedStatus.includes('MISSING');

    // Extract time from punch in/out using centralized utility
    let punchInTime = extractTimeFromDateTime(selectedAttendanceForRegularize.PunchIn);
    let punchOutTime = extractTimeFromDateTime(selectedAttendanceForRegularize.PunchOut);

    // For checkout missing: bind the actual punch in time from attendance record
    // For other statuses: use extracted time or default to 00:00
    if (isCheckoutMissing) {
      punchInTime = punchInTime || '00:00';
      punchOutTime = punchOutTime || '00:00';
    } else {
      punchInTime = punchInTime || '00:00';
      punchOutTime = punchOutTime || '00:00';
    }

    setRegularizeFormData({
      AttendanceRegularizationId: 0,
      Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      AttendanceDate: attendanceDate ? formatDate_dd_mm_yyyy(attendanceDate) : null,
      PunchInTime: punchInTime,
      PunchOutTime: punchOutTime,
      Reason: null,
    });
    setRegularizeErrors({});
  }, [selectedAttendanceForRegularize]);

  const handleRegularizeFieldChange = useCallback((field: keyof RegularizeFormData, value: string | null) => {
    setRegularizeFormData(prev => ({ ...prev, [field]: value }));

    setRegularizeErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const validateRegularizeForm = useCallback((data: RegularizeFormData): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {};

    // Early return for required fields
    if (!data.AttendanceDate?.trim()) {
      newErrors.AttendanceDate = 'Attendance Date is required';
    }

    const reasonTrimmed = data.Reason?.trim();
    if (!reasonTrimmed) {
      newErrors.Reason = 'Reason is required';
    } else if (reasonTrimmed.length > 255) {
      newErrors.Reason = 'Reason must be at most 255 characters';
    }

    if (!data.PunchInTime || data.PunchInTime === '00:00') {
      newErrors.PunchInTime = 'Punch In Time is required';
    }

    if (!data.PunchOutTime || data.PunchOutTime === '00:00') {
      newErrors.PunchOutTime = 'Punch Out Time is required';
    }

    // Validate Punch Out is not less than Punch In using centralized utilities
    if (data.PunchInTime && data.PunchOutTime && data.AttendanceDate) {
      try {
        const punchIn24Hour = convertTimeTo24Hour(data.PunchInTime);
        const punchOut24Hour = convertTimeTo24Hour(data.PunchOutTime);

        if (punchIn24Hour && punchOut24Hour) {
          const punchInDateTime = combineDateAndTime(data.AttendanceDate, punchIn24Hour);
          const punchOutDateTime = combineDateAndTime(data.AttendanceDate, punchOut24Hour);

          if (punchInDateTime && punchOutDateTime) {
            const punchInDate = new Date(punchInDateTime);
            const punchOutDate = new Date(punchOutDateTime);

            if (punchOutDate < punchInDate) {
              newErrors.PunchOutTime = 'Punch Out time must be greater than or equal to Punch In time';
            }
          }
        }
      } catch (error) {
        // If date/time parsing fails, skip this validation
        console.error('Error validating punch times:', error);
      }
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  }, []);

  const handleRegularizeSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateRegularizeForm(regularizeFormData);
    if (!validation.isValid) {
      setRegularizeErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsRegularizeLoading,
      setRegularizeLoadingMessage,
      async () => {
        // Convert time to 24-hour format using centralized utility
        const punchIn24Hour = convertTimeTo24Hour(regularizeFormData.PunchInTime);
        const punchOut24Hour = convertTimeTo24Hour(regularizeFormData.PunchOutTime);

        const payload: AddUpdateAttendanceRegularization = {
          AttendanceRegularizationId: regularizeFormData.AttendanceRegularizationId || 0,
          Uniquekey: regularizeFormData.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          AttendanceDate: regularizeFormData.AttendanceDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(regularizeFormData.AttendanceDate) : null,
          PunchIn: combineDateAndTime(regularizeFormData.AttendanceDate || '', punchIn24Hour),
          PunchOut: combineDateAndTime(regularizeFormData.AttendanceDate || '', punchOut24Hour),
          Reason: regularizeFormData.Reason?.trim() || null,
        };

        const response = await attendanceRegularizationService.apiCallAddUpdateAttendanceRegularization(payload);

        if (E.isRight(response)) {
          // If response contains regularization data, add it to the list immediately
          if (response.right.Data && response.right.Data.length > 0) {
            setRegularizationList(prev => {
              // Check if this regularization already exists
              const existingIds = new Set(prev.map(r => r.AttendanceRegularizationId));
              const newItems = response.right.Data.filter((r: AttendanceRegularizationData) =>
                !existingIds.has(r.AttendanceRegularizationId)
              );
              return [...prev, ...newItems];
            });
          }

          handleCloseRegularizeModal();
          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] || 'Attendance regularized successfully' });
          // Reload regularization data to ensure we have the latest, then attendance
          await loadRegularization();
          await loadAttendance();
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
      'Regularizing Attendance'
    );
  }, [regularizeFormData, validateRegularizeForm, addToast, handleCloseRegularizeModal, loadAttendance]);
  //#endregion

  return (
    <div className="flex flex-col lg:flex-row bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 gap-3 sm:gap-4 lg:gap-6 relative w-full">
      {/* LEFT - CALENDAR */}

      <div className="flex-1 min-w-0 p-2 sm:p-3 lg:p-4">
        <CalendarHeader
          displayedMonth={displayedMonth}
          activeTab={activeTab}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onFilterChange={setActiveTab}
        />

        <div className="w-full overflow-x-auto">
          <AttendanceMonthView
            currentDate={displayedMonth}
            events={filteredCalendarEvents}
            onDateChange={handleDateChange}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      {/* RIGHT - DETAILS */}
      <aside className="w-full lg:w-[350px] xl:w-[400px] flex-shrink-0">
        <div className="sticky top-2 sm:top-4">
          <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
              style={{
                backgroundColor: stableEventsForSelectedDate[0]?.AttendanceStatus
                  ? getStatusColor(stableEventsForSelectedDate[0].AttendanceStatus)
                  : '',
              }}
            />
            <div className="font-semibold text-base sm:text-lg flex-1 truncate">
              {formatDate_dd_MonthName_yy(selectedDate)}
            </div>
            {stableEventsForSelectedDate.some(att => {
              const canRegularizeStatus = canRegularize(att.AttendanceStatus);
              const hasExistingRegularization = hasRegularization(att.AttendanceDate);
              return canRegularizeStatus && !hasExistingRegularization;
            }) && (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const firstRegularizable = stableEventsForSelectedDate.find(att => {
                      const canRegularizeStatus = canRegularize(att.AttendanceStatus);
                      const hasExistingRegularization = hasRegularization(att.AttendanceDate);
                      return canRegularizeStatus && !hasExistingRegularization;
                    });

                    if (firstRegularizable) {
                      handleRegularize(firstRegularizable);
                    }
                  }}
                  color="blue"
                  size="mxs"
                  variant="solid"
                  colorMode="gradient_dark"
                  defineWidth
                  title="Regularize"
                  aria-label="Regularize"
                  style={{ width: '110px' }}
                  leftIcon={<ClockCheck className="h-4 w-4" />}
                >
                  <span>Regularize</span>
                </Button>

              )}
          </div>

          <div className="space-y-2 sm:space-y-3">
            {stableEventsForSelectedDate.map((att) => {
              const cardKey = `${att.EmployeeId}-${att.AttendanceDate}-${att.AttendanceId || ''}`;

              return (
                <AttendanceDetailsCard
                  key={cardKey}
                  attendance={att}
                />
              );
            })}
          </div>
          
        </div>
      </aside>

      <RegularizeModal
        isOpen={isRegularizeModalOpen}
        isLoading={isRegularizeLoading}
        selectedAttendance={selectedAttendanceForRegularize}
        formData={regularizeFormData}
        errors={regularizeErrors}
        onClose={handleCloseRegularizeModal}
        onSubmit={handleRegularizeSubmit}
        onFieldChange={handleRegularizeFieldChange}
        onReset={handleResetRegularizeForm}
      />
    </div>
  );
};

export default AttendanceCalendar;

