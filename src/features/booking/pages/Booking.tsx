// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import { usePagination } from '@/core/hooks/usePagination';
// import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
// import { runApiWithLoader } from '@/core/utils';
// import * as E from 'fp-ts/Either';
// import { useToast } from '@/core/hooks/useToast';
// import type { BookingData, FilterWithPaginationBookingRequest } from '@/features/booking/models/BookingModel';
// import { bookingService } from '@/features/booking/services/BookingService';
// import TooltipText from '@/ui/components/Tooltip/TooltipText';
// import { handleExportFile } from '@/core/utils/exportFile';
// import { Loader } from '@/core/utils/loader';
// import { Modal } from '@/ui/components/Modal/Modal';
// import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
// import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
// import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
// import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
// import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
// import { useNavigate } from 'react-router-dom';
// import { Button, Input } from '@/ui/components/forms';
// import { updateFilter } from '@/core/utils/filterHelper';
// import { Eye, Trash2 } from 'lucide-react';
// import { useProject } from '@/features/projectMaster/context/ProjectContext';
// import { getSortByParam } from '@/core/constants/sortingColumnDetails';
// import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
// import { DatePickerInput } from '@/ui/components/forms/Datepicker';
// import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from '@/core/utils/dateFormat';
// import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
// import { useBookingListState } from '@/features/booking/context/BookingListStateContext';

// export const Booking: React.FC = () => {
//   //#region STATE
//   const [bookingList, setBookingList] = useState<BookingData[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [loadingMessage, setLoadingMessage] = useState('');
//   const navigate = useNavigate();

//   const { pagination, setPagination } = usePagination(20);

//   const { addToast } = useToast();

//   const [showFilterPopup, setShowFilterPopup] = useState(false);

//   const [tempFilters, setTempFilters] = useState<FilterInfo>({});

//   const [isShowCustomizeBookingColumnsModal, setIsShowCustomizeBookingColumnsModal] = useState(false);

//   const { canAction, canExport } = useMenuPermissions();

//   const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

//   const [deleteBookingData, setDeleteBookingData] = useState<BookingData | null>(null)

//   //#endregion

//   //#region PROJECT SELECTION GET ID
//   const { projectId } = useProject()
//   //#endregion

//   //#region BOOKING LIST STATE CONTEXT
//   const { listState, updateListState, resetFilters, clearBookingContext } = useBookingListState();

//   const { page, filters, sortInfo, searchTerm } = listState;
//   //#endregion

//   //#region DATA LOAD BOOKING

//   const loadBookings = async (pageNum: number, filterParams: FilterInfo, sortInfo?: SortInfo) => {
//     await runApiWithLoader(
//       setIsLoading,
//       setLoadingMessage,
//       async () => {
       
//         const params: FilterWithPaginationBookingRequest = {
//           PageNumber: pageNum,
//           PageSize: pagination.pageSize,
//           BookingId: filterParams.BookingId ? Number(filterParams.BookingId) : undefined,
//           ProjectId: projectId ?? undefined,
//           ApplicantMobileNumber: filterParams.ApplicantMobileNumber?.trim() || undefined,
//           ApplicantName: filterParams.ApplicantName?.trim() || undefined,
//           FromDate: filterParams.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) : undefined,
//           ToDate: filterParams.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) : undefined,
//           Wing: filterParams.Wing?.trim() || undefined,
//           Flat: filterParams.Flat?.trim() || undefined,
//           Floor: filterParams.Floor?.trim() || undefined,
//           Source: filterParams.Source?.trim() || undefined,
//           AgreementValue: filterParams.AgreementValue ? Number(filterParams.AgreementValue) : undefined,
//           BookingType: filterParams.BookingType?.trim() || undefined,
//           SortBy: getSortByParam(sortInfo ?? null, bookingColumns)
//         };

//         const response = await bookingService.apiCallPullBooking(params);

//         if (E.isRight(response)) {

//           setBookingList(response.right.Data);

//           setPagination({
//             currentPage: pageNum,
//             totalRecords: response.right.TotalNumberOfRecord,
//             totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
//           });

//         } else {
//           addToast({ type: 'error', title: response.left.message });
//         }

//         return response;
//       },
//       undefined,
//       (error: any) => {
//         addToast({ type: 'error', title: error.message });
//       },
//       undefined,
//       'Loading Booking'
//     );
//   };

//   //#endregion

//   //#region INIT
//   useEffect(() => {

//     if (!projectId) return;

//     clearBookingContext();

//     if (searchTerm && searchTerm.trim()) {

//       loadBookings(page, { ApplicantName: searchTerm.trim() }, sortInfo);

//     } else {

//       loadBookings(page, filters, sortInfo);

//     }
//   }, [projectId, page, filters, sortInfo, searchTerm, clearBookingContext]);


//   useEffect(() => {

//     setPagination({ currentPage: page });

//   }, [page]);

//   useEffect(() => {

//     setTempFilters(filters);

//   }, [filters]);

//   //#endregion

//   //#region SEARCH BOOKING FILTER

//   const debouncedSearch = useDebouncedCallback((value: string, isSearch: boolean = true) => {

//     let filterParams: FilterInfo = {};

//     if (value.trim() === '') {

//       updateListState({ searchTerm: '', filters: {}, page: 1 });

//       return;
//     }

//     if (isSearch) {

//       filterParams = { ApplicantName: value.trim() };
//     }

//     updateListState({ searchTerm: value, filters: filterParams, page: 1 });

//   }, 350);

//   const searchBookings = (searchValue: string) => {

//     updateListState({ searchTerm: searchValue });

//     debouncedSearch(searchValue, false);
//   };

//   //#endregion

//   //#region CLEAR SEARCH BOOKING
//   const clearSearchBookings = () => {
//     debouncedSearch.cancel?.();
//     resetFilters();
//     setTempFilters({});
//   };

//   //#endregion

//   //#region  EXCEL EXPORT TO EXCEL | PDF
//   const handleExportBookings = async (exportType: 'Excel' | 'PDF' | 'BOOKING FORM PDF') => {
//     await runApiWithLoader(
//       setIsLoading,
//       setLoadingMessage,
//       async () => {
        

//         const params: FilterWithPaginationBookingRequest = {
//           PageNumber: 1,
//           PageSize: pagination.totalRecords,
//           ProjectId: projectId ?? undefined,
//           ApplicantMobileNumber: tempFilters.ApplicantMobileNumber?.trim() || undefined,
//           ApplicantName: tempFilters.ApplicantName?.trim() || undefined,
//           FromDate: tempFilters.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(tempFilters.FromDate) : undefined,
//           ToDate: tempFilters.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(tempFilters.ToDate) : undefined,
//           Wing: tempFilters.Wing?.trim() || undefined,
//           Flat: tempFilters.Flat?.trim() || undefined,
//           Floor: tempFilters.Floor?.trim() || undefined,
//           Source: tempFilters.Source?.trim() || undefined,
//           AgreementValue: tempFilters.AgreementValue ? Number(tempFilters.AgreementValue) : undefined,
//           BookingType: tempFilters.BookingType?.trim() || undefined,
//           SortBy: getSortByParam(null, bookingColumns),
//           ExportType: exportType
//         };

//         const response = await bookingService.apiCallPullBooking(params);

//         if (exportType === 'BOOKING FORM PDF') {
//           // Handle PDF export differently if needed
//           handleExportFile(response, 'PDF', 'Booking Form', addToast);
//         } else {
//           handleExportFile(response, exportType, 'Booking Master', addToast);
//         }

//         return response;
//       },
//       undefined,
//       (error: any) => {
//         addToast({ type: 'error', title: error.message || 'Export failed' });
//       },
//       undefined,
//       'Preparing Export'
//     );
//   };

//   const handleExportBookingExcel = () => handleExportBookings('Excel');
//   const handleExportBookingPdf = () => handleExportBookings('PDF');

//   //#endregion

//   //#region TABLE CONFIG
//   const handlePageChange = useCallback((newPage: number) => {
//     updateListState({ page: newPage });
//   }, [updateListState]);

//   const handleSortColumn = useCallback((sort: SortInfo) => {
//     updateListState({ sortInfo: sort, page: 1 });
//   }, [updateListState]);

//   const bookingPaginationInfo: PaginationInfo = useMemo(
//     () => ({
//       currentPage: pagination.currentPage,
//       totalPages: pagination.totalPages,
//       totalRecords: pagination.totalRecords,
//       pageSize: pagination.pageSize,
//       onPageChange: handlePageChange
//     }),
//     [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
//   );

//   const bookingsForTable = useMemo(() => bookingList, [bookingList]);
//   //#endregion

//   //#region VIEW BOOKING DETAILS
//   const handleViewBookingDetails = useCallback((row: BookingData) => {
//     updateListState({
//       bookingId: row.BookingId ?? 0,
//       bookingName: row.ApplicantName ?? '',
//     });
//     navigate('/booking/view');
//   }, [navigate, updateListState]);
//   //#endregion

//   //#region CONFIRMATION DIALOG BOX

//   const handleConfirmationDialogBoxOpen = useCallback((row: BookingData) => {
//     setDeleteBookingData(row)
//     setIsConfirmationDialogBoxOpen(true)
//   }, [])

//   //#endregion

//   //#region TABLE COLUMN
//   const bookingColumns = useMemo<TableColumn[]>(
//     () => [
//       {
//         key: 'ApplicantName',
//         label: 'Applicant Name',
//         width: '20',
//         sortable: true,
//         fixed: 'left',
//         align: 'left',
//         render: (value, row) => (
//           <div className="flex items-center justify-between gap-3">
//             <div className="flex items-center gap-3">
//               <div className="min-w-0">
//                 <TooltipText
//                   text={value || '-'}
//                   maxWidth="260px"
//                   tooltipThreshold={26}
//                   onClick={() => handleViewBookingDetails(row)}
//                 />
//               </div>
//             </div>
//           </div>
//         )
//       },
//       {
//         key: 'ProjectName',
//         label: 'Project Name',
//         width: '18',
//         sortable: true,
//         align: 'left',
//         render: value => (
//           <TooltipText text={value || '-'} maxWidth="220px" tooltipThreshold={22} />
//         )
//       },
//       {
//         key: 'BookingType',
//         label: 'Booking Type',
//         width: '14',
//         sortable: true,
//         align: 'left',
//         render: value => value || '-'
//       },
//       {
//         key: 'Flat',
//         label: 'Flat',
//         width: '12',
//         sortable: true,
//         align: 'left',
//         render: value => value || '-'
//       },
//       {
//         key: 'Wing',
//         label: 'Wing',
//         width: '10',
//         sortable: false,
//         align: 'left',
//         render: value => value || '-'
//       },
//       {
//         key: 'Floor',
//         label: 'Floor',
//         width: '10',
//         sortable: false,
//         align: 'left',
//         render: value => value || '-'
//       },
//       {
//         key: 'AgreementValue',
//         label: 'Agreement Value (₹)',
//         width: '18',
//         sortable: true,
//         align: 'right',
//         render: value => value ? `₹${Number(value).toLocaleString('en-IN')}` : '-'
//       },
//       {
//         key: 'RegistrationDate',
//         label: 'Registration Date',
//         width: '16',
//         sortable: true,
//         align: 'center',
//         render: value => value ? formatDate_dd_MonthName_yy(value) : '-'
//       },
//       {
//         key: 'Source',
//         label: 'Source',
//         width: '14',
//         sortable: false,
//         align: 'left',
//         render: value => value || '-'
//       },
//       {
//         key: 'ChannelPartnerName',
//         label: 'Channel Partner',
//         width: '16',
//         sortable: false,
//         align: 'left',
//         render: value => (
//           <TooltipText text={value || '-'} maxWidth="200px" tooltipThreshold={20} />
//         )
//       },
//       {
//         key: 'actions',
//         label: 'Actions',
//         width: '12',
//         fixed: 'right',
//         align: 'center',
//         render: (_value, row) => (
//           canAction ? (
//             <div className="flex items-center justify-center gap-2">
//               <Button
//                 onClick={(e) => {
//                   e.preventDefault()
//                   e.stopPropagation()
//                   handleViewBookingDetails(row)
//                 }}
//                 color='transparent'
//                 isborderRadius
//                 size='sm'
//                 style={{
//                   color: 'blue',
//                   padding: '4px 8px'
//                 }}
//                 title="View Booking"
//               >
//                 <Eye className="h-4 w-4" />
//               </Button>

//               <Button
//                 onClick={(e) => {
//                   e.preventDefault()
//                   e.stopPropagation()
//                   handleConfirmationDialogBoxOpen(row)
//                 }}
//                 color='transparent'
//                 isborderRadius
//                 size='sm'
//                 style={{
//                   color: 'red',
//                   padding: '4px 8px'
//                 }}
//                 title="Cancel Booking"
//               >
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             </div>
//           ) : null
//         )
//       }
//     ],
//     [canAction, handleViewBookingDetails, handleConfirmationDialogBoxOpen]
//   );
//   //#endregion

//   //#region CUSTOMIZE COLUMNS
//   const requiredBookingColumnKeys: string[] = ['ApplicantName'];

//   const allBookingColumnKeys: string[] = bookingColumns.map(c => c.key);

//   const [selectedBookingColumnKeys, setSelectedBookingColumnKeys] = useState<string[]>(() => {
//     try {
//       const saved = LocalStorageHelper.getBookingTableColumns?.();
//       if (saved) {
//         const parsed = JSON.parse(saved) as string[];
//         const withRequired = Array.from(new Set([...parsed, ...requiredBookingColumnKeys]));
//         return withRequired.filter(k => allBookingColumnKeys.includes(k));
//       }
//     } catch {
//       // ignore
//     }
//     return allBookingColumnKeys;
//   });

//   useEffect(() => {
//     setSelectedBookingColumnKeys(prev =>
//       Array.from(new Set([...prev, ...requiredBookingColumnKeys])).filter(k =>
//         allBookingColumnKeys.includes(k)
//       )
//     );

//   }, [bookingColumns.length]);

//   const visibleBookingColumns = useMemo(
//     () => bookingColumns.filter(col => selectedBookingColumnKeys.includes(col.key)),
//     [bookingColumns, selectedBookingColumnKeys]
//   );
//   //#endregion

//   //#region  HANDLE CHANGE EVENT

//   const handleFilterChange = (key: string, value: string) => {
//     setTempFilters(prev => updateFilter(prev, key, value));
//   };

//   //#endregion

//   //#region  CANCEL BOOKING EVENT
//   const handleCancelBooking = async () => {
//     setIsConfirmationDialogBoxOpen(false);

//     if (!deleteBookingData) return

//     await runApiWithLoader(
//       setIsLoading,
//       setLoadingMessage,
//       async () => {

//         const params = {
//           BookingId: deleteBookingData.BookingId,
//           Uniquekey: deleteBookingData.Uniquekey ?? "",
//           ProjectId: Number(projectId),
//           InventoryFlatId: deleteBookingData.InventoryFlatId ?? 0,
//           ParkingId: deleteBookingData.ParkingId ?? ""
//         }

//         const response = await bookingService.apiCallCancelBooking(params);

//         if (E.isRight(response)) {

//           const newTotalRecords = pagination.totalRecords - 1;

//           const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

//           let pageToShow = pagination.currentPage;

//           if (pagination.currentPage > newTotalPages) {
//             pageToShow = newTotalPages;
//           }

//           else if (bookingList.length === 1 && pagination.currentPage > 1) {
//             pageToShow = pagination.currentPage - 1;
//           }

//           setPagination({
//             currentPage: pageToShow,
//             totalRecords: newTotalRecords,
//             totalPages: newTotalPages
//           });

//           await loadBookings(pageToShow, filters, sortInfo);

//           addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

//           setIsConfirmationDialogBoxOpen(false);

//           setDeleteBookingData(null);

//         } else {

//           addToast({ type: 'error', title: response.left.message });

//           setIsConfirmationDialogBoxOpen(false);

//         }

//         return response
//       },
//       undefined,
//       (error: unknown) => {
//         const err = error as { message?: string };
//         addToast({ type: 'error', title: err.message || 'An error occurred' })
//       },
//       undefined,
//       'Cancel Booking'
//     )
//   }

//   //#endregion


//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//       <Loader loading={isLoading} title={loadingMessage}>
//         <div></div>
//       </Loader>

//       <TableActionToolbar
//         isShowSearchBar
//         searchTerm={searchTerm}
//         searchPlaceholder="Search By Applicant Name"
//         onSearchChange={searchBookings}
//         onClearSearch={clearSearchBookings}
//         isShowFilterButton
//         filters={tempFilters}
//         onOpenFilter={() => {
//           setTempFilters(tempFilters);
//           setShowFilterPopup(true);
//         }}
//         isShowCustomizeButton
//         onCustomize={() => setIsShowCustomizeBookingColumnsModal(true)}
//         // ADD
//         isShowAddButton={canAction && Number(projectId) > 0}
//         addTitle="Add"
//         onAdd={() => navigate('/booking/add')}
//         // IMPORT
//         isShowImportButton={false}

//         // EXPORT
//         isShowExportButton={canExport && bookingsForTable.length > 0}
//         onExportExcel={handleExportBookingExcel}
//         onExportPdf={handleExportBookingPdf}
//         exportLoading={isLoading}
//       />

//       <DataTable
//         data={bookingsForTable}
//         columns={visibleBookingColumns}
//         pagination={bookingPaginationInfo}
//         emptyMessage="No Booking Data Found"
//         fixedHeight
//         recordsPerPage={20}
//         className="flex-1"
//         sortInfo={undefined}
//         onSort={handleSortColumn}
//       />

//       <CustomizeColumnsModal
//         isOpen={isShowCustomizeBookingColumnsModal}
//         onClose={() => setIsShowCustomizeBookingColumnsModal(false)}
//         onApply={keys => {
//           const withRequired = Array.from(new Set([...keys, ...requiredBookingColumnKeys]));
//           setSelectedBookingColumnKeys(withRequired);
//           try {
//             LocalStorageHelper.storeRedevelopmentBookingTableColumns?.(JSON.stringify(withRequired));
//           } catch {
//             // ignore
//           }
//         }}
//         columns={bookingColumns}
//         selectedKeys={selectedBookingColumnKeys}
//         requiredKeys={requiredBookingColumnKeys}
//         title="Customize Table Columns"
//       />

//       {/* CANCEL CONFIRMATION MODAL */}
//       <DeleteDialog
//         isOpen={isConfirmationDialogBoxOpen}
//         onClose={() => {
//           setIsConfirmationDialogBoxOpen(false)
//           setDeleteBookingData(null)
//         }}
//         onConfirm={handleCancelBooking}
//         loading={isLoading}
//         pageName='booking'
//       />

//       <Modal
//         isOpen={showFilterPopup}
//         onClose={() => setShowFilterPopup(false)}
//         title="Filter - Booking"
//         onSubmit={e => {
//           e.preventDefault();
//           updateListState({ filters: tempFilters, page: 1 });
//           setShowFilterPopup(false);
//         }}
//         saveText="Apply "
//         cancelText="Clear"
//         onCancel={() => {
//           setTempFilters({});
//           resetFilters();
//           setShowFilterPopup(false);
//         }}


//         size="small-half"
//       >
//         <div className="space-y-6">
//           <div className="space-y-4">
//             <div>
//               <Input
//                 label='Applicant Name'
//                 type="text"
//                 value={tempFilters.ApplicantName || ''}
//                 onChange={e => handleFilterChange('ApplicantName', e.target.value)}
//                 placeholder="Enter Applicant name"
//               />
//             </div>

//             <div>
//               <Input
//                 label='Applicant Mobile Number'
//                 type="text"
//                 value={tempFilters.ApplicantMobileNumber || ''}
//                 onChange={e => handleFilterChange('ApplicantMobileNumber', e.target.value)}
//                 placeholder="Enter Mobile Number"
//               />
//             </div>

//             <div>
//               <DatePickerInput
//                 label='From Date'
//                 value={tempFilters.FromDate || ''}
//                 onChange={value => handleFilterChange('FromDate', value || '')}
//                 placeholder="Select From Date"
//               />
//             </div>

//             <div>
//               <DatePickerInput
//                 label='To Date'
//                 value={tempFilters.ToDate || ''}
//                 onChange={value => handleFilterChange('ToDate', value || '')}
//                 placeholder="Select To Date"
//               />
//             </div>

//             <div>
//               <Input
//                 label='Wing'
//                 type="text"
//                 value={tempFilters.Wing || ''}
//                 onChange={e => handleFilterChange('Wing', e.target.value)}
//                 placeholder="Enter Wing"
//               />
//             </div>

//             <div>
//               <Input
//                 label='Flat'
//                 type="text"
//                 value={tempFilters.Flat || ''}
//                 onChange={e => handleFilterChange('Flat', e.target.value)}
//                 placeholder="Enter Flat"
//               />
//             </div>

//             <div>
//               <Input
//                 label='Floor'
//                 type="text"
//                 value={tempFilters.Floor || ''}
//                 onChange={e => handleFilterChange('Floor', e.target.value)}
//                 placeholder="Enter Floor"
//               />
//             </div>

//             <div>
//               <Input
//                 label='Source'
//                 type="text"
//                 value={tempFilters.Source || ''}
//                 onChange={e => handleFilterChange('Source', e.target.value)}
//                 placeholder="Enter Source"
//               />
//             </div>

//             <div>
//               <Input
//                 label='Agreement Value'
//                 type="number"
//                 value={tempFilters.AgreementValue || ''}
//                 onChange={e => handleFilterChange('AgreementValue', e.target.value)}
//                 placeholder="Enter Agreement Value"
//               />
//             </div>

//             <div>
//               <Input
//                 label='Booking Type'
//                 type="text"
//                 value={tempFilters.BookingType || ''}
//                 onChange={e => handleFilterChange('BookingType', e.target.value)}
//                 placeholder="Enter Booking Type"
//               />
//             </div>
//           </div>
//         </div>
//       </Modal>
//     </div >
//   );
// };

// export default Booking;

import React from "react";

const Booking: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Add / Update Booking
            </h2>

            <p className="text-sm text-gray-600">
                Booking form content will go here.
            </p>
        </div>
    );
};

export default Booking;


