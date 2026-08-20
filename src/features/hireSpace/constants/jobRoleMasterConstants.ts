import type { AddUpdateJobRoleMasterRequest } from '@/features/hireSpace/models/JobRoleMasterModel'

export const INITIAL_FORM_STATE: AddUpdateJobRoleMasterRequest = {
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
}

export const getInitialFormState = (): AddUpdateJobRoleMasterRequest => ({
  ...INITIAL_FORM_STATE,
})


