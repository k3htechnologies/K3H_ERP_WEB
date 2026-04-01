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
import { formatDate_dd_MonthName_yy, formatTimeFromDateTime } from '@/core/utils/dateFormat';
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
  ClipboardCheck,
} from "lucide-react";

import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { MultiImageViewer } from "@/ui/components/ImageViewer/ImageViewer";
import { ExpandableCard } from "@/ui/components/Card/ExpandableCard";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Pagination, type PaginationInfo } from "@/ui/components/Pagination/Pagination";
import { handleExportFile } from '@/core/utils/exportFile';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { DateRangeWithActions } from '@/ui/components/DateRangeWithActions';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { updateFiltersWithDates } from '@/core/helpers/dateFilterHelper';
import { isEditDisabled } from '../helpers/dateFilterHelper';

export const OutDoor: React.FC = () => {
  //#region STATE
  const [outDoorList, setOutDoorList] = useState<OutDoorMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const navigate = useNavigate();

  const { pagination, setPagination } = usePagination(10);

  const { addToast } = useToast();

  const [, setTempFilters] = useState<FilterInfo>({});

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
          SortBy: getSortByParam(sortInfo ?? null, []),
          CanApprove: false,
          IsReport: false
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
          IsReport: false,
          CanApprove: false,
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
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
              return (
                <ExpandableCard
                  key={item.OutdoorId}
                  expandedheight={320}
                  title={
                    <div className="flex items-center justify-between w-full gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 mb-1 flex items-center gap-2">

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
                      {(
                        <Button
                          color='transparent'
                          disabled={isEditDisabled(item.CreatedDate)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenConclusionModal(item);
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                          title={isEditDisabled(item.CreatedDate) ? "Conclusion can only be edited within 2 days" : item.Conclusion ? "Edit Conclusion" : "Add Conclusion"}
                        >
                          <ClipboardCheck
                            className={`w-5 h-5 ${item.Conclusion ? 'text-purple-600' : 'text-gray-600'}`}
                          />
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
                                disabled={isEditDisabled(item.CreatedDate)}
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