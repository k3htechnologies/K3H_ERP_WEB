export const normalizePath = (p?: string): string => {
    if (!p && p !== '') return ''
    const s = String(p || '').trim()
    if (s === '') return ''
    let out = s.toLowerCase()
    // ensure leading slash
    if (!out.startsWith('/')) out = '/' + out
    // remove trailing slashes (except root '/')
    if (out.length > 1) out = out.replace(/\/+$/, '')
    return out
}

export const mapPathToRoute = (apiPath: string): string => {
    const normalized = normalizePath(apiPath);

    const routeMap: Record<string, string> = {
        '/departmentmaster': '/departmentMaster',
        '/designationmaster': '/designationMaster',
        '/branchmaster': '/branchMaster',
        '/branchassociationsmaster': '/branchAssociationsMaster',
        '/assetmaster': '/assetMaster',
        '/assetmappingmaster': '/assetMappingMaster',
        '/deductionmaster': '/deductionMaster',
        '/earningmaster': '/earningMaster',
        '/holidaymaster': '/holidayMaster',
        '/holidaymappingmaster': '/holidayMappingMaster',
        '/leaveencashmentmaster': '/leaveEncashmentMaster',
        '/leavetypemaster': '/leaveTypeMaster',
        '/leave': '/leave',
        '/leavecreditconfiguration': '/leaveCreditConfiguration',
        '/shiftmaster': '/shiftMaster',
        '/shiftmappingmaster': '/shiftMappingMaster',
        '/weekoffmaster': '/weekOffMaster',
        '/weekoffmappingmaster': '/weekOffMappingMaster',
        '/companymaster': '/companyMaster',
        '/vendor': '/vendor',
        '/employeemaster': '/employeeMaster',
        '/profile': '/profile',
        '/tnc': '/tnc',
        '/banklistmaster': '/bankListMaster',
        '/projectmaster': '/projectMaster',
        '/outdoor': '/outdoor',
        '/materialmaster': '/materialMaster',
        '/submaterialmaster': '/subMaterialMaster',
        '/uommaster': '/uomMaster',
        '/category': '/category',
        '/document': '/document',
        '/reracategory': '/reraCategory',
        '/rera': '/rera',
        '/siteprogress': '/siteProgress',
        '/building': '/building',
        '/tenant': '/tenant',
        '/proposedoffer': '/proposedOffer',
        '/proposedplan': '/proposedPlan',
        '/rent': '/rent',
        '/event': '/event',
        '/approvalcategory': '/approvalCategory',
        '/approvaldocument': '/approvalDocument',
        '/channelpartner': '/channelPartner',
        '/enquiry': '/enquiry',
        '/resignation': '/resignation',
        '/payrollreport': '/payrollReport',
        '/attendancecalendar': '/attendanceCalendar',
        '/compoff': '/compOff',
        '/redevelopmentdashboard': 'redevelopmentDashboard'
    }

    // If a mapped route exists, return it (normalized)
    if (normalized && routeMap[normalized]) {
        // keep the mapped value as-is (your app routes may be camelCase intentionally)
        return routeMap[normalized]
    }

    // Otherwise, return normalized API path so caller can still compare reliably.
    // (This avoids silently mapping unknowns to '/dashboard'.)
    return normalized || ''
}

