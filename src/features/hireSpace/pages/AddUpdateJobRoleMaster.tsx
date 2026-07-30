import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as E from "fp-ts/Either";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { Input } from "@/ui/components/forms";
import { TextArea } from "@/ui/components/forms/Textarea";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { jobRoleMasterService } from "../services/JobRoleMasterService";
import type {
  AddUpdateJobRoleMasterRequest,
  JobRoleMasterData,
} from "../models/JobRoleMasterModel";
import {
  getJobRoleApiMessage,
  getJobRoleSkillsText,
  DEFAULT_UNIQUE_KEY,
} from "../utils/jobRoleUtils";

interface FormState {
  roleName: string;
  description: string;
  responsibilities: string;
  requirement: string;
  qualification: string;
  skills: string;
  jobRoleId: number;
  uniqueKey: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialFormState = (): FormState => ({
  roleName: "",
  description: "",
  responsibilities: "",
  requirement: "",
  qualification: "",
  skills: "",
  jobRoleId: 0,
  uniqueKey: DEFAULT_UNIQUE_KEY,
});

const mapRoleToForm = (role: JobRoleMasterData): FormState => ({
  roleName: role.RoleName || "",
  description: role.RoleDescription || "",
  responsibilities: role.RoleResponsibility || "",
  requirement: role.JobRequirement || "",
  qualification: role.RoleQualification || "",
  skills: getJobRoleSkillsText(role.RoleSkills),
  jobRoleId: role.JobRoleId,
  uniqueKey: role.UniqueKey || DEFAULT_UNIQUE_KEY,
});

export const AddUpdateJobRoleMaster: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { departmentId, jobRoleId } = useParams();
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions("/jobRoleMaster");
  const passedRole = (location.state as { jobData?: JobRoleMasterData } | null)?.jobData;
  const isUpdateMode = Boolean(jobRoleId);
  const departmentIdNumber = Number(departmentId);
  const jobRoleIdNumber = Number(jobRoleId);
  const [formValues, setFormValues] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRole, setIsLoadingRole] = useState(false);

  useEffect(() => {
    if (!isUpdateMode) return;
    if (passedRole?.JobRoleId === jobRoleIdNumber) {
      setFormValues(mapRoleToForm(passedRole));
      return;
    }

    const controller = new AbortController();
    const loadRole = async () => {
      setIsLoadingRole(true);
      const response = await jobRoleMasterService.apiCallPullJobRoleMaster(
        {
          PageSize: 1,
          PageNumber: 1,
          JobRoleId: jobRoleIdNumber,
          DepartmentId: departmentIdNumber,
        },
        { signal: controller.signal },
      );
      if (controller.signal.aborted) return;
      setIsLoadingRole(false);
      if (E.isLeft(response)) {
        addToast({ type: "error", title: response.left.message });
        return;
      }
      const role = Array.isArray(response.right.Data)
        ? response.right.Data[0]
        : undefined;
      if (!response.right.IsSuccess || !role) {
        addToast({
          type: "error",
          title: getJobRoleApiMessage(response.right.ErrorMessage, "Job role not found"),
        });
        navigate("/jobRoleMaster", { replace: true });
        return;
      }
      setFormValues(mapRoleToForm(role));
    };
    void loadRole();
    return () => controller.abort();
  }, [
    addToast,
    departmentIdNumber,
    isUpdateMode,
    jobRoleIdNumber,
    navigate,
    passedRole,
  ]);

  const updateField = (
    field: Exclude<keyof FormState, "jobRoleId">,
    value: string,
  ) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!formValues.roleName.trim()) nextErrors.roleName = "Role name is required";
    if (!formValues.description.trim())
      nextErrors.description = "Role description is required";
    if (!formValues.responsibilities.trim())
      nextErrors.responsibilities = "Responsibilities are required";
    if (!formValues.requirement.trim())
      nextErrors.requirement = "Job requirements are required";
    if (!formValues.qualification.trim())
      nextErrors.qualification = "Qualifications are required";
    if (!formValues.skills.trim()) nextErrors.skills = "Role skills are required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!Number.isInteger(departmentIdNumber) || departmentIdNumber <= 0) {
      addToast({ type: "error", title: "Invalid department" });
      return;
    }
    if (!validate()) {
      addToast({ type: "error", title: "Please fill all required fields" });
      return;
    }

    const payload: AddUpdateJobRoleMasterRequest = {
      JobRoleId: formValues.jobRoleId,
      UniqueKey: formValues.uniqueKey || DEFAULT_UNIQUE_KEY,
      DepartmentId: departmentIdNumber,
      RoleName: formValues.roleName.trim(),
      RoleDescription: formValues.description.trim(),
      RoleQualification: formValues.qualification.trim(),
      RoleResponsibility: formValues.responsibilities.trim(),
      JobRequirement: formValues.requirement.trim(),
      RoleSkills: formValues.skills.trim(),
      IsCopy: "0",
    };

    setIsLoading(true);
    const response = await jobRoleMasterService.apiCallAddUpdateJobRoleMaster(payload);
    setIsLoading(false);
    if (E.isLeft(response)) {
      addToast({ type: "error", title: response.left.message });
      return;
    }
    if (!response.right.IsSuccess) {
      addToast({
        type: "error",
        title: getJobRoleApiMessage(response.right.ErrorMessage, "Unable to save job role"),
      });
      return;
    }
    addToast({
      type: "success",
      title: getJobRoleApiMessage(
        response.right.SuccessMessage,
        isUpdateMode ? "Job role updated" : "Job role added",
      ),
    });
    navigate("/jobRoleMaster", { replace: true });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <Loader
        loading={isLoading || isLoadingRole}
        title={isLoadingRole ? "Fetch Job Role Details" : "Processing Job Role"}
      >
        <div />
      </Loader>

      <div className="thin-scroll flex-1 space-y-2 overflow-y-auto px-6 py-3">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 pb-3">
            <h3 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-900">
              Role Details
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                label="Role Name"
                placeholder="Enter role name"
                value={formValues.roleName}
                onChange={(event) => updateField("roleName", event.target.value)}
                error={errors.roleName}
                required
              />
              <Input
                label="Required Skills"
                placeholder="React, TypeScript, Communication"
                value={formValues.skills}
                onChange={(event) => updateField("skills", event.target.value)}
                error={errors.skills}
                required
              />
              <TextArea
                label="Role Description"
                placeholder="Enter role description"
                value={formValues.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                error={errors.description}
                rows={4}
                required
              />
              <TextArea
                label="Responsibilities"
                placeholder="Enter role responsibilities"
                value={formValues.responsibilities}
                onChange={(event) =>
                  updateField("responsibilities", event.target.value)
                }
                error={errors.responsibilities}
                rows={4}
                required
              />
              <TextArea
                label="Job Requirements"
                placeholder="Enter job requirements"
                value={formValues.requirement}
                onChange={(event) =>
                  updateField("requirement", event.target.value)
                }
                error={errors.requirement}
                rows={4}
                required
              />
              <TextArea
                label="Qualifications"
                placeholder="Enter qualifications"
                value={formValues.qualification}
                onChange={(event) =>
                  updateField("qualification", event.target.value)
                }
                error={errors.qualification}
                rows={4}
                required
              />
            </div>
          </div>
        </form>
      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={isUpdateMode ? "Update" : "Add"}
        onCancel={() => navigate("/jobRoleMaster")}
        onSave={handleSubmit}
        isLoading={isLoading}
        canAction={canAction}
      />
    </div>
  );
};

export default AddUpdateJobRoleMaster;
