import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as E from 'fp-ts/Either';
import { runApiWithLoader } from '@/core/utils';
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import { getInitialFormState } from '@/features/hireSpace/JobRoleMaster/constants/jobRoleMasterConstants';
import type { AddUpdateJobRoleMasterRequest, FilterWithPaginationJobRoleMasterRequest } from '@/features/hireSpace/JobRoleMaster/models/JobRoleMasterModel';
import { JobRoleMasterService } from '@/features/hireSpace/JobRoleMaster/services/JobRoleMasterService';
import { getJobRoleSkillsText } from '@/features/hireSpace/JobRoleMaster/utils/jobRoleUtils';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { Input } from '@/ui/components/forms';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { TextArea } from '@/ui/components/forms/Textarea';

export const AddUpdateJobRoleMaster: React.FC = () => {

  const [formData, setFormData] = useState<AddUpdateJobRoleMasterRequest>(() => getInitialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const navigate = useNavigate();

  const { departmentId, jobRoleId } = useParams<{ departmentId?: string; jobRoleId?: string }>();
  const departmentIdNumber = departmentId ? Number(departmentId) : 0;
  const jobRoleIdNumber = jobRoleId ? Number(jobRoleId) : 0;
  const isAddMode = jobRoleIdNumber === 0;

  const { addToast } = useToast();

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const { canAction } = useMenuPermissions('/jobRoleMaster');

  const handleFieldChange = (field: keyof AddUpdateJobRoleMasterRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const fetchJobRoleMasterDetails = useCallback(async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationJobRoleMasterRequest = {
          PageNumber: 1,
          PageSize: 1,
          JobRoleId: jobRoleIdNumber,
          DepartmentId: departmentIdNumber,
        };

        const response = await JobRoleMasterService.apiCallPullJobRoleMaster(params);

        if (E.isRight(response)) {
          const jobRole = response.right.Data?.[0];

          if (jobRole) {
            setFormData((prev) => ({
              ...prev,
              JobRoleId: jobRole.JobRoleId ?? prev.JobRoleId,
              UniqueKey: jobRole.UniqueKey ?? prev.UniqueKey,
              DepartmentId: jobRole.DepartmentId ?? prev.DepartmentId,
              RoleName: jobRole.RoleName ?? prev.RoleName,
              RoleDescription: jobRole.RoleDescription ?? prev.RoleDescription,
              RoleQualification: jobRole.RoleQualification ?? prev.RoleQualification,
              RoleResponsibility: jobRole.RoleResponsibility ?? prev.RoleResponsibility,
              JobRequirement: jobRole.JobRequirement ?? prev.JobRequirement,
              RoleSkills: getJobRoleSkillsText(jobRole.RoleSkills),
              IsCopy: jobRole.IsCopy ?? prev.IsCopy,
            }));
          } else {
            addToast({ type: 'error', title: 'Job role details not found' });
          }
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Job Role Data'
    );
  }, [addToast, departmentIdNumber, jobRoleIdNumber]);

  useEffect(() => {
    if (!isAddMode) {
      fetchJobRoleMasterDetails();
      return;
    }

    handleFieldChange('DepartmentId', departmentIdNumber);
  }, [departmentIdNumber, fetchJobRoleMasterDetails, isAddMode]);

  const validateAddJobRoleMasterForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.RoleName?.trim()) {
      newErrors.RoleName = 'Role Name is required.';
    }

    if (!formData.RoleSkills?.trim()) {
      newErrors.RoleSkills = 'Required Skills are required.';
    }

    if (!formData.RoleDescription?.trim()) {
      newErrors.RoleDescription = 'Role Description is required.';
    }

    if (!formData.RoleResponsibility?.trim()) {
      newErrors.RoleResponsibility = 'Responsibilities are required.';
    }

    if (!formData.JobRequirement?.trim()) {
      newErrors.JobRequirement = 'Job Requirements are required.';
    }

    if (!formData.RoleQualification?.trim()) {
      newErrors.RoleQualification = 'Qualifications are required.';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const pushJobRoleMasterFormData = (): AddUpdateJobRoleMasterRequest => ({
    JobRoleId: formData.JobRoleId ?? 0,
    UniqueKey: formData.UniqueKey,
    DepartmentId: formData.DepartmentId ?? departmentIdNumber,
    RoleName: formData.RoleName,
    RoleDescription: formData.RoleDescription,
    RoleQualification: formData.RoleQualification,
    RoleResponsibility: formData.RoleResponsibility,
    JobRequirement: formData.JobRequirement,
    RoleSkills: formData.RoleSkills,
    IsCopy: formData.IsCopy ?? '0',
  });

  const handleAddUpdateJobRoleMaster = async () => {

    setErrors({});

    const validation = validateAddJobRoleMasterForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      addToast({ type: 'error', title: 'Please fill the required fields' });
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = pushJobRoleMasterFormData();
        const response = await JobRoleMasterService.apiCallAddUpdateJobRoleMaster(payload);

        if (E.isRight(response)) {
          addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          navigate('/jobRoleMaster');
        } else {
          addToast({ type: 'error', title: response.left?.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      isAddMode ? 'Add Job Role' : 'Update Job Role'
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll">
        <form onSubmit={(event) => { event.preventDefault(); handleAddUpdateJobRoleMaster(); }}>
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Role Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Role Name"
                  placeholder="Enter Role Name"
                  value={formData.RoleName}
                  onChange={(event) => handleFieldChange('RoleName', event.target.value)}
                  error={errors.RoleName}
                  required
                />
              </div>
              <div>
                <Input
                  label="Required Skills"
                  placeholder="Enter comma-separated skills"
                  value={formData.RoleSkills}
                  onChange={(event) => handleFieldChange('RoleSkills', event.target.value)}
                  error={errors.RoleSkills}
                  required
                />
              </div>
              <div>
                <TextArea
                  label="Role Description"
                  placeholder="Enter Role Description"
                  value={formData.RoleDescription}
                  onChange={(event) => handleFieldChange('RoleDescription', event.target.value)}
                  error={errors.RoleDescription}
                  rows={4}
                  required
                />
              </div>
              <div>
                <TextArea
                  label="Responsibilities"
                  placeholder="Enter Responsibilities"
                  value={formData.RoleResponsibility}
                  onChange={(event) => handleFieldChange('RoleResponsibility', event.target.value)}
                  error={errors.RoleResponsibility}
                  rows={4}
                  required
                />
              </div>
              <div>
                <TextArea
                  label="Job Requirements"
                  placeholder="Enter Job Requirements"
                  value={formData.JobRequirement}
                  onChange={(event) => handleFieldChange('JobRequirement', event.target.value)}
                  error={errors.JobRequirement}
                  rows={4}
                  required
                />
              </div>
              <div>
                <TextArea
                  label="Qualifications"
                  placeholder="Enter Qualifications"
                  value={formData.RoleQualification}
                  onChange={(event) => handleFieldChange('RoleQualification', event.target.value)}
                  error={errors.RoleQualification}
                  rows={4}
                  required
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      <BottomActionBar
        saveText={formData.JobRoleId ? 'Update' : 'Add'}
        onCancel={() => navigate(-1)}
        canAction={canAction}
        onSave={handleAddUpdateJobRoleMaster}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AddUpdateJobRoleMaster;
