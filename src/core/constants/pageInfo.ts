export const getPageInfo = (path: string) => {
    const [first, second] = path.split("/").filter(Boolean);
    path = first

    switch (path) {
        case 'dashboard':
            return {
                title: 'Dashboard',
                description: 'Quick insights, smarter decisions',
            }
        // SETTING
        case 'departmentMaster':
            return {
                title: 'Department Master',
                description: 'Centralized department management for real estate operations',
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
                description: 'Define roles and designations across the organization',
            }
        case 'companyMaster':
            return {
                title: 'Company Master',
                description: 'Single source of truth for company information',
            }
        case 'tnc':
            return {
                title: 'Terms & Conditions Master',
                description: 'Clear terms for every transaction',
            }
        case 'bankListMaster':
            return {
                title: 'Bank List Master',
                description: 'Centralized list of banks for seamless financial operations',
            }
        case 'vendor':
            return {
                title: 'Vendor Management',
                description: 'Structured vendor data for efficient sourcing',
            }
        case 'projectMaster':
            return {
                title: 'Project Management',
                description: 'End-to-end Details of projects in one place',
            }


        case 'employeeMaster':
            return {
                title: 'Employee Master',
                description: 'Manage employee records with accuracy and control',
            }

        case 'materialMaster':
            return {
                title: 'Material Master',
                description: 'Manage material details in one place',
            }
        case 'subMaterialMaster':
            return {
                title: 'Sub Material Master',
                description: 'Detailed material breakdown in one place',
            }
        case 'uomMaster':
            return {
                title: 'UOM Master',
                description: 'Manage and organize company departments with complete CRUD operations',
            }
        // PAYROLL MASTER
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
        // PAYROLL
        case 'leave':
            return {
                title: 'Leave Management',
                description: 'Manage and organize employee leave requests with complete CRUD operations',
            }
        case 'leaveCreditDebit':
            return {
                title: 'Leave Credit Debit Management',
                description: 'Manage employee leave credit and debit with complete CRUD operations',
            }
        case 'compOff':
            return {
                title: 'compOff',
                description: 'Manage compOff with complete CRUD operations',
            }
        case 'outdoor':
            return {
                title: "Outdoor Management",
                description: "outdoor visit information",
            }
        case 'resignation':
            return {
                title: "Resignation",
                description: "Resignation information",
            }
        case 'payrollReport':
            return {
                title: "Payroll Report",
                description: "Comprehensive payroll reports for accurate financial tracking",
            }



        //DOCUMENT MANAGEMENT
        case 'category':
            return {
                title: 'Project Document Category',
                description: 'Organize project documents by category for easy access',
            }
        case 'document':
            return {
                title: 'Project Document',
                description: 'Structured document management for real estate projects',
            }
        case 'reraCategory':
            return {
                title: 'RERA Document Category',
                description: 'Organize RERA documents for clear regulatory reporting',
            }
        case 'rera':
            return {
                title: 'RERA Document',
                description: 'Centralized RERA documents for regulatory compliance',
            }
        case 'approvalDocument':
            return {
                title: 'Approval Document',
                description: 'Manage and organize company departments with complete CRUD operations',
            }
        case 'approvalCategory':
            return {
                title: 'Approval Document Category',
                description: 'Manage and organize company departments with complete CRUD operations',
            }
        //PROFILE
        case 'profile':
            return {
                title: 'Profile',
                description: 'Manage user identity and profile details securely',
            }

        //OPERATIONS
        case 'siteProgress':
            if (second === "SiteProgressSubConstruction") {
                return {
                    title: "Site Progress Sub Construction",
                    description: "Assign and manage module permissions for designations",
                };
            }

            if (second === "SiteProgressWingConstruction") {
                return {
                    title: "Wing Wise Construction",
                    description: "Assign and manage module permissions for designations",
                };
            }

            if (second === "SiteProgressFloorConstruction") {
                return {
                    title: "Floor Wise Construction",
                    description: "Assign and manage module permissions for designations",
                };
            }

            if (second === "SiteProgressFlatConstruction") {
                return {
                    title: "Flat Wise Construction",
                    description: "Assign and manage module permissions for designations",
                };
            }

            if (second === "SiteProgressConstructionActivity") {
                return {
                    title: "Activity",
                    description: "Assign and manage module permissions for designations",
                };
            }

            if (second === "SiteProgressConstructionSubActivity") {
                return {
                    title: "Sub Activity",
                    description: "Assign and manage module permissions for designations",
                };
            }

            return {
                title: 'Site Progress',
                description: 'Profile',
            }

        //REDEVELOPMENT
        case 'building':
            return {
                title: 'Building',
                description: 'Profile',
            }
        case 'tenant':
            return {
                title: 'Tenant',
                description: 'Profile',
            }
        case 'rent':
            return {
                title: 'Rent',
                description: 'Rent',
            }
        case 'proposedOffer':
            return {
                title: 'Proposed Offer',
                description: 'Profile',
            }
        case 'proposedPlan':
            return {
                title: 'Proposed Plan',
                description: 'Proposed Plan',
            }
        //COMMAN MODULES
        case 'event':
            return {
                title: 'Event',
                description: 'Profile',
            }



        case 'inventory':
            return {
                title: "Inventory Management",
                description: "Track building units, floors, and availability in real time",
            }
        case 'parking':
            return {
                title: "Parking Management",
                description: "Track parking availability across buildings and projects",
            }
        case 'enquiry':
            return {
                title: "Enquiry",
                description: "Centralized enquiry management for faster response",
            }
        case 'channelPartner':
            return {
                title: "Channel Partner",
                description: "Single source of truth for channel partner information",
            }

        default:
            return {
                title: 'Dashboard',
                description: 'Overview of your system and key metrics',
            }
    }
}
