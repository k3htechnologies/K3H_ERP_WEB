import type { JobOpeningData } from "@/features/hireSpace/jobOpening/models/JobOpeningModel"

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

export const getJobOpeningExperienceLabel = (jobOpening: JobOpeningData): string => {
  const years = jobOpening.ExperienceYears

  if (years == null || Number.isNaN(Number(years)) || Number(years) <= 0) {
    return "-"
  }

  return `${years}+ Years`
}

export const getJobOpeningWorkModeLabel = (jobOpening: JobOpeningData): string => {
  return jobOpening.WorkMode?.trim() || jobOpening.WorkLocation?.trim() || "-"
}

export const getJobOpeningEmploymentTypeLabel = (jobOpening: JobOpeningData): string => {
  return jobOpening.EmploymentType?.trim() || "-"
}

export const getJobOpeningApplicationsCount = (jobOpening: JobOpeningData): number => {
  return Number(jobOpening.ApplicationCount ?? jobOpening.ApplicationsCount ?? 0)
}
