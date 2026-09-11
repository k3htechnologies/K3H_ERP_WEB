import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/ui/components/forms';
import * as E from 'fp-ts/Either';
import { runApiWithLoader } from '@/core/utils';
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import { useEffect, useState } from 'react';
import React from 'react';
import type {
  AddUpdateJobRoleMasterRequest,
  FilterWithPaginationJobRoleMasterRequest,
} from '@/features/hireSpace/JobRoleMaster/models/JobRoleMasterModel';
import { jobRoleMasterService } from '@/features/hireSpace/JobRoleMaster/services/JobRoleMasterService';
import { useJobRoleMasterListState } from '@/features/hireSpace/JobRoleMaster/context/JobRoleMasterListStateContext';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { TextArea } from '@/ui/components/forms/Textarea';

const initialFormState = (): AddUpdateJobRoleMasterRequest => ({
  JobRoleId: 0,
  UniqueKey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  DepartmentId: 0,
  RoleName: '',
  RoleDescription: '',
  RoleQualification: '',
  RoleResponsibility: '',
  JobRequirement: '',
  RoleSkills: '',
  IsCopy: '0',
});

export const AddUpdateJobRoleMaster: React.FC = () => {

  const { listState } = useJobRoleMasterListState();
  const departmentId = listState.departmentId;
  const departmentName = listState.departmentName;

  const [formData, setFormData] = useState<AddUpdateJobRoleMasterRequest>(() => ({
    ...initialFormState(),
    DepartmentId: departmentId,
  }));
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const navigate = useNavigate();

  const { jobRoleId } = useParams<{ jobRoleId?: string }>();
  const JobRoleId = jobRoleId ? Number(jobRoleId) : 0;
  const isAddMode = JobRoleId === 0;
  
  const { addToast } = useToast();

  const { canAction } = useMenuPermissions('/jobRoleMaster');
  
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  
  const handleFieldChange = (field: keyof AddUpdateJobRoleMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  
  useEffect(() => {
    if (!isAddMode) {
      fetchJobRoleMasterDetails();
    }
  }, [JobRoleId]);
  
  
  const fetchJobRoleMasterDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationJobRoleMasterRequest = {
          PageNumber: 1,
          PageSize: 1,
          JobRoleId: JobRoleId,
        };

        const response = await jobRoleMasterService.apiCallPullJobRoleMaster(params);

        if (E.isRight(response)) {
          const e = response.right.Data?.[0];

          if (e) {
            setFormData((prev) => ({
              ...prev,
              JobRoleId: e.JobRoleId ?? prev.JobRoleId,
              UniqueKey: e.UniqueKey ?? prev.UniqueKey,
              DepartmentId: e.DepartmentId ?? prev.DepartmentId,
              RoleName: e.RoleName ?? prev.RoleName,
              RoleDescription: e.RoleDescription ?? prev.RoleDescription,
              RoleQualification: e.RoleQualification ?? prev.RoleQualification,
              RoleResponsibility: e.RoleResponsibility ?? prev.RoleResponsibility,
              JobRequirement: e.JobRequirement ?? prev.JobRequirement,
              RoleSkills: e.RoleSkills ?? prev.RoleSkills,
              IsCopy: e.IsCopy ?? prev.IsCopy,
            }));
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
      'Loading Job Role',
    );
  };
  

  const validateAddJobRoleMasterForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
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
  
  const PushJobRoleMasterFormData = (): AddUpdateJobRoleMasterRequest => {
    return {
      JobRoleId: formData.JobRoleId,
      UniqueKey: formData.UniqueKey,
      DepartmentId: formData.DepartmentId,
      RoleName: formData.RoleName,
      RoleDescription: formData.RoleDescription,
      RoleQualification: formData.RoleQualification,
      RoleResponsibility: formData.RoleResponsibility,
      JobRequirement: formData.JobRequirement,
      RoleSkills: formData.RoleSkills,
      IsCopy: formData.IsCopy,
    };
  };
  
  const handleAddUpdateJobRoleMaster = async () => {
    setErrors({});

    const validation = validateAddJobRoleMasterForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushJobRoleMasterFormData();

        const response = await jobRoleMasterService.apiCallAddUpdateJobRoleMaster(payload);

        if (E.isRight(response)) {
          addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          navigate('/jobRoleMaster');
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
      isAddMode ? 'Add Job Role' : 'Update Job Role',
    );
  };
  

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll">
        <div className="border-b border-gray-300 pb-2">
          <HeaderActionBar
            titleText={isAddMode ? 'Add Job Role : ' : 'Edit Job Role : '}
            subTitleText={departmentName}
            canAction={false}
            isLoading={isLoading}
          />
        </div>

        <form onSubmit={handleAddUpdateJobRoleMaster}>
          <div className="space-y-4 pb-3">
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
        cancelText="Cancel"
        saveText={formData.JobRoleId ? 'Update' : 'Add'}
        onCancel={() => navigate(-1)}
        canAction={canAction}
        onSave={() => {
          handleAddUpdateJobRoleMaster();
        }}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AddUpdateJobRoleMaster;
