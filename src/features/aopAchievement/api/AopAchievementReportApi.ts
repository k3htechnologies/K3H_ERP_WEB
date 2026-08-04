export const AOpAchievementReportApi = {

    PULL_AOP_ACHIEVEMENT: '/AOPAchievementReport/PullAOPAchievementReport',
    PULL_AOP_ACHIEVEMENT_DRILL_DOWN_REPORT: '/AOPAchievementReport/PullAOPAchievementDrillDownReport',

} as const

export type AopAchievementReportApiKeys = keyof typeof AOpAchievementReportApi