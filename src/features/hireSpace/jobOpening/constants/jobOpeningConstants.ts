import type { AddUpdateJobOpeningRequest } from '@/features/hireSpace/jobOpening/models/JobOpeningModel'

export const INITIAL_FORM_STATE: AddUpdateJobOpeningRequest = {
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

export const getInitialFormState = (): AddUpdateJobOpeningRequest => ({
  ...INITIAL_FORM_STATE,
})
