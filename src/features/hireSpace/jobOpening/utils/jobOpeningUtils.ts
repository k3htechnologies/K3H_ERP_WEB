type JobSkillOption = {
  name?: string
  label?: string
}

type JobRoleSkills = string | JobSkillOption[] | null | undefined

export const getJobRoleSkills = (roleSkills: JobRoleSkills): string[] => {
  if (!roleSkills) return []

  if (Array.isArray(roleSkills)) {
    return roleSkills.map((skill) => skill.name || skill.label || "").filter(Boolean)
  }

  return roleSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
}

export const getJobRoleSkillsText = (roleSkills: JobRoleSkills): string => getJobRoleSkills(roleSkills).join(", ")
