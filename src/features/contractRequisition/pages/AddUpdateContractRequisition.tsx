import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as E from "fp-ts/Either";

import { Loader } from "@/core/utils/loader";
import { TextArea } from "@/ui/components/forms/Textarea";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import type {
  AddUpdateContractLevelRequest,
  AddUpdateContractRequisitionRequest,
  FilterWithPaginationContractRequisition,
  PullProjectLockAndKeyContractStatusRequest,
} from "@/features/contractRequisition/models/ContractRequisitionModel";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import Tabs from "@/ui/components/Tab/Tab";
import useToast from "@/core/hooks/useToast";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { runApiWithLoader } from "@/core/utils";
import { contractRequisitionService } from "@/features/contractRequisition/services/ContractRequisitionService";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button } from "@/ui/components/forms";
import { Edit, Plus, Trash2 } from "lucide-react";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { fetchContractMasterDropdown } from "@/features/contractMaster/contractMasterDropdown";
import ToggleSwitch from "@/ui/components/forms/ToggleSwitch";
import type { FilterWithPaginationProjectMasterRequest } from "@/features/projectMaster/models/ProjectMasterModel";
import { projectMasterService } from "@/features/projectMaster/services/ProjectMasterService";
import type { BudgetData } from "@/features/budget/models/BudgetModel";
import { fetchProjectBudget, getBudgetL1Dropdown, getBudgetL2Dropdown } from "@/features/budget/budgetDropdown";

const initialFormStateContractRequisition = (): AddUpdateContractRequisitionRequest => ({
  ContractRequisitionId: 0,
  UniqueKey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  ProjectId: 0,
  DirectContractRequisitionDetailJSON: "",
  IndirectContractRequisitionDetailJSON: "",
  AttachmentsURL: "",
  Remark: "",
  EstimatedDate: "",
  ContractType: "direct",
  IsLockAndKey: false,
  RemoveAttachmentURL: null,
});

const initialFormStateLevelDetails = (): AddUpdateContractLevelRequest => ({
  ContractMasterId: 0,
  ContractMasterName: "",
  SubLevelId: null,
  LevelRemark: "",
});

