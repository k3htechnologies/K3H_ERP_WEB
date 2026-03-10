import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as E from "fp-ts/Either";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { runApiWithLoader } from "@/core/utils";
import { useProjectMasterListState } from "@/features/projectMaster/context/ProjectMasterListStateContext";
import type {
  AddUpdateModulesWorkflowApprovalRequest,
  FilterModulesWorkflowApprovalRequest,
  ModulesWorkflowApprovalData,
} from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import { Tabs, type TabItem } from "@/ui/components/Tab/Tab";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { Mail, Phone } from "lucide-react";
import { Modal } from "@/ui/components/Modal/Modal";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import { fetchPaginationProjectWithEmployeeDropdown } from "../projectWiseEmployeeDropdown";

const Approval: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [modulesWorkflowApprovalList, setModulesWorkflowApprovalList] = useState<ModulesWorkflowApprovalData[]>([]);
  const [activeTabForModulesWorkflowApproval, setActiveTabForModulesWorkflowApproval] = useState<TabItem[]>([]);
  const [activeModuleTab, setActiveModuleTab] = useState<string>("");
  const [isOpenAddProjectMasterWithEmployee, setIsOpenAddProjectMasterWithEmployee] = useState(false);
  const [selectedApprovalItem, setSelectedApprovalItem] = useState<ModulesWorkflowApprovalData | null>(null);
  const [selectedEmployeeValues, setSelectedEmployeeValues] = useState<string | number | null>(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const { listState } = useProjectMasterListState();
  const projectId = listState.projectId;
  const projectName = listState.projectName;

  const { canAction } = useMenuPermissions("/projectMaster");

  useEffect(() => {
    loadModulesWorkflowApproval(projectId);
  }, []);

  useEffect(() => {
    if (activeTabForModulesWorkflowApproval.length > 0 && !activeModuleTab) {
      setActiveModuleTab(activeTabForModulesWorkflowApproval[0].id);
    }
  }, [activeTabForModulesWorkflowApproval]);

  const filteredApprovalList = modulesWorkflowApprovalList.filter((x) => String(x.ModulesMasterId) === activeModuleTab);

  const loadModulesWorkflowApproval = async (ProjectId: number) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterModulesWorkflowApprovalRequest = {
          ProjectId: ProjectId,
        };

        const response = await modulesWorkflowApprovalService.apiCallPullModulesWorkflowApproval(params);

        if (E.isRight(response)) {
          const items = Array.isArray(response?.right.Data) ? response.right.Data : [];

          setModulesWorkflowApprovalList(items);

          const tabs: TabItem[] = Array.from(
            new Map(items.filter((x) => x.ModulesMasterId && x.ModuleName).map((x) => [x.ModulesMasterId, x])).values(),
          ).map((x) => ({
            id: String(x.ModulesMasterId),
            label: x.ModuleName!,
          }));

          setActiveTabForModulesWorkflowApproval(tabs);
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
      "Loading Bank Details",
    );
  };

  const handleBackToListProjectMaster = () => {
    navigate("/projectMaster");
  };

  //#region FETCH CHANNEL PARTNER DROPDOWN WITH TEAM MEMBER
  const fetchEmployeeDropdown = useCallback(
    async (pageNumber: number, params?: { value?: string }) => {
      return fetchPaginationProjectWithEmployeeDropdown(pageNumber, {
        projectId: projectId,
        value: params?.value || "",
      });
    },
    [projectId]
  );

  const employeeDropdown = useMultiSelectDropdown({
    value: selectedEmployeeValues,
    fetchCallback: fetchEmployeeDropdown,
    autoFetchOptions: true,
  });
  //#endregion

  const handleAddUpdateEmployee = (item: ModulesWorkflowApprovalData) => {
    setSelectedApprovalItem(item);
    const employeeIds =
      item.EmployeeData && item.EmployeeData.length > 0
        ? item.EmployeeData.map((e) => e.EmployeeId).join(",")
        : null;

    setSelectedEmployeeValues(employeeIds);

    setIsOpenAddProjectMasterWithEmployee(true);
  };

  const PushModulesWorkflowApproval = (): AddUpdateModulesWorkflowApprovalRequest => {

    const selectedEmployeeValues = employeeDropdown.selectedValues.length > 0 ? employeeDropdown.selectedValues.join(",") : "";

    return {
      ProjectId: projectId,
      EmployeeId: selectedEmployeeValues,
      ModulesMasterId: selectedApprovalItem?.ModulesMasterId,
      SubModulesMasterId: selectedApprovalItem?.SubModulesMasterId,
      SubSubModulesMasterId: selectedApprovalItem?.SubSubModulesMasterId,
    };

  };

  const handleAddUpdateModulesWorkflowApproval = async (e: React.FormEvent) => {

    e.preventDefault();

    if (employeeDropdown.selectedValues.length === 0) {

      addToast({ type: "error", title: "At least one employee is required" });
      return
    }

    await runApiWithLoader(

      setIsLoading,

      setLoadingMessage,
      async () => {

        const payload = PushModulesWorkflowApproval();

        const response = await modulesWorkflowApprovalService.apiCallAddUpdateModulesWorkflowApproval(payload);

        if (E.isRight(response)) {

          await loadModulesWorkflowApproval(projectId);

          setIsOpenAddProjectMasterWithEmployee(false);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

        } else {

          addToast({ type: "error", title: response.left?.message });

        }
        return response;
      },
      undefined,
      (error: any) => {

        addToast({ type: 'error', title: error.message })
      },
      undefined,

      "Add Permission"
    )

  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <HeaderActionBar
        titleText={"Modules Workflow Approval : "}
        subTitleText={projectName}
        cancelText="Cancel"
        onCancel={() => handleBackToListProjectMaster()}
        canAction={false}
        isLoading={isLoading}
      />
      <div className="space-y-4 p-4">
        <Tabs
          tabs={activeTabForModulesWorkflowApproval}
          defaultActive={activeModuleTab}
          isChips={true}
          onTabChange={(tab: TabItem) => {
            setActiveModuleTab(tab.id);
          }}
        />

        {filteredApprovalList?.length ? (
          filteredApprovalList.map((item, i) => (
            <section key={i} className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
              {/* Module Name */}
              <div className="flex items-center justify-between mb-4">
                <FieldItem label="" value={item.SubSubModuleName ?? "-"} />

                {canAction && (
                  <button
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => handleAddUpdateEmployee(item)}
                  >
                    Add
                  </button>
                )}
              </div>

              {/* Employee List */}
              {item.EmployeeData && item.EmployeeData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {item.EmployeeData.map((member, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 hover:shadow transition">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-sm font-semibold text-gray-900 truncate">{member.FullName || "-"}</h5>

                        <span className="text-xs text-gray-500 whitespace-nowrap">{member.Designation || "—"}</span>
                      </div>

                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-600 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                          <span>{member.PersonalMobileNumber ? `+91 ${member.PersonalMobileNumber}` : "-"}</span>
                        </p>

                        <p className="text-xs text-gray-600 flex items-center gap-2 break-all">
                          <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                          <span>{member.EmailId || "-"}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500">No Employee Assigned</div>
              )}
            </section>
          ))
        ) : (
          <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
            <NoDataView message="No Approval Found" />
          </section>
        )}
      </div>

      <Modal
        isOpen={isOpenAddProjectMasterWithEmployee}

        onClose={() => {
          setIsOpenAddProjectMasterWithEmployee(false);
          setSelectedEmployeeValues(null);
        }}
        title="Add Employee"
        onSubmit={handleAddUpdateModulesWorkflowApproval}
        saveText="Add"
        resetText=""
        size="small35">

        <div className="space-y-4">

          <MultiSelectPagination
            label="Add Employee"
            style={{ height: 80 }}
            dataFetchCallBack={fetchEmployeeDropdown}
            selectedValues={employeeDropdown.selectedValues}
            options={employeeDropdown.initialOptions}
            onChange={(values) => {
              const { idsString } = employeeDropdown.handleChange(values);
              setSelectedEmployeeValues(idsString || null);
            }}
          />

        </div>
      </Modal>
    </div>
  );
};

export default Approval;
