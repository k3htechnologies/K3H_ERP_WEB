import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { runApiWithLoader } from '@/core/utils';
import { Loader } from '@/core/utils/loader';
import type { JobRoleMasterData } from '@/features/hireSpace/models/JobRoleMasterModel';
import {
  fetchJobOpeningDepartmentDropdown,
  fetchJobOpeningJobTitleDropdown,
} from '@/features/jobOpening/jobOpeningDropDown';
import { getJobRoleSkillsText } from '@/features/jobOpening/utils/jobOpeningUtils';
import {
  ACTIVE_INACTIVE_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  EXPERIENCE_MONTH_OPTIONS,
  EXPERIENCE_YEAR_OPTIONS,
  JOB_OPENING_LOCKED_EDIT_FIELDS,
  WORK_MODE_OPTIONS,
} from '@/core/constants';
import {
  getInitialFormState,
  INITIAL_FORM_STATE,
} from '@/features/jobOpening/constants/jobOpeningConstants';
import { useJobOpeningListState } from '@/features/jobOpening/context/JobOpeningListStateContext';
import type {
  AddUpdateJobOpeningRequest,
  FilterWithPaginationJobOpeningRequest,
} from '@/features/jobOpening/models/JobOpeningModel';
import { JobOpeningService } from '@/features/jobOpening/services/JobOpeningService';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { Input } from '@/ui/components/forms';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';

