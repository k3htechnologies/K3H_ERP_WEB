import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  FilterWithPaginationOutDoor,
  OutDoorMasterData,
} from '@/features/outdoor/models/OutDoorModel';
import { outDoorService } from '@/features/outdoor/services/OutDoorDataService';
import { formatDate_dd_MonthName_yy, formatTimeFromDateTime } from '@/core/utils/dateFormat';
import { Loader } from '@/core/utils/loader';
import { useNavigate } from 'react-router-dom';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';
import { updateFilter } from '@/core/utils/filterHelper';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useOutDoorListState } from '@/features/outdoor/context/OutDoorListStateContext';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input, Button } from '@/ui/components/forms';
import { TextArea } from '@/ui/components/forms/Textarea';
import {
  Clock,
  Fingerprint,
  ClipboardCheck,
  AlertTriangle,
  Download,
  Plus,
  Edit
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
import { FieldRow, FieldGridRow, PunchCard } from '../components';
import { updateFiltersWithDates } from '../helpers';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';

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
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [punchingItemId, setPunchingItemId] = useState<number | null>(null);
  const [conclusionModalOpen, setConclusionModalOpen] = useState(false);
  const [selectedOutdoorItem, setSelectedOutdoorItem] = useState<OutDoorMasterData | null>(null);
  const [conclusionText, setConclusionText] = useState("");
  const [isConclusionEditMode, setIsConclusionEditMode] = useState(false);

  const { canAction, canExport } = useMenuPermissions();
  //#endregion


  //#region OUTDOOR LIST STATE CONTEXT
  const { listState, updateListState, resetFilters, clearOutDoorContext } = useOutDoorListState();

  const { page, filters: contextFilters, sortInfo: contextSortInfo } = listState;
  //#endregion

  //#region DATA LOAD OUTDOOR

  const loadOutDoors = useCallback(async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
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
          SortBy: getSortByParam(sortInfo ?? null, [])
        };

        const response = await outDoorService.apiCallPullOutDoorData(params);

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
  }, [sortInfo, pagination.pageSize, addToast]);

  //#endregion

  //#region INIT
  useEffect(() => {
    clearOutDoorContext();

    setPagination({ currentPage: page });

    setSortInfo(contextSortInfo);

    setTempFilters(contextFilters);

    // Flight booking behavior: Only load when both dates are selected
    // Skip loading if only StartDate is set (user is still selecting end date)
    const hasStartDate = !!contextFilters.StartDate;
    const hasEndDate = !!contextFilters.EndDate;
    
    // Don't load if only StartDate is set (user is selecting end date)
    // Load in all other cases: both dates set, no dates set, or other filters
    if (!(hasStartDate && !hasEndDate)) {
      loadOutDoors(page, contextFilters);
    }

  }, [page, contextFilters, contextSortInfo, clearOutDoorContext, loadOutDoors]);

  useEffect(() => {
    setTempFilters(contextFilters);
  }, [contextFilters]);
  //#endregion

  //#region EXPORT DROPDOWN HANDLER
  //#endregion

  //#region EXCEL EXPORT PDF | EXCEL
  const handleExportOutDoors = useCallback(async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationOutDoor = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          StartDate: contextFilters.StartDate
            ? new Date(contextFilters.StartDate).toISOString()
            : undefined,
          EndDate: contextFilters.EndDate
            ? new Date(contextFilters.EndDate).toISOString()
            : undefined,
          CompanyName: contextFilters.CompanyName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, []),
          ExportType: exportType
        };

        const response = await outDoorService.apiCallPullOutDoorData(params);

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
  }, [sortInfo, pagination.totalRecords, contextFilters, addToast]);

  const handleExportOutDoorExcel = useCallback(() => handleExportOutDoors('Excel'), [handleExportOutDoors]);
  const handleExportOutDoorPdf = useCallback(() => handleExportOutDoors('PDF'), [handleExportOutDoors]);
  //#endregion

  //#region HELPER FUNCTIONS
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
  //#endregion

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
          const response = await outDoorService.apiCallPunchInOut({
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
              await loadOutDoors(pagination.currentPage, contextFilters);
            } else {
              // Success - use backend SuccessMessage
              await loadOutDoors(pagination.currentPage, contextFilters);
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
  }, [punchingItemId, pagination.currentPage, contextFilters, addToast, loadOutDoors]);
  //#endregion

  //#region CONCLUSION HANDLERS
  const handleOpenConclusionModal = useCallback((item: OutDoorMasterData) => {
    setSelectedOutdoorItem(item);
    setConclusionText(item.Conclusion || "");
    setIsConclusionEditMode(false);
    setConclusionModalOpen(true);
  }, []);

  const handleCloseConclusionModal = useCallback(() => {
    setConclusionModalOpen(false);
    setSelectedOutdoorItem(null);
    setConclusionText("");
    setIsConclusionEditMode(false);
  }, []);

  const handleEnableConclusionEdit = useCallback(() => {
    setIsConclusionEditMode(true);
  }, []);

  const handleSaveConclusion = useCallback(async () => {
    if (!selectedOutdoorItem) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await outDoorService.apiCallAddUpdateConclusion({
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
            await loadOutDoors(pagination.currentPage, contextFilters);
            handleCloseConclusionModal();
          } else {
            // Success - use backend SuccessMessage
            await loadOutDoors(pagination.currentPage, contextFilters);
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
  }, [selectedOutdoorItem, conclusionText, pagination.currentPage, contextFilters, addToast, handleCloseConclusionModal, loadOutDoors]);
  //#endregion

  //#region FILTER HELPERS
  const applyFilters = useCallback(() => {
    updateListState({ filters: tempFilters, page: 1 });
    setShowFilterPopup(false);
  }, [tempFilters, updateListState]);

  const clearFilters = useCallback(() => {
    resetFilters();
    setTempFilters({});
    setShowFilterPopup(false);
  }, [resetFilters]);

  //#endregion

  //#region HANDLE CHANGE EVENT
  const handleFilterChange = useCallback((key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  }, []);
  //#endregion

  //#region ADD OUTDOOR THEN NAVIGATE
  const handleAddOutdoor = useCallback(() => {
    navigate("/outdoor/add");
  }, [navigate]);
  //#endregion

  //#region DATE RANGE HANDLERS
  const handleBothDatesChange = useCallback((fromDate: string | null, toDate: string | null) => {
    // Only trigger load if both dates are selected (flight booking behavior)
    updateFiltersWithDates(
      contextFilters,
      { StartDate: fromDate, EndDate: toDate },
      updateListState,
      setTempFilters,
      !!(fromDate && toDate)
    );
  }, [contextFilters, updateListState]);

  const handleFromDateChange = useCallback((date: string | null) => {
    updateFiltersWithDates(
      contextFilters,
      { StartDate: date },
      updateListState,
      setTempFilters
    );
  }, [contextFilters, updateListState]);

  const handleToDateChange = useCallback((date: string | null) => {
    updateFiltersWithDates(
      contextFilters,
      { EndDate: date },
      updateListState,
      setTempFilters
    );
  }, [contextFilters, updateListState]);
  //#endregion

  //#region PAGINATION CONFIG
  const handlePageChange = useCallback((page: number) => {
    updateListState({ page });
  }, [updateListState]);

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <Loader loading={isLoading} title={loadingMessage}>

        <div className="pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative min-w-0 w-[526px]">
              <DateRangeSelector
                fromDate={contextFilters.StartDate ?? null}
                toDate={contextFilters.EndDate ?? null}
                onBothDatesChange={handleBothDatesChange}
                onFromDateChange={handleFromDateChange}
                onToDateChange={handleToDateChange}
              />
            </div>

            {/* RIGHT SIDE: Export and Add Buttons */}
            <div className="flex items-center space-x-3">
              {/* EXPORT BUTTON */}
              {canExport && outDoorList.length > 0 && (
                <div className="relative">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleExportOutDoorExcel();
                    }}
                    color="blue"
                    colorMode="gradient_light"
                    size="mxs"
                    defineWidth
                    title="Export"
                    style={{ width: '95px' }}
                    leftIcon={<Download className="h-4 w-4" />}
                    disabled={isLoading}
                  >
                    <span>Export</span>
                  </Button>
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

        <>

          {outDoorList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No outdoor records found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {outDoorList.map((item) => {
                const isMeetingStarted = canPunchInOut(item.OutDoorDate, item.OutDoorTime);
                const hasMissed = hasMissedPunch(item);
                const hasMissedPrevious = hasMissedPunchInPreviousDate(item);

                const isPunchedInAndOut = item.PunchIn && item.PunchOut;

                return (
                  <ExpandableCard
                    key={item.OutdoorId}
                    title={
                      <div className="flex items-center justify-between w-full gap-4">
                        <div className="flex-1 min-w-0">
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
                      <div className="flex items-center gap-2 flex-shrink-0">
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
                        <div className="space-y-0">
                          <FieldGridRow>
                            <FieldRow label="Company Name" value={item.CompanyName || '-'} />
                            <FieldRow label="Department" value={item.DepartmentName || '-'} />
                          </FieldGridRow>

                          <FieldGridRow>
                            <FieldRow label="Company Address" value={item.CompanyAddress || '-'} />
                            <FieldRow label="Accompanied By" value={item.AccompaniedByName || '-'} />
                          </FieldGridRow>

                          <FieldGridRow>
                            <FieldRow 
                              label="Purpose" 
                              value={
                                <TooltipText
                                  text={item.Purpose || '-'}
                                  maxWidth="300px"
                                  tooltipThreshold={30}
                                />
                              } 
                            />
                            <FieldRow label="Requested By" value={item.CreatedBy || '-'} />
                          </FieldGridRow>

                          {/* Row 4: Visiting Card */}
                          <FieldGridRow withBorder={false}>
                            <FieldRow 
                              label="Visiting Card" 
                              value={
                                item.VisitingCardURL ? (() => {
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
                                )
                              } 
                            />
                          </FieldGridRow>

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
                                  <PunchCard 
                                    type="in" 
                                    time={item.PunchIn} 
                                    address={item.PunchInAddress} 
                                  />
                                )}
                                {item.PunchOut && (
                                  <PunchCard 
                                    type="out" 
                                    time={item.PunchOut} 
                                    address={item.PunchOutAddress} 
                                  />
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
        </>

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
          title={selectedOutdoorItem?.Conclusion && !isConclusionEditMode ? "View Conclusion" : selectedOutdoorItem?.Conclusion ? "Edit Conclusion" : "Add Conclusion"}
          onSubmit={(e) => {
            e.preventDefault();
            if (isConclusionEditMode || !selectedOutdoorItem?.Conclusion) {
              handleSaveConclusion();
            }
          }}
          saveText={selectedOutdoorItem?.Conclusion && !isConclusionEditMode ? "Save" : "Save"}
          cancelText="Cancel"
          onCancel={handleCloseConclusionModal}
          loading={isLoading}
          size="md"
        >
          <div className="space-y-4">
            <div>
              {selectedOutdoorItem?.Conclusion && !isConclusionEditMode ? (
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-gray-700">Conclusion</label>
                  <button
                    onClick={handleEnableConclusionEdit}
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                    title="Edit Conclusion"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                <label className="text-sm font-medium text-gray-700 mb-2 block">Conclusion</label>
              )}
              <TextArea
                label=""
                value={conclusionText}
                onChange={(e) => setConclusionText(e.target.value)}
                placeholder="Enter conclusion about the outdoor visit..."
                rows={6}
                autoResize={true}
                disabled={selectedOutdoorItem?.Conclusion ? !isConclusionEditMode : false}
              />
            </div>
          </div>
          {selectedOutdoorItem?.Conclusion && !isConclusionEditMode && (
            <style>{`
              form > div:last-child > div:last-child {
                display: none;
              }
            `}</style>
          )}
        </Modal>

      </Loader>
    </div>
  );
};

export default OutDoor