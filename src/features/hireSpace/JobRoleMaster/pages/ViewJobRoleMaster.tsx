import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { runApiWithLoader } from '@/core/utils';
import { Loader } from '@/core/utils/loader';
import { JobRoleDetailView } from '@/features/hireSpace/JobRoleMaster/components';
import { INITIAL_FORM_STATE } from '@/features/hireSpace/JobRoleMaster/constants/jobRoleMasterConstants';
import { useJobRoleMasterListState } from '@/features/hireSpace/JobRoleMaster/context/JobRoleMasterListStateContext';
import type { FilterWithPaginationJobRoleMasterRequest, JobRoleMasterData } from '@/features/hireSpace/JobRoleMaster/models/JobRoleMasterModel';
import { JobRoleMasterService } from '@/features/hireSpace/JobRoleMaster/services/JobRoleMasterService';
import { getJobRoleSkillsText } from '@/features/hireSpace/JobRoleMaster/utils/jobRoleUtils';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';

export const ViewJobRoleMaster: React.FC = () => {

  const [editJobRoleMasterData, setEditJobRoleMasterData] = useState<JobRoleMasterData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);

  const navigate = useNavigate();

  const { addToast } = useToast();

  const { canAction } = useMenuPermissions('/jobRoleMaster');

  const { listState } = useJobRoleMasterListState();
  const { jobRoleId, jobRoleName, departmentId, departmentName } = listState;

  const loadJobRoleMasterDetails = useCallback(async () => {
    if (!jobRoleId) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationJobRoleMasterRequest = {
          PageNumber: 1,
          PageSize: 1,
          JobRoleId: jobRoleId,
          DepartmentId: departmentId,
        };

        const response = await JobRoleMasterService.apiCallPullJobRoleMaster(params);

        if (E.isRight(response)) {
          setEditJobRoleMasterData(response.right.Data?.[0] || null);
        } else {
          setEditJobRoleMasterData(null);
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Job Role Master'
    );
  }, [addToast, departmentId, jobRoleId]);

  useEffect(() => {
    if (jobRoleId) {
      loadJobRoleMasterDetails();
    }
  }, [jobRoleId, loadJobRoleMasterDetails]);
  
  const handleBackToListJobRoleMaster = useCallback(() => {
    navigate('/jobRoleMaster');
  }, [navigate]);

  const handleEditJobRoleMaster = useCallback((row: JobRoleMasterData) => {
    if (!row?.JobRoleId || !row.DepartmentId) return;
    navigate(`/jobRoleMaster/add/${row.DepartmentId}/${row.JobRoleId}`);
  }, [navigate]);

  const handleDuplicateJobRoleMaster = async () => {
    if (!editJobRoleMasterData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await JobRoleMasterService.apiCallAddUpdateJobRoleMaster({
          JobRoleId: 0,
          UniqueKey: INITIAL_FORM_STATE.UniqueKey,
          DepartmentId: editJobRoleMasterData.DepartmentId,
          RoleName: editJobRoleMasterData.RoleName,
          RoleDescription: editJobRoleMasterData.RoleDescription || '',
          RoleQualification: editJobRoleMasterData.RoleQualification || '',
          RoleResponsibility: editJobRoleMasterData.RoleResponsibility || '',
          JobRequirement: editJobRoleMasterData.JobRequirement || '',
          RoleSkills: getJobRoleSkillsText(editJobRoleMasterData.RoleSkills),
          IsCopy: '1',
        });

        if (E.isRight(response)) {
          addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          setIsDuplicateDialogOpen(false);
          navigate('/jobRoleMaster');
        } else {
          addToast({ type: 'error', title: response.left?.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Duplicating Job Role'
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <HeaderActionBar
        titleText="Job Role"
        subTitleText={jobRoleName}
        subSubTitleText={departmentName}
        onCancel={handleBackToListJobRoleMaster}
        canAction={canAction && Boolean(editJobRoleMasterData)}
        onEdit={() => {
          if (editJobRoleMasterData) handleEditJobRoleMaster(editJobRoleMasterData);
        }}
        isLoading={isLoading}
      />

      {!isLoading && !editJobRoleMasterData ? (
        <NoDataView message="No Job Role Details Found" />
      ) : editJobRoleMasterData ? (
        <JobRoleDetailView
          jobRole={editJobRoleMasterData}
          isDuplicating={isLoading}
          canAction={canAction}
          onDuplicate={() => setIsDuplicateDialogOpen(true)}
        />
      ) : null}

      <DeleteDialog
        isOpen={isDuplicateDialogOpen}
        onClose={() => setIsDuplicateDialogOpen(false)}
        onConfirm={handleDuplicateJobRoleMaster}
        loading={isLoading}
        title="Duplicate Job Role?"
        message={`This will create a copy of "${editJobRoleMasterData?.RoleName ?? 'this job role'}".`}
        confirmText="Duplicate"
        variant="info"
      />
    </div>
  );
};

export default ViewJobRoleMaster;
