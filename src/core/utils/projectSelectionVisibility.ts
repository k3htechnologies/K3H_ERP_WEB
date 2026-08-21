export const shouldShowProjectSelection = (pathname: string): boolean => {
    const hiddenRoutes = [
        'bankListMaster'
        , 'departmentMaster'
        , 'designationMaster'
        , 'vendor'
        , 'employeeMaster'
        , 'companyMaster'
        , 'tnc'
        , 'materialMaster'
        , 'subMaterialMaster'
        , 'uomMaster'
        , 'projectMaster'
        , 'bankListMaster'
        , 'departmentMaster'
        , 'branchMaster'
        , 'branchAssociationsMaster'
        , 'assetMaster'
        , 'assetMappingMaster'
        , 'deductionMaster'
        , 'earningMaster'
        , 'holidayMaster'
        , 'holidayMappingMaster'
        , 'leaveEncashmentMaster'
        , 'leaveTypeMaster'
        , 'leave'
        , 'leaveCreditConfiguration'
        , 'outdoor'
        , 'shiftMaster'
        , 'shiftMappingMaster'
        , 'weekOffMaster'
        , 'weekOffMappingMaster'
        , 'outdoor'
        , 'profile'
        , 'dashboard'
        , 'event'
        , 'resignation'
        ,'channelPartner'
        ,'compOff'
        ,'attendance'
        ,'payrollReport'
        ,'channelPartnerDashboard'
        ,'payrollDashboard'
        ,'settingDashboard'
        ,'cpUniverse'
        ,'inventoryParkingOverallReport'
        ,'achievement'
        ,'litigation'
        ,'legalDashboard'
        ,'inwardOutward'
        ,'ticket'
        ,'collectionReport'
        ,'ibmObmReport'
        ,'saleDashboard'
        ,'aopAchievement'
        ,'specificationmaster'
        ,'termSheet'
        ,'taxTracker'
        ,'noticeSection'
        ,'otpLogs'
        ,'termSheetReport'
    ];

    const baseRoute = getBaseRouteName(pathname);

    return !hiddenRoutes.includes(baseRoute);
};

export const getBaseRouteName = (pathname: string): string => {
    return pathname.replace(/^\/+/, '').split('/')[0];
};


