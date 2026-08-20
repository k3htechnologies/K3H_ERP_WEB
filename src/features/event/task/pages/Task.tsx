import React, { useCallback, useEffect, useMemo, useState } from "react";
import { History, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as E from "fp-ts/Either";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { handleExportFile } from "@/core/utils/exportFile";
import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { useToast } from "@/core/hooks/useToast";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Button } from "@/ui/components/forms";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import {
  DataTable,
  type TableColumn,
} from "@/ui/components/DataTable/DataTable";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import Tabs from "@/ui/components/Tab/Tab";
import { Modal } from "@/ui/components/Modal/Modal";
import {
  getTaskColumnKeys,
  REQUIRED_TASK_COLUMN_KEYS,
  TASK_TABS,
  type TaskTab,
} from "@/features/event/event/constants/eventConstants";
import type { EventData } from "@/features/event/event/models/EventModel";
import { EventService } from "@/features/event/event/services/EventService";
import { getApiMessage, getTaskPriorityClassName } from "@/features/event/event/utils/eventUtils";

export const Task: React.FC = () => {

  //#region STATE MANAGEMENT
  const [tasks, setTasks] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // USE NAVIGATE
  const navigate = useNavigate();

  // TOAST
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<TaskTab>("Task");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<EventData | null>(null);
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions("/event");
  //#endregion

  //#region DATA LOADING | FETCH | LOAD
  const loadTasks = useCallback(async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await EventService.apiCallPullEvent({
          EventId: 0,
          Type: activeTab,
        });

        if (E.isLeft(response)) {
          setTasks([]);
          addToast({ type: "error", title: response.left.message });
          return response;
        }

        if (!response.right.IsSuccess) {
          setTasks([]);
          addToast({
            type: "error",
            title: getApiMessage(response.right.ErrorMessage, "Unable to load tasks"),
          });
          return response;
        }

        setTasks(Array.isArray(response.right.Data) ? response.right.Data : []);
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Loading Tasks",
    );
  }, [activeTab, addToast]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);
  //#endregion

  //#region SEARCH & CLEAR
  const filteredTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return tasks;

    return tasks.filter((task) =>
      [task.EventId, task.Title, task.Priority, task.DeadlineDate]
        .some((value) => String(value ?? "").toLowerCase().includes(query)),
    );
  }, [searchTerm, tasks]);
  //#endregion

  //#region TABLE COLUMNS
  const columns = useMemo<TableColumn[]>(
    () => [
      {
        key: "EventId",
        label: "Task Id",
        align: "center",
        render: (value) => (
          <span className="font-medium text-[#075CF6]">Task-{value}</span>
        ),
      },
      {
        key: "Title",
        label: "Subject",
        align: "center",
        render: (value) => value || "-",
      },
      {
        key: "Priority",
        label: "Priority",
        align: "center",
        render: (value) => (
          <span className={`font-medium ${getTaskPriorityClassName(value)}`}>
            {value || "-"}
          </span>
        ),
      },
      {
        key: "DeadlineDate",
        label: "Deadline",
        align: "center",
        render: (value) =>
          value ? formatDate_dd_MonthName_yy(value) : "-",
      },
      {
        key: "Action",
        label: "Action",
        align: "center",
        render: (_value, row: EventData) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              color="transparent"
              size="xss"
              aria-label={`View Task-${row.EventId}`}
              title="View task"
              onClick={() => setSelectedTask(row)}
            >
              <History />
            </Button>
            <Button
              color="transparent"
              size="xss"
              aria-label="Refresh task list"
              title="Refresh tasks"
              onClick={() => void loadTasks()}
            >
              <RefreshCw />
            </Button>
          </div>
        ),
      },
    ],
    [loadTasks],
  );
  //#endregion

  //#region COLUMN CUSTOMIZATION
  const allTaskColumnKeys = useMemo(() => getTaskColumnKeys(), []);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getTaskTableColumns?.();
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const withRequired = Array.from(new Set([...parsed, ...REQUIRED_TASK_COLUMN_KEYS]));
        return withRequired.filter((key) => allTaskColumnKeys.includes(key));
      }
    } catch { }
    return allTaskColumnKeys;
  });

  const visibleColumns = useMemo(
    () => columns.filter((column) => selectedColumnKeys.includes(column.key)),
    [columns, selectedColumnKeys],
  );
  //#endregion

  //#region EXPORT / IMPORT EXCEL AND PDF
  const exportTasks = async (exportType: "Excel" | "PDF") => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await EventService.apiCallPullEvent({
          EventId: 0,
          Type: activeTab,
          ExportType: exportType,
        });

        if (E.isLeft(response)) {
          addToast({ type: "error", title: response.left.message });
          return response;
        }

        handleExportFile(
          response,
          exportType,
          activeTab === "Task" ? "Tasks" : "Agenda Tasks",
          addToast,
        );
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Preparing Export",
    );
  };
  //#endregion

  //#region NAVIGATE TO ADD TASK
  const handleAddTask = () => {
    navigate("/event", {
      state: { openAddType: "Task", returnTo: "/task" },
    });
  };
  //#endregion

  //#region RENDER
  return (
    <div className="flex h-[calc(100vh-105px)] min-h-0 flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <Loader loading={isLoading} title={loadingMessage}>
        <div />
      </Loader>

      <TableActionToolbar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Name"
        onSearchChange={setSearchTerm}
        onClearSearch={() => setSearchTerm("")}
        isShowFilterButton={false}
        onCustomize={() => setIsCustomizeOpen(true)}
        isShowExportButton={canExport && tasks.length > 0}
        onExportExcel={() => void exportTasks("Excel")}
        onExportPdf={() => void exportTasks("PDF")}
        exportLoading={isLoading}
        isShowImportButton={false}
        isShowAddButton={canAction}
        addTitle="Add Task"
        onAdd={handleAddTask}
        isShowAddExtraButton={false}
      />

      <div className="mb-4 w-[224px] max-w-full">
        <Tabs
          tabs={[...TASK_TABS]}
          defaultActive={activeTab}
          islarge
          onTabChange={(tab) => setActiveTab(tab.id as TaskTab)}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <DataTable
          data={filteredTasks}
          columns={visibleColumns}
          rowKey="EventId"
          emptyMessage={
            searchTerm ? "No tasks match your search" : "No tasks found"
          }
          fixedHeight
          recordsPerPage={20}
          variant="minimal"
        />
      </div>

      <CustomizeColumnsModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        onApply={(keys) => {
          const nextKeys = Array.from(new Set([...keys, ...REQUIRED_TASK_COLUMN_KEYS]));
          setSelectedColumnKeys(nextKeys);
          LocalStorageHelper.storeTaskTableColumns?.(JSON.stringify(nextKeys));
        }}
        columns={columns}
        selectedKeys={selectedColumnKeys}
        requiredKeys={REQUIRED_TASK_COLUMN_KEYS}
        title="Customize Task Columns"
      />

      <Modal
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        onCancel={() => setSelectedTask(null)}
        title={selectedTask ? `Task-${selectedTask.EventId}` : "Task Details"}
        cancelText="Close"
        size="md"
      >
        {selectedTask && (
          <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
            <FieldItem label="Subject" value={selectedTask.Title || "-"} />
            <FieldItem
              label="Priority"
              value={selectedTask.Priority || "-"}
            />
            <FieldItem
              label="Deadline"
              value={
                selectedTask.DeadlineDate
                  ? formatDate_dd_MonthName_yy(selectedTask.DeadlineDate)
                  : "-"
              }
            />
            <FieldItem
              label="Assigned To"
              value={selectedTask.FullName || "-"}
            />
            <div className="sm:col-span-2">
              <FieldItem
                label="Description"
                value={selectedTask.Description || "-"}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
  //#endregion
};

export default Task;
