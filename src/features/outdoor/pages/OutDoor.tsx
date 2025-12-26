import React, { useCallback, useEffect, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
    FilterWithPaginationOutDoor,
    OutDoorMasterData,
} from '@/features/outdoor/models/OutDoorModel';
import { OutDoorDataService } from '@/features/outdoor/services/OutDoorDataService';
import { formatDate_dd_MonthName_yy, formatTimeFromDateTime } from '@/core/utils/dateFormat';
import { Loader } from '@/core/utils/loader';
import { useLocation, type Location, useNavigate } from 'react-router-dom';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';
import { updateFilter } from '@/core/utils/filterHelper';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import { TextArea } from '@/ui/components/forms/Textarea';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import type { DeleteOutDoorRequest } from '@/features/outdoor/models/OutDoorModel';
import {
  Clock,
  MapPin,
  FileText,
  ExternalLink,
  Fingerprint,
  ClipboardCheck,
  AlertTriangle,
  Edit,
  Trash2
} from "lucide-react";
import { getCurrentLocation, formatLocationString, type LocationData } from "@/core/utils/locationUtils";
import { parseOutdoorDate, parseOutdoorTime, isToday, isPreviousDate } from "../utils/outdoorDateUtils";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { MultiImageViewer } from "@/ui/components/ImageViewer/ImageViewer";
import { ExpandableCard } from "@/ui/components/Card/ExpandableCard";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Pagination, type PaginationInfo } from "@/ui/components/Pagination/Pagination";
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { handleExportFile } from '@/core/utils/exportFile';