export const AddUpdateContractRequisition: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isLockAndKeyContract, setIsLockAndKeyProject] = useState(false);
  const [canCreateLockAndKeyContract, setCanCreateLockAndKeyContract] = useState<boolean>(false);
  const [isLockAndKeyContractCreating, setIsLockAndKeyContractCreating] = useState<boolean>(false);
  const [documentFiles, setdocumentFiles] = useState<(File | string)[]>([]);
  const [removeddocumentFilesURLs, setRemoveddocumentFilesURLs] = useState<string[]>([]);
  const [documentURL, setDocumentURL] = useState<string>("");
  const [levelFormData, setLevelFormData] = useState<AddUpdateContractLevelRequest>(() => initialFormStateLevelDetails());
  const [formData, setFormData] = useState<AddUpdateContractRequisitionRequest>(() => initialFormStateContractRequisition());
  const [levelDetailsList, setLevelDetailsList] = useState<AddUpdateContractLevelRequest[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [dropdownLabels, setDropdownLabels] = useState<{
    contractName?: string;
  }>({});
  const [showAddLevelPopup, setShowAddLevelPopup] = useState(false);

  const navigate = useNavigate();
  const { ContractRequisitionId } = useParams<{ ContractRequisitionId?: string }>();
  const contractId = ContractRequisitionId ? Number(ContractRequisitionId) : 0;
  const isAddMode = contractId === 0;
  const { addToast } = useToast();
  const { projectId } = useProject();
  const { canAction } = useMenuPermissions("/contractRequisition");

  const memoizedfetchSpecificationMasterDropdown = useMemo(
    () => async (_: number, __?: { value?: string }) => {
      const itemList = getBudgetL2Dropdown(
        budgetData,
        levelFormData.ContractMasterId
      );
      return {
        itemList,
        totalNumberOfRecord: itemList.length,
      };
    },
    [levelFormData.ContractMasterId]
  );

  const levelDropdown = useMultiSelectDropdown({
    value: levelFormData.SubLevelId,
    fetchCallback: memoizedfetchSpecificationMasterDropdown,
    autoFetchOptions: true,
  });

  const StaticContractTypeTabList = [
    { id: "direct", label: "Direct" },
    { id: "indirect", label: "Indirect" },
  ];

  const ContractTypeTabList = useMemo(() => {
    if (canCreateLockAndKeyContract || isLockAndKeyContract) {
      setFormData(prev => ({
        ...prev,
        ContractType: "indirect"
      }));
      return [StaticContractTypeTabList[1]];
    }
    if (levelDetailsList.length > 0) {
      return StaticContractTypeTabList.filter(tab => tab.id === formData.ContractType)
    }
    return StaticContractTypeTabList;
  }, [levelDetailsList, canCreateLockAndKeyContract, isLockAndKeyContract]);

  useEffect(() => {
    loadProjectMaster();
    loadProjectBudget();
  }, []);

  useEffect(() => {
    if (!isAddMode) {
      fetchContractDetails();
    }
  }, [ContractRequisitionId]);

  const meoizedBudgetL1 = useMemo(() => {
    return getBudgetL1Dropdown(budgetData);

  }, [budgetData])

  const loadProjectMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationProjectMasterRequest = {
          PageNumber: 1,
          PageSize: 1,
          IsProjectAccess: false,
          ProjectId: Number(projectId)
        }

        const response = await projectMasterService.apiCallPullProjectMaster(params);

        if (E.isRight(response)) {
          const selectedProject = response.right.Data[0];
          if (selectedProject.IsLockAndKey) {
            setIsLockAndKeyProject(true);
            const params: PullProjectLockAndKeyContractStatusRequest = {
              ProjectId: Number(projectId)
            };

            const response = await contractRequisitionService.apiCallPullProjectLockAndKeyContractStatus(params);

            if (E.isRight(response)) {
              const data = response.right.Data[0];
              if (!data.IsLockAndKeyContractCreated) {
                setCanCreateLockAndKeyContract(true);
              }
            }
          }
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
      'Loading Project Details'
    );
  };

  const loadProjectBudget = async () => {
    const data = await fetchProjectBudget(Number(projectId), "APPROVED");
    setBudgetData(data);
  };

  const fetchContractDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationContractRequisition = {
          PageNumber: 1,
          PageSize: 1,
          ProjectId: Number(projectId),
          ContractRequisitionId: Number(ContractRequisitionId),
        };

        const response = await contractRequisitionService.apiCallPullContractRequisition(params);

        if (E.isRight(response)) {
          const e = response.right.Data?.[0];

          if (e) {
            setFormData((prev) => ({
              ...prev,
              ContractRequisitionId: e.ContractRequisitionId ?? prev.ContractRequisitionId,
              UniqueKey: e.UniqueKey ?? prev.UniqueKey,
              ProjectId: e.ProjectId ?? prev.ProjectId,
              ContractType: e.ContractType ?? prev.ContractType,
              ContractStatus: e.ContractStatus ?? prev.ContractStatus,
              Remark: e.Remark ?? prev.Remark,
              EstimatedDate: e.EstimatedDate ?? prev.EstimatedDate,
            }));
            let result: AddUpdateContractLevelRequest[] = [];
            if (e.ContractType === "direct") {
              result = Object.values(
                e.DirectContractRequisition.reduce<
                  Record<number, AddUpdateContractLevelRequest>
                >((acc, item) => {
                  if (!acc[item.ContractLevel1Id]) {
                    acc[item.ContractLevel1Id] = {
                      ContractMasterId: item.ContractLevel1Id,
                      ContractMasterName: item.ContractLevel1Name,
                      SubLevelId: String(item.ContractLevel2Id),
                      LevelRemark: item.Remark,
                    };
                  } else {
                    acc[item.ContractLevel1Id].SubLevelId += `,${item.ContractLevel2Id}`;
                  }

                  return acc;
                }, {})
              );
            } else {
              result = e.InDirectContractRequisition.map(details => {
                const obj: AddUpdateContractLevelRequest = {
                  ContractMasterId: details.ContractId,
                  ContractMasterName: details.ContractName,
                  LevelRemark: details.Remark
                }
                return obj;
              });

            }
            setLevelDetailsList(result);
            if (e.AttachmentsURL) {
              setdocumentFiles([]);
              setDocumentURL(e.AttachmentsURL || "");
              setRemoveddocumentFilesURLs([]);
            }
            setDropdownLabels({
              contractName: e.ContractName || ""
            });
          }
        } else {
          addToast({
            type: "error", title: response.left.message
          });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Loading Material Requisition",
    );
  };

  const handleFieldChange = (field: keyof AddUpdateContractRequisitionRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleLevelFieldChange = (field: keyof AddUpdateContractLevelRequest, value: any) => {
    setLevelFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateLevelForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!levelFormData.ContractMasterId || levelFormData.ContractMasterId === 0) {
      newErrors.ContractMasterId = "Contract is required";
    }
    if (formData.ContractType === "direct") {
      if (!(levelFormData.SubLevelId && levelFormData.SubLevelId.trim().length)) {
        newErrors.SubLevelId = "Level 2 Contracts are required";
      }
    }
    if (!levelFormData.LevelRemark) {
      newErrors.LevelRemark = " Remark is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }

  const validateContractRequisitionForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!isLockAndKeyContractCreating && levelDetailsList.length === 0) {
      newErrors.ContractDetails = "Contract Details is required";
    }
    if (!formData.ContractType) {
      newErrors.ContractType = "Contract Type is required";
    }
    if (!formData.EstimatedDate || formData.EstimatedDate === "") {
      newErrors.EstimatedDate = "Estimated Date is required";
    }
    if (!formData.Remark) {
      newErrors.Remark = " Remark is required.";
    }
    if (!hasAnyDocumentFile(documentFiles, documentURL, removeddocumentFilesURLs)) {
      newErrors.AttachmentsURL = "File is required.";
    }
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleAddLevel = () => {
    setErrors({});
    setEditIndex(null);
    handleLevelFieldChange("ContractMasterId", 0);
    handleLevelFieldChange("ContractMasterName", "");
    handleLevelFieldChange("SubLevelId", null);
    handleLevelFieldChange("LevelRemark", "");
    setShowAddLevelPopup(true);
  }

  const handleEditContractDetails = (row: AddUpdateContractLevelRequest) => {
    setErrors({});
    handleLevelFieldChange("ContractMasterId", row.ContractMasterId);
    handleLevelFieldChange("ContractMasterName", row.ContractMasterName);
    handleLevelFieldChange("SubLevelId", row.SubLevelId);
    handleLevelFieldChange("LevelRemark", row.LevelRemark);
    setDropdownLabels({
      contractName: row.ContractMasterName
    })
    setShowAddLevelPopup(true);
  }

  const saveLevels = () => {
    setErrors({});
    const validation = validateLevelForm();
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    if (editIndex !== null) {
      levelDetailsList.splice(editIndex, 1, levelFormData);
      setLevelDetailsList(levelDetailsList);
    } else {
      setLevelDetailsList(prev => ([...prev, levelFormData]));
    }
    setShowAddLevelPopup(false);
  }

  const PushContractFormData = (): FormData => {
    const form = new FormData();
    form.append("ContractRequisitionId", String(formData.ContractRequisitionId));
    form.append("UniqueKey", formData.UniqueKey);
    form.append("ProjectId", projectId!.toString());
    form.append("ContractType", formData.ContractType);
    form.append("EstimatedDate", formData.EstimatedDate);
    form.append("Remark", formData.Remark);
    if (formData.ContractType === "direct") {
      const DirectContractRequisitionDetailJSON = levelDetailsList.map(levelDetail => ({
        ContractLevel1Id: levelDetail.ContractMasterId,
        ContractLevel2Id: levelDetail.SubLevelId,
        Remark: levelDetail.LevelRemark
      }));
      form.append("DirectContractRequisitionDetailJSON", JSON.stringify(DirectContractRequisitionDetailJSON));
      form.append("IndirectContractRequisitionDetailJSON", "");

    } else {
      const IndirectContractRequisitionDetailJSON = levelDetailsList.map(levelDetail => ({
        ContractId: levelDetail.ContractMasterId,
        Remark: levelDetail.LevelRemark
      }));
      form.append("IndirectContractRequisitionDetailJSON", JSON.stringify(IndirectContractRequisitionDetailJSON));
      form.append("DirectContractRequisitionDetailJSON", "");
    }
    form.append("IsLockAndKey", String(formData.IsLockAndKey));
    documentFiles.forEach((file) => {
      if (file instanceof File) {
        form.append("AttachmentsURL", file);
      }
    });
    form.append("RemoveAttachmentURL", removeddocumentFilesURLs.join(","));

    return form;
  };

  const handleSave = async () => {
    setErrors({});
    const validation = validateContractRequisitionForm();
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushContractFormData();
        const response = await contractRequisitionService.apiCallToAddContractRequisition(payload);
        if (E.isRight(response)) {
          addToast({ type: "success", title: response.right.SuccessMessage[0] });
          navigate("/contractRequisition");
        } else {
          addToast({ type: "error", title: response.left?.message });
        }
        return response;
      },
      undefined,
      (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : "Failed to save material requisition";

        addToast({ type: "error", title: errorMessage });
      },
      undefined,
      "Saving Data",
    );
  };

  const ContractLevelDetailsColumns = useMemo<TableColumn[]>(() => [
    {
      key: "ContractMasterName",
      label: "Contract Name",
      align: "left",
      width: "30",
      render: (value) => (
        <TooltipText
          text={value || "-"}
          maxWidth="250px"
          tooltipThreshold={25}
        />
      ),
    },
    {
      key: "ContractType",
      label: "Contract Type",
      align: "left",
      render: () => (
        <TooltipText
          text={formData.ContractType || "-"}
          maxWidth="250px"
          tooltipThreshold={25}
        />
      ),
    },
    {
      key: "LevelRemark",
      label: "Remark",
      align: "left",
      render: (value) => (
        <TooltipText
          text={value || "-"}
          maxWidth="250px"
          tooltipThreshold={25}
        />
      ),
    },
    ...((!isLockAndKeyContractCreating
      ? [
        {
          key: "action",
          label: "Action",
          align: "right",
          render: (_value: unknown, row: typeof levelDetailsList[number], index: number) => {
            if (!canAction) return null;

            return (
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    setEditIndex(index);
                    handleEditContractDetails(row);
                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  style={{
                    color: "#2563eb",
                    padding: "4px",
                  }}
                  leftIcon={<Edit className="h-4 w-4" />}
                  title="Edit Material Requisition"
                />

                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    setLevelDetailsList((prev) =>
                      prev.filter(
                        (level) =>
                          level.ContractMasterId !== row.ContractMasterId
                      )
                    );
                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  style={{
                    color: "red",
                    padding: "4px 8px",
                  }}
                  title="Delete Material Requisition"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          },
        } satisfies TableColumn,
      ]
      : []) as TableColumn[]),
  ], [
    canAction,
    isLockAndKeyContractCreating,
    levelDetailsList,
  ]);

  const BudgetDetailsColumns = useMemo<TableColumn[]>(() => [
    {
      key: "LevelType",
      label: "Level Type",
      align: "left",
      render: (value) => (
        <TooltipText
          text={value || "-"}
          maxWidth="250px"
          tooltipThreshold={25}
        />
      ),
    },
    {
      key: "label",
      label: "Category Name",
      align: "left",
      width: "30",
      render: (value) => (
        <TooltipText
          text={value || "-"}
          maxWidth="250px"
          tooltipThreshold={25}
        />
      ),
    },
  ], [
    canAction,
    budgetData,
  ]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        {" "}
        <div />{" "}
      </Loader>

      <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll">
        <form
          onSubmit={handleSave}
        >
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">Contract Requisition Details </h3>
            <div className="flex items-center justify-between">
              <div>
                {
                  canCreateLockAndKeyContract &&
                  <ToggleSwitch
                    label="Lock and Key Contract"
                    name="IsLockAndKeyContract"
                    disabled={levelDetailsList.length > 0}
                    value={formData.IsLockAndKey ?? false}
                    onChange={(_, value) => {
                      handleFieldChange("IsLockAndKey", value);
                      if (value) {
                        handleFieldChange("ContractType", "lock and key");
                        setIsLockAndKeyContractCreating(true);
                      } else {
                        setIsLockAndKeyContractCreating(false);
                        handleFieldChange("ContractType", "indirect");
                        setLevelDetailsList([]);
                      }
                    }
                    }
                  />
                }
                <h3 className="text-md font-medium text-gray-500">Contract Details</h3>
              </div>
              <Button
                type="button"
                color="blue"
                size="sm"
                disabled={formData.IsLockAndKey}
                onClick={handleAddLevel}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Level
              </Button>
            </div>
            {levelDetailsList.length > 0 && (
              <div className="pb-2">
                <DataTable
                  data={levelDetailsList}
                  columns={ContractLevelDetailsColumns}
                  emptyMessage="No Contract Details Found"
                  fixedHeight
                  recordsPerPage={5}
                  className="flex-1"
                />
              </div>
            )}
            {
              formData.IsLockAndKey &&
              <div className="pb-2">
                <DataTable
                  data={meoizedBudgetL1}
                  columns={BudgetDetailsColumns}
                  emptyMessage="No Contract Details Found"
                  fixedHeight
                  recordsPerPage={5}
                  className="flex-1"
                />
              </div>
            }
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DatePickerInput
                  label="Estimated Start Date"
                  required
                  value={formatDate_dd_mm_yyyy(formData.EstimatedDate)}
                  onChange={(value) =>
                    handleFieldChange("EstimatedDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(value))
                  }
                  placeholder="DD/MM/YYYY"
                  error={errors.EstimatedDate}
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Document Details</h3>
            <div className="flex items-center justify-between pb-3">
              <MultiFilePicker
                label="Upload Document"
                placeholder="Upload Document"
                value={documentFiles}
                onChange={setdocumentFiles}
                availableFilesURL={documentURL}
                allowedTypes={["image/jpeg", "image/png"]}
                required
                maxFiles={1}
                error={errors.AttachmentsURL}
                maxSizeMB={5}
                onRemoveExisting={(url) => setRemoveddocumentFilesURLs((prev) => [...prev, url])}
              />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Remark</h3>

            <div className="flex items-center justify-between pb-3">
              <TextArea
                label="Remark"
                className="thin-scroll"
                value={formData.Remark}
                onChange={(e) =>
                  handleFieldChange("Remark", e.target.value)
                }
                required
                placeholder="Enter Remark"
                error={errors.Remark}
              />
            </div>
          </div>
        </form>
      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={formData.ContractRequisitionId && formData.ContractRequisitionId > 0 ? "Update" : "Add"}
        onCancel={() => navigate(-1)}
        canAction={canAction}
        onSave={() => {
          void handleSave();
        }}
        isLoading={isLoading}
      />

      <Modal
        isOpen={showAddLevelPopup}
        onClose={() => setShowAddLevelPopup(false)}
        title="Add Level"
        onSubmit={e => {
          e.preventDefault();
          saveLevels();
        }}
        saveText="Save"
        cancelText="Cancel"
        onCancel={() => setShowAddLevelPopup(false)}
        size="small-half"
      >
        <Tabs
          tabs={ContractTypeTabList}
          defaultActive={formData.ContractType}
          islarge
          onTabChange={(t) => {
            const { id } = t;
            handleLevelFieldChange("ContractMasterId", 0);
            handleLevelFieldChange("ContractMasterName", "");
            handleLevelFieldChange("SubLevelId", null);
            handleLevelFieldChange("LevelRemark", "");
            handleFieldChange("ContractType", id);
          }}
        />
        {
          formData.ContractType === "direct" ?
            <>
              <SingleSelectDropdownWithPagination
                label="Select Contract"
                required
                title="Select Contract"
                size="lg"
                disabled={!(editIndex === null)}
                dataFetchCallBack={async () => {
                  const itemList = getBudgetL1Dropdown(
                    budgetData
                  );
                  return {
                    itemList,
                    totalNumberOfRecord: itemList.length,
                  };
                }}
                onSelected={(item) => {
                  if (item === null) {
                    handleLevelFieldChange("ContractMasterId", 0);
                    handleLevelFieldChange("ContractMasterName", "");
                  } else {
                    const contractId = Number(item?.value);
                    const contractName = item.label;
                    handleLevelFieldChange("ContractMasterId", contractId);
                    handleLevelFieldChange("ContractMasterName", contractName);
                  }
                  handleLevelFieldChange("SubLevelId", null);
                }}
                initialValue={createDropdownInitialValue(levelFormData.ContractMasterId, dropdownLabels.contractName)}
                error={errors.ContractMasterId}
              />
              <MultiSelectPagination
                required
                label="Contract"
                disabled={levelFormData.ContractMasterId === 0}
                dataFetchCallBack={memoizedfetchSpecificationMasterDropdown}
                selectedValues={levelDropdown.selectedValues}
                options={levelDropdown.initialOptions}
                onChange={(values) => {
                  const { idsString } = levelDropdown.handleChange(values);
                  handleLevelFieldChange("SubLevelId", idsString);
                  if (errors.SubLevelId) {
                    setErrors((prev) => ({
                      ...prev,
                      SubLevelId: "",
                    }));
                  }
                }}
                error={errors.SubLevelId}
              />
            </> :
            <SingleSelectDropdownWithPagination
              disabled={!(editIndex === null)}
              label="Select Contract"
              required
              title="Select Contract"
              size="lg"
              dataFetchCallBack={fetchContractMasterDropdown}
              onSelected={(item) => {
                if (item === null) {
                  handleLevelFieldChange("ContractMasterId", 0);
                  handleLevelFieldChange("ContractMasterName", "");
                } else {
                  const contractId = Number(item?.value);
                  const contractName = item.label;
                  handleLevelFieldChange("ContractMasterId", contractId);
                  handleLevelFieldChange("ContractMasterName", contractName);
                }
                handleLevelFieldChange("SubLevelId", null);
              }}
              initialValue={createDropdownInitialValue(levelFormData.ContractMasterId, dropdownLabels.contractName)}
              error={errors.ContractMasterId}
            />
        }
        <TextArea
          label="Remark"
          className="thin-scroll"
          value={levelFormData.LevelRemark}
          onChange={(e) =>
            handleLevelFieldChange("LevelRemark", e.target.value)
          }
          placeholder="Enter Remark"
          error={errors.LevelRemark}
        />
      </Modal>
    </div>
  );
};
