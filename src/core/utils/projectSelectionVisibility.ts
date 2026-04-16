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
        , 'materialRequisition'
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
    ];

    const baseRoute = getBaseRouteName(pathname);

    return !hiddenRoutes.includes(baseRoute);
};

export const getBaseRouteName = (pathname: string): string => {
    return pathname.replace(/^\/+/, '').split('/')[0];
};


