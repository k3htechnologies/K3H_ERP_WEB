import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type UIEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import * as E from 'fp-ts/Either';
import { runApiWithLoader } from '@/core/utils';
import { Loader } from '@/core/utils/loader';
import { useToast } from '@/core/hooks/useToast';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat';
import { handleExportFile } from '@/core/utils/exportFile';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import MeetingCard, {
  type MeetingCardField,
} from '@/features/event/meeting/components/MeetingCard';
import {
  getAllMeetingColumnKeys,
  getMeetingCardOptions,
  MEETING_PAGE_SIZE,
  REQUIRED_MEETING_COLUMN_KEYS,
} from '@/features/event/event/constants/eventConstants';
import type { MeetingMasterData } from '@/features/event/meeting/models/MeetingModel';
import { MeetingService } from '@/features/event/meeting/services/MeetingService';
import { getApiMessage } from '@/features/event/event/utils/eventUtils';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { TableActionToolbar } from '@/ui/components/TableAction/TableActionToolbar';

export const Meeting: React.FC = () => {

  //#region STATE MANAGEMENT
  const [meetingMasterList, setMeetingMasterList] = useState<MeetingMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // USE NAVIGATE
  const navigate = useNavigate();

  // TOAST
  const { addToast } = useToast();

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('');
  const [meetingName, setMeetingName] = useState('');

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchMeeting(value);
  }, 350);

  // CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeMeetingColumnsModal, setIsShowCustomizeMeetingColumnsModal] =
    useState(false);

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions('/event');
  //#endregion

  //#endregion

  //#region INIT
  useEffect(() => {
    const controller = new AbortController();

    loadMeeting(currentPage, controller.signal);

    return () => controller.abort();
  }, [currentPage, meetingName]);
  //#endregion

  //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);
  //#endregion

  //#region DATA LOADING | FETCH | LOAD | SEARCH

  const loadMeeting = async (
    pageNumber: number,
    signal?: AbortSignal,
  ) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params = {
          PageSize: MEETING_PAGE_SIZE,
          PageNumber: pageNumber,
          MeetingName: meetingName,
        };

        const response = await MeetingService.apiCallPullMeetingMaster(
          params,
          { signal },
        );

        if (signal?.aborted) return response;

        if (E.isRight(response)) {
          if (response.right.IsSuccess) {
            const meetingData = Array.isArray(response.right.Data)
              ? response.right.Data
              : [];

            setMeetingMasterList((current) => {
              if (pageNumber === 1) {
                return meetingData;
              }

              const existingIds = new Set(
                current.map((meeting) => meeting.MeetingId),
              );

              return [
                ...current,
                ...meetingData.filter(
                  (meeting) => !existingIds.has(meeting.MeetingId),
                ),
              ];
            });

            setTotalRecords(response.right.TotalNumberOfRecord || 0);
          } else {
            addToast({
              type: 'error',
              title: getApiMessage(
                response.right.ErrorMessage,
                'Unable to load meetings',
              ),
            });

            if (pageNumber === 1) {
              setMeetingMasterList([]);
              setTotalRecords(0);
            }
          }
        } else {
          addToast({
            type: 'error',
            title: response.left.message,
          });

          if (pageNumber === 1) {
            setMeetingMasterList([]);
            setTotalRecords(0);
          }

          return response;
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Meetings',
    );
  };

  //#endregion

  //#region SEARCH & CLEAR

  const searchMeeting = async (searchValue: string) => {
    setCurrentPage(1);
    setMeetingName(searchValue.trim());
  };

  //#endregion

  //#region CLEAR MEETING MASTER

  const clearSearchMeeting = () => {
    debouncedSearch.cancel?.();

    setSearchTerm('');
    setMeetingName('');
    setCurrentPage(1);
  };

  //#endregion

  //#region EXPORT EXCEL AND PDF

  const handleExportMeeting = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params = {
          PageSize: Math.max(totalRecords, MEETING_PAGE_SIZE),
          PageNumber: 1,
          MeetingName: meetingName,
          ExportType: exportType,
        };

        const response = await MeetingService.apiCallPullMeetingMaster(params);

        handleExportFile(
          response,
          exportType,
          'Meetings',
          addToast,
        );

        return response;
      },
      undefined,
      (error: any) =>
        addToast({
          type: 'error',
          title: error.message || 'Export failed',
        }),
      undefined,
      'Preparing Export',
    );
  };

  const handleExportMeetingExcel = () => handleExportMeeting('Excel');
  const handleExportMeetingPdf = () => handleExportMeeting('PDF');

  //#endregion

  //#region HANDLE MEETING SCROLL

  const handleMeetingScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;

    const isNearBottom =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + 40;

    if (
      isNearBottom &&
      !isLoading &&
      meetingMasterList.length < totalRecords
    ) {
      setCurrentPage((page) => page + 1);
    }
  };

  //#endregion

  //#region NAVIGATE TO VIEW MEETING

  const handleNavigateToView = (row: MeetingMasterData) => {
    navigate(`/meeting/view/${row.MeetingId}`);
  };

  //#endregion

  //#region NAVIGATE TO EDIT MEETING

  const handleNavigateToEdit = (row: MeetingMasterData) => {
    navigate(`/meeting/edit/${row.MeetingId}`);
  };


  const handleNavigateToAddMom = (row: MeetingMasterData) => {
    navigate(`/meeting/${row.MeetingId}/mom`);
  };


  const handleAddMeeting = useCallback(() => {
    navigate('/meeting/add');
  }, [navigate]);
  //#endregion

  //#region TABLE COLUMNS
  const meetingColumns = useMemo(() => getMeetingCardOptions(), []);
  const allMeetingColumnKeys = useMemo(() => getAllMeetingColumnKeys(), []);
  //#endregion

  //#region COLUMN CUSTOMIZATION
  const [selectedMeetingColumnKeys, setSelectedMeetingColumnKeys] =
    useState<string[]>(() => {
      try {
        const saved = LocalStorageHelper.getMeetingTableColumns?.();
        if (saved) {
          const parsed = JSON.parse(saved) as string[];
          const withRequired = Array.from(new Set([...parsed, ...REQUIRED_MEETING_COLUMN_KEYS]));
          return withRequired.filter((key) => allMeetingColumnKeys.includes(key));
        }
      } catch { }
      return allMeetingColumnKeys;
    });

  const visibleMeetingFields = useMemo(
    () =>
      allMeetingColumnKeys.filter((key) =>
        selectedMeetingColumnKeys.includes(key),
      ) as MeetingCardField[],
    [allMeetingColumnKeys, selectedMeetingColumnKeys],
  );
  //#endregion

  //#region RENDER
  return (
    <div className="flex h-[calc(100vh-105px)] min-h-0 flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm">

      {/* Loader */}

      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Meeting Name"
        onSearchChange={(value) => {
          setSearchTerm(value);
          debouncedSearch(value);
        }}
        onClearSearch={clearSearchMeeting}
        isShowFilterButton={false}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeMeetingColumnsModal(true)}

        // ADD
        isShowAddButton={canAction}
        addTitle="Schedule Meeting"
        onAdd={handleAddMeeting}

        // IMPORT
        isShowImportButton={false}

        // EXPORT
        isShowExportButton={
          canExport && meetingMasterList.length > 0 ? true : false
        }
        onExportExcel={handleExportMeetingExcel}
        onExportPdf={handleExportMeetingPdf}
        exportLoading={isLoading}

        isShowAddExtraButton={false}
      />

      {/* MEETING LIST */}

      <div
        className="thin-scroll mt-5 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1"
        onScroll={handleMeetingScroll}
      >
        {meetingMasterList.map((meeting) => (
          <MeetingCard
            key={meeting.MeetingId}
            meeting={meeting}
            formattedDate={
              formatDate_dd_mm_yyyy(meeting.MeetingDate) || '-'
            }
            status={meeting.MeetingStatus || '-'}
            visibleFields={visibleMeetingFields}
            canAction={canAction}
            onView={handleNavigateToView}
            onEdit={handleNavigateToEdit}
            onAddMom={handleNavigateToAddMom}
          />
        ))}

        {!isLoading && meetingMasterList.length === 0 && (
          <NoDataView message="No meetings found" />
        )}

        {isLoading && currentPage > 1 && (
          <div className="py-3 text-center text-sm text-[#98A0AD]">
            Loading more meetings...
          </div>
        )}
      </div>

      {/* CUSTOMIZE COLUMNS MODAL */}

      <CustomizeColumnsModal
        isOpen={isShowCustomizeMeetingColumnsModal}
        onClose={() => setIsShowCustomizeMeetingColumnsModal(false)}
        onApply={(keys) => {
          const nextKeys = Array.from(new Set([...keys, ...REQUIRED_MEETING_COLUMN_KEYS]));
          setSelectedMeetingColumnKeys(nextKeys);
          LocalStorageHelper.storeMeetingTableColumns?.(JSON.stringify(nextKeys));
        }}
        columns={meetingColumns}
        selectedKeys={selectedMeetingColumnKeys}
        title="Customize Meeting Fields"
      />

    </div>
  );
  //#endregion
};

export default Meeting;