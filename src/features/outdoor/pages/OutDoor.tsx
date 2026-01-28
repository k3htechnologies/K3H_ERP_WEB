import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  FilterWithPaginationOutDoor,
  OutDoorMasterData,
} from '@/features/outdoor/models/OutDoorModel';
import { OutDoorService } from '@/features/outdoor/services/OutDoorDataService';
import { formatDate_dd_MonthName_yy, formatTimeFromDateTime } from '@/core/utils/dateFormat';
import { Loader } from '@/core/utils/loader';
import { useLocation, type Location, useNavigate } from 'react-router-dom';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';
import { updateFilter } from '@/core/utils/filterHelper';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input, Button } from '@/ui/components/forms';
import { TextArea } from '@/ui/components/forms/Textarea';
import {
  Clock,
  MapPin,
  Fingerprint,
  ClipboardCheck,
  AlertTriangle,
  Download,
  Plus
} from "lucide-react";
import { getCurrentLocation, formatLocationString, type LocationData } from "@/core/utils/locationUtils";
import { parseOutdoorDate, parseOutdoorTime, isToday, isPreviousDate } from "../utils/outdoorDateUtils";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { MultiImageViewer } from "@/ui/components/ImageViewer/ImageViewer";
import { ExpandableCard } from "@/ui/components/Card/ExpandableCard";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Pagination, type PaginationInfo } from "@/ui/components/Pagination/Pagination";
import { handleExportFile } from '@/core/utils/exportFile';
import { DateRangeSelector } from '@/ui/components/forms/DateRangeSelector';

export const OutDoor: React.FC = () => {
  //#region STATE
  const [outDoorList, setOutDoorList] = useState<OutDoorMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const navigate = useNavigate();

  const { pagination, setPagination } = usePagination(10);

  const [sortInfo, setSortInfo] = useState<any>(undefined);

  const { addToast } = useToast();

  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [punchingItemId, setPunchingItemId] = useState<number | null>(null);
  const [conclusionModalOpen, setConclusionModalOpen] = useState(false);
  const [selectedOutdoorItem, setSelectedOutdoorItem] = useState<OutDoorMasterData | null>(null);
  const [conclusionText, setConclusionText] = useState("");

  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region STATE CREATED PAGE AFTER NAVIGATE VIEW OR ADD UPDATE PAGE THEN CHECK
  const location = useLocation() as Location & {
    state?: {
      listState?: {
        page?: number;
        filters?: FilterInfo;
        sortInfo?: any;
        outdoorId?: number;
      };
    };
  };
  //#endregion

  //#region INIT

  useEffect(() => {

    const incoming = location.state?.listState as
      | { page?: number; filters?: FilterInfo; sortInfo?: any; outdoorId?: number }
      | undefined;

    const listState = incoming ?? { page: 1, filters: {} as FilterInfo, sortInfo: undefined, outdoorId: 0 };


    setPagination({ currentPage: listState.page ?? pagination.currentPage });

    setSortInfo(listState.sortInfo);

    setFilters(listState.filters ?? {});

    setTempFilters(listState.filters ?? {});

    loadOutDoors(listState.page ?? 1, listState.filters ?? {});

  }, [location.state]);
  //#endregion

  //#region EXPORT DROPDOWN HANDLER
  // Close export dropdown when clicked outside or Escape pressed
  useEffect(() => {
    if (!isExportOpen) return;

    function handleDocClick(e: MouseEvent) {
      const target = e.target as Node | null;
      // click inside export menu -> do nothing
      if (exportRef.current && exportRef.current.contains(target!)) return;
      // otherwise close
      setIsExportOpen(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsExportOpen(false);
      }
    }

    document.addEventListener('mousedown', handleDocClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleDocClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExportOpen]);
  //#endregion

  //#region DATA LOAD OUTDOOR

  const loadOutDoors = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        let sortByParam = undefined;
        if (sortInfo) {
          sortByParam = sortInfo;
        }

        const params: FilterWithPaginationOutDoor = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          StartDate: filterParams.StartDate
            ? new Date(filterParams.StartDate).toISOString()
            : undefined,
          EndDate: filterParams.EndDate
            ? new Date(filterParams.EndDate).toISOString()
            : undefined,
          CompanyName: filterParams.CompanyName?.trim() || undefined,
          SortBy: sortByParam
        };

        const response = await OutDoorService.apiCallPullOutDoorData(params);

        if (E.isRight(response)) {

          setOutDoorList(response.right.Data || []);

          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
          });

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
      'Loading Outdoor Data'
    );
  };

  //#endregion

  //#region EXCEL EXPORT PDF | EXCEL
  const handleExportOutDoors = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        let sortByParam = undefined;
        if (sortInfo) {
          sortByParam = sortInfo;
        }

        const params: FilterWithPaginationOutDoor = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          StartDate: filters.StartDate
            ? new Date(filters.StartDate).toISOString()
            : undefined,
          EndDate: filters.EndDate
            ? new Date(filters.EndDate).toISOString()
            : undefined,
          CompanyName: filters.CompanyName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        };

        const response = await OutDoorService.apiCallPullOutDoorData(params);

        handleExportFile(response, exportType, 'Outdoor', addToast);

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' });
      },
      undefined,
      'Preparing Export'
    );
  };

  const handleExportOutDoorExcel = () => handleExportOutDoors('Excel');
  const handleExportOutDoorPdf = () => handleExportOutDoors('PDF');
  //#endregion

  //#region PAGINATION CONFIG
  const handlePageChange = useCallback((page: number) => {
    loadOutDoors(page, filters);
  }, [filters]);

  //#endregion

  const canPunchInOut = useCallback((outdoorDate: string, outdoorTime: string): boolean => {
    if (!outdoorDate || !outdoorTime) return false;

    try {
      const outdoorDateObj = parseOutdoorDate(outdoorDate);
      if (!outdoorDateObj || !isToday(outdoorDateObj)) {
        return false;
      }

      const meetingDateTime = parseOutdoorTime(outdoorDate, outdoorTime);
      if (!meetingDateTime) {
        return false;
      }

      return new Date() >= meetingDateTime;
    } catch {
      return false;
    }
  }, []);

  const hasMissedPunch = useCallback((item: OutDoorMasterData): boolean => {
    if (!item.OutDoorDate || !item.OutDoorTime) return false;

    try {
      const outdoorDateObj = parseOutdoorDate(item.OutDoorDate);
      if (!outdoorDateObj || !isToday(outdoorDateObj)) {
        return false;
      }

      const meetingDateTime = parseOutdoorTime(item.OutDoorDate, item.OutDoorTime);
      if (!meetingDateTime || new Date() < meetingDateTime) {
        return false;
      }

      if (!item.PunchIn) {
        return true;
      }

      if (item.PunchIn && !item.PunchOut) {
        const punchInTime = new Date(item.PunchIn);
        if (!isNaN(punchInTime.getTime())) {
          const timeSincePunchIn = new Date().getTime() - punchInTime.getTime();
          const thirtyMinutes = 30 * 60 * 1000;
          return timeSincePunchIn >= thirtyMinutes;
        }
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }, []);

  const hasMissedPunchInPreviousDate = useCallback((item: OutDoorMasterData): boolean => {
    if (!item.OutDoorDate || item.PunchIn) return false;

    try {
      const outdoorDateObj = parseOutdoorDate(item.OutDoorDate);
      return outdoorDateObj !== null && isPreviousDate(outdoorDateObj);
    } catch {
      return false;
    }
  }, []);

  //#region PUNCH IN/OUT HANDLERS
  const handlePunchInOut = useCallback(async (item: OutDoorMasterData) => {
    if (punchingItemId !== null) return;

    setPunchingItemId(item.OutdoorId);

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        try {
          // Capture time first to ensure accuracy
          const now = new Date();
          const currentDateTime = now.toISOString();

          // Get current location with retry for better accuracy
          let location: LocationData | null = null;
          let retries = 0;
          const maxRetries = 2;

          while (retries <= maxRetries && !location) {
            try {
              location = await getCurrentLocation();
            } catch (error) {
              if (retries === maxRetries) {
                throw error;
              }
              retries++;
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          if (!location) {
            throw new Error("Failed to get location after retries");
          }

          const locationString = formatLocationString(location);

          // Check if already punched in and out
          if (item.PunchIn && item.PunchOut) {
            addToast({
              type: "warning",
              title: "Already punched in and out"
            });
            setPunchingItemId(null);
            return;
          }

          // Use same API for both punch in and punch out
          const response = await OutDoorService.apiCallPunchInOut({
            OutdoorId: item.OutdoorId,
            Punch: currentDateTime,
            Address: locationString
          });

          if (E.isRight(response)) {
            const apiResponse = response.right;

            // Check backend ErrorMessage first (same pattern as ProjectMaster)
            if (apiResponse.ErrorMessage && apiResponse.ErrorMessage.length > 0) {
              addToast({
                type: "error",
                title: apiResponse.ErrorMessage[0]
              });
            } else if (apiResponse.WarningMessage && apiResponse.WarningMessage.length > 0) {
              addToast({
                type: "warning",
                title: apiResponse.WarningMessage[0]
              });
              await loadOutDoors(pagination.currentPage, filters);
            } else {
              // Success - use backend SuccessMessage
              await loadOutDoors(pagination.currentPage, filters);
              addToast({
                type: "success",
                title: apiResponse.SuccessMessage?.[0]
              });
            }
          } else {
            // Network/HTTP error - use backend error message (same pattern as ProjectMaster)
            addToast({
              type: "error",
              title: response.left.message
            });
          }
        } catch (error: any) {
          addToast({
            type: "error",
            title: error.message
          });
        } finally {
          setPunchingItemId(null);
        }
      },
      undefined,
      (error: any) => {
        addToast({
          type: "error",
          title: error.message
        });
        setPunchingItemId(null);
      },
      undefined,
      !item.PunchIn ? "Punching In..." : "Punching Out..."
    );
  }, [punchingItemId, pagination.currentPage, filters, addToast]);
  //#endregion

  //#region CONCLUSION HANDLERS
  const handleOpenConclusionModal = useCallback((item: OutDoorMasterData) => {
    setSelectedOutdoorItem(item);
    setConclusionText(item.Conclusion || "");
    setConclusionModalOpen(true);
  }, []);

  const handleCloseConclusionModal = useCallback(() => {
    setConclusionModalOpen(false);
    setSelectedOutdoorItem(null);
    setConclusionText("");
  }, []);

  const handleSaveConclusion = useCallback(async () => {
    if (!selectedOutdoorItem) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await OutDoorService.apiCallAddUpdateConclusion({
          OutdoorId: selectedOutdoorItem.OutdoorId,
          Conclusion: conclusionText
        });

        if (E.isRight(response)) {
          const apiResponse = response.right;

          // Check backend ErrorMessage first (same pattern as ProjectMaster)
          if (apiResponse.ErrorMessage && apiResponse.ErrorMessage.length > 0) {
            addToast({
              type: "error",
              title: apiResponse.ErrorMessage[0]
            });
          } else if (apiResponse.WarningMessage && apiResponse.WarningMessage.length > 0) {
            addToast({
              type: "warning",
              title: apiResponse.WarningMessage[0]
            });
            await loadOutDoors(pagination.currentPage, filters);
            handleCloseConclusionModal();
          } else {
            // Success - use backend SuccessMessage
            await loadOutDoors(pagination.currentPage, filters);
            addToast({
              type: "success",
              title: apiResponse.SuccessMessage?.[0]
            });
            handleCloseConclusionModal();
          }
        } else {
          // Network/HTTP error - use backend error message (same pattern as ProjectMaster)
          addToast({
            type: "error",
            title: response.left.message
          });
        }
      },
      undefined,
      (error: any) => {
        addToast({
          type: "error",
          title: error.message
        });
      },
      undefined,
      'Saving conclusion...'
    );
  }, [selectedOutdoorItem, conclusionText, pagination.currentPage, filters, addToast, handleCloseConclusionModal]);
  //#endregion

  //#region FILTER HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);
    loadOutDoors(1, tempFilters);
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    setPagination({ currentPage: 1 });
    loadOutDoors(1, {});
    setShowFilterPopup(false);
    navigate(location.pathname, { replace: true, state: {} });
  };
  //#endregion

  //#region HANDLE CHANGE EVENT
  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  //#endregion

  //#region ADD OUTDOOR THEN NAVIGATE
  const handleAddOutdoor = useCallback(() => {
    navigate("/outdoor/add");
  }, [navigate]);
  //#endregion

  //#region PAGINATION INFO
  const outDoorPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  );
  //#endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>

        <div className="pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="pl-5 relative min-w-0 w-[526px]">
              <DateRangeSelector
                fromDate={filters.StartDate || null}
                toDate={filters.EndDate || null}
                onFromDateChange={(date) => {
                  setFilters(prevFilters => {
                    const newFilters = { ...prevFilters };
                    if (date) {
                      newFilters.StartDate = date;
                    } else {
                      delete newFilters.StartDate;
                    }
                    setTempFilters(newFilters);
                    loadOutDoors(1, newFilters);
                    return newFilters;
                  });
                }}
                onToDateChange={(date) => {
                  setFilters(prevFilters => {
                    const newFilters = { ...prevFilters };
                    if (date) {
                      newFilters.EndDate = date;
                    } else {
                      delete newFilters.EndDate;
                    }
                    setTempFilters(newFilters);
                    loadOutDoors(1, newFilters);
                    return newFilters;
                  });
                }}
              />
            </div>

            {/* RIGHT SIDE: Export and Add Buttons */}
            <div className="flex items-center space-x-1">
              {/* EXPORT BUTTON */}
              {canExport && (
                <div className="relative" ref={exportRef}>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsExportOpen((s) => !s);
                    }}
                    color="blue"
                    colorMode="gradient_light"
                    size="mxs"
                    defineWidth
                    title="Export"
                    aria-expanded={isExportOpen}
                    aria-haspopup="menu"
                    style={{ width: '95px' }}
                    leftIcon={<Download className="h-4 w-4" />}
                  >
                    <span>Export</span>
                  </Button>

                  {isExportOpen && (
                    <div
                      className="absolute right-0 mt-2 min-w-[168px] bg-white rounded-md shadow-lg border border-gray-200 transition-all duration-150 z-100"
                      role="menu"
                      aria-label="Export options"
                    >
                      <div className="py-1">
                        {handleExportOutDoorExcel && (
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleExportOutDoorExcel();
                              setIsExportOpen(false);
                            }}
                            disabled={isLoading}
                            color="transparent"
                            fullWidth
                            isborderRadius
                            size="sm"
                            title="Export as Excel"
                            style={{ justifyContent: "left" }}
                          >
                            Export as Excel
                          </Button>
                        )}

                        {handleExportOutDoorPdf && (
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleExportOutDoorPdf();
                              setIsExportOpen(false);
                            }}
                            disabled={isLoading}
                            color="transparent"
                            fullWidth
                            isborderRadius
                            size="sm"
                            title="Export as PDF"
                            style={{ justifyContent: "left" }}
                          >
                            Export as PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ADD BUTTON */}
              {canAction && (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddOutdoor();
                  }}
                  color="blue"
                  size="mxs"
                  variant="solid"
                  colorMode="gradient_dark"
                  defineWidth
                  title="Add"
                  aria-label="Add"
                  style={{ width: '95px' }}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  <span>Add</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">

          {outDoorList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No outdoor records found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {outDoorList.map((item) => {
                const isMeetingStarted = canPunchInOut(item.OutDoorDate, item.OutDoorTime);
                const hasMissed = hasMissedPunch(item);
                const hasMissedPrevious = hasMissedPunchInPreviousDate(item);

                const isPunchedInAndOut = item.PunchIn && item.PunchOut;

                return (
                  <ExpandableCard
                    key={item.OutdoorId}
                    title={
                      <div className="flex items-center justify-between w-full">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 mb-1 flex items-center gap-2">
                            {hasMissed && (
                              <div title={!item.PunchIn ? "Punch In missed" : "Punch Out missed"}>
                                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                              </div>
                            )}
                            {formatDate_dd_MonthName_yy(item.OutDoorDate)}
                          </h3>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTimeFromDateTime(item.OutDoorTime) || '-'}
                            </span>
                          </div>
                        </div>

                      </div>
                    }
                    showline={true}
                    customizedIcon={
                      <div className="flex items-center gap-2 ml-auto">
                        {/* Conclusion Button */}
                        {isPunchedInAndOut && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenConclusionModal(item);
                            }}
                            className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                            title={item.Conclusion ? "Edit Conclusion" : "Add Conclusion"}
                          >
                            <ClipboardCheck
                              className={`w-5 h-5 ${item.Conclusion ? 'text-purple-600' : 'text-gray-600'}`}
                            />
                          </button>
                        )}

                        {/* Punch In/Out Button */}
                        {!isPunchedInAndOut && isMeetingStarted && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePunchInOut(item);
                            }}
                            disabled={punchingItemId === item.OutdoorId}
                            className="p-1.5 rounded-lg hover:bg-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={!item.PunchIn ? "Punch In" : "Punch Out"}
                          >
                            {punchingItemId === item.OutdoorId ? (
                              <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Fingerprint
                                className={`w-5 h-5 ${!item.PunchIn ? 'text-green-600' : 'text-blue-600'}`}
                              />
                            )}
                          </button>
                        )}

                      </div>

                    }
                    child={
                      <div className="space-y-6">
                        {/* Fields Grid - Aligned Side by Side */}
                        <div className="space-y-0">
                          {/* Row 1: Company Name | Department */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200">
                            <div className="flex items-start gap-2.5 p-3">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Company Name</p>
                                <p className="text-sm font-medium text-gray-900">{item.CompanyName || '-'}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2.5 p-3">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Department</p>
                                <p className="text-sm font-medium text-gray-900">{item.DepartmentName || '-'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Row 2: Company Address | Accompanied By */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200">
                            <div className="flex items-start gap-2.5 p-3">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Company Address</p>
                                <p className="text-sm font-medium text-gray-900">{item.CompanyAddress || '-'}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2.5 p-3">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Accompanied By</p>
                                <p className="text-sm font-medium text-gray-900">{item.AccompaniedByName || '-'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Row 3: Purpose | Requested By */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200">
                            <div className="flex items-start gap-2.5 p-3">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Purpose</p>
                                <div className="text-sm font-medium text-gray-900">
                                  <TooltipText
                                    text={item.Purpose || '-'}
                                    maxWidth="300px"
                                    tooltipThreshold={30}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start gap-2.5 p-3">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Requested By</p>
                                <p className="text-sm font-medium text-gray-900">{item.CreatedBy || '-'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Row 4: Conclusion | Empty */}
                          {item.Conclusion && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200">
                              <div className="flex items-start gap-2.5 p-3">
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Conclusion</p>
                                  <p className="text-sm font-medium text-gray-600">{item.Conclusion}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2.5 p-3">
                                <div className="flex-1"></div>
                              </div>
                            </div>
                          )}

                          {/* Row 5: Visiting Card | Edit */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200">
                            <div className="flex items-start gap-2.5 p-3">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Visiting Card</p>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.VisitingCardURL ? (() => {
                                    const cardUrls = parseDocumentUrls(item.VisitingCardURL);
                                    return (
                                      <MultiImageViewer
                                        images={cardUrls}
                                        title="Visiting Card"
                                        isIcon={true}
                                        triggerLabel={
                                          <span className="flex items-center gap-2 text-sm font-medium">
                                            {cardUrls.length > 1 ? `View ${cardUrls.length} Cards` : 'View Card'}
                                          </span>
                                        }
                                      />
                                    );
                                  })() : (
                                    <span className="text-gray-400 italic">Not Uploaded</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start gap-2.5 p-3">
                              <div className="flex-1 flex justify-end">
                                {canAction && (
                                  <Button
                                    onClick={() => navigate(`/outdoor/add/${item.OutdoorId}`)}
                                    color="blue"
                                    size="sm"
                                    variant="solid"
                                  >
                                    Edit
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Punch In/Out Section */}
                        {(item.PunchIn || item.PunchOut || hasMissedPrevious) && (
                          <div className="border-t border-gray-200 -mt-6 pt-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                              <Fingerprint className="w-4 h-4" />
                              Attendance
                            </h4>
                            {hasMissedPrevious ? (
                              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                <p className="text-sm font-medium text-red-700">Attendance is not marked</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {item.PunchIn && (
                                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <p className="text-xs font-semibold text-green-700 uppercase">Punch In</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                      {formatTimeFromDateTime(item.PunchIn) || '-'}
                                    </p>
                                    {item.PunchInAddress && (
                                      <p className="text-xs text-gray-600 flex items-start gap-1">
                                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-2">{item.PunchInAddress}</span>
                                      </p>
                                    )}
                                  </div>
                                )}
                                {item.PunchOut && (
                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      <p className="text-xs font-semibold text-blue-700 uppercase">Punch Out</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                      {formatTimeFromDateTime(item.PunchOut) || '-'}
                                    </p>
                                    {item.PunchOutAddress && (
                                      <p className="text-xs text-gray-600 flex items-start gap-1">
                                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-2">{item.PunchOutAddress}</span>
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    }
                  />
                );
              })}
            </div>
          )}

          <Pagination pagination={outDoorPaginationInfo} className="mt-4" />
        </div>

        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Outdoor"
          onSubmit={(e) => {
            e.preventDefault()
            applyFilters()
          }}
          saveText="Apply "
          cancelText="Clear"
          onCancel={() => clearFilters()}

          size="small-half"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Input
                  label='Company Name'
                  type="text"
                  value={tempFilters.CompanyName || ''}
                  onChange={(e) => handleFilterChange('CompanyName', e.target.value)}
                  placeholder="Enter Company Name"
                />
              </div>
              <div>
                <Input
                  label='Start Date'
                  type="date"
                  value={tempFilters.StartDate || ''}
                  onChange={(e) => handleFilterChange('StartDate', e.target.value)}
                  placeholder="Enter Start Date"
                />
              </div>
              <div>
                <Input
                  label='End Date'
                  type="date"
                  value={tempFilters.EndDate || ''}
                  onChange={(e) => handleFilterChange('EndDate', e.target.value)}
                  placeholder="Enter End Date"
                />
              </div>
            </div>
          </div>
        </Modal>

        {/* Conclusion Modal */}
        <Modal
          isOpen={conclusionModalOpen}
          onClose={handleCloseConclusionModal}
          title="Add Conclusion"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveConclusion();
          }}
          saveText="Save"
          cancelText="Cancel"
          onCancel={handleCloseConclusionModal}
          loading={isLoading}
          size="md"
        >
          <TextArea
            label="Conclusion"
            value={conclusionText}
            onChange={(e) => setConclusionText(e.target.value)}
            placeholder="Enter conclusion about the outdoor visit..."
            rows={6}
            autoResize={true}
          />
        </Modal>

      </Loader>
    </div>
  );
};

export default OutDoor