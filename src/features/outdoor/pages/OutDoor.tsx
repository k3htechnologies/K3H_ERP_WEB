import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  FilterWithPaginationOutDoor,
  OutDoorMasterData,
} from '@/features/outdoor/models/OutDoorModel';
import { outDoorService } from '@/features/outdoor/services/OutDoorDataService';
import { formatDate_dd_MonthName_yy, formatTimeFromDateTime, isPreviousDate, isToday } from '@/core/utils/dateFormat';
import { Loader } from '@/core/utils/loader';
import { useNavigate } from 'react-router-dom';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useOutDoorListState } from '@/features/outdoor/context/OutDoorListStateContext';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/forms';
import { TextArea } from '@/ui/components/forms/Textarea';
import {
  Clock,
  Fingerprint,
  ClipboardCheck,
  AlertTriangle
} from "lucide-react";
import { getCurrentLocation, formatLocationString, type LocationData } from "@/core/utils/locationUtils";
import { parseOutdoorDate, parseOutdoorTime } from "../utils/outdoorDateUtils";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { MultiImageViewer } from "@/ui/components/ImageViewer/ImageViewer";
import { ExpandableCard } from "@/ui/components/Card/ExpandableCard";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Pagination, type PaginationInfo } from "@/ui/components/Pagination/Pagination";
import { handleExportFile } from '@/core/utils/exportFile';
import { PunchCard } from '@/features/outdoor/components/PunchCard';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { DateRangeWithActions } from '@/ui/components/DateRangeWithActions';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { updateFiltersWithDates } from '@/core/helpers/dateFilterHelper';

export const OutDoor: React.FC = () => {
  //#region STATE
  const [outDoorList, setOutDoorList] = useState<OutDoorMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const navigate = useNavigate();

  const { pagination, setPagination } = usePagination(10);

  const { addToast } = useToast();

  const [, setTempFilters] = useState<FilterInfo>({});

  const [punchingItemId, setPunchingItemId] = useState<number | null>(null);
  const [conclusionModalOpen, setConclusionModalOpen] = useState(false);
  const [selectedOutdoorItem, setSelectedOutdoorItem] = useState<OutDoorMasterData | null>(null);
  const [conclusionText, setConclusionText] = useState("");
  const [isConclusionEditMode, setIsConclusionEditMode] = useState(false);

  const { canAction, canExport } = useMenuPermissions();
  //#endregion


  //#region OUTDOOR LIST STATE CONTEXT
  const { listState, updateListState, clearOutDoorContext } = useOutDoorListState();

  const { page, filters, sortInfo } = listState;
  //#endregion

  //#region DATA LOAD OUTDOOR

  const loadOutDoors = async (pageNum: number, filterParams: FilterInfo, sortInfo?: any) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationOutDoor = {
          PageNumber: pageNum,
          PageSize: pagination.pageSize,
          StartDate: filterParams.StartDate || undefined,
          EndDate: filterParams.EndDate || undefined,
          CompanyName: filterParams.CompanyName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, [])
        };

        const response = await outDoorService.apiCallPullOutDoor(params);

        if (E.isRight(response)) {

          setOutDoorList(response.right.Data || []);

          setPagination({
            currentPage: pageNum,
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
      'Loading Outdoor'
    );
  };

  //#endregion

  //#region INIT
  useEffect(() => {

    clearOutDoorContext();

    setPagination({ currentPage: page });

    setTempFilters(filters);

    const hasStartDate = !!filters.StartDate;
    const hasEndDate = !!filters.EndDate;

    if (!(hasStartDate && !hasEndDate)) {
      loadOutDoors(page, filters, sortInfo);
    }

  }, [page, filters, sortInfo, clearOutDoorContext]);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportOutDoors = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationOutDoor = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          StartDate: filters.StartDate || undefined,
          EndDate: filters.EndDate || undefined,
          CompanyName: filters.CompanyName?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, []),
          ExportType: exportType
        };

        const response = await outDoorService.apiCallPullOutDoor(params);

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
      if (!outdoorDateObj) {
        return false;
      }

      const isTodayDate = isToday(outdoorDateObj);
      const isPreviousDateValue = isPreviousDate(outdoorDateObj);

      if (isPreviousDateValue) {
        if (item.PunchIn && !item.PunchOut) {
          return true;
        }
        return false;
      }

      if (!isTodayDate) {
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
          const now = new Date();
          const currentDateTime = now.toISOString();

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


            await loadOutDoors(pagination.currentPage, filters, sortInfo);

            addToast({ type: "success", title: apiResponse.SuccessMessage?.[0] });


            } else {
            addToast({ type: "error", title: response.left.message });
          }

        } catch (error: any) {

          addToast({ type: "error", title: error.message });

        } finally {

          setPunchingItemId(null);
        }
      },
      undefined,
      (error: any) => {

        addToast({ type: "error", title: error.message });

        setPunchingItemId(null);
      },
      undefined,
      !item.PunchIn ? "Punching In" : "Punching Out"
    );
  }, [punchingItemId, pagination.currentPage, filters, sortInfo, addToast]);
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
          addToast({ type: "success", title: response.right.SuccessMessage[0] });

          // Update the local state with the new conclusion
          setOutDoorList(prevList =>
            prevList.map(item =>
              item.OutdoorId === selectedOutdoorItem.OutdoorId
                ? { ...item, Conclusion: conclusionText }
                : item
            )
          );

          // Close the modal
          setConclusionModalOpen(false);
          setSelectedOutdoorItem(null);
          setConclusionText("");
          setIsConclusionEditMode(false);

          } else {
            addToast({
            type: "error", title: response.left.message
          });
        }
      },
      undefined,
      (error: any) => {
        addToast({
          type: "error", title: error.message
        });
      },
      undefined,
      'Saving conclusion'
    );
  }, [selectedOutdoorItem, conclusionText, addToast]);

  const handleConclusionSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutdoorItem?.Conclusion || isConclusionEditMode) {
      handleSaveConclusion();
    } else {
      handleEnableConclusionEdit();
    }
  }, [selectedOutdoorItem, isConclusionEditMode, handleSaveConclusion, handleEnableConclusionEdit]);
  //#endregion

  //#region ADD OUTDOOR THEN NAVIGATE
  const handleAddOutdoor = useCallback(() => {
    navigate("/outdoor/add");
  }, [navigate]);
  //#endregion

  //#region DATE RANGE HANDLERS
  const handleBothDatesChange = useCallback((fromDate: string | null, toDate: string | null) => {
    updateFiltersWithDates(
      filters,
      { StartDate: fromDate, EndDate: toDate },
      updateListState,
      setTempFilters,
      !!(fromDate && toDate)
    );
  }, [filters, updateListState]);

  const handleFromDateChange = useCallback((date: string | null) => {
    updateFiltersWithDates(
      filters,
      { StartDate: date },
      updateListState,
      setTempFilters
    );
  }, [filters, updateListState]);

  const handleToDateChange = useCallback((date: string | null) => {
    updateFiltersWithDates(
      filters,
      { EndDate: date },
      updateListState,
      setTempFilters
    );
  }, [filters, updateListState]);
  //#endregion

  //#region PAGINATION CONFIG
  const handlePageChange = useCallback((newPage: number) => {
    updateListState({ page: newPage });
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}> </Loader>

      <DateRangeWithActions
        fromDate={filters.StartDate ?? null}
        toDate={filters.EndDate ?? null}
        onBothDatesChange={handleBothDatesChange}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
        canAction={canAction}
        canExport={canExport}
        addTitle="Add"
        onAdd={handleAddOutdoor}
        hasData={outDoorList.length > 0}
        onExportExcel={handleExportOutDoorExcel}
        onExportPdf={handleExportOutDoorPdf}
        exportLoading={isLoading}
      />

      <>

        {outDoorList.length === 0 ? (
          <NoDataView message='No outdoor records found'></NoDataView>
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
                        <Button
                          color='transparent'
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
                        </Button>
                      )}

                      {/* Punch In/Out Button */}
                      {!isPunchedInAndOut && isMeetingStarted && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePunchInOut(item);
                          }}
                          color='transparent'
                          disabled={punchingItemId === item.OutdoorId}
                          className="p-1.5 rounded-lg hover:bg-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!item.PunchIn ? "Punch In" : "Punch Out"}
                        >
                          {punchingItemId === item.OutdoorId ? (
                            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Fingerprint className={`w-5 h-5 ${!item.PunchIn ? 'text-green-600' : 'text-blue-600'}`}
                            />
                          )}
                        </Button>
                      )}

                    </div>

                  }
                  child={
                    <div className="space-y-6">
                      <div className="space-y-0 p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 border-b border-gray-200 pb-2">
                          <FieldItem label="Company Name" value={item.CompanyName || '-'} isRow={false} />
                          <FieldItem label="Department" value={item.DepartmentName || '-'} isRow={false} />
                            </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 border-b border-gray-200 pb-2 pt-2">
                          <FieldItem label="Company Address" value={item.CompanyAddress || '-'} isRow={false} />
                          <FieldItem label="Accompanied By" value={item.AccompaniedByName || '-'} isRow={false} />
                          </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 border-b border-gray-200 pb-2 pt-2">
                          <FieldItem label="Purpose" value={<TooltipText text={item.Purpose || '-'} maxWidth="300px" tooltipThreshold={30} />} isRow={false} />
                          <FieldItem label="Requested By" value={item.CreatedBy || '-'} isRow={false} />
                          </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-2">
                          <FieldItem label="Visiting Card"
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
                            isRow={false}
                          />
                          </div>

                        <div className="flex items-start gap-2.5 pt-2">
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
                                <PunchCard type="in" time={item.PunchIn} address={item.PunchInAddress} />
                              )}
                              {item.PunchOut && (
                                <PunchCard type="out" time={item.PunchOut} address={item.PunchOutAddress} />
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
        isOpen={conclusionModalOpen}
        onClose={handleCloseConclusionModal}
        title={
          selectedOutdoorItem?.Conclusion
            ? isConclusionEditMode
              ? "Edit Conclusion"
              : "View Conclusion"
            : "Add Conclusion"
        }
        size="md"
        onSubmit={handleConclusionSubmit}
        saveText={
          selectedOutdoorItem?.Conclusion && !isConclusionEditMode
            ? "Edit"
            : selectedOutdoorItem?.Conclusion
              ? "Save"
              : "Add"
        }
        loading={isLoading}
      >
        <div className='-mt-2'>
        <TextArea

          label="Conclusion"
          value={conclusionText}
          onChange={(e) => setConclusionText(e.target.value)}
            placeholder="Enter conclusion about the outdoor visit"
          rows={6}
            autoResize
            disabled={selectedOutdoorItem?.Conclusion ? !isConclusionEditMode : false}
        />
        </div>

      </Modal>




    </div>
  );
};

export default OutDoor