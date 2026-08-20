export const getPageInfo = (path: string) => {
    const [first, second, third] = path.split("/").filter(Boolean);
    path = first

    switch (path) {
        case 'dashboard':
            return {
                title: 'Dashboard',
                description: 'Quick insights, smarter decisions',
            }

            {/* SETTING -> COMPANY SETUP */ }
        case 'settingDashboard':
            return {
                title: 'Setting Dashboard',
                description: 'One Dashboard. Complete Operational Control',
            }
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

        case 'employeeMaster':
            return {
                title: 'Employee Master',
                description: 'Manage employee records with accuracy and control',
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
                description: 'Standardized Units for Accurate Property Management.',
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

        // PAYROLL MASTER
        case 'branchMaster':
            return {
                title: 'Branch Master',
                description: 'Centralized management of branch information',
            }
        case 'assetMaster':
            return {
                title: 'Asset Master',
                description: 'Centralized asset records for complete visibility.',
            }
        case 'assetMappingMaster':
            return {
                title: 'Asset Mapping Master',
                description: 'Map assets accurately across locations, projects, and users',
            }
        case 'branchAssociationsMaster':
            return {
                title: 'Branch Associations Master',
                description: 'Map and manage inter-branch associations efficiently',
            }
        case 'deductionMaster':
            return {
                title: 'Deduction Master',
                description: 'Structured deduction rules for seamless salary calculation',
            }
        case 'earningMaster':
            return {
                title: 'Earning Master',
                description: 'Standardized earning definitions across payroll',
            }
        case 'holidayMaster':
            return {
                title: 'Holiday Master',
                description: 'Structured holiday management for seamless operations',
            }

        case 'holidayMappingMaster':
            return {
                title: 'Holiday Mapping Master',
                description: 'Link holidays to branches, departments, and employees',
            }
        case 'leaveEncashmentMaster':
            return {
                title: 'Leave Encashment Master',
                description: 'Convert unused leaves into accurate salary payouts',
            }
        case 'leaveTypeMaster':
            return {
                title: 'Leave Type Master',
                description: 'Define and manage leave types with policy clarity',
            }
        case 'shiftMaster':
            return {
                title: 'Shift Master',
                description: 'Define and assign shifts for accurate attendance tracking',
            }
        case 'shiftMappingMaster':
            return {
                title: 'Shift Mapping Master',
                description: 'Map employee shifts with accuracy and control',
            }
        case 'weekOffMaster':
            return {
                title: 'Week Off Master',
                description: 'Organized Week Offs for Efficient HR Management',
            }
        case 'weekOffMappingMaster':
            return {
                title: 'Week Off Mapping Master',
                description: 'Right Offs, Right Teams, Right Time',
            }
        case 'leaveCreditConfiguration':
            return {
                title: 'Leave Credit Configuration Management',
                description: 'Smart Leave Credit Setup for Seamless HR Management',
            }

        case 'noticeSection':
            return {
                title: 'Notice Section Master',
                description: 'Centralized management of notice sections for real estate projects',
            }
        // PAYROLL

        case 'payrollDashboard':
            return {
                title: 'Payroll Dashboard',
                description: 'Manage and organize employee leave requests with complete CRUD operations',
            }

        case 'leave':
            return {
                title: 'Leave Management',
                description: 'Manage and organize employee leave requests with complete CRUD operations',
            }

        case 'compOff':
            return {
                title: 'Comp Off',
                description: 'Smartly Track Extra Work. Seamlessly Grant Comp Off',
            }
        case 'outdoor':
            return {
                title: "Outdoor",
                description: "Outdoor Work. Indoor Balance",
            }
        case 'attendance':
            return {
                title: "Attendance",
                description: "Accurate Attendance. Smarter Workforce",
            }
        case 'resignation':
            return {
                title: "Resignation",
                description: "Simple Resignations. Smooth Transitions",
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
                description: 'Efficient Approvals for Seamless Real Estate Operations',
            }
        case 'approvalCategory':
            return {
                title: 'Approval Document Category',
                description: 'Categorize Approvals, Simplify Decisions',
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
                    description: "Structured Sub-Construction Progress, Simplified",
                };
            }

            if (second === "SiteProgressWingConstruction") {
                return {
                    title: "Wing Wise Construction",
                    description: "Structured Building Progress — One Wing at a Time",
                };
            }

            if (second === "SiteProgressFloorConstruction") {
                return {
                    title: "Floor Wise Construction",
                    description: "Clear Floor-Wise Visibility for Better Control",
                };
            }

            if (second === "SiteProgressFlatConstruction") {
                return {
                    title: "Flat Wise Construction",
                    description: "Track Progress, Flat by Flat",
                };
            }

            if (second === "SiteProgressConstructionActivity") {
                return {
                    title: "Activity",
                    description: "Track Every Action. Deliver Every Outcome.",
                };
            }

            if (second === "SiteProgressConstructionSubActivity") {
                return {
                    title: "Sub Activity",
                    description: "Small Steps. Big Progress",
                };
            }

            return {
                title: 'Site Progress',
                description: 'Clear Visibility Across Every Construction Stage',
            }

        //REDEVELOPMENT
        case 'redevelopmentDashboard':
            return {
                title: 'Redevelopment Dashboard',
                description: 'Structured redevelopment workflows for efficient execution',
            }
        case 'building':
            return {
                title: 'Building',
                description: 'Single source of truth for building information',
            }
        case 'tenant':
            return {
                title: 'Tenant',
                description: 'Manage tenants in one place',
            }
        case 'rent':
            return {
                title: 'Temporary Alternate Accommodation',
                description: 'Manage rent cycles with clarity and control',
            }
        case 'proposedOffer':
            return {
                title: 'Proposed Offer',
                description: 'Evaluate and manage building redevelopment offers',
            }
        case 'proposedPlan':
            return {
                title: 'Proposed Plan',
                description: 'Proposed Plan',
            }

        //COMMAN MODULES
        // case 'event':
        //     return {
        //         title: 'Event',
        //         description: 'Profile',
        //     }

        case 'jobRoleMaster':
            if (second === 'add') {
                return {
                    title: 'Add Job Role',
                    description: 'Create a job role for the selected department',
                }
            }
            if (second === 'edit') {
                return {
                    title: 'Edit Job Role',
                    description: 'Update job role details',
                }
            }
            if (second === 'view') {
                return {
                    title: 'Job Role Details',
                    description: 'View complete job role information',
                }
            }
            return {
                title: 'Job Role Master',
                description: 'Manage department-wise job roles',
            }

        // case 'conference':
        //     return {
        //         title: 'Conference Room',
        //         description: 'View room availability and manage conference bookings',
        //     }

        // case 'task':
        //     return {
        //         title: 'Task',
        //         description: 'Manage and track assigned tasks',
        //     }

        // case 'meeting':
        //     if (second === 'add') {
        //         return {
        //             title: 'Schedule Meeting',
        //             description: 'Create and organize a new meeting',
        //         }
        //     }
        //     if (second === 'edit') {
        //         return {
        //             title: 'Edit Meeting',
        //             description: 'Update the selected meeting details',
        //         }
        //     }
        //     if (third === 'mom') {
        //         return {
        //             title: 'Minutes Of Meeting',
        //             description: 'Review meeting details and manage the agenda',
        //         }
        //     }
        //     return {
        //         title: 'Meeting',
        //         description: 'Manage and organize company departments with complete CRUD operations',
        //     }

        case 'jobOpenings':
            if (second === 'add') {
                return {
                    title: 'Add Job Opening',
                    description: 'Create a new job opening for the selected department',
                }
            }
            if (second === 'interviews') {
                return {
                    title: 'Schedule Interview',
                    description: 'Schedule and manage candidate interviews',
                }
            }
            return {
                title: 'Job Openings',
                description: 'Manage department-wise job openings and applications',
            }

        case 'inwardOutward':
            return {
                title: 'Inward Outward',
                description: 'Inward Outward',
            }

        case 'ticket':
            return {
                title: 'Ticket',
                description: 'Ticket',
            }
            
            case 'otpLogs':
            return {
                title: 'OTP Logs',
                description: 'OTP Logs'
            }

        case 'taxTracker':
            return {
                title: 'Tax Tracker',
                description: 'Tax Tracker for tracking notices issued by authorities across India',
            }

       
            {/* INVENTORY AND REPORT */ }

        case 'inventoryDashboard':
            return {
                title: 'Inventory Dashboard',
                description: 'Inventory Insights, Instantly',
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
        case 'inventoryParkingOverallReport':
            return {
                title: "Inventory and Parking Overall Report",
                description: "Comprehensive report for inventory and parking management with real-time insights and actionable data",
            }


            {/* SALES */ }
        case 'saleDashboard':
            return {
                title: "Sales Dashboard",
                description: "Structured sales management for real estate projects",
            }
        case 'enquiry':
            return {
                title: "Enquiry",
                description: "Centralized enquiry management for faster response",
            }
        case 'channelPartnerDashboard':
            return {
                title: "Channel Partner Dashboard",
                description: "Centralized enquiry management for faster response",
            }
        case 'cpUniverse':
            return {
                title: "Channel Partner Universe",
                description: "Single source of truth for channel partner information",
            }

        case 'channelPartner':
            return {
                title: "Channel Partner",
                description: "Single source of truth for channel partner information",
            }
        case 'booking':
            return {
                title: "Booking",
                description: "Secure Bookings, Satisfied Customers",
            }
        case 'sourcing':
            return {
                title: "Channel Partner Sourcing",
                description: "Source Smarter, Sell Faster with Channel Partners",
            }

        case 'callTracker':
            return {
                title: "Call Tracker",
                description: "Monitor sales calls and follow-ups in real time",
            }

        case 'otherCharges':
            return {
                title: "Other Charges",
                description: "Clear Breakdown of All Extra Charges",
            }
        case 'paymentSchedule':
            return {
                title: "Payment Schedule",
                description: "Structured Payment Schedules for Smooth Cash Flow",
            }
        case 'paymentScheduleScheme':
            return {
                title: "Payment Schedule Scheme",
                description: "Flexible Plans, Faster Closures",
            }
        case 'paymentScheduleReport':
            return {
                title: "Payment Schedule Report",
                description: "Single source of truth for channel partner information",
            }
        case 'enquiryReport':
            return {
                title: "Enquiry Report",
                description: "Turn Enquiries into Opportunities",
            }
        case 'ibmObmReport':
            return {
                title: "IBM OBM Report",
                description: "Turn Enquiries into Opportunities",
            }
        case 'cpEnquiryReport':
            return {
                title: "Channel Partner Enquiry Report",
                description: "Maximize Enquiries through Trusted Channel Partners",
            }
        case 'target':
            return {
                title: "Sales Target",
                description: "Driving Sales Performance with Clear Targets",
            }
        case 'incentiveReport':
            return {
                title: "Incentive Report",
                description: "Turn Referrals into Rewards",
            }
        case 'classificationParameter':
            return {
                title: "Classification Parameter",
                description: "Turn Lead Insights into Sales Opportunities",
            }
        case 'performance':
            return {
                title: "Performance",
                description: "Track Team Progress Against Every Target",
            }
        case 'achievement':
            return {
                title: "Achievement",
                description: "Recognize and Reward Top Performers",
            }
        case 'channelPartnerCategory':
            return {
                title: "Channel Partner Category",
                description: "Channel Partner Category",
            }
        case 'aopAchievement':
            return {
                title: "AOP Achievement",
                description: "Recognize and Reward Top Performers",
            }


        // MARKETING
        case 'content':
            return {
                title: "Content",
                description: "Structured marketing materials for real estate campaigns",
            }
        // PROJECT
        case 'approvedBank':
            return {
                title: "Approved Bank",
                description: "Reliable Banks, Hassle-Free Financing",
            }
        // LITIGATION
        case 'litigation':
            return {
                title: "Litigation",
                description: "Track & manage project related legal cases",
            }

        case 'legalDashboard':
            return {
                title: "Legal Dashboard",
                description: "Simplifying Legal Oversight Across Every Project",
            }

        //CRM  

        case 'crmDashboard':
            return {
                title: "CRM Dashboard",
                description: "Secure your unit by completing the booking process",
            }

        case 'payTrack':
            return {
                title: "Pay Track",
                description: "Secure your unit by completing the booking process",
            }

        case 'payTrackreport':
            return {
                title: "Pay Track Report",
                description: "Secure your unit by completing the booking process",
            }

        case 'collectionReport':
            return {
                title: "Collection Report",
                description: "Comprehensive report for collection management with real-time insights and actionable data",
            }

        case 'dailyCollectionReport':
            return {
                title: "Daily Collection Report",
                description: "Comprehensive report for collection management with real-time insights and actionable data",
            }


        case 'brokerage':
            return {
                title: "Brokerage",
                description: "Brokerage",
            }

             //SPECIFICATION MASTER
        case 'specificationmaster':
            return {
                title: "Specification Master",
                description: 'Overview of your system and key metrics',
            }
            //BUDGET
            case 'budget':
            return {
                title: "Budget",
                description: 'Overview of your system and key metrics',
            }

            //FINANCE
        case 'termSheet':
            return {
                title: "Term Sheet",
                description: "Manage and track term sheets for real estate transactions",
            }
            
        default:
            return {
                title: 'Dashboard',
                description: 'Overview of your system and key metrics',
            }
    }
}
