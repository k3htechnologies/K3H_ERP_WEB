export const getPageInfo = (path: string) => {
    const [first, second] = path.split("/").filter(Boolean);
    path = first

    switch (path) {
        case 'dashboard':
            return {
                title: 'Dashboard',
                description: 'Overview of your system and key metrics',
            }
        case 'departmentMaster':
            return {
                title: 'Department Master',
                description: 'Manage and organize company departments with complete CRUD operations',
            }

        case 'designationMaster':
            if (second === "employeeModuleAccess") {
                return {
                    title: "Module Access",
                    description: "Assign and manage module permissions for designations",
                };
            }

            return {

                title: 'Designation Master',
                description: 'Manage and organize company departments with complete CRUD operations',
            }
        case 'branchMaster':
            return {
                title: 'Branch Master',
                description: 'Manage and organize branch  with complete CRUD operations',
            }
        case 'assetMaster':
            return {
                title: 'Asset Master',
                description: 'Manage and organize asset  with complete CRUD operations',
            }
        case 'assetMappingMaster':
            return {
                title: 'Asset Mapping Master',
                description: 'Manage and organize asset mapping with complete CRUD operations',
            }
        case 'branchAssociationsMaster':
            return {
                title: 'Branch Associations Master',
                description: 'Manage and organize branch associations with complete CRUD operations',
            }
        case 'deductionMaster':
            return {
                title: 'Deduction Master',
                description: 'Manage and organize branch associations with complete CRUD operations',
            }
        case 'earningMaster':
            return {
                title: 'Earning Master',
                description: 'Manage and organize branch associations with complete CRUD operations',
            }
        case 'holidayMaster':
            return {
                title: 'Holiday Master',
                description: 'Manage and organize branch associations with complete CRUD operations',
            }

        case 'holidayMappingMaster':
            return {
                title: 'Holiday Mapping Master',
                description: 'Manage and organize branch associations with complete CRUD operations',
            }
        case 'leaveEncashmentMaster':
            return {
                title: 'Leave Encashment Master',
                description: 'Manage and organize branch associations with complete CRUD operations',
            }
        case 'leaveTypeMaster':
            return {
                title: 'Leave Type Master',
                description: 'Manage and organize branch associations with complete CRUD operations',
            }

        case 'shiftMaster':
            return {
                title: 'Shift Master',
                description: 'Manage and organize branch associations with complete CRUD operations',
            }
        case 'shiftMappingMaster':
            return {
                title: 'Shift Mapping Master',
                description: 'Manage and organize branch associations with complete CRUD operations',
            }
        case 'weekOffMaster':
            return {
                title: 'Week Off Master',
                description: 'Manage and organize branch associations with complete CRUD operations',
            }
        case 'weekOffMappingMaster':
            return {
                title: 'Week Off Mapping Master',
                description: 'Manage and organize branch associations with complete CRUD operations',
            }
        case 'companyMaster':
            return {
                title: 'Company Master',
                description: 'Manage and organize branch associations with complete CRUD operations',
            }
        case 'tnc':
            return {
                title: 'Terms & Conditions Master',
                description: 'Manage and organize branch associations with complete CRUD operations',
            }
        case 'bankListMaster':
            return {
                title: 'Bank List Master',
                description: 'Manage and organize branch associations with complete CRUD operations',
            }
        case 'vendor':
            return {
                title: 'Vendor Management',
                description: 'Manage and organize branch associations with complete CRUD operations',
            }
        case 'projectMaster':
            return {
                title: 'Project Management',
                description: 'Manage and organize branch associations with complete CRUD operations',
            }

        case 'employeeMaster':
            return {
                title: 'Employee Master',
                description: 'Manage and organize company departments with complete CRUD operations',
            }

        case 'materialMaster':
            return {
                title: 'Material Master',
                description: 'Manage and organize company departments with complete CRUD operations',
            }
        case 'subMaterialMaster':
            return {
                title: 'Sub Material Master',
                description: 'Manage and organize company departments with complete CRUD operations',
            }
        case 'uomMaster':
            return {
                title: 'UOM Master',
                description: 'Manage and organize company departments with complete CRUD operations',
            }
       case 'category':
            return {
                title: 'Project Document Category Master',
                description: 'Manage and organize company departments with complete CRUD operations',
            }
        case 'profile':
            return {
                title: 'Employee Profile',
                description: 'Profile',
            }
        // ✅ Add other cases here...
        default:
            return {
                title: 'Dashboard',
                description: 'Overview of your system and key metrics',
            }
    }
}
