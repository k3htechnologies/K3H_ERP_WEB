export const AchievementReportApi = {

    PULL_ACHIEVEMENT_BY_PROJECT: '/AchievementReport/PullProjectAchievementReport',
    PULL_ACHIEVEMENT_BY_SOURCING: '/AchievementReport/PullSourcingAchievementReport',
    PULL_ACHIEVEMENT_BY_CLOSING: '/AchievementReport/PullClosingAchievementReport',

} as const

export type AchievementReportApiKeys = keyof typeof AchievementReportApi