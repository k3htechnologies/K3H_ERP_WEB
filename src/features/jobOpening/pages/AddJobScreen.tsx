import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

import { jobOpeningService } from "@/features/jobOpening/services/JobOpeningService";
import { jobRoleMasterService } from "@/features/hireSpace/services/JobRoleMasterService";
import * as E from "fp-ts/Either";
import { Input } from "@/ui/components/forms";
import type {
  AddUpdateJobOpeningRequest,
  JobOpening,
} from "../models/JobOpeningModel";
import type { JobRoleMasterData } from "@/features/hireSpace/models/JobRoleMasterModel";

interface JobFormState {
  JobOpeningMasterId: number;
  UniqueKey: string;
  Department: string;
  JobTitle: string;
  JobRoleName: string;
  RoleDescription: string;
  RoleResponsibility: string;
  JobRequirement: string;
  RoleQualification: string;
  RoleSkills: string;
  WorkMode: string;
  ExpYears: string;
  ExpMonths: string;
  NumberOfOpenings: string;
  WorkLocation: string;
  EmploymentType: string;
  JobRoleStatus: string;
}

const DEFAULT_UNIQUE_KEY = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

const initialFormState = (): JobFormState => ({
  JobOpeningMasterId: 0,
  UniqueKey: DEFAULT_UNIQUE_KEY,
  Department: "",
  JobTitle: "",
  JobRoleName: "",
  RoleDescription: "",
  RoleResponsibility: "",
  JobRequirement: "",
  RoleQualification: "",
  RoleSkills: "",
  WorkMode: "",
  ExpYears: "",
  ExpMonths: "",
  NumberOfOpenings: "",
  WorkLocation: "",
  EmploymentType: "",
  JobRoleStatus: "Active",
});

const mapJobOpeningToForm = (jobOpening: JobOpening): JobFormState => ({
  JobOpeningMasterId: jobOpening.JobOpeningMasterId,
  UniqueKey: jobOpening.UniqueKey || DEFAULT_UNIQUE_KEY,
  Department: String(jobOpening.DepartmentMasterId || ""),
  JobTitle: String(jobOpening.JobRoleMasterId || ""),
  JobRoleName: jobOpening.JobRoleName || jobOpening.RoleName || "",
  RoleDescription: jobOpening.JobDescription || "",
  RoleResponsibility: jobOpening.JobResponsibilities || "",
  JobRequirement: jobOpening.JobRequirement || "",
  RoleQualification: jobOpening.JobQualification || "",
  RoleSkills: jobOpening.JobSkills || "",
  WorkMode: jobOpening.WorkMode || "",
  ExpYears:
    jobOpening.ExperienceYears !== undefined
      ? String(jobOpening.ExperienceYears)
      : "",
  ExpMonths:
    jobOpening.ExperienceMonths !== undefined
      ? String(jobOpening.ExperienceMonths)
      : "",
  NumberOfOpenings:
    jobOpening.NumberOfOpenings !== undefined
      ? String(jobOpening.NumberOfOpenings)
      : "",
  WorkLocation: jobOpening.WorkLocation || "",
  EmploymentType: jobOpening.EmploymentType || "",
  JobRoleStatus: jobOpening.JobRoleStatus === false ? "Inactive" : "Active",
});

type AutofillFormKey = Exclude<keyof JobFormState, "JobOpeningMasterId">;

const AUTOFILL_FIELD_MAP: Array<{
  formKey: AutofillFormKey;
  roleKey: keyof JobRoleMasterData;
}> = [
  { formKey: "RoleDescription", roleKey: "RoleDescription" },
  { formKey: "RoleResponsibility", roleKey: "RoleResponsibility" },
  { formKey: "JobRequirement", roleKey: "JobRequirement" },
  { formKey: "RoleQualification", roleKey: "RoleQualification" },
  { formKey: "RoleSkills", roleKey: "RoleSkills" },
  { formKey: "WorkMode", roleKey: "WorkMode" },
  { formKey: "ExpYears", roleKey: "ExperienceYears" },
  { formKey: "ExpMonths", roleKey: "ExperienceMonths" },
  { formKey: "NumberOfOpenings", roleKey: "NumberOfOpenings" },
  { formKey: "WorkLocation", roleKey: "WorkLocation" },
  { formKey: "EmploymentType", roleKey: "EmploymentType" },
  { formKey: "JobRoleStatus", roleKey: "Status" },
];

export const AddJobScreen: React.FC = () => {
  const [formData, setFormData] = useState<JobFormState>(() => initialFormState());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [departments, setDepartments] = useState<{ label: string; value: string }[]>([]);
  const [jobTitles, setJobTitles] = useState<{ label: string; value: string }[]>([]);
  const [jobRolesData, setJobRolesData] = useState<JobRoleMasterData[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { jobOpeningId } = useParams<{ jobOpeningId?: string }>();
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions("/jobOpenings");

  const isUpdateMode = Boolean(jobOpeningId);
  const jobOpeningIdNumber = Number(jobOpeningId);

  useEffect(() => {
    const jobData = (location.state as { jobData?: JobOpening } | null)?.jobData;

    if (isUpdateMode && jobData) {
      setFormData(mapJobOpeningToForm(jobData));
      return;
    }

    if (!isUpdateMode || !Number.isInteger(jobOpeningIdNumber) || jobOpeningIdNumber <= 0) {
      return;
    }

    const abortController = new AbortController();
    const loadJobOpening = async () => {
      setIsLoading(true);
      const response = await jobOpeningService.apiCallPullJobOpening(
        {
          PageNumber: 1,
          PageSize: 1,
          JobOpeningMasterId: jobOpeningIdNumber,
        },
        { signal: abortController.signal },
      );
      if (abortController.signal.aborted) return;
      setIsLoading(false);

      if (E.isRight(response) && response.right.IsSuccess) {
        const opening = response.right.Data?.find(
          (item) => item.JobOpeningMasterId === jobOpeningIdNumber,
        );
        if (opening) {
          setFormData(mapJobOpeningToForm(opening));
          return;
        }
      }

      addToast({
        type: "error",
        title: E.isLeft(response)
          ? response.left.message
          : response.right.ErrorMessage?.[0] || "Job opening not found",
      });
      navigate("/jobOpenings", { replace: true });
    };

    void loadJobOpening();
    return () => abortController.abort();
  }, [
    addToast,
    isUpdateMode,
    jobOpeningIdNumber,
    location.state,
    navigate,
  ]);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchDepartments = async () => {
      setIsLoading(true);
      try {
        const deptResponse = await jobRoleMasterService.apiCallPullJobDepartments({ signal: abortController.signal });
        if (isMounted && E.isRight(deptResponse) && deptResponse.right.IsSuccess) {
          const rawData = Array.isArray(deptResponse.right.Data) ? deptResponse.right.Data : [];
          const mappedDepartments = rawData
            .filter((department) => department.DepartmentId && department.DepartmentName)
            .map((department) => ({
              label: department.DepartmentName,
              value: department.DepartmentId.toString(),
            }));

          const uniqueDepartments = Array.from(new Map(mappedDepartments.map((item) => [item.value, item])).values());
          setDepartments(uniqueDepartments);
        } else if (isMounted) {
          addToast({
            type: "error",
            title: E.isLeft(deptResponse)
              ? deptResponse.left.message
              : deptResponse.right.ErrorMessage?.[0] || "Failed to load departments",
          });
        }
      } catch (error) {
        console.error("Failed to load departments", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDepartments();
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [addToast]);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchJobTitles = async () => {
      if (!formData.Department) {
        setJobTitles([]);
        setJobRolesData([]);
        return;
      }
      try {
        const jobResponse = await jobRoleMasterService.apiCallPullJobRoleMaster(
          {
            PageNumber: 1,
            PageSize: 100,
            DepartmentId: Number(formData.Department),
          },
          { signal: abortController.signal },
        );
        if (isMounted && E.isRight(jobResponse) && jobResponse.right.IsSuccess) {
          const rawData = Array.isArray(jobResponse.right.Data) ? jobResponse.right.Data : [];
          setJobRolesData(rawData);
          setJobTitles(
            rawData.map((jobRole) => ({
              label: jobRole.RoleName || "",
              value: (jobRole.JobRoleId ?? "").toString(),
            })),
          );
        } else if (isMounted) {
          addToast({
            type: "error",
            title: E.isLeft(jobResponse)
              ? jobResponse.left.message
              : jobResponse.right.ErrorMessage?.[0] || "Failed to load job titles",
          });
        }
      } catch (error) {
        console.error("Failed to load job titles", error);
      }
    };

    fetchJobTitles();
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [addToast, formData.Department]);

  const handleDropdownChange = (
    field: keyof JobFormState,
    value: string | number,
  ) => {
    if (isUpdateMode && (field === "Department" || field === "JobTitle")) return;

    const extractedValue = String(value ?? "");

    if (field === "Department") {
      setFormData((prev) => ({
        ...initialFormState(),
        JobOpeningMasterId: prev.JobOpeningMasterId,
        UniqueKey: isUpdateMode ? prev.UniqueKey : DEFAULT_UNIQUE_KEY,
        Department: extractedValue,
      }));
      return;
    }

    if (field === "JobTitle") {
      const selectedRole = jobRolesData.find(
        (role) => String(role.JobRoleId) === extractedValue,
      );
      setFormData((prev) => {
        const next = {
          ...prev,
          JobTitle: extractedValue,
          JobRoleName: selectedRole ? selectedRole.RoleName || "" : prev.JobRoleName,
        };
        if (selectedRole) {
          const autofillValues: Partial<JobFormState> = {};
          for (const { formKey, roleKey } of AUTOFILL_FIELD_MAP) {
            const value = selectedRole[roleKey];
            if (value === undefined || value === null) continue;
            autofillValues[formKey] = String(value);
          }
          return { ...next, ...autofillValues };
        }
        return next;
      });
      return;
    }

    handleFieldChange(field, extractedValue);
  };

  const handleFieldChange = (field: keyof JobFormState, value: string) => {
    const lockedInEditMode: (keyof JobFormState)[] = [
      "RoleDescription",
      "RoleResponsibility",
      "JobRequirement",
      "RoleQualification",
      "RoleSkills",
    ];
    if (isUpdateMode && lockedInEditMode.includes(field)) return;

    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  
const validate = () => {
  const newErrors: { [key: string]: string } = {};

  if (!formData.Department.trim())
    newErrors.Department = "Department is required";

  if (!formData.JobTitle.trim())
    newErrors.JobTitle = "Job title is required";

  if (!formData.RoleDescription.trim())
    newErrors.RoleDescription = "Job description is required";

  if (!formData.RoleResponsibility.trim())
    newErrors.RoleResponsibility = "Job responsibilities are required";

  if (!formData.JobRequirement.trim())
    newErrors.JobRequirement = "Job requirement is required";

  if (!formData.RoleQualification.trim())
    newErrors.RoleQualification = "Qualification is required";

  if (!formData.RoleSkills.trim())
    newErrors.RoleSkills = "Skills are required";

  if (!formData.WorkMode.trim())
    newErrors.WorkMode = "Work mode is required";

  if (!formData.ExpYears)
    newErrors.ExpYears = "Experience years is required";

  if (!formData.ExpMonths)
    newErrors.ExpMonths = "Experience months is required";

  if (!formData.NumberOfOpenings.trim()) {
    newErrors.NumberOfOpenings = "Number of openings is required";
  } else if (
    isNaN(Number(formData.NumberOfOpenings)) ||
    Number(formData.NumberOfOpenings) <= 0
  ) {
    newErrors.NumberOfOpenings =
      "Number of openings must be greater than 0";
  }

  if (!formData.WorkLocation.trim())
    newErrors.WorkLocation = "Work location is required";

  if (!formData.EmploymentType.trim())
    newErrors.EmploymentType = "Employment type is required";

  if (!formData.JobRoleStatus.trim())
    newErrors.JobRoleStatus = "Status is required";

  return {
    isValid: Object.keys(newErrors).length === 0,
    errors: newErrors,
  };
};




  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
 
    const validation = validate();
       if (!validation.isValid) {
      setErrors(validation.errors);

      addToast({ type: "error", title: "Please fill the required filed" });

      return;
    }

    setIsLoading(true);

    const payload: AddUpdateJobOpeningRequest = {
      JobOpeningMasterId: formData.JobOpeningMasterId,
      UniqueKey: formData.UniqueKey,
      DepartmentMasterId: Number(formData.Department) || 0,
      JobRoleMasterId: Number(formData.JobTitle) || 0,
      JobDescription: formData.RoleDescription,
      JobResponsibilities: formData.RoleResponsibility,
      JobRequirement: formData.JobRequirement,
      JobQualification: formData.RoleQualification,
      JobSkills: formData.RoleSkills,
      WorkMode: formData.WorkMode,
      ExperienceYears: Number(formData.ExpYears) || 0,
      ExperienceMonths: Number(formData.ExpMonths) || 0,
      NumberOfOpenings: Number(formData.NumberOfOpenings) || 0,
      WorkLocation: formData.WorkLocation,
      EmploymentType: formData.EmploymentType,
      JobRoleStatus: formData.JobRoleStatus === "Active",
    };

    const response = await jobOpeningService.apiCallAddUpdateJobOpening(payload);

    setIsLoading(false);
    if (E.isRight(response) && response.right.IsSuccess) {
      addToast({
        type: "success",
        title:
          response.right.SuccessMessage?.[0] || (isUpdateMode ? "Job opening updated successfully!" : "Job opening created successfully!"),
      });
      navigate(-1);
    } else {
      addToast({
        type: "error",
        title: E.isLeft(response)
          ? response.left.message
          : response.right.ErrorMessage?.[0] || "Failed to process request.",
      });
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <Loader loading={isLoading} title="Processing Job Request...">
        <div />
      </Loader>

      <div className="thin-scroll flex-1 space-y-2 overflow-y-auto px-6 py-3">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 pb-3">
            <div className="flex flex-col gap-1 border-b pb-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
            {isUpdateMode && (
              <span className="text-xs font-medium text-gray-400 italic">
                Role details are locked while editing an existing opening
              </span>
            )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <SinglePageSelection
                label="Select Department"
                placeholder="Select Department"
                options={departments}
                value={formData.Department}
                onChange={(value) => handleDropdownChange("Department", value)}
                error={errors.Department}
                searchable={true}
                disabled={isUpdateMode}
             
              />
            </div>

            <div>
              <SinglePageSelection
                label="Job Title"
                placeholder={formData.Department ? "Select Job Title" : "Select a department first"}
                options={jobTitles}
                value={formData.JobTitle}
                onChange={(value) => handleDropdownChange("JobTitle", value)}
                error={errors.JobTitle}
                searchable={true}
                disabled={isUpdateMode || !formData.Department}
               
              />
            </div>

            <div>
                <Input
                  type="text"
                  placeholder="Pre-filled"
                value={formData.RoleDescription}
                onChange={(e) => handleFieldChange("RoleDescription", e.target.value)}
                disabled={isUpdateMode}
                  label={"Job Description"}
                 error={errors.RoleDescription}
              />
            </div>

            <div>
                <Input
                  type="text"
                placeholder="Pre-filled"
                value={formData.RoleResponsibility}
                onChange={(e) => handleFieldChange("RoleResponsibility", e.target.value)}
                disabled={isUpdateMode}
                label={"Job Responsibilities"}
                error={errors.RoleResponsibility}
              />
            </div>

            <div>
                <Input
                  type="text"
                placeholder="Pre-filled"
                value={formData.JobRequirement}
                onChange={(e) => handleFieldChange("JobRequirement", e.target.value)}
                disabled={isUpdateMode}
                label={"Job Requirement"}
                 error={errors.JobRequirement}
              />
            </div>

            <div>
                <Input
                  type="text"
                placeholder="Pre-filled"
                value={formData.RoleQualification}
                onChange={(e) => handleFieldChange("RoleQualification", e.target.value)}
                disabled={isUpdateMode}
                label={"Qualifications"}
                 error={errors.RoleQualification}
              />
            </div>

            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder="Pre-filled"
                value={formData.RoleSkills}
                onChange={(e) => handleFieldChange("RoleSkills", e.target.value)}
                disabled={isUpdateMode}
                label={"Skills"}
                error={errors.RoleSkills}
              />
            </div>
          </div>
        </div>

          <div className="space-y-4 pt-5">
            <h3 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-900">
              Basic Details
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <SinglePageSelection
                label="Work Mode"
                placeholder="Select Work Mode"
                options={[
                  { label: "On-site", value: "On-site" },
                  { label: "Hybrid", value: "Hybrid" },
                  { label: "Remote", value: "Remote" },
                ]}
                value={formData.WorkMode}
                onChange={(value) => handleDropdownChange("WorkMode", value)}
                searchable={false}
                error={errors.WorkMode}
              />
            </div>

            <div>
              <label className="mb-1 block text-[14px] font-medium text-[#00000080]">
                Experience
              </label>
              <div className="flex flex-col gap-4 min-[420px]:flex-row min-[420px]:items-center">
                <div className="flex-1">
                  <SinglePageSelection
                    placeholder="Select Years"
                    options={Array.from({ length: 10 }, (_, i) => ({
                      label: `${i + 1} ${i + 1 === 1 ? "Year" : "Years"}`,
                      value: String(i + 1),
                    }))}
                    value={formData.ExpYears}
                    onChange={(value) => handleDropdownChange("ExpYears", value)}
                    searchable={false}
                    error={errors.ExpYears}
                  />
                </div>

                <div className="flex-1">
                  <SinglePageSelection
                    placeholder="Select Months"
                    options={Array.from({ length: 12 }, (_, i) => ({
                      label: `${i + 1} ${i + 1 === 1 ? "Month" : "Months"}`,
                      value: String(i + 1),
                    }))}
                    value={formData.ExpMonths}
                    onChange={(value) => handleDropdownChange("ExpMonths", value)}
                    searchable={false}
                    error={errors.ExpMonths}
                  />
                </div>
              </div>
            </div>

            <div>
              <Input
                type="text"
                placeholder="Enter Number Of Openings"
                value={formData.NumberOfOpenings}
                onChange={(e) => handleFieldChange("NumberOfOpenings", e.target.value)}
                label={"Number Of Openings"}
                error={errors.NumberOfOpenings}
              />
            </div>

            <div>
              <Input
                type="text"
                placeholder="Enter Location"
                value={formData.WorkLocation}
                onChange={(e) => handleFieldChange("WorkLocation", e.target.value)}
                label={"Work Location"}
                error={errors.WorkLocation}
              />
            </div>

            <div>
              <SinglePageSelection
                label="Employment Type"
                placeholder="Select Employment Type"
                options={[
                  { label: "Full-Time", value: "Full-Time" },
                  { label: "Contract", value: "Contract" },
                  { label: "Internship", value: "Internship" },
                ]}
                value={formData.EmploymentType}
                onChange={(value) => handleDropdownChange("EmploymentType", value)}
                searchable={false}
                error={errors.EmploymentType}
              />
            </div>

            <div>
              <SinglePageSelection
                label="Job Role Status"
                placeholder="Select Status"
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ]}
                value={formData.JobRoleStatus}
                onChange={(value) => handleDropdownChange("JobRoleStatus", value)}
                searchable={false}
                error={errors.JobRoleStatus}
              />
            </div>
          </div>
          </div>
        </form>
      </div>

      <BottomActionBar
        cancelText="Cancel"
        onCancel={() => navigate(-1)}
        onSave={handleSubmit}
        isLoading={isLoading}
        canAction={canAction}
        saveText={isUpdateMode ? "Update" : "Add"}
      />
    </div>
  );
};

export default AddJobScreen;
