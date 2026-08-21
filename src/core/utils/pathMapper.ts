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
        '/testcategory': '/testCategory',
        '/testdocument': '/testDocument',
        '/drawingcategory': '/drawingCategory',
        '/drawing': '/drawing',
        
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


        '/resignation': '/resignation',
        '/payrollreport': '/payrollReport',
        '/attendancecalendar': '/attendanceCalendar',
        '/compoff': '/compOff',
        '/redevelopmentdashboard': '/redevelopmentDashboard',

        '/approvedbank': '/approvedBank',
        '/content': '/content',

        '/settingdashboard': '/settingDashboard',
        '/payrolldashboard': '/payrollDashboard',

        //LEGAL
        '/litigation': '/litigation',
        '/legaldashboard': '/legalDashboard',

        //SALES
        '/saledashboard': '/saleDashboard',
        '/enquiry': '/enquiry',
        '/enquiryreport': '/enquiryReport',
        '/cpenquiryreport': '/cpEnquiryReport',
        '/ibmobmreport': '/ibmObmReport',
        '/classificationparameter': '/classificationParameter',
        '/performance': '/performance',
        '/achievement': '/achievement',
        '/sourcing': '/sourcing',
        '/booking': '/booking',
        '/calltracker': '/callTracker',
        '/othercharges': '/otherCharges',
        '/paymentschedulescheme': '/paymentScheduleScheme',
        '/target': '/target',
        '/incentivereport': '/incentiveReport',
        '/paymentschedulereport': '/paymentScheduleReport',
        '/paymentschedule': '/paymentSchedule',
        '/channelpartnercategory' :'/channelPartnerCategory',
        '/aopachievement': '/aopAchievement',


        // INVENTORY
        '/inventorydashboard': '/inventoryDashboard',
        '/inventory': '/inventory',
        '/parking': '/parking',
        '/inventoryparkingoverallreport': '/inventoryParkingOverallReport',

        //CHANNEL PARTNER
        '/channelpartnerdashboard': '/channelPartnerDashboard',
        '/channelpartner': '/channelPartner',
        '/cpuniverse': '/cpUniverse',

        // CRM
        '/crmdashboard': '/crmDashboard',
        '/paytrack': '/payTrack',
        '/paytrackreport': '/payTrackReport',
        '/brokerage': '/brokerage',
        '/collectionreport': '/collectionReport',
        '/dailycollectionreport': '/dailyCollectionReport',

        //MORE
        '/inwardoutward': '/inwardOutward',
        '/ticket': '/ticket',
        '/otplogs': '/otpLogs',
        '/taxtracker': '/taxTracker',


        //SETTING EXTRA
        '/companypolicy': '/companyPolicy',

        //TAX TRACKER
        '/noticesection': '/noticeSection',

        //FINANCE
        '/termsheet': '/termSheet',
        '/termsheetreport': '/termSheetReport'
    }


    if (normalized && routeMap[normalized]) {
        return routeMap[normalized]
    }

    return normalized || ''
}

