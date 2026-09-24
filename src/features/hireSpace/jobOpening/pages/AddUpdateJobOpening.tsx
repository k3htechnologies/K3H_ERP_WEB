import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as E from 'fp-ts/Either';

import { Input } from '@/ui/components/forms';
import { runApiWithLoader } from '@/core/utils';
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import {
  ACTIVE_INACTIVE_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  EXPERIENCE_MONTH_OPTIONS,
  EXPERIENCE_YEAR_OPTIONS,
  WORK_MODE_OPTIONS,
} from '@/core/constants';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import {
  fetchJobOpeningDepartmentDropdown,
  fetchJobOpeningJobTitleDropdown,
} from '@/features/hireSpace/jobOpening/jobOpeningDropDown';
import type {
  AddUpdateJobOpeningRequest,
  FilterWithPaginationJobOpeningRequest,
} from '@/features/hireSpace/jobOpening/models/JobOpeningModel';
import { JobOpeningService } from '@/features/hireSpace/jobOpening/services/JobOpeningService';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';

const INITIAL_FORM_STATE: AddUpdateJobOpeningRequest = {
  JobOpeningMasterId: 0,
  UniqueKey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  DepartmentMasterId: 0,
  JobRoleMasterId: 0,
  JobDescription: '',
  JobResponsibilities: '',
  JobRequirement: '',
  JobQualification: '',
  JobSkills: '',
  WorkMode: '',
  ExperienceYears: 0,
  ExperienceMonths: 0,
  NumberOfOpenings: 0,
  WorkLocation: '',
  EmploymentType: '',
  JobRoleStatus: true,
}

export const AddUpdateJobOpening: React.FC = () => {
  const [formData, setFormData] = useState<AddUpdateJobOpeningRequest>(INITIAL_FORM_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const navigate = useNavigate();

  const { jobOpeningId } = useParams<{ jobOpeningId?: string }>();
  const JobOpeningId = jobOpeningId ? Number(jobOpeningId) : 0;
  const isAddMode = JobOpeningId === 0;

  const { addToast } = useToast();

  const { canAction } = useMenuPermissions('/jobOpenings');

  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [departments, setDepartments] = useState<{ id: string; label: string; count: number }[]>([]);
  const [dropdownLabels, setDropdownLabels] = useState<{ jobTitleName?: string }>({});


  const handleFieldChange = (field: keyof AddUpdateJobOpeningRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };


  const fetchDepartments = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const result = await fetchJobOpeningDepartmentDropdown();
        setDepartments(result.itemList);
        return result;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Loading Departments',
    );
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (!isAddMode) {
      fetchJobOpeningDetails();
    }
  }, [JobOpeningId]);


  const fetchJobOpeningDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationJobOpeningRequest = {
          PageNumber: 1,
          PageSize: 1,
          JobOpeningMasterId: JobOpeningId,
        };

        const response = await JobOpeningService.apiCallPullJobOpening(params);

        if (E.isRight(response)) {
          const e = response.right.Data?.[0];

          if (e) {
            setFormData((prev) => ({
              ...prev,
              JobOpeningMasterId: e.JobOpeningMasterId ?? prev.JobOpeningMasterId,
              UniqueKey: e.UniqueKey ?? prev.UniqueKey,
              DepartmentMasterId: e.DepartmentMasterId ?? prev.DepartmentMasterId,
              JobRoleMasterId: e.JobRoleMasterId ?? prev.JobRoleMasterId,
              JobDescription: e.JobDescription ?? prev.JobDescription,
              JobResponsibilities: e.JobResponsibilities ?? prev.JobResponsibilities,
              JobRequirement: e.JobRequirement ?? prev.JobRequirement,
              JobQualification: e.JobQualification ?? prev.JobQualification,
              JobSkills: e.JobSkills ?? prev.JobSkills,
              WorkMode: e.WorkMode ?? prev.WorkMode,
              ExperienceYears: e.ExperienceYears ?? prev.ExperienceYears,
              ExperienceMonths: e.ExperienceMonths ?? prev.ExperienceMonths,
              NumberOfOpenings: e.NumberOfOpenings ?? prev.NumberOfOpenings,
              WorkLocation: e.WorkLocation ?? prev.WorkLocation,
              EmploymentType: e.EmploymentType ?? prev.EmploymentType,
              JobRoleStatus: e.JobRoleStatus ?? prev.JobRoleStatus,
            }));
            setDropdownLabels({
              jobTitleName: e.JobRoleName,
            });
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
      'Loading Job Opening',
    );
  };


  const validateAddJobOpeningForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.DepartmentMasterId) {
      newErrors.DepartmentMasterId = 'Department is required';
    }

    if (!formData.JobRoleMasterId) {
      newErrors.JobRoleMasterId = 'Job title is required';
    }

    if (!formData.JobDescription?.trim()) {
      newErrors.JobDescription = 'Job description is required';
    }

    if (!formData.JobResponsibilities?.trim()) {
      newErrors.JobResponsibilities = 'Job responsibilities are required';
    }

    if (!formData.JobRequirement?.trim()) {
      newErrors.JobRequirement = 'Job requirement is required';
    }

    if (!formData.JobQualification?.trim()) {
      newErrors.JobQualification = 'Qualification is required';
    }

    if (!formData.JobSkills?.trim()) {
      newErrors.JobSkills = 'Skills are required';
    }

    if (!formData.WorkMode?.trim()) {
      newErrors.WorkMode = 'Work mode is required';
    }

    if (!formData.ExperienceYears) {
      newErrors.ExperienceYears = 'Experience years is required';
    }

    if (!formData.ExperienceMonths) {
      newErrors.ExperienceMonths = 'Experience months is required';
    }

    if (!formData.NumberOfOpenings) {
      newErrors.NumberOfOpenings = 'Number of openings is required';
    }

    if (!formData.WorkLocation?.trim()) {
      newErrors.WorkLocation = 'Work location is required';
    }

    if (!formData.EmploymentType?.trim()) {
      newErrors.EmploymentType = 'Employment type is required';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };


  const PushJobOpeningFormData = (): AddUpdateJobOpeningRequest => {
    return {
      JobOpeningMasterId: formData.JobOpeningMasterId,
      UniqueKey: formData.UniqueKey,
      DepartmentMasterId: formData.DepartmentMasterId,
      JobRoleMasterId: formData.JobRoleMasterId,
      JobDescription: formData.JobDescription,
      JobResponsibilities: formData.JobResponsibilities,
      JobRequirement: formData.JobRequirement,
      JobQualification: formData.JobQualification,
      JobSkills: formData.JobSkills,
      WorkMode: formData.WorkMode,
      ExperienceYears: formData.ExperienceYears,
      ExperienceMonths: formData.ExperienceMonths,
      NumberOfOpenings: formData.NumberOfOpenings,
      WorkLocation: formData.WorkLocation,
      EmploymentType: formData.EmploymentType,
      JobRoleStatus: formData.JobRoleStatus,
    };
  };

  const handleAddUpdateJobOpening = async () => {
    setErrors({});

    const validation = validateAddJobOpeningForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushJobOpeningFormData();

        const response = await JobOpeningService.apiCallAddUpdateJobOpening(payload);

        if (E.isRight(response)) {
          addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          navigate('/jobOpenings');
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
      isAddMode ? 'Add Job Opening' : 'Update Job Opening',
    );
  };


  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll">
        <form onSubmit={handleAddUpdateJobOpening}>
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Job Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <SinglePageSelection
                  label="Select Department"
                  placeholder="Select Department"
                  value={formData.DepartmentMasterId ? String(formData.DepartmentMasterId) : ''}
                  valueKey="id"
                  onChange={(e) => {
                    handleFieldChange('DepartmentMasterId', Number(e) || 0);
                    handleFieldChange('JobRoleMasterId', 0);
                    handleFieldChange('JobDescription', '');
                    handleFieldChange('JobResponsibilities', '');
                    handleFieldChange('JobRequirement', '');
                    handleFieldChange('JobQualification', '');
                    handleFieldChange('JobSkills', '');
                    setDropdownLabels((prev) => ({ ...prev, jobTitleName: '' }));
                  }}
                  options={departments}
                  error={errors.DepartmentMasterId}
                  disabled={!isAddMode}
                />
              </div>

              <div>
                <SingleSelectDropdownWithPagination
                  key={`job-title-${formData.DepartmentMasterId}`}
                  label="Job Title"
                  title="Select Job Title"
                  size="lg"
                  disabled={!isAddMode || !formData.DepartmentMasterId}
                  dataFetchCallBack={(pageNumber, params) =>
                    fetchJobOpeningJobTitleDropdown(pageNumber, {
                      value: params?.value,
                      departmentId: formData.DepartmentMasterId,
                    })
                  }
                  onSelected={(item) => {
                    if (!item) {
                      handleFieldChange('JobRoleMasterId', 0);
                      handleFieldChange('JobDescription', '');
                      handleFieldChange('JobResponsibilities', '');
                      handleFieldChange('JobRequirement', '');
                      handleFieldChange('JobQualification', '');
                      handleFieldChange('JobSkills', '');
                      setDropdownLabels((prev) => ({ ...prev, jobTitleName: '' }));
                      return;
                    }

                    handleFieldChange('JobRoleMasterId', Number(item.value));
                    handleFieldChange('JobDescription', item.RoleDescription);
                    handleFieldChange('JobResponsibilities', item.RoleResponsibility);
                    handleFieldChange('JobRequirement', item.JobRequirement);
                    handleFieldChange('JobQualification', item.RoleQualification);
                    handleFieldChange('JobSkills', item.RoleSkills);
                    setDropdownLabels((prev) => ({ ...prev, jobTitleName: item.label }));
                  }}
                  initialValue={createDropdownInitialValue(
                    formData.JobRoleMasterId,
                    dropdownLabels.jobTitleName,
                  )}
                  error={errors.JobRoleMasterId}
                />
              </div>

              <div>
                <Input
                  label="Job Description"
                  placeholder="Pre-filled"
                  value={formData.JobDescription}
                  onChange={(e) => handleFieldChange('JobDescription', e.target.value)}
                  disabled={!isAddMode}
                  error={errors.JobDescription}
                />
              </div>

              <div>
                <Input
                  label="Job Responsibilities"
                  placeholder="Pre-filled"
                  value={formData.JobResponsibilities}
                  onChange={(e) => handleFieldChange('JobResponsibilities', e.target.value)}
                  disabled={!isAddMode}
                  error={errors.JobResponsibilities}
                />
              </div>

              <div>
                <Input
                  label="Job Requirement"
                  placeholder="Pre-filled"
                  value={formData.JobRequirement}
                  onChange={(e) => handleFieldChange('JobRequirement', e.target.value)}
                  disabled={!isAddMode}
                  error={errors.JobRequirement}
                />
              </div>

              <div>
                <Input
                  label="Qualifications"
                  placeholder="Pre-filled"
                  value={formData.JobQualification}
                  onChange={(e) => handleFieldChange('JobQualification', e.target.value)}
                  disabled={!isAddMode}
                  error={errors.JobQualification}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Skills"
                  placeholder="Pre-filled"
                  value={formData.JobSkills}
                  onChange={(e) => handleFieldChange('JobSkills', e.target.value)}
                  disabled={!isAddMode}
                  error={errors.JobSkills}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-5">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Basic Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <SinglePageSelection
                  label="Work Mode"
                  placeholder="Select Work Mode"
                  value={formData.WorkMode}
                  onChange={(e) => handleFieldChange('WorkMode', String(e))}
                  options={WORK_MODE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                  searchable={false}
                  error={errors.WorkMode}
                />
              </div>

              <div>
                <label className="mb-1 block text-[14px] font-medium text-[#00000080]">Experience</label>
                <div className="flex flex-col gap-4 min-[420px]:flex-row min-[420px]:items-center">
                  <div className="flex-1">
                    <SinglePageSelection
                      placeholder="Select Years"
                      value={formData.ExperienceYears ? String(formData.ExperienceYears) : ''}
                      onChange={(e) => handleFieldChange('ExperienceYears', Number(e) || 0)}
                      options={EXPERIENCE_YEAR_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                      searchable={false}
                      error={errors.ExperienceYears}
                    />
                  </div>
                  <div className="flex-1">
                    <SinglePageSelection
                      placeholder="Select Months"
                      value={formData.ExperienceMonths ? String(formData.ExperienceMonths) : ''}
                      onChange={(e) => handleFieldChange('ExperienceMonths', Number(e) || 0)}
                      options={EXPERIENCE_MONTH_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                      searchable={false}
                      error={errors.ExperienceMonths}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Input
                  label="Number Of Openings"
                  placeholder="Enter Number Of Openings"
                  value={formData.NumberOfOpenings}
                  onChange={(e) => handleFieldChange('NumberOfOpenings', Number(e.target.value))}
                  error={errors.NumberOfOpenings}
                />
              </div>

              <div>
                <Input
                  label="Work Location"
                  placeholder="Enter Location"
                  value={formData.WorkLocation}
                  onChange={(e) => handleFieldChange('WorkLocation', e.target.value)}
                  error={errors.WorkLocation}
                />
              </div>

              <div>
                <SinglePageSelection
                  label="Employment Type"
                  placeholder="Select Employment Type"
                  value={formData.EmploymentType}
                  onChange={(e) => handleFieldChange('EmploymentType', String(e))}
                  options={EMPLOYMENT_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                  searchable={false}
                  error={errors.EmploymentType}
                />
              </div>
              
              <div>
                <SinglePageSelection
                  label="Job Role Status"
                  placeholder="Select Status"
                  value={formData.JobRoleStatus ? 'Active' : 'Inactive'}
                  onChange={(e) => handleFieldChange('JobRoleStatus', String(e) === 'Active')}
                  options={ACTIVE_INACTIVE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                  searchable={false}
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={formData.JobOpeningMasterId ? 'Update' : 'Add'}
        onCancel={() => navigate(-1)}
        canAction={canAction}
        onSave={handleAddUpdateJobOpening}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AddUpdateJobOpening;
