import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePagination } from "@/core/hooks/usePagination";
import { type FilterInfo, type PaginationInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import type { PayTrackBookingData, FilterWithPaginationPayTrackBooking } from "@/features/crmPayTrack/models/PayTrackBookingModel";
import { payTrackBookingService } from "@/features/crmPayTrack/services/PayTrackBookingService";
import { Modal } from "@/ui/components/Modal/Modal";
import { handleExportFile } from "@/core/utils/exportFile";
import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { runApiWithLoader } from "@/core/utils";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { useNavigate } from "react-router-dom";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { updateFilter } from "@/core/utils/filterHelper";
import { Input } from "@/ui/components/forms";
import { usePayTrackBookingListState } from "../context/PayTrackBookingListStateContext";
import { filterNumbers, filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import ToggleSwitch from "@/ui/components/forms/ToggleSwitch";
import PaginationCard from "@/ui/components/Card/PaginationCard";
import { formatCurrency } from "@/core/utils/comman";
import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";
import { getStatusColor } from "@/features/modulesWorkflowApproval/utils/Status";
import { ChevronRight, ExternalLink, Phone } from "lucide-react";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";

const PayTrack: React.FC = () => {
  const [payTrackList, setPayTrackList] = useState<PayTrackBookingData[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<PayTrackBookingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const navigate = useNavigate();

  const { pagination, setPagination } = usePagination(20);

  const { addToast } = useToast();

  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const { canExport } = useMenuPermissions("/bookingPayTrack");

  const { projectId } = useProject();

  const { listState, updateListState, resetFilters, clearPayTrackBookingContext } = usePayTrackBookingListState();

  const { page, filters, sortInfo, searchTerm } = listState;

  // APPROVAL LOG MODAL
  const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
  const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
  const [ownerName, setOwnerName] = useState<string | null>("");
  const [wing, setwing] = useState<string | null>("");
  const [unitNumber, setUnitNumber] = useState<string | null>("");

  // APPROVAL ACTION MODAL
  const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
  const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
  const [approvalRowData, setApprovalRowData] = useState<PayTrackBookingData | null>(null);


  const loadPayTrackList = async (pageNum: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationPayTrackBooking = {
          PageNumber: pageNum,
          PageSize: pagination.pageSize,
          ProjectId: Number(projectId),
          Wing: filterParams.Wing || undefined,
          Flat: filterParams.Flat || undefined,
          Floor: filterParams.Floor || undefined,
          ApplicantName: filterParams.ApplicantName?.trim() || undefined,
          ApplicantMobileNumber: filterParams.ApplicantMobileNumber?.trim() || undefined,
          Configuration: filterParams.Configuration || undefined,
          FromDate: filterParams.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) : undefined,
          ToDate: filterParams.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) : undefined,
          AgreementValue: filterParams.AgreementValue ? Number(filterParams.AgreementValue) : undefined,
          BookingType: filterParams.BookingType?.trim() || undefined,
          IsFinalRegistrationCompleted: filterParams.IsFinalRegistrationCompleted ?? undefined,
        };

        const response = await payTrackBookingService.apiCallPullPayTrackBooking(params);

        if (E.isRight(response)) {

          setPayTrackList(response.right.Data);

          if (response.right.Data.length > 0) {
            setSelectedBooking(response.right.Data[0]);
          } else {
            setSelectedBooking(null);
          }

          setPagination({
            currentPage: pageNum,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });

        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Loading Pay Track Booking",
    );
  };

  useEffect(() => {
    if (!projectId) return;

    clearPayTrackBookingContext();

    if (searchTerm && searchTerm.trim()) {
      loadPayTrackList(page, { ApplicantName: searchTerm.trim() });
    } else {
      loadPayTrackList(page, filters);
    }
  }, [projectId, page, filters, sortInfo, searchTerm, clearPayTrackBookingContext]);

  useEffect(() => {
    setPagination({ currentPage: page });
  }, [page]);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);



  const debouncedSearch = useDebouncedCallback((value: string, isSearch: boolean = true) => {
    let filterParams: FilterInfo = {};

    if (value.trim() === "") {
      updateListState({ searchTerm: "", filters: {}, page: 1 });

      return;
    }

    if (isSearch) {
      filterParams = { ApplicantName: value.trim() };
    }

    updateListState({ searchTerm: value, filters: filterParams, page: 1 });
  }, 350);

  const searchPayTrackBookings = (searchValue: string) => {
    updateListState({ searchTerm: searchValue });

    debouncedSearch(searchValue, false);
  };


  const clearPayTrackSearchBookings = () => {
    debouncedSearch.cancel?.();
    resetFilters();
    setTempFilters({});
  };

  const handleExportPayTrackExcel = async (exportType: "Excel" | "PDF") => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationPayTrackBooking = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          ProjectId: Number(projectId),
          Wing: tempFilters.wing || undefined,
          Flat: tempFilters.Flat || undefined,
          Floor: tempFilters.Floor || undefined,
          ApplicantName: searchTerm || undefined,
          FromDate: tempFilters.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(tempFilters.FromDate) : undefined,
          ToDate: tempFilters.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(tempFilters.ToDate) : undefined,
          AgreementValue: tempFilters.AgreementValue ? Number(tempFilters.AgreementValue) : undefined,
          BookingType: tempFilters.BookingType?.trim() || undefined,
          IsFinalRegistrationCompleted: tempFilters.IsFinalRegistrationCompleted ?? undefined,
          ExportType: exportType,
        };

        const response = await payTrackBookingService.apiCallPullPayTrackBooking(params);
        handleExportFile(response, exportType, "PayTrack", addToast);
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message || "Export failed" });
      },
      undefined,
      "Preparing Export",
    );
  };

  const handleExportPayTrackExcelFile = () => handleExportPayTrackExcel("Excel");
  const handleExportPayTrackPdfFile = () => handleExportPayTrackExcel("PDF");

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateListState({ page: newPage });
    },
    [updateListState],
  );
  const payTrackBookingPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange,
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize],
  );

  const payTrackBookingsForTable = useMemo(() => payTrackList, [payTrackList]);

  const handleViewpayTrackDetails = useCallback((row: PayTrackBookingData) => {

    updateListState({
      bookingId: row.BookingId ?? 0,
      bookingName: row.ApplicantName ?? "",
      bookingType: row.BookingType ?? "",
      flat: row.Flat ?? "",
      bookingApprovalStatus: row.BookingApprovalStatus ?? "",
      bookingOtherChargesData: row.BookingOtherChargesData ?? [],
      bookingData: row ?? [],
      parkingNumber: row.ParkingNumber || "",
      totalAmountRefundedAgainstBooking: row.TotalAmountRefundedAgainstBooking || 0,
      isFinalRegistrationCompleted: row.IsFinalRegistrationCompleted || false,
      totalUnitCost:
        (row.AgreementValue || 0) +
        (row.AgreementValueGSTAmount || 0) +
        (row.StampDutyAmount || 0) +
        (row.RegistrationFees || 0) +
        (row.OtherChargesAmount || 0) +
        (row.OtherChargesGSTAmount || 0),
    });
    navigate("/payTrack/view");
  },
    [navigate, updateListState],
  );

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters((prev) => updateFilter(prev, key, value));
  };

  const paymentData = useMemo(() => {
    if (!selectedBooking) return [];

    const data = [
      {
        type: "Stamp Duty",
        total: selectedBooking.StampDutyAmount || 0,
        paid: selectedBooking.ReceivedStampDutyAmount || 0,
      },
      {
        type: "Registration Fees",
        total: selectedBooking.RegistrationFees || 0,
        paid: selectedBooking.ReceivedRegistrationFees || 0,
      },
      {
        type: "Agreement Value (Without TDS)",
        total: Number(selectedBooking.AgreementValue || 0) - Number(selectedBooking.AgreementValueTDS || 0),
        paid: selectedBooking.ReceivedAgreementValue || 0,
      },
      {
        type: "Agreement Value GST",
        total: selectedBooking.AgreementValueGSTAmount || 0,
        paid: selectedBooking.ReceivedAgreementValueGSTAmount || 0,
      },
      {
        type: "Agreement Value TDS",
        total: selectedBooking.AgreementValueTDS || 0,
        paid: selectedBooking.ReceivedAgreementValueTDS || 0,
      },
      {
        type: "Other Charges Value",
        total: selectedBooking.OtherChargesAmount || 0,
        paid: selectedBooking.ReceivedOtherChargesAmount || 0,
      },
      {
        type: "Other Charges GST",
        total: selectedBooking.OtherChargesGSTAmount || 0,
        paid: selectedBooking.ReceivedOtherChargesGSTAmount || 0,
      },
    ].map((x) => ({
      ...x,
      pending: x.total - x.paid,
    }));

    const total = data.reduce((s, x) => s + x.total, 0);
    const paid = data.reduce((s, x) => s + x.paid, 0);
    const pending = total - paid;

    return [
      ...data,
      {
        type: "Total",
        total,
        paid,
        pending,
        isTotal: true,
      },
    ];
  }, [selectedBooking]);

  const payTrackPaymentColumns = useMemo<TableColumn[]>(() => [
    {
      key: "type",
      label: "Type",
      align: "left",
      width: "300px",
      render: (value, row) => (
        <span className={row.isTotal ? "font-bold" : ""}>{value}</span>
      ),
    },
    {
      key: "total",
      label: "Total Amount",
      align: "right",
      width: "300px",
      render: (value, row) => (
        <span className={row.isTotal ? "font-bold" : ""}>{formatCurrency(value)}</span>
      ),
    },
    {
      key: "paid",
      label: "Received Amount",
      align: "right",
      width: "300px",
      render: (value, row) => (
        <span className={row.isTotal ? "font-bold" : ""}>{formatCurrency(value)}</span>
      ),
    },
    {
      key: "pending",
      label: "Outstanding Amount",
      align: "right",
      width: "300px",
      render: (_, row) => (
        <span className={row.isTotal ? "font-bold" : ""}>{formatCurrency(row.pending)}</span>
      ),
    },
  ], []);

  const handleApprovalLog = (row: PayTrackBookingData) => {
    const request: ModulesApprovalStatusRequest = {
      ModuleName: "CANCEL BOOKING APPROVAL",
      Id: row.BookingId ?? 0,
      ProjectId: row.ProjectId ?? 0,
    };
    setOwnerName(row.ApplicantName);
    setwing(row?.Wing)
    setUnitNumber(row?.Flat);

    setApprovalLogRequest(request);
    setIsApprovalLogModalOpen(true);
  };

  const handleApproveRejectDocument = (row: PayTrackBookingData, approvalType: "approve" | "reject") => {

    setApprovalRowData(row);
    setOwnerName(row.ApplicantName);
    setwing(row?.Wing)
    setUnitNumber(row?.Flat);
    setApprovalActionType(approvalType);
    setIsApprovalActionModalOpen(true);

  };

  const handleApprovalSubmit = async (remark: string) => {

    if (!approvalRowData) return;

    const payload: UpdateModulesWorkflowApprovalRequest = {
      ModuleName: "CANCEL BOOKING APPROVAL",
      Id: approvalRowData.BookingId ?? 0,
      ProjectId: approvalRowData.ProjectId ?? 0,
      IsApproved: approvalActionType === "approve",
      Remarks: remark ?? null
    };

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const response = await modulesWorkflowApprovalService.apiCallupdateModulesWorkflowApproval(payload);

        if (E.isRight(response)) {

          addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

          setIsApprovalActionModalOpen(false);

          await loadPayTrackList(page, filters);

        } else {

          addToast({ type: "error", title: response.left.message });

        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      approvalActionType === "approve" ? "Approving Cancel Booking Process" : "Rejecting Cancel Booking Process"
    );
  };



  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}> {" "}<div></div>{" "}</Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Applicant Name"
        onSearchChange={searchPayTrackBookings}
        onClearSearch={clearPayTrackSearchBookings}
        isShowCustomizeButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters || {});
          setShowFilterPopup(true);
        }}
        isShowFilterButton
        // IMPORT
        isShowImportButton={false}
        // EXPORT
        isShowExportButton={canExport && payTrackBookingsForTable.length > 0}
        onExportExcel={handleExportPayTrackExcelFile}
        onExportPdf={handleExportPayTrackPdfFile}
        exportLoading={isLoading}
      />

      {payTrackBookingsForTable.length === 0 ?

        <section className="bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f]">
          <NoDataView message="No Pay Track Data Available" />
        </section>

        :
        <div className="grid grid-cols-12 gap-4">

          <div className="bg-white col-span-12 lg:col-span-4 p-3 rounded-2xl">

            <PaginationCard
              key={searchTerm}
              data={payTrackBookingsForTable}
              pagination={payTrackBookingPaginationInfo}
              emptyMessage="No Data found"
              className="flex-1"
              selectedRowKey={selectedBooking?.BookingId || 0}
              onRowClick={setSelectedBooking}
              rowKey="BookingId"
              header={(row) => (

                <div className="flex items-start justify-between w-full">

                  <div className="flex flex-col">

                    <span className="font-medium text-md text-[#1E293B]">
                      {row.ApplicantName}
                    </span>


                    <div className="flex items-center gap-2 mt-3">
                      <span className={`px-4 py-1 rounded-full text-xs font-medium ${getStatusColor(row.TenantId === 0 ? "Booked" : "Alloted")}`}>
                        {row.TenantId === 0 ? "Booked" : "Alloted"}
                      </span>

                      {["CANCEL", "REFUND"].includes(row.BookingApprovalStatus?.toUpperCase()) && (
                        <>
                          <ChevronRight size={18} className="text-gray-400" />

                          <span className={`px-4 py-1 rounded-full text-xs font-medium ${getStatusColor(row.BookingApprovalStatus)}`}>
                            {row.BookingApprovalStatus}
                          </span>
                        </>
                      )}
                    </div>
                    {row.CancelRemark && row.BookingApprovalStatus.toUpperCase() !== 'REFUND' && (
                      <span className="font-medium mt-3 text-sm text-gray-500">
                        Cancellation Status :
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col">

                    <span className="font-medium text-sm text-end text-[#1E293B]">
                      {row.Flat}
                    </span>
                    <span className="font-medium mt-8 text-sm text-gray-500">
                      {""}
                    </span>

                    {row.CancelRemark && row.BookingApprovalStatus.toUpperCase() !== 'REFUND' && (
                      <span className="mt-3">
                        <ApprovalActions
                          approvalStatus={row.CancelBookingApprovalStatus || "-"}
                          showApproval={row.CancelBookingIsApproval}
                          isIcons={true}
                          onHistory={() => handleApprovalLog(row)}
                          onApprove={() => handleApproveRejectDocument(row, "approve")}
                          onReject={() => handleApproveRejectDocument(row, "reject")}
                        />
                      </span>
                    )}


                  </div>

                </div>
              )}
            />
          </div>

          {selectedBooking && (

            <div className="col-span-12 lg:col-span-8">

                <div className="bg-white rounded-2xl h-[calc(100vh-190px)] overflow-y-auto thin-scroll">

                <div className="p-6">

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                    <div>
                      <h2 className="inline-flex items-center gap-1 text-xl font-semibold text-[#135BEC] cursor-pointer hover:text-[#0F4BCF] hover:underline transition-colors"
                        onClick={() => {
                          if (selectedBooking) {
                            handleViewpayTrackDetails(selectedBooking);
                          }
                        }}
                      >
                        {selectedBooking?.ApplicantName}
                        <ExternalLink size={16} />
                      </h2>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[#64748B]">
                        <Phone size={14} className="text-[#64748B]" />
                        <span>
                          {selectedBooking?.ApplicantMobileNumberCountryCode ?? "+91"}{" "}
                          {selectedBooking?.ApplicantMobileNumber}
                        </span>

                        <span>•</span>

                        <span>{selectedBooking?.SystemGeneratedCode}</span>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col items-end">

                      <span className="text-xs text-gray-500 mb-1">
                        Final Registration : {formatDate_dd_MonthName_yy(selectedBooking?.FinalRegistrationDate ?? "")}
                      </span>

                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(selectedBooking?.IsFinalRegistrationCompleted ? "Completed" : "Pending")}}`}>

                        {selectedBooking?.IsFinalRegistrationCompleted ? "Completed" : "Pending"}
                      </span>
                    </div>

                  </div>

                  {/* Booking Details */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <p className="text-[11px] uppercase text-gray-400">
                        Building & Wing
                      </p>
                      <p className="font-semibold text-gray-800 mt-1">
                        {selectedBooking?.BuildingNumber} - {selectedBooking?.Wing}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <p className="text-[11px] uppercase text-gray-400">
                        Floor & Unit
                      </p>
                      <p className="font-semibold text-gray-800 mt-1">
                        {selectedBooking?.Floor} {selectedBooking?.Flat}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <p className="text-[11px] uppercase text-gray-400">
                        Configuration
                      </p>
                      <p className="font-semibold text-gray-800 mt-1">
                        {selectedBooking?.FlatConfiguration}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <p className="text-[11px] uppercase text-gray-400">
                        Registration Date
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {formatDate_dd_MonthName_yy(selectedBooking?.RegistrationDate ?? "")}
                      </p>
                    </div>


                  </div>
                </div>

                {/* Summary */}
                <div className="px-6 pb-5">

                  <div className="border border-gray-200 rounded-2xl bg-white">

                    <div className="grid grid-cols-3 divide-x divide-[#E5E7EB]">

                      <div className="text-center py-4">
                        <p className="text-xs uppercase text-gray-400">
                          Agreement Value
                        </p>
                        <p className="text-2xl font-medium mt-2">
                          {formatCurrency(selectedBooking?.AgreementValue)}
                        </p>
                      </div>

                      <div className="text-center py-4">
                        <p className="text-xs uppercase text-gray-400">
                          Received Amount
                        </p>
                        <p className="text-2xl font-medium mt-2">
                          {formatCurrency(selectedBooking?.ReceivedAgreementValue)}
                        </p>
                      </div>

                      <div className="text-center py-4">
                        <p className="text-xs uppercase text-gray-400">
                          Outstanding Amount
                        </p>
                        <p className="text-2xl font-medium mt-2 text-red-500">
                          {formatCurrency(Number(selectedBooking?.AgreementValue) - Number(selectedBooking?.ReceivedAgreementValue) - Number(selectedBooking?.ReceivedAgreementValueTDS))}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Ledger Table */}
                  <div className="mt-5 overflow-hidden">

                    <DataTableWithHeaderRowDivider
                      data={paymentData}
                      columns={payTrackPaymentColumns}
                      emptyMessage="No Data Found"
                      recordsPerPage={20}
                      loading={false}
                    />
                  </div>

                  <div className="mt-6 border border-gray-200 rounded-2xl bg-white p-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">
                          Pending Ledger
                        </p>

                        <div className="h-10 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
                          {selectedBooking?.PendingLedgerApprovalCount ?? 0}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">
                          Flat Alteration
                        </p>

                        <div className="h-10 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
                          {selectedBooking?.FlatAlterationRequestIsApproval ? "Yes" : "No"}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">
                          Parking Modification
                        </p>

                        <div className="h-10 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
                          {selectedBooking?.ParkingModificationRequestIsApproval ? "Yes" : "No"}
                        </div>
                      </div>


                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">
                          Applicant Modification
                        </p>

                        <div className="h-10 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
                          {selectedBooking?.BookingApplicantModificationRequestIsApproval ? "Yes" : "No"}
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}
        </div>
      }

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Pay Track"
        onSubmit={(e) => {
          e.preventDefault();
          updateListState({ filters: tempFilters, page: 1 });
          setShowFilterPopup(false);
        }}
        saveText="Apply "
        cancelText="Clear"
        onCancel={() => {
          setTempFilters({});
          resetFilters();
        }}
        size="small-half"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                label="Applicant Name"
                value={tempFilters.ApplicantName || ""}
                onChange={(e) => handleFilterChange("ApplicantName", e.target.value)}
                placeholder="Enter Applicant Name"
              />
            </div>
            <div>
              <Input
                label="Applicant Mobile Number"
                value={tempFilters.ApplicantMobileNumber || ""}
                onChange={(e) => handleFilterChange("ApplicantMobileNumber", filterNumbers(e.target.value))}
                placeholder="Enter Applicant Mobile Number"
                maxLength={13}
              />
            </div>
            <div>
              <ToggleSwitch
                label="Final Registration Completed"
                name="IsFinalRegistrationCompleted"
                value={tempFilters.IsFinalRegistrationCompleted === "1"}
                onChange={(name, value) =>
                  handleFilterChange(name, value ? "1" : "0")
                }
              />
            </div>
            <div>
              <Input
                type="text"
                label="Wing"
                value={tempFilters.Wing || ""}
                onChange={(e) => handleFilterChange("Wing", e.target.value)}
                placeholder="Enter Wing"
              />
            </div>
            <div>
              <Input
                type="text"
                label="Unit"
                value={tempFilters.Flat || ""}
                onChange={(e) => handleFilterChange("Flat", e.target.value)}
                placeholder="Enter Flat"
              />
            </div>
            <div>
              <Input
                type="text"
                label="Floor"
                value={tempFilters.Floor || ""}
                onChange={(e) => handleFilterChange("Floor", e.target.value)}
                placeholder="Enter Floor"
              />
            </div>
            <div>
              <Input
                type="text"
                label="Configuration"
                value={tempFilters.Configuration || ""}
                onChange={(e) => handleFilterChange("Configuration", e.target.value)}
                placeholder="Enter Configuration"
              />
            </div>
            <div>
              <DatePickerInput
                label="From Date"
                value={tempFilters.FromDate || ""}
                onChange={(value) => handleFilterChange("FromDate", value || "")}
                placeholder="Select From Date"
              />
            </div>

            <div>
              <DatePickerInput
                label="To Date"
                value={tempFilters.ToDate || ""}
                onChange={(value) => handleFilterChange("ToDate", value || "")}
                placeholder="Select To Date"
              />
            </div>
            <div>
              <Input
                label="Agreement Value"
                value={tempFilters.AgreementValue || ""}
                onChange={(e) => {
                  const value = filterNumbersWithDecimal(e.target.value);
                  handleFilterChange("AgreementValue", value);
                }}
                placeholder="Enter Agreement Value"
                maxLength={9}
              />
            </div>

            <div>
              <Input
                label="Booking Type"
                type="text"
                value={tempFilters.BookingType || ""}
                onChange={(e) => handleFilterChange("BookingType", e.target.value)}
                placeholder="Enter Booking Type"
              />
            </div>
          </div>
        </div>
      </Modal>

      <ApprovalLogModal
        isOpen={isApprovalLogModalOpen}
        title='Cancel Booking'
        titleText={ownerName ?? ""}
        subTitleText={wing ?? ""}
        subSubTitleText={unitNumber ?? ""}
        onClose={() => setIsApprovalLogModalOpen(false)}
        request={approvalLogRequest} />

      <ApprovalActionModal
        title="Cancel Booking"
        isOpen={isApprovalActionModalOpen}
        onClose={() => setIsApprovalActionModalOpen(false)}
        actionType={approvalActionType}
        titleText={ownerName ?? ""}
        subTitleText={wing ?? ""}
        subSubTitleText={unitNumber ?? ""}
        onSubmit={handleApprovalSubmit}
        loading={isLoading}
      />
    </div>
  );
};
export default PayTrack;