export const AddUpdateJobOpening: React.FC = () => {

  //#region STATE MANAGEMENT
  const [formData, setFormData] = useState<AddUpdateJobOpeningRequest>(() => getInitialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const navigate = useNavigate();

  const { jobOpeningId } = useParams<{ jobOpeningId?: string }>();
  const jobOpeningIdNumber = jobOpeningId ? Number(jobOpeningId) : 0;
  const isAddMode = jobOpeningIdNumber === 0;
  const isUpdateMode = !isAddMode;

  const { addToast } = useToast();

  const { listState } = useJobOpeningListState();

  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [departments, setDepartments] = useState<{ label: string; value: string }[]>([]);
  const [jobTitles, setJobTitles] = useState<{ label: string; value: string }[]>([]);
  const [jobRolesData, setJobRolesData] = useState<JobRoleMasterData[]>([]);

  const { canAction } = useMenuPermissions('/jobOpenings');

  const handleFieldChange = (field: keyof AddUpdateJobOpeningRequest, value: any) => {
    if (isUpdateMode && (JOB_OPENING_LOCKED_EDIT_FIELDS as readonly string[]).includes(field)) return;

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  
  const handleDropdownChange = (field: keyof AddUpdateJobOpeningRequest, value: string | number) => {
    if (isUpdateMode && (field === 'DepartmentMasterId' || field === 'JobRoleMasterId')) return;

    const extractedValue = String(value ?? '');

    if (field === 'DepartmentMasterId') {
      setFormData((prev) => ({
        ...getInitialFormState(),
        JobOpeningMasterId: prev.JobOpeningMasterId,
        UniqueKey: isUpdateMode ? prev.UniqueKey : INITIAL_FORM_STATE.UniqueKey,
        DepartmentMasterId: Number(extractedValue) || 0,
      }));
      setErrors({});
      return;
    }

    if (field === 'JobRoleMasterId') {
      const selectedRole = jobRolesData.find((role) => String(role.JobRoleId) === extractedValue);
      setFormData((prev) => ({
        ...prev,
        JobRoleMasterId: Number(extractedValue) || 0,
        JobDescription: selectedRole?.RoleDescription || '',
        JobResponsibilities: selectedRole?.RoleResponsibility || '',
        JobRequirement: selectedRole?.JobRequirement || '',
        JobQualification: selectedRole?.RoleQualification || '',
        JobSkills: getJobRoleSkillsText(selectedRole?.RoleSkills ?? null),
        WorkMode: selectedRole?.WorkMode || '',
        ExperienceYears: Number(selectedRole?.ExperienceYears) || 0,
        ExperienceMonths: Number(selectedRole?.ExperienceMonths) || 0,
        NumberOfOpenings: Number(selectedRole?.NumberOfOpenings) || 0,
        WorkLocation: selectedRole?.WorkLocation || '',
        EmploymentType: selectedRole?.EmploymentType || '',
        JobRoleStatus: String(selectedRole?.Status || 'Active').toLowerCase() !== 'inactive',
      }));
      setErrors((prev) => ({ ...prev, JobRoleMasterId: '' }));
      return;
    }

    handleFieldChange(field, extractedValue);
  };


  const fetchJobOpeningDetails = useCallback(async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationJobOpeningRequest = {
          PageNumber: 1,
          PageSize: 1,
          JobOpeningMasterId: jobOpeningIdNumber,
        };

        const response = await JobOpeningService.apiCallPullJobOpening(params);

        if (E.isRight(response)) {
          const jobOpening = response.right.Data?.[0];

          if (jobOpening) {
            setFormData({
              JobOpeningMasterId: jobOpening.JobOpeningMasterId,
              UniqueKey: jobOpening.UniqueKey || INITIAL_FORM_STATE.UniqueKey,
              DepartmentMasterId: jobOpening.DepartmentMasterId || 0,
              JobRoleMasterId: jobOpening.JobRoleMasterId || 0,
              JobDescription: jobOpening.JobDescription || '',
              JobResponsibilities: jobOpening.JobResponsibilities || '',
              JobRequirement: jobOpening.JobRequirement || '',
              JobQualification: jobOpening.JobQualification || '',
              JobSkills: jobOpening.JobSkills || '',
              WorkMode: jobOpening.WorkMode || '',
              ExperienceYears: jobOpening.ExperienceYears || 0,
              ExperienceMonths: jobOpening.ExperienceMonths || 0,
              NumberOfOpenings: jobOpening.NumberOfOpenings || 0,
              WorkLocation: jobOpening.WorkLocation || '',
              EmploymentType: jobOpening.EmploymentType || '',
              JobRoleStatus: jobOpening.JobRoleStatus !== false,
            });
          } else {
            addToast({ type: 'error', title: 'Job opening details not found' });
          }
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Job Opening'
    );
  }, [addToast, jobOpeningIdNumber]);
 

  const fetchDepartments = useCallback(async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const result = await fetchJobOpeningDepartmentDropdown();
        setDepartments(result.itemList);
        return result;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Departments'
    );
  }, [addToast]);


  const fetchJobTitles = useCallback(async (departmentId: number) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const result = await fetchJobOpeningJobTitleDropdown(departmentId);
        setJobRolesData(result.data);
        setJobTitles(result.itemList);
        return result;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Job Titles'
    );
  }, [addToast]);


  useEffect(() => {
    const initializeScreen = async () => {
      await fetchDepartments();

      if (!isAddMode) {
        await fetchJobOpeningDetails();
      } else if (listState.departmentId) {
        setFormData((prev) => ({
          ...prev,
          DepartmentMasterId: listState.departmentId,
        }));
      }
    };

    void initializeScreen();
  }, [fetchDepartments, fetchJobOpeningDetails, isAddMode, listState.departmentId]);


  useEffect(() => {
    const departmentId = Number(formData.DepartmentMasterId);

    if (!departmentId) {
      setJobTitles([]);
      setJobRolesData([]);
      return;
    }

    void fetchJobTitles(departmentId);
  }, [fetchJobTitles, formData.DepartmentMasterId]);


  const validateAddJobOpeningForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.DepartmentMasterId) {
      newErrors.DepartmentMasterId = 'Department is required';
    }
    if (!formData.JobRoleMasterId) {
      newErrors.JobRoleMasterId = 'Job title is required';
    }
    if (!formData.JobDescription.trim()) {
      newErrors.JobDescription = 'Job description is required';
    }
    if (!formData.JobResponsibilities.trim()) {
      newErrors.JobResponsibilities = 'Job responsibilities are required';
    }
    if (!formData.JobRequirement.trim()) {
      newErrors.JobRequirement = 'Job requirement is required';
    }
    if (!formData.JobQualification.trim()) {
      newErrors.JobQualification = 'Qualification is required';
    }
    if (!formData.JobSkills.trim()) {
      newErrors.JobSkills = 'Skills are required';
    }
    if (!formData.WorkMode.trim()) {
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
    } else if (formData.NumberOfOpenings <= 0) {
      newErrors.NumberOfOpenings = 'Number of openings must be greater than 0';
    }

    if (!formData.WorkLocation.trim()) {
      newErrors.WorkLocation = 'Work location is required';
    }
    if (!formData.EmploymentType.trim()) {
      newErrors.EmploymentType = 'Employment type is required';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };


  const pushJobOpeningFormData = (): AddUpdateJobOpeningRequest => ({
    JobOpeningMasterId: formData.JobOpeningMasterId,
    UniqueKey: formData.UniqueKey || INITIAL_FORM_STATE.UniqueKey,
    DepartmentMasterId: formData.DepartmentMasterId || 0,
    JobRoleMasterId: formData.JobRoleMasterId || 0,
    JobDescription: formData.JobDescription.trim(),
    JobResponsibilities: formData.JobResponsibilities.trim(),
    JobRequirement: formData.JobRequirement.trim(),
    JobQualification: formData.JobQualification.trim(),
    JobSkills: formData.JobSkills.trim(),
    WorkMode: formData.WorkMode.trim(),
    ExperienceYears: formData.ExperienceYears || 0,
    ExperienceMonths: formData.ExperienceMonths || 0,
    NumberOfOpenings: formData.NumberOfOpenings || 0,
    WorkLocation: formData.WorkLocation.trim(),
    EmploymentType: formData.EmploymentType.trim(),
    JobRoleStatus: formData.JobRoleStatus,
  });


  const handleAddUpdateJobOpening = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
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
        const payload = pushJobOpeningFormData();
        const response = await JobOpeningService.apiCallAddUpdateJobOpening(payload);

        if (E.isRight(response)) {
          addToast({
            type: 'success',
            title: response.right.SuccessMessage?.[0] || (isAddMode ? 'Job opening added successfully' : 'Job opening updated successfully'),
          });
          navigate('/jobOpenings');
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      isAddMode ? 'Add Job Opening' : 'Update Job Opening'
    );
  };


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <div className="thin-scroll flex-1 space-y-2 overflow-y-auto px-6 py-3">
        <form onSubmit={handleAddUpdateJobOpening}>
          <section className="space-y-4 pb-3">
            <div className="flex flex-col gap-1 border-b pb-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
              {isUpdateMode && (
                <span className="text-xs font-medium text-gray-400 italic">Role details are locked while editing an existing opening</span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <SinglePageSelection
                  label="Select Department"
                  placeholder="Select Department"
                  options={departments}
                  value={formData.DepartmentMasterId || ''}
                  onChange={(value) => handleDropdownChange('DepartmentMasterId', value)}
                  error={errors.DepartmentMasterId}
                  disabled={isUpdateMode}
                />
              </div>

              <div>
                <SinglePageSelection
                  label="Job Title"
                  placeholder={formData.DepartmentMasterId ? 'Select Job Title' : 'Select a department first'}
                  options={jobTitles}
                  value={formData.JobRoleMasterId || ''}
                  onChange={(value) => handleDropdownChange('JobRoleMasterId', value)}
                  error={errors.JobRoleMasterId}
                  disabled={isUpdateMode || !formData.DepartmentMasterId}
                />
              </div>

              <div>
                <Input
                  type="text"
                  label="Job Description"
                  placeholder="Pre-filled"
                  value={formData.JobDescription}
                  onChange={(event) => handleFieldChange('JobDescription', event.target.value)}
                  disabled={isUpdateMode}
                  error={errors.JobDescription}
                />
              </div>

              <div>
                <Input
                  type="text"
                  label="Job Responsibilities"
                  placeholder="Pre-filled"
                  value={formData.JobResponsibilities}
                  onChange={(event) => handleFieldChange('JobResponsibilities', event.target.value)}
                  disabled={isUpdateMode}
                  error={errors.JobResponsibilities}
                />
              </div>

              <div>
                <Input
                  type="text"
                  label="Job Requirement"
                  placeholder="Pre-filled"
                  value={formData.JobRequirement}
                  onChange={(event) => handleFieldChange('JobRequirement', event.target.value)}
                  disabled={isUpdateMode}
                  error={errors.JobRequirement}
                />
              </div>

              <div>
                <Input
                  type="text"
                  label="Qualifications"
                  placeholder="Pre-filled"
                  value={formData.JobQualification}
                  onChange={(event) => handleFieldChange('JobQualification', event.target.value)}
                  disabled={isUpdateMode}
                  error={errors.JobQualification}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Skills"
                  placeholder="Pre-filled"
                  value={formData.JobSkills}
                  onChange={(event) => handleFieldChange('JobSkills', event.target.value)}
                  disabled={isUpdateMode}
                  error={errors.JobSkills}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-5">
            <h3 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-900">Basic Details</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <SinglePageSelection
                  label="Work Mode"
                  placeholder="Select Work Mode"
                  options={WORK_MODE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                  value={formData.WorkMode}
                  onChange={(value) => handleDropdownChange('WorkMode', value)}
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
                      options={EXPERIENCE_YEAR_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                      value={formData.ExperienceYears || ''}
                      onChange={(value) => handleFieldChange('ExperienceYears', Number(value) || 0)}
                      searchable={false}
                      error={errors.ExperienceYears}
                    />
                  </div>

                  <div className="flex-1">
                    <SinglePageSelection
                      placeholder="Select Months"
                      options={EXPERIENCE_MONTH_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                      value={formData.ExperienceMonths || ''}
                      onChange={(value) => handleFieldChange('ExperienceMonths', Number(value) || 0)}
                      searchable={false}
                      error={errors.ExperienceMonths}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Input
                  type="text"
                  label="Number Of Openings"
                  placeholder="Enter Number Of Openings"
                  value={formData.NumberOfOpenings || ''}
                  onChange={(event) => handleFieldChange('NumberOfOpenings', Number(event.target.value) || 0)}
                  error={errors.NumberOfOpenings}
                />
              </div>

              <div>
                <Input
                  label="Work Location"
                  placeholder="Enter Location"
                  value={formData.WorkLocation}
                  onChange={(event) => handleFieldChange('WorkLocation', event.target.value)}
                  error={errors.WorkLocation}
                />
              </div>

              <div>
                <SinglePageSelection
                  label="Employment Type"
                  placeholder="Select Employment Type"
                  options={EMPLOYMENT_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                  value={formData.EmploymentType}
                  onChange={(value) => handleDropdownChange('EmploymentType', value)}
                  searchable={false}
                  error={errors.EmploymentType}
                />
              </div>

              <div>
                <SinglePageSelection
                  label="Job Role Status"
                  placeholder="Select Status"
                  options={ACTIVE_INACTIVE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                  value={formData.JobRoleStatus ? 'Active' : 'Inactive'}
                  onChange={(value) => handleFieldChange('JobRoleStatus', value === 'Active')}
                  searchable={false}
                  error={errors.JobRoleStatus}
                />
              </div>
            </div>
          </section>
        </form>
      </div>

      <BottomActionBar
        cancelText="Cancel"
        onCancel={() => navigate(-1)}
        onSave={() => {
          void handleAddUpdateJobOpening();
        }}
        isLoading={isLoading}
        canAction={canAction}
        saveText={isUpdateMode ? 'Update' : 'Add'}
      />
    </div>
  );
  //#endregion
};

export default AddUpdateJobOpening;
