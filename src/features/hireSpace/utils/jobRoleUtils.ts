import type { JobRole, SkillOption } from "../models/JobRoleModel";

export const getJobRoleApiMessage = (
  messages?: string[],
  fallback = "Something went wrong",
): string => messages?.filter(Boolean).join(", ") || fallback;

export const isJobRoleActive = (role: JobRole): boolean =>
  role.IsActive ??
  !["inactive", "false", "0"].includes(
    String(role.Status ?? "active").toLowerCase(),
  );

export const getJobRoleSkills = (
  roleSkills: JobRole["RoleSkills"],
): string[] => {
  if (Array.isArray(roleSkills)) {
    return roleSkills
      .map((skill: SkillOption) => skill.name || skill.label || "")
      .filter(Boolean);
  }

  return roleSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
};

export const getJobRoleSkillsText = (
  roleSkills: JobRole["RoleSkills"],
): string => getJobRoleSkills(roleSkills).join(", ");
