import { useCallback, useEffect, useMemo, useState } from "react";
import { History, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as E from "fp-ts/Either";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { handleExportFile } from "@/core/utils/exportFile";
import { Loader } from "@/core/utils/loader";
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
import type { EventData } from "../models/EventModel";
import { eventService } from "../services/EventService";

type TaskTab = "Task" | "Agenda Task";

const TASK_TABS = [
  { id: "Task", label: "Task" },
  { id: "Agenda Task", label: "Agenda Task" },
] as const;

const getPriorityClassName = (priority?: string): string => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "text-[#F5222D]";
    case "medium":
      return "text-[#FA8C16]";
    case "low":
      return "text-[#52C96A]";
    default:
      return "text-[#30323A]";
  }
};

export const Task: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { canAction, canExport } = useMenuPermissions("/event");
  const [tasks, setTasks] = useState<EventData[]>([]);
  const [activeTab, setActiveTab] = useState<TaskTab>("Task");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<EventData | null>(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setLoadingMessage("Loading Tasks");
    const response = await eventService.apiCallPullEvent({
      EventId: 0,
      Type: activeTab,
    });
    setIsLoading(false);
    setLoadingMessage("");

    if (E.isLeft(response)) {
      setTasks([]);
      addToast({ type: "error", title: response.left.message });
      return;
    }

    if (!response.right.IsSuccess) {
      setTasks([]);
      addToast({
        type: "error",
        title:
          response.right.ErrorMessage?.filter(Boolean).join(", ") ||
          "Unable to load tasks",
      });
      return;
    }

    setTasks(Array.isArray(response.right.Data) ? response.right.Data : []);
  }, [activeTab, addToast]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const filteredTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return tasks;

    return tasks.filter((task) =>
      [task.EventId, task.Title, task.Priority, task.DeadlineDate]
        .some((value) => String(value ?? "").toLowerCase().includes(query)),
    );
  }, [searchTerm, tasks]);

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
          <span className={`font-medium ${getPriorityClassName(value)}`}>
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
              type="button"
              color="transparent"
              size="xss"
              aria-label={`View Task-${row.EventId}`}
              title="View task"
              onClick={() => setSelectedTask(row)}
              style={{ height: 28, width: 28, padding: 0 }}
              className="bg-[#E8F1FF] text-[#075CF6] hover:bg-[#DCE9FF]"
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              color="transparent"
              size="xss"
              aria-label="Refresh task list"
              title="Refresh tasks"
              onClick={() => void loadTasks()}
              style={{ height: 28, width: 28, padding: 0 }}
              className="bg-[#E8F1FF] text-[#075CF6] hover:bg-[#DCE9FF]"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [loadTasks],
  );

  const requiredColumnKeys = ["EventId", "Action"];
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([
    "EventId",
    "Title",
    "Priority",
    "DeadlineDate",
    "Action",
  ]);
  const visibleColumns = useMemo(
    () => columns.filter((column) => selectedColumnKeys.includes(column.key)),
    [columns, selectedColumnKeys],
  );

  const exportTasks = async (exportType: "Excel" | "PDF") => {
    setIsLoading(true);
    setLoadingMessage("Preparing Export");
    const response = await eventService.apiCallPullEvent({
      EventId: 0,
      Type: activeTab,
      ExportType: exportType,
    });
    setIsLoading(false);
    setLoadingMessage("");

    if (E.isLeft(response)) {
      addToast({ type: "error", title: response.left.message });
      return;
    }

    handleExportFile(
      response,
      exportType,
      activeTab === "Task" ? "Tasks" : "Agenda Tasks",
      addToast,
    );
  };

  return (
    <div className="flex h-[calc(100vh-105px)] min-h-0 flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <Loader loading={isLoading} title={loadingMessage}>
        <div />
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Name"
        onSearchChange={setSearchTerm}
        onClearSearch={() => setSearchTerm("")}
        isShowFilterButton={false}
        isShowCustomizeButton
        onCustomize={() => setIsCustomizeOpen(true)}
        isShowExportButton={canExport && tasks.length > 0}
        onExportExcel={() => void exportTasks("Excel")}
        onExportPdf={() => void exportTasks("PDF")}
        exportLoading={isLoading}
        isShowImportButton={false}
        isShowAddButton={canAction}
        addTitle="Add Task"
        onAdd={() =>
          navigate("/event", {
            state: { openAddType: "Task", returnTo: "/task" },
          })
        }
        isShowAddExtraButton={false}
      />

      <div className="mb-4 w-[224px] max-w-full">
        <Tabs
          tabs={TASK_TABS}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab.id as TaskTab)}
          isButtonGrid
          buttonGridClassName="!grid-cols-2"
          ariaLabel="Task type"
        />
      </div>

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
        className="min-h-0 flex-1 overflow-hidden border border-[#D8E5FF]"
        scrollContainerClassName="h-full overflow-y-auto"
        headerRowClassName="!bg-[#E4F0FF]"
        headerCellClassName="!py-2 !text-xs !font-medium !text-[#30323A]"
        rowClassName="border-b border-[#DCE5F5] hover:bg-[#F8FAFF]"
        cellClassName="!px-4 !py-4 !text-sm"
      />

      <CustomizeColumnsModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        onApply={(keys) =>
          setSelectedColumnKeys(
            Array.from(new Set([...keys, ...requiredColumnKeys])),
          )
        }
        columns={columns}
        selectedKeys={selectedColumnKeys}
        requiredKeys={requiredColumnKeys}
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
};

export default Task;
