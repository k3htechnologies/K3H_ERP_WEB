import React, { useCallback, useMemo, useRef, useState } from "react";
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

import { TAB_LIST, EMPTY_MESSAGES, type TabId } from "../constants/tabConfig";
import { useTabData } from "../hooks/useTabData";
import { useGroupedAttendance } from "../hooks/useGroupedAttendance";
import { usePayrollColumns } from "../hooks/usePayrollColumns";

export const PayrollReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>(TAB_LIST[0].id);
  const attendanceTableRef = useRef<DataTableExpandableRef>(null);

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
    getCurrentData,
    dispatchLoad,
    applyFilters,
    clearFilters,
    handleFilterChange,
    clearSearch,
    handleExportPdf,
  } = useTabData(activeTab, attendanceTableRef);

  // ── All memoized column definitions ───────────────────────────────────────
  const { attendanceColumns, attendanceDetailsColumns, getCurrentColumns } =
    usePayrollColumns();

  // ── Grouped + sorted attendance rows for expandable table ─────────────────
  const groupedAttendanceData = useGroupedAttendance(attendanceList);

  // ── Debounced search ───────────────────────────────────────────────────────
  const debouncedSearch = useDebouncedCallback(
    (_v: string) => dispatchLoad(1),
    350,
  );

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

        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
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

        <div className="mt-6">
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
                renderRow: (_data: any, row: any) => {
                  return (
                    <>
                      <DataTableWithOutBorder
                        data={row._groupedItems || []}
                        columns={attendanceDetailsColumns}
                        emptyMessage="No Attendance Data Found"
                        {...sharedTableProps}
                        loading={isLoading}
                      />
                    </>
                  );
                },
              }}
            />
          ) : (
            <DataTable
              data={getCurrentData()}
              columns={getCurrentColumns(activeTab)}
              pagination={paginationInfo}
              emptyMessage={EMPTY_MESSAGES[activeTab]}
              {...sharedTableProps}
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
      </div>
    </div>
  );
};

export default PayrollReport;
