export const AchievementReportApi = {

    PULL_ACHIEVEMENT_BY_PROJECT: '/AchievementReport/PullProjectAchievementReport',
    PULL_ACHIEVEMENT_BY_SOURCING: '/AchievementReport/PullSourcingAchievementReport',
    PULL_ACHIEVEMENT_BY_CLOSING: '/AchievementReport/PullClosingAchievementReport',
    PULL_ACHIEVEMENT_DRILL_DOWN_REPORT: '/AchievementReport/PullAchievementDrillDownReport',

} as const

export type AchievementReportApiKeys = keyof typeof AchievementReportApi