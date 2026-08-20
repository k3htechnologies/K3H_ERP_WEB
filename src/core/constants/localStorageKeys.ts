export const LOCAL_STORAGE_KEYS = {
    //LOGIN DATA
    EMPLOYEE: 'employee_data',
    EMPLOYEE_PROJECT: 'employee_project_data',
    TOKEN: 'auth_token',
    LAST_VISITED_PAGE: 'lastVisitedPage',

    //MENU
    MENU_MODULE: 'menuModule',

    //STATIC COUNTRY STATE DISTRICT CITY VILLAGE
    COUNTRY_STATE_DISTRICT_CITY_VILLAGE_MASTER: 'country_state_district_city_village_data',

    //SELECTED PROJECT ID
    SELECTED_PROJECT_ID: 'selectedProjectId',


    BRANCH_MASTER_SELECTED_COLUMNS: 'branchMaster.selectedColumns',
    BRANCH_ASSOCIATIONS_MASTER_SELECTED_COLUMNS: 'branchAssociationsMaster.selectedColumns',
    ASSET_MASTER_SELECTED_COLUMNS: 'assetMaster.selectedColumns',
    ASSET_MAPPING_MASTER_SELECTED_COLUMNS: 'assetMappingMaster.selectedColumns',
    DEDUCTION_MASTER_SELECTED_COLUMNS: 'deductionMaster.selectedColumns',
    EARNING_MASTER_SELECTED_COLUMNS: 'earningMaster.selectedColumns',
    BANK_LIST_MASTER_SELECTED_COLUMNS: 'bankListMaster.selectedColumns',
    HOLIDAY_MASTER_SELECTED_COLUMNS: 'holidayMaster.selectedColumns',
    HOLIDAY_MAPPING_MASTER_SELECTED_COLUMNS: 'holidayMappingMaster.selectedColumns',
    LEAVE_ENCASHMENT_MASTER_SELECTED_COLUMNS: 'leaveEncashmentMaster.selectedColumns',
    LEAVE_TYPE_MASTER_SELECTED_COLUMNS: 'leaveTypeMaster.selectedColumns',
    LEAVE_CREDIT_CONFIGURATION_SELECTED_COLUMNS: 'leaveCreditConfiguration.selectedColumns',
    COMP_OFF_SELECTED_COLUMNS: 'compOffTableColumns',
    SHIFT_MASTER_SELECTED_COLUMNS: 'shiftMaster.selectedColumns',
    SHIFT_MAPPING_MASTER_SELECTED_COLUMNS: 'shiftMappingMaster.selectedColumns',
    WEEK_OFF_MAPPING_MASTER_SELECTED_COLUMNS: 'weekOffMappingMaster.selectedColumns',
    WEEK_OFF_MASTER_SELECTED_COLUMNS: 'weekOffMaster.selectedColumns',

    //PAYROLL
    LEAVE_SELECTED_COLUMNS: 'leave.selectedColumns',
    OUTDOOR_SELECTED_COLUMNS: 'outdoor.selectedColumns',

    //SETTING -> COMPANY SETUP
    DAPARTMENT_MASTER_SELECTED_COLUMNS: 'departmentMaster.selectedColumns',
    DESIGNATION_MASTER_SELECTED_COLUMNS: 'designationMaster.selectedColumns',
    EMPLOYEE_MASTER_SELECTED_COLUMNS: 'employeeMaster.selectedColumns',
    COMPANY_MASTER_SELECTED_COLUMNS: 'companyMaster.selectedColumns',
    TNC_MASTER_SELECTED_COLUMNS: 'tncMaster.selectedColumns',
    VENDOR_SELECTED_COLUMNS: 'vendor.selectedColumns',

    //LITIGATION
    LITIGATION_SELECTED_COLUMNS: 'litigation.selectedColumns',

    //PROJECT DOCUMENT

    PROJECT_DOCUMENT_CATEGORY_MASTER_SELECTED_COLUMNS: 'projectDocumentCategoryMaster.selectedColumns',
    APPROVAL_DOCUMENT_CATEGORY_MASTER_SELECTED_COLUMNS: 'approvalDocumentCategoryMaster.selectedColumns',
    PROJECT_RERA_DOCUMENT_CATEGORY_MASTER_SELECTED_COLUMNS: 'projectRERADocumentCategoryMaster.selectedColumns',

    // REDEVELOPMENT

    REDEVELOPMENT_BUILDING_COLUMNS: 'redevelopmentBuilding.selectedColumns',
    TENANT_SELECTED_COLUMNS: 'tenant.selectedColumns',

    // PROCUREMENT MASTER
    MATERIAL_MASTER_SELECTED_COLUMNS: 'materialMaster.selectedColumns',
    SUB_MATERIAL_MASTER_SELECTED_COLUMNS: 'subMaterialMaster.selectedColumns',
    UOM_MASTER_SELECTED_COLUMNS: 'uomMaster.selectedColumns',


    // CHANNEL PARTNER
    CHANNEL_PARTNER_SELECTED_COLUMNS: 'channelPartnerMaster.selectedColumns',
    CHANNEL_PARTNER_UNIVERSE_SELECTED_COLUMNS: 'channelPartnerUniverse.selectedColumns',

    // SALES
    CALLING_DATA_SELECTED_COLUMNS: 'callTracker.selectedColumns',
    CALL_LOG_SELECTED_COLUMNS: 'callLog.selectedColumns',
    ENQUIRY_SELECTED_COLUMNS: 'enquiry.selectedColumns',
    CHANNEL_PARTNER_SOURCING_SELECTED_COLUMNS: 'channelPartnerSourcing.selectedColumns',
    BOOKING_SELECTED_COLUMNS: 'booking.selectedColumns',
    INCENTIVE_REPORT_COLUMNS: 'incentive_report.selectedColumns',
    PAYMENT_SCHEDULE_SCHEME_MASTER_COLUMNS: 'paymentScheduleSchemeMaster.selectedColumns',
    ACHIEVEMENT_BY_PROJECT_COLUMNS: 'achievementByProject.selectedColumns',
    ACHIEVEMENT_BY_CLOSING_COLUMNS: 'achievementByClosing.selectedColumns',
    ACHIEVEMENT_BY_SOURCING_COLUMNS: 'achievementBySourcing.selectedColumns',
    ACHIEVEMENT_BY_WALKINS_REVISIT_COLUMNS: 'achievementByWalkinsRevisit.selectedColumns',
    ACHIEVEMENT_BY_BOOKING_COLUMNS: 'achievementByBooking.selectedColumns',
    ACHIEVEMENT_BY_IBMOBM_COLUMNS: 'achievementByIbmObm.selectedColumns',

    //AOP ACHIEVEMENT
    ACHIEVEMENT_BY_CHANNEL_PARTNER_COLUMNS: 'achievementByChannelPartner.selectedColumns',
    ACHIEVEMENT_BY_CHANNEL_PARTNER_WALKINS_REVISIT_COLUMNS: 'achievementByChannelPartnerWalkinsRevisit.selectedColumns',
    ACHIEVEMENT_BY_CHANNEL_PARTNER_BOOKING_COLUMNS: 'achievementByChannelPartnerBooking.selectedColumns',
    ACHIEVEMENT_BY_CHANNEL_PARTNER_IBMOBM_COLUMNS: 'achievementByChannelPartnerIbmObm.selectedColumns',

    //CRM
    PAY_TRACK_BOOKING_SELECTED_COLUMNS: 'payTrackBooking.selectedColumns',
    PAY_TRACK_REPORT_SELECTED_COLUMNS: 'payTrackReport.selectedColumns',
    BROKERAGE_BOOKING_SELECTED_COLUMNS: 'brokerage.selectedColumns',
    PAY_TRACK_CALL_LOG_SELECTED_COLUMNS: 'payTrackCallLog.selectedColumns',
    DAILY_COLLECTION_REPORT_SELECTED_COLUMNS: 'dailyCollectionReport.selectedColumns',

    //MORE
    INWARD_OUTWARD_SELECTED_COLUMNS: 'inwardOutward.selectedColumns',


    //TICKET MASTER
    TICKET_MASTER_SELECTED_COLUMNS: 'ticket.selectedColumns',

    //TAX TRACKER
     NOTICE_SECTION_MASTER_SELECTED_COLUMNS: 'noticeSectionMaster.selectedColumns',

     //ESTIMATION AND BUDGET
    BUDGET_SELECTED_COLUMNS: 'budget.selectedColumns',

    //TERM SHEET
    TERM_SHEET_SELECTED_COLUMNS: 'termSheet.selectedColumns',

    //TAX TRACKER
    TAX_TRACKER_SELECTED_COLUMNS: 'taxTracker.selectedColumns',



} as const

export const LOCAL_STORAGE_FOR_STATE_KEYS = {
    EMPLOYEE: 'employeeMaster.listState',
    COMPANY: 'companyMaster.listState',
    VENDOR: 'vendor.listState',
    PROJECT_MASTER: 'projectMaster.listState',
    ASSET_MASTER: 'assetMaster.listState',
    ASSET_MAPPING_MASTER: 'assetMappingMaster.listState',
    DEDUCTION_MASTER: 'deductionMaster.listState',
    SHIFT_MASTER: 'shiftMaster.listState',
    WEEK_OFF_MASTER: 'weekOffMaster.listState',
    LITIGATION: 'Litigation.listState',
    LEAVECREDITCONFIGURATION: 'LeaveCreditConfiguration.listState',
    LEAVE: 'leave.listState',
    OUTDOOR: 'outdoor.listState',
    CHANNEL_PARTNER: 'channelPartner.listState',
    CHANNEL_PARTNER_SOURCING: 'channelPartnerSourcing.listState',
    CHANNEL_PARTNER_UNIVERSE: 'channelPartnerUniverse.listState',
    INCENTIVE_REPORT: 'incentive_report.listState',
    BOOKING: 'booking.listState',
    PAY_TRACK_BOOKING: 'payTrackBooking.listState',
    PAY_TRACK_REPORT: 'payTrackReport.listState',
    INWARD_OUTWARD: 'inwardOutward.listState',
    BOOKING_Brokerage: 'bookingBrokerage.listState',
    TICKET: 'ticket.listState',
    TERM_SHEET: 'termSheet.listState',
    TAX_TRACKER: 'taxTracker.listState',
    JOB_ROLE_MASTER: 'jobRoleMaster.listState',
    JOB_OPENING: 'jobOpening.listState',

} as const
