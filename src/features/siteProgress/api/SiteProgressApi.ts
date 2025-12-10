export const SiteProgressApi = {
    PULL_SITE_PROGRESS_CONSTRUCTION: '/SiteProgress/PullSiteProgressConstruction',
    PULL_SITE_PROGRESS_SUB_CONSTRUCTION: '/SiteProgress/PullSiteProgressSubConstruction',
    PULL_SITE_PROGRESS_WING_CONSTRUCTION: '/SiteProgress/PullSiteProgressWingConstruction',
    PULL_SITE_PROGRESS_FLOOR_CONSTRUCTION: '/SiteProgress/PullSiteProgressFloorConstruction',
    PULL_SITE_PROGRESS_FLAT_CONSTRUCTION: '/SiteProgress/PullSiteProgressFlatConstruction',
    PULL_SITE_PROGRESS_CONSTRUCTION_ACTIVITY: '/SiteProgress/PullSiteProgressConstructionActivity',
    PULL_SITE_PROGRESS_CONSTRUCTION_SUB_ACTIVITY: '/SiteProgress/PullSiteProgressConstructionSubActivity'
} as const

export type SiteProgressApiKeys = keyof typeof SiteProgressApi