export const SiteProgressApi = {
    PULL_SITE_PROGRESS_CONSTRUCTION: '/SiteProgress/PullSiteProgressConstruction',
    PULL_SITE_PROGRESS_SUB_CONSTRUCTION: '/api/SiteProgress/PullSiteProgressSubConstruction',
    PULL_SITE_PROGRESS_WING_CONSTRUCTION: '/api/SiteProgress/PullSiteProgressWingConstruction',
    PULL_SITE_PROGRESS_FLOOR_CONSTRUCTION: '/api/SiteProgress/PullSiteProgressFloorConstruction',
    PULL_SITE_PROGRESS_FLAT_CONSTRUCTION: '/api/SiteProgress/PullSiteProgressFlatConstruction',
    PULL_SITE_PROGRESS_CONSTRUCTION_ACTIVITY: '/api/SiteProgress/PullSiteProgressConstructionActivity',
    PULL_SITE_PROGRESS_CONSTRUCTION_SUB_ACTIVITY: '/api/SiteProgress/PullSiteProgressConstructionSubActivity'
} as const

export type SiteProgressApiKeys = keyof typeof SiteProgressApi