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
        , 'shiftMaster'
        , 'shiftMappingMaster'
        , 'weekOffMaster'
        , 'weekOffMappingMaster'
        , 'profile'
        , 'dashboard'
    ];

    const baseRoute = getBaseRouteName(pathname);

    return !hiddenRoutes.includes(baseRoute);
};

export const getBaseRouteName = (pathname: string): string => {
    return pathname.replace(/^\/+/, '').split('/')[0];
};