export const OutDoor: React.FC = () => {

  //#region STATE
  const [outDoorList, setOutDoorList] = useState<OutDoorMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const navigate = useNavigate();

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(10);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<any>(undefined);

  // TOAST
  const { addToast } = useToast()

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('')

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchOutDoors(value)
  }, 350)

  // FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  // PUNCH IN/OUT STATES
  const [punchingItemId, setPunchingItemId] = useState<number | null>(null);
  const [conclusionModalOpen, setConclusionModalOpen] = useState(false);
  const [selectedOutdoorItem, setSelectedOutdoorItem] = useState<OutDoorMasterData | null>(null);
  const [conclusionText, setConclusionText] = useState("");

  //DELETE CONFIRMATION DIALOG
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [selectedOutdoorToDelete, setSelectedOutdoorToDelete] = useState<OutDoorMasterData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
        searchTerm?: string;
        outdoorId?: number;
      };
    };
  };
  //#endregion

  //#region INIT

  useEffect(() => {

    const incoming = location.state?.listState as
      | { page?: number; filters?: FilterInfo; sortInfo?: any; searchTerm?: string; outdoorId?: number }
      | undefined;

    const listState = incoming ?? { page: 1, filters: {} as FilterInfo, sortInfo: undefined, searchTerm: '', outdoorId: 0 };


    setPagination({ currentPage: listState.page ?? pagination.currentPage });

    setSortInfo(listState.sortInfo);

    setFilters(listState.filters ?? {});

    setTempFilters(listState.filters ?? {});

    setSearchTerm(listState.searchTerm ?? '');

    if (listState.searchTerm && String(listState.searchTerm).trim()) {

      setSearchTerm(String(listState.searchTerm));

      loadOutDoors(listState.page ?? 1, { CompanyName: String(listState.searchTerm).trim() });

      return;
    }


    loadOutDoors(listState.page ?? 1, listState.filters ?? {});

  }, [location.state]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOAD
  const fetchOutDoorList = async (page: number = pagination.currentPage) => {
    return await loadOutDoors(page, filters);
  }

  const loadOutDoors = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;
        if (sortInfo) {
          // For outdoor, we can add sorting if needed
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
        }

        const response = await getOutDoors(params);

        if (E.isRight(response)) {

          setOutDoorList(response.right.Data || []);

          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });

        } else {
          addToast({ type: 'error', title: response.left.message });
        }
        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Outdoor Data'
    )
  }

  //#endregion

  //#region SEARCH OUTDOOR
  const searchOutDoors = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchOutDoorList();
      return;
    }

    const filterParams: FilterInfo = {
      CompanyName: searchValue.trim()
    };

    await loadOutDoors(1, filterParams);
  }
  //#endregion

  //#region CLEAR SEARCH OUTDOOR
  const clearSearchOutDoors = () => {
    setSearchTerm('');

    debouncedSearch.cancel?.();

    setFilters({});
    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadOutDoors(1, {});
    try {
      navigate(location.pathname, { replace: true, state: {} });
    } catch {
    }
  };

  //#endregion

  //#region EXCEL EXPORT PDF | EXCEL
  const handleExportOutDoors = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
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
        }
        const response = await getOutDoors(params);
        handleExportFile(response, exportType, 'Outdoor', addToast)
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' })
      },
      undefined,
      'Preparing Export...'
    )
  }

  const handleExportOutDoorExcel = () => handleExportOutDoors('Excel')
  const handleExportOutDoorPdf = () => handleExportOutDoors('PDF')
  //#endregion

  //#region GET OUTDOOR DATA FROM API
  const getOutDoors = async (filterParams: FilterWithPaginationOutDoor) => {
    return await OutDoorDataService.apiCallPullOutDoorData(filterParams);
  }
  //#endregion

  //#region TABLE CONFIG

  const handlePageChange = useCallback((page: number) => {
    fetchOutDoorList(page);
  }, []);

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

  const handlePunchInOut = useCallback(async (item: OutDoorMasterData) => {
    if (punchingItemId !== null) return;

    setPunchingItemId(item.OutdoorId);

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
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
          const response = await OutDoorDataService.apiCallPunchInOut({
            OutdoorId: item.OutdoorId,
            Punch: currentDateTime,
            Address: locationString
          });

          if (E.isRight(response)) {
            const apiResponse = response.right;

            // Check if API response has error messages
            if (apiResponse.ErrorMessage && apiResponse.ErrorMessage.length > 0) {
              const errorMessage = apiResponse.ErrorMessage[0];
              addToast({
                type: "error",
                title: errorMessage
              });
            } else if (apiResponse.WarningMessage && apiResponse.WarningMessage.length > 0) {
              const warningMessage = apiResponse.WarningMessage[0];
              addToast({
                type: "warning",
                title: warningMessage
              });
              await loadOutDoors(pagination.currentPage, filters);
            } else if (!apiResponse.IsSuccess) {
              addToast({
                type: "error",
                title: "Failed to punch in/out"
              });
            } else {
              await loadOutDoors(pagination.currentPage, filters);
              const successMessage = apiResponse.SuccessMessage?.[0] || (!item.PunchIn ? "Punched In Successfully" : "Punched Out Successfully");
              addToast({
                type: "success",
                title: successMessage
              });
            }
          } else {
            addToast({
              type: "error",
              title: response.left.message || "Failed to punch in/out"
            });
          }
        } catch (error: unknown) {
          const errorMessage = (error as { message?: string })?.message || "Failed to get location or punch in/out";
          addToast({
            type: "error",
            title: errorMessage
          });
        } finally {
          setPunchingItemId(null);
        }
      },
      undefined,
      (error: unknown) => {
        addToast({
          type: "error",
          title: (error as { message?: string })?.message || "Failed to punch in/out"
        });
        setPunchingItemId(null);
      },
      undefined,
      !item.PunchIn ? "Punching In..." : "Punching Out..."
    );
  }, [punchingItemId, pagination.currentPage, filters, addToast]);

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
      setIsLoadingMessage,
      async () => {
        const response = await OutDoorDataService.apiCallAddUpdateConclusion({
          OutdoorId: selectedOutdoorItem.OutdoorId,
          Conclusion: conclusionText
        });

        if (E.isRight(response)) {
          const apiResponse = response.right;

          // Check if API response has error messages
          if (apiResponse.ErrorMessage && apiResponse.ErrorMessage.length > 0) {
            const errorMessage = apiResponse.ErrorMessage[0];
            addToast({
              type: "error",
              title: errorMessage
            });
          } else if (apiResponse.WarningMessage && apiResponse.WarningMessage.length > 0) {
            const warningMessage = apiResponse.WarningMessage[0];
            addToast({
              type: "warning",
              title: warningMessage
            });
            await loadOutDoors(pagination.currentPage, filters);
            handleCloseConclusionModal();
          } else if (!apiResponse.IsSuccess) {
            addToast({
              type: "error",
              title: "Failed to save conclusion"
            });
          } else {
            await loadOutDoors(pagination.currentPage, filters);
            const successMessage = apiResponse.SuccessMessage?.[0] || "Conclusion saved successfully";
            addToast({
              type: "success",
              title: successMessage
            });
            handleCloseConclusionModal();
          }
        } else {
          addToast({
            type: "error",
            title: response.left.message || "Failed to save conclusion"
          });
        }
      },
      undefined,
      (error: unknown) => {
        addToast({
          type: "error",
          title: (error as { message?: string })?.message || "Failed to save conclusion"
        });
      },
      undefined,
      'Saving conclusion...'
    );
  }, [selectedOutdoorItem, conclusionText, pagination.currentPage, filters, addToast, handleCloseConclusionModal]);

  //#region FILTER HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadOutDoors(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});

    // reset page
    setPagination({ currentPage: 1 });

    // load empty filters
    loadOutDoors(1, {});

    setShowFilterPopup(false);

    // clear router state (very important)
    navigate(location.pathname, { replace: true, state: {} });
  };


  //#endregion

  //#region  HANDLE CHANGE EVENT

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region ADD OUTDOOR THEN NAVIGATE
  const handleAddOutdoor = useCallback(() => {
    navigate("/outdoor/add");
  }, [navigate]);
  //#endregion

  //#region DELETE OUTDOOR
  const handleConfirmationDialogBoxOpen = (item: OutDoorMasterData) => {
    setSelectedOutdoorToDelete(item);
    setIsConfirmationDialogBoxOpen(true);
  };

  const handleDeleteOutdoor = async () => {
    if (!selectedOutdoorToDelete?.OutdoorId || !selectedOutdoorToDelete?.Uniquekey) return;

    setIsDeleting(true);

    const payload: DeleteOutDoorRequest = {
      OutdoorId: selectedOutdoorToDelete.OutdoorId,
      UniqueKey: selectedOutdoorToDelete.Uniquekey,
    };

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const response = await OutDoorDataService.apiCallDeleteOutDoor(payload);
        if (E.isRight(response)) {
          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] || 'Deleted successfully' });
          setIsConfirmationDialogBoxOpen(false);
          setSelectedOutdoorToDelete(null);
          loadOutDoors(pagination.currentPage, filters);
        } else {
          addToast({ type: 'error', title: response.left.message || 'Delete failed' });
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error?.message || 'Delete failed' }),
      undefined,
      'Deleting Outdoor'
    );

    setIsDeleting(false);
  };
  //#endregion

  //#region PAGINATION INFO
  const outDoorPaginationInfo: PaginationInfo = {
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalRecords: pagination.totalRecords,
    pageSize: pagination.pageSize,
    onPageChange: handlePageChange,
  };
  //#endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Company Name..."
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearSearchOutDoors}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters)
          setShowFilterPopup(true)
        }}
        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddOutdoor}

        // IMPORT 
        isShowImportButton={canAction}

        // EXPORT
        isShowExportButton={canExport}
        onExportExcel={handleExportOutDoorExcel}
        onExportPdf={handleExportOutDoorPdf}
        exportLoading={isLoading}
      />
      <div className="p-4">

          {outDoorList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No outdoor records found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
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
                          <h3 className="text-sm font-medium text-gray-900 mb-1">
                            {formatDate_dd_MonthName_yy(item.OutDoorDate)}
                          </h3>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTimeFromDateTime(item.OutDoorTime) || 'N/A'}
                            </span>
                          </div>
                        </div>

                      </div>
                    }
                    showline={true}
                    customizedIcon={
                      <div className="flex items-center gap-2">
                        {/* Missed Punch Icon */}
                        {hasMissed && (
                          <div title={!item.PunchIn ? "Punch In missed" : "Punch Out missed"}>
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          </div>
                        )}

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

                        {/* Delete Button */}
                        {canAction && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirmationDialogBoxOpen(item);
                            }}
                            className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                            title="Delete Outdoor"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        )}
                      </div>

                    }
                    child={
                      <div className="space-y-4">
                        {/* Left Column */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                          <div className="space-y-0">
                            <div className="flex items-start gap-2.5 p-2.5 rounded-lg border-b border-gray-200">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Company Name</p>
                                <p className="text-sm font-medium text-gray-900">{item.CompanyName || 'N/A'}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2.5 p-2.5 rounded-lg border-b border-gray-200">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Company Address</p>
                                <p className="text-sm font-medium text-gray-900">{item.CompanyAddress || 'N/A'}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2.5 p-2.5 rounded-lg border-b border-gray-200">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Purpose</p>
                                <div className="text-sm font-medium text-gray-900">
                                  <TooltipText
                                    text={item.Purpose || 'N/A'}
                                    maxWidth="300px"
                                    tooltipThreshold={30}
                                  />
                                </div>
                              </div>
                            </div>

                            {item.Conclusion && (
                              <div className="flex items-start gap-2.5 p-2.5 rounded-lg border-b border-gray-200">
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Conclusion</p>
                                  <p className="text-sm font-medium text-gray-600">{item.Conclusion}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right Column */}
                          <div className="space-y-0">
                            {item.DepartmentName && (
                              <div className="flex items-start gap-2.5 p-2.5 rounded-lg border-b border-gray-200">
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Department</p>
                                  <p className="text-sm font-medium text-gray-900">{item.DepartmentName}</p>
                                </div>
                              </div>
                            )}

                            <div className="flex items-start gap-2.5 p-2.5 rounded-lg border-b border-gray-200">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Accompanied By</p>
                                <p className="text-sm font-medium text-gray-900">{item.AccompaniedByName || 'N/A'}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2.5 p-2.5 rounded-lg border-b border-gray-200">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Requested By</p>
                                <p className="text-sm font-medium text-gray-900">{item.CreatedBy || 'N/A'}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-end pt-2">
                              <button
                                onClick={() => navigate(`/outdoor/add/${item.OutdoorId}`)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium shadow-sm min-w-[110px] justify-center"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Punch In/Out Section */}
                        {(item.PunchIn || item.PunchOut || hasMissedPrevious) && (
                          <div className="border-t border-gray-200 pt-3">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
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
                                      {formatTimeFromDateTime(item.PunchIn) || 'N/A'}
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
                                      {formatTimeFromDateTime(item.PunchOut) || 'N/A'}
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

                        {/* Visiting Card Section */}
                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2.5">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">Visiting Card</p>
                                <p className="text-xs text-gray-500">Document attachment</p>
                              </div>
                            </div>
                            {item.VisitingCardURL ? (() => {
                              const cardUrls = parseDocumentUrls(item.VisitingCardURL);
                              return (
                                <MultiImageViewer
                                  images={cardUrls}
                                  title="Visiting Card"
                                  triggerLabel={
                                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium shadow-sm">
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      View Card{cardUrls.length > 1 ? ` (${cardUrls.length})` : ''}
                                    </button>
                                  }
                                />
                              );
                            })() : (
                              <span className="text-xs text-gray-400 italic">Not Uploaded</span>
                            )}
                          </div>
                        </div>
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
        saveText="Apply Filter"
        cancelText="Clear Filter"
        onCancel={() => clearFilters()}
        resetText=''
        size="small-half"
      >
        <div className="space-y-6">
          <div className="space-y-4">
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

      <ConfirmationDialogBox
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setSelectedOutdoorToDelete(null);
        }}
        onConfirm={() => {
          setIsConfirmationDialogBoxOpen(false);
          void handleDeleteOutdoor();
        }}
        title="You are about to delete Outdoor"
        message="Are you sure you want to delete this outdoor visit?"
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        variant="danger"
      />
    </div>
  );
};

export default OutDoor