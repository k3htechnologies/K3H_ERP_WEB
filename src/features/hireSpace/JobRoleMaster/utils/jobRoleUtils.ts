import type { JobRoleMasterData, JobRoleSkillOption } from "@/features/hireSpace/JobRoleMaster/models/JobRoleMasterModel";

export const isJobRoleActive = (role: JobRoleMasterData): boolean =>
  role.IsActive ?? !["inactive", "false", "0"].includes(String(role.Status ?? "active").toLowerCase());

export const getJobRoleSkills = (roleSkills: JobRoleMasterData["RoleSkills"]): string[] => {
  if (!roleSkills) return [];

  if (Array.isArray(roleSkills)) {
    return roleSkills.map((skill: JobRoleSkillOption) => skill.name || skill.label || "").filter(Boolean);
  }

  return roleSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
};

export const getJobRoleSkillsText = (roleSkills: JobRoleMasterData["RoleSkills"]): string => getJobRoleSkills(roleSkills).join(", ");
