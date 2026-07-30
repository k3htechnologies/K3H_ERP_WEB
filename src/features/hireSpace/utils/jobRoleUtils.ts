import type {
  JobRoleMasterData,
  JobRoleSkillOption,
} from "../models/JobRoleMasterModel";

export const DEFAULT_UNIQUE_KEY = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

export const getJobRoleApiMessage = (
  messages?: string[],
  fallback = "Something went wrong",
): string => messages?.filter(Boolean).join(", ") || fallback;

export const isJobRoleActive = (role: JobRoleMasterData): boolean =>
  role.IsActive ??
  !["inactive", "false", "0"].includes(
    String(role.Status ?? "active").toLowerCase(),
  );

export const getJobRoleSkills = (
  roleSkills: JobRoleMasterData["RoleSkills"],
): string[] => {
  if (Array.isArray(roleSkills)) {
    return roleSkills
      .map((skill: JobRoleSkillOption) => skill.name || skill.label || "")
      .filter(Boolean);
  }

  return roleSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
};

export const getJobRoleSkillsText = (
  roleSkills: JobRoleMasterData["RoleSkills"],
): string => getJobRoleSkills(roleSkills).join(", ");
