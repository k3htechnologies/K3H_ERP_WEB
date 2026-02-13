export const normalizePath = (p?: string): string => {
    if (!p && p !== '') return ''
    const s = String(p || '').trim()
    if (s === '') return ''
    let out = s.toLowerCase()
    if (!out.startsWith('/')) out = '/' + out
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
        '/redevelopmentdashboard': '/redevelopmentDashboard',
        '/inventorydashboard': '/inventoryDashboard',
        '/approvedbank': '/approvedBank',
        '/content': '/content',
        '/settingsdashboard': 'settingsDashboard',
        '/payrolldashboard': 'payrollDashboard'
    }


    if (normalized && routeMap[normalized]) {
        return routeMap[normalized]
    }

    return normalized || ''
}

