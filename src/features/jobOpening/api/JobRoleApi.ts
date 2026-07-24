export const JobRoleApis = {
  PULL_DEPARTMENTS: "/JobRole/PullJobDepartment",
  PULL_JOB_ROLES: "/JobRole/PullJobRoleMaster",
  ADD_UPDATE: "/JobRole/AddUpdateJobRoleMaster",
  DELETE_JOB_OPENING: "/JobOpening/DeleteJobOpeningMaster",
  PULL_JOB_OPENING: "/JobOpening/PullJobOpeningMaster",
  PULL_CANDIDATES: "/CandidateDetails/PullCandidateDetails",
  ADD_REMARK: "/CandidateDetails/AddUpdateCandidateRemark",
  PULL_REMARK: "/CandidateDetails/PullCandidateRemark",
  UPDATE_STAGE: "/CandidateDetails/UpdateCanditateSelectionStage",
  PULL_CANDIDATE_TIMELINE:
    "/CandidateProcess/PullCandidateApplicationTimeline",
  SCHEDULE_INTERVIEW: "/CandidateProcess/ScheduleInterview",
  PULL_CANDIDATE_INTERVIEW:
    "/CandidateProcess/PullCandidateInterview",
} as const;
