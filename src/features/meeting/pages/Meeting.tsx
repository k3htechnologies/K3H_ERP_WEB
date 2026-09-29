import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit } from 'lucide-react';
import * as E from 'fp-ts/Either';

import { usePagination } from '@/core/hooks/usePagination';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import { runApiWithLoader } from '@/core/utils';
import { formatDate_dd_MonthName_yy, formatDate_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd } from '@/core/utils/dateFormat';
import { updateFilter } from '@/core/utils/filterHelper';
import { handleExportFile } from '@/core/utils/exportFile';
import type { FilterInfo, PaginationInfo } from '@/ui/components/DataTable/DataTable';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { Modal } from '@/ui/components/Modal/Modal';
import PaginationCard from '@/ui/components/Card/PaginationCard';
import { Button, Input } from '@/ui/components/forms';
import DatePickerInput from '@/ui/components/forms/Datepicker';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import type { FilterWithPaginationMeetingMasterRequest, MeetingMasterData } from '@/features/meeting/models/MeetingModel';
import { meetingService } from '@/features/meeting/services/MeetingService';
import { useMeetingListState } from '@/features/meeting/context/MeetingListStateContext';

export const Meeting: React.FC = () => {
  const [meetingMasterList, setMeetingMasterList] = useState<MeetingMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const { pagination, setPagination } = usePagination(20);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { canAction, canExport } = useMenuPermissions('/event');

  const { listState, updateListState, resetFilters, setMeetingContext } = useMeetingListState();
  const { page, filters, searchTerm } = listState;

  const loadMeeting = async (pageNum: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationMeetingMasterRequest = {
          PageNumber: pageNum,
          PageSize: pagination.pageSize,
          MeetingId: filterParams.MeetingId
            ? Number(filterParams.MeetingId)
            : undefined,
          MeetingName: filterParams.MeetingName?.trim() || undefined,
          MeetingTitle: filterParams.MeetingTitle?.trim() || undefined,
          MeetingDate: filterParams.MeetingDate?.trim() || undefined,
          MeetingStatus: filterParams.MeetingStatus?.trim() || undefined,
        };

        const response = await meetingService.apiCallPullMeetingMaster(params);

        if (E.isRight(response)) {
          setMeetingMasterList(response.right.Data);
          setPagination({
            currentPage: pageNum,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(
              response.right.TotalNumberOfRecord / pagination.pageSize,
            ),
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
      'Loading Meetings',
    );
  };

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchMeetings(value);
  }, 350);

  useEffect(() => {
    setPagination({ currentPage: page });

    if (searchTerm.trim()) {
      loadMeeting(page, { MeetingName: searchTerm.trim() });
    } else {
      loadMeeting(page, filters);
    }
  }, [page, filters, searchTerm]);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  const searchMeetings = (searchValue: string) => {
    updateListState({ searchTerm: searchValue, page: 1 });

    if (searchValue.trim() === '') {
      updateListState({ filters: {}, searchTerm: '' });
    }
  };

  const clearSearchMeeting = () => {
    debouncedSearch.cancel?.();
    updateListState({ searchTerm: '', filters: {}, page: 1 });
    setTempFilters({});
  };

  const handleExportMeeting = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationMeetingMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          MeetingId: filters.MeetingId ? Number(filters.MeetingId) : undefined,
          MeetingName: searchTerm.trim() || undefined,
          MeetingTitle: filters.MeetingTitle?.trim() || undefined,
          MeetingDate: filters.MeetingDate?.trim() || undefined,
          MeetingStatus: filters.MeetingStatus?.trim() || undefined,
          ExportType: exportType,
        };

        const response = await meetingService.apiCallPullMeetingMaster(params);
        handleExportFile(response, exportType, 'Meetings', addToast);
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Preparing Export',
    );
  };

  const handlePageChange = useCallback(
    (nextPage: number) => {
      updateListState({ page: nextPage });
    },
    [updateListState],
  );

  const meetingPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange,
    }),
    [
      pagination.currentPage,
      pagination.totalPages,
      pagination.totalRecords,
      pagination.pageSize,
      handlePageChange,
    ],
  );

  const handleNavigateToView = (row: MeetingMasterData) => {
    setMeetingContext(row.MeetingId, row.MeetingTitle);
    navigate('/meeting/view');
  };

  const handleEditMeeting = (row: MeetingMasterData) => {
    navigate(`/meeting/add/${row.MeetingId}`);
  };

  const handleNavigateToMom = (row: MeetingMasterData) => {
    setMeetingContext(row.MeetingId, row.MeetingTitle);

    if (row.MeetingStatus?.toLowerCase() === 'completed') {
      navigate('/meeting/view');
      return;
    }

    navigate('/meeting/view?mode=mom');
  };

  const applyFilters = () => {
    updateListState({ filters: tempFilters, page: 1 });
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    resetFilters();
    setTempFilters({});
    setShowFilterPopup(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters((prev) => updateFilter(prev, key, value));
  };

  const handleAddMeeting = () => {
    navigate('/meeting/add');
  };

  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Meeting Name"
        onSearchChange={(v) => {
          updateListState({ searchTerm: v });
          debouncedSearch(v);
        }}
        onClearSearch={clearSearchMeeting}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowAddButton={canAction}
        onAdd={handleAddMeeting}
        isShowImportButton={false}
        isShowExportButton={canExport && meetingMasterList.length > 0}
        onExportExcel={() => handleExportMeeting('Excel')}
        onExportPdf={() => handleExportMeeting('PDF')}
        exportLoading={isLoading}
      />

      <PaginationCard
        data={meetingMasterList}
        loading={isLoading}
        pagination={meetingPaginationInfo}
        emptyMessage="No meetings found"
        rowKey="MeetingId"
        isUsedForOther={false}
        className="mt-4 flex-1"
        maxHeight="calc(100dvh - 280px)"
        header={(row) => {
          const isMeetingCompleted = row.MeetingStatus?.toLowerCase() === 'completed';
          const meetingLocation =
            row.MeetingMode?.toLowerCase() === 'online'
              ? row.MeetingLink?.trim() || '-'
              : row.RoomName?.trim() || row.MeetingLocation?.trim() || '-';

          return (
            <section className="relative mb-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#2563EB]" />

              <div className="border-b border-gray-200 bg-[#F8FAFC] px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="min-w-0 flex-1 text-lg font-semibold text-gray-900">
                    <TooltipText
                      text={row.MeetingTitle}
                      maxWidth="100%"
                      tooltipThreshold={40}
                      onClick={() => handleNavigateToView(row)}
                    />
                  </h4>

                  {canAction && (
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEditMeeting(row);
                        }}
                        color="transparent"
                        size="sm"
                        isborderRadius
                        title="Edit"
                        leftIcon={<Edit className="h-4 w-4" />}
                      />

                      <Button
                        size="sm"
                        color="blue"
                        variant="solid"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleNavigateToMom(row);
                        }}
                      >
                        {isMeetingCompleted ? 'View Mom' : 'Add Mom'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="pb-1 text-sm font-medium text-[#1D1D1D80]">
                      Meeting Type
                    </p>
                    <span className="inline-block rounded bg-[#EFF6FF] px-2 py-1 text-sm font-medium text-[#1D4ED8]">
                      {row.MeetingType?.trim() || '-'}
                    </span>
                  </div>

                  <FieldItem
                    label="Date"
                    value={
                      row.MeetingDate
                        ? formatDate_dd_MonthName_yy(row.MeetingDate)
                        : '-'
                    }
                  />
                  <FieldItem label="Location" value={meetingLocation} />
                  <FieldItem
                    label="Mode"
                    value={row.MeetingMode?.trim() || '-'}
                  />
                </div>
              </div>
            </section>
          );
        }}
      />

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Meeting"
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters();
        }}
        saveText="Apply"
        cancelText="Clear"
        onCancel={() => clearFilters()}
        size="small-half"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                label="Meeting Title"
                type="text"
                value={tempFilters.MeetingTitle || ''}
                onChange={(e) =>
                  handleFilterChange('MeetingTitle', e.target.value)
                }
                placeholder="Enter Meeting Title"
              />
            </div>

            <div>
              <DatePickerInput
                label="Meeting Date"
                value={
                  tempFilters.MeetingDate
                    ? formatDate_dd_mm_yyyy(tempFilters.MeetingDate)
                    : ''
                }
                onChange={(val) =>
                  handleFilterChange(
                    'MeetingDate',
                    convert_dd_mm_yyyy_To_Yyyy_mm_dd(val) || '',
                  )
                }
              />
            </div>

            <div>
              <Input
                label="Meeting Status"
                type="text"
                value={tempFilters.MeetingStatus || ''}
                onChange={(e) =>
                  handleFilterChange('MeetingStatus', e.target.value)
                }
                placeholder="Enter Meeting Status"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Meeting;
