import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader } from "@/core/utils/loader";
import Tabs from "@/ui/components/Tab/Tab";
import {
  DataTable,
  type PaginationInfo,
  type SortInfo,
} from "@/ui/components/DataTable/DataTable";
import {
  DataTableExpandable,
  type DataTableExpandableRef,
} from "@/ui/components/DataTable/DataTableExpandable";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { Modal } from "@/ui/components/Modal/Modal";
import { DatePickerInput } from "@/ui/components/forms/Datepicker";
import { TextArea } from "@/ui/components/forms/Textarea";

import { TAB_LIST, EMPTY_MESSAGES, type TabId, SUBTAB_LIST, type SubTabId } from "../constants/tabConfig";
import { useTabData } from "../hooks/useTabData";
import { useGroupedAttendance } from "../hooks/useGroupedAttendance";
import { usePayrollColumns } from "../hooks/usePayrollColumns";
import { Button } from "@/ui/components/forms/Button";
import { Check, X } from "lucide-react";
import ModuleApprovalStatus from "../components/moduleApprovalStatus";
import useToast from "@/core/hooks/useToast";

export const PayrollReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>(TAB_LIST[0].id);
  const attendanceTableRef = useRef<DataTableExpandableRef>(null);
  const [selectedApprovals, setSelectedApprovals] = useState<any[]>([]);
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  const [approvalRemark, setApprovalRemark] = useState("");
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [subActiveTab, setSubActiveTab] = useState<SubTabId>(SUBTAB_LIST[0].id);
  const { addToast } = useToast();

  // ── All data / filter / export logic ──────────────────────────────────────
  const {
    isLoading,
    loadingMessage,
    searchTerm,
    setSearchTerm,
    filters,
    tempFilters,
    showFilterPopup,
    setShowFilterPopup,
    sortInfo,
    setSortInfo,
    pagination,
    attendanceList,
    handleApproval,
    getCurrentData,
    getApprovalData,
    dispatchLoad,
    applyFilters,
    clearFilters,
    handleFilterChange,
    clearSearch,
    handleExportPdf,
  } = useTabData(activeTab, attendanceTableRef, subActiveTab);


  // ── All memoized column definitions ───────────────────────────────────────
  const { attendanceColumns, attendanceDetailsColumns, getCurrentColumns } = usePayrollColumns();

  // ── Grouped + sorted attendance rows for expandable table ─────────────────
  const groupedAttendanceData = useGroupedAttendance(attendanceList);


  // Row key for approval grid selection should match the primary key of each module
  const approvalRowKey = useMemo(() => {
    switch (activeTab) {
      case "Comp-Off":
        return "CompOffId";
      case "Leave":
        return "LeaveId";
      case "Outdoor":
        return "OutdoorId";
      case "Attendance Regularization":
        return "RegularizationId";
      case "Resignation":
        return "EmployeeResignationId";
      default:
        return "Id";
    }
  }, [activeTab]);
  // ── Debounced search ───────────────────────────────────────────────────────
  const debouncedSearch = useDebouncedCallback(
    (v: string) => dispatchLoad(1, filters, activeTab, sortInfo, v),
    350,
  );
  useEffect(() => {
    setSubActiveTab(SUBTAB_LIST[0].id);
  }, [activeTab]);
  useEffect(() => {
    const currentData = getApprovalData()

    if (
      currentData.length > 0 &&
      selectedApprovals.length === currentData.length
    ) {
      setIsSelectAll(true)
    } else {
      setIsSelectAll(false)
    }
  }, [selectedApprovals, activeTab, subActiveTab])
  useEffect(() => {
    if (activeTab !== "Attendance") {
      dispatchLoad(1);
    }
  }, [subActiveTab]);
  // ── Pagination & sorting ───────────────────────────────────────────────────
  const handlePageChange = useCallback(
    (page: number) => dispatchLoad(page),
    [dispatchLoad],
  );

  const handleSortColumn = useCallback(
    (sort: SortInfo) => {
      setSortInfo(sort);
      handlePageChange(1);
    },
    [setSortInfo, handlePageChange],
  );

  const paginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange,
    }),
    [pagination, handlePageChange],
  );
  // ── Shared table props  ──────────
  const sharedTableProps = {
    fixedHeight: true,
    recordsPerPage: 20,
    // className: "flex-1",
    sortInfo,
    onSort: handleSortColumn,
  } as const;

  const totalCount = isSelectAll
    ? getApprovalData().length
    : selectedApprovals.length

  const dataToApprove = isSelectAll
    ? getApprovalData()
    : selectedApprovals

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mx-auto max-w-[1920px]">
        <Loader loading={isLoading} title={loadingMessage}>
          <div />
        </Loader>

        <Tabs
          tabs={TAB_LIST}
          defaultActive={activeTab}
          islarge={true}
          onTabChange={(t) => setActiveTab(t.id as TabId)}
        />

        <div className="mt-6 -mx-6 px-6">
          <TableActionToolbar
            isShowSearchBar
            searchTerm={searchTerm}
            searchPlaceholder="Search by Employee Name"
            onSearchChange={(v) => {
              setSearchTerm(v);
              debouncedSearch(v);
            }}
            onClearSearch={clearSearch}
            isShowFilterButton
            filters={filters}
            onOpenFilter={() => setShowFilterPopup(true)}
            isShowExportButton
            onExportPdf={() =>
              handleExportPdf(() => getCurrentColumns(activeTab), sortInfo)
            }
            exportLoading={isLoading}
            isShowAddButton={false}
            isShowCustomizeButton={false}
          />
        </div>
        {activeTab !== "Attendance" && (
          <div className="mt-3 -mx-6 px-6">
            <div className="flex items-center justify-between">
              <Tabs
                tabs={SUBTAB_LIST}
                isChips={true}
                defaultActive={subActiveTab}
                onTabChange={(t) => setSubActiveTab(t.id as SubTabId)}
              />

              {subActiveTab === "Approval" && (
                <div className="flex items-center gap-3">

                  {/* SELECT ALL CHECKBOX */}
                  <label className="flex items-center gap-3 px-4 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isSelectAll}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsSelectAll(checked);
                        if (checked) {
                          const allData = getApprovalData()
                          setSelectedApprovals(allData)
                        } else {
                          setSelectedApprovals([])
                        }
                      }} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Select All
                    </span>
                  </label>
                  <Button
                    size='sm'
                    color="green"
                    className="flex items-center gap-1 px-4 py-1 rounded bg-green-100 text-green-600 hover:bg-green-200 transition"
                    onClick={async () => {
                      const currentData = getApprovalData()

                      if (!isSelectAll && selectedApprovals.length === 0) {
                        addToast({ type: 'warning', title: "Please select at least one record or use Select All" })
                        return
                      }

                      if (isSelectAll && currentData.length === 0) {
                        addToast({ type: 'warning', title: "No records available to approve" })
                        return

                        return
                      }

                      setShowApprovalPopup(true);
                    }}
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>

                  <Button
                    size='sm'
                    color='red'
                    className="flex items-center gap-1 px-4 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
                    onClick={async () => {
                      if (!isSelectAll && !selectedApprovals.length) {
                        addToast({ type: 'warning', title: "Please select at least one record or use Select All" })
                        return;
                      }

                      setShowRejectPopup(true);
                    }}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>

                </div>
              )}
            </div>
          </div>
        )}


        <div className="mt-1 -mx-6 px-6">
          {activeTab === "Attendance" ? (
            <DataTableExpandable
              ref={attendanceTableRef}
              data={groupedAttendanceData}
              columns={attendanceColumns}
              pagination={paginationInfo}

              emptyMessage={EMPTY_MESSAGES[activeTab]}
              {...sharedTableProps}
              expandable={{
                keyField: "EmployeeId",
                alwaysFetchOnOpen: false,

                renderRow: (_data: any, row: any) => (
                  <DataTableWithOutBorder
                    data={row._groupedItems || []}
                    columns={attendanceDetailsColumns}
                    emptyMessage="No Attendance Data Found"
                    {...sharedTableProps}
                    loading={isLoading}
                  />
                ),
              }}
            />
          ) : subActiveTab === "Approval" ? (
            <DataTable
              data={getApprovalData()}
              columns={getCurrentColumns(activeTab)}
              pagination={paginationInfo}
              onRowSelect={(rows) => {
                setSelectedApprovals(rows)
                setIsSelectAll(false)
              }}
              selectedRowKeys={selectedApprovals.map(r => r[approvalRowKey])}
              rowKey={approvalRowKey}
              emptyMessage={EMPTY_MESSAGES[activeTab]}
              {...sharedTableProps}
            />

          ) : (

            <DataTableExpandable
              data={getCurrentData()}
              columns={getCurrentColumns(activeTab)}
              pagination={paginationInfo}
              emptyMessage={EMPTY_MESSAGES[activeTab]}
              {...sharedTableProps}
              expandable={{
                keyField: approvalRowKey,
                alwaysFetchOnOpen: true,
                renderRow: (_data: any, row: any) => (
                  <ModuleApprovalStatus

                    id={row[approvalRowKey]}
                    moduleName={activeTab}
                    requestId={row.CreatedById}
                    remarks={row.remarks}
                  />
                ),
              }}
            />
          )}
        </div>


        {/* FILTER MODAL */}
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title={`Filter - ${activeTab}`}
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters();
          }}
          saveText="Apply "
          cancelText="Clear"
          onCancel={clearFilters}
          size="small-half"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              {activeTab === "Resignation" ? (
                <>
                  <div>
                    <DatePickerInput
                      label="Resignation Date From"
                      value={tempFilters.ResignationDateFrom || ""}
                      onChange={(v) =>
                        handleFilterChange("ResignationDateFrom", v || "")
                      }
                    />
                  </div>
                  <div>
                    <DatePickerInput
                      label="Resignation Date To"
                      value={tempFilters.ResignationDateTo || ""}
                      onChange={(v) =>
                        handleFilterChange("ResignationDateTo", v || "")
                      }
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <DatePickerInput
                      label="Start Date"
                      value={tempFilters.StartDate || ""}
                      onChange={(v) => handleFilterChange("StartDate", v || "")}
                    />
                  </div>
                  <div>
                    <DatePickerInput
                      label="End Date"
                      value={tempFilters.EndDate || ""}
                      onChange={(v) => handleFilterChange("EndDate", v || "")}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </Modal>

        {/* APPROVAL CONFIRMATION MODAL */}
        <Modal
          isOpen={showApprovalPopup}
          onClose={() => setShowApprovalPopup(false)}
          title="Confirm Approval"
          onSubmit={async (e) => {
            e.preventDefault();
            await handleApproval("Approved", dataToApprove, approvalRemark);
            setShowApprovalPopup(false);
            setApprovalRemark("");
            setSelectedApprovals([]);
            dispatchLoad(1);
          }}
          saveText="Approve"
          cancelText="Cancel"
          onCancel={() => {
            setShowApprovalPopup(false);
            setApprovalRemark("");
          }}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              You are about to approve <span className="font-semibold">{totalCount}</span>{" "}
              record(s).
            </p>
            <TextArea
              label="Remark"
              value={approvalRemark}
              onChange={(e) => setApprovalRemark(e.target.value)}
              rows={4}
              placeholder="Enter remark "
            />
          </div>
        </Modal>

        {/* REJECT CONFIRMATION MODAL */}
        <Modal
          isOpen={showRejectPopup}
          onClose={() => setShowRejectPopup(false)}
          title="Confirm Rejection"
          onSubmit={async (e) => {
            e.preventDefault();
            await handleApproval("Rejected", dataToApprove, rejectRemark);
            setShowRejectPopup(false);
            setRejectRemark("");
            setSelectedApprovals([]);
            setIsSelectAll(false);
            dispatchLoad(1);
          }}
          saveText="Reject"
          cancelText="Cancel"
          onCancel={() => {
            setShowRejectPopup(false);
            setRejectRemark("");
          }}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              You are about to reject <span className="font-semibold">{selectedApprovals.length}</span>{" "}
              record(s).
            </p>
            <TextArea
              label="Remark"
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              rows={4}
              placeholder="Enter remark "
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default PayrollReport;
