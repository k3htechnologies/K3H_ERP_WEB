// ============================================================================
// MASTER DATA (Static Dropdown Options)
// Centralized constants for select/dropdown fields
// ============================================================================

export interface Option {
    id: string
    name: string
}

// ============================================================================
// STATIC MASTER DATA
// ============================================================================

export const MASTER_DATA = {
    emergencyRelations: [
        'Father', 'Mother', 'Spouse', 'Child',
        'Son', 'Daughter', 'Grandfather', 'Grandmother', 'Uncle', 'Aunt',
        'Cousin', 'Friend', 'Other'
    ],

    employeeTypes: [
        'Permanent', 'Contract', 'Intern', 'Part Time', 'Temporary'
    ],

    genders: ['Male', 'Female', 'Other'],

    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

    deductionType: ['Provident Fund', 'Professional Tax', "Tax Deduction at Source", 'Labor Welfare Fund', 'ESI', 'Labour WaleFare Fund', 'National Pension Scheme', 'Health Insurance Premiums'],

    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

    maritalStatuses: ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'],

    bloodGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],

    companyType: ['LLP', 'Private Limited Company', 'Proprietorship'],

    projectStatus: ['On-Going', 'Completed', 'On-Hold', 'Cancelled', 'Planning'],

    businessCategory: ['Real Estate', 'Construction', 'Infrastructure', 'Residential', 'Commercial', 'Mixed Use'],

    documentStatus: [
        'Applied', 'Doc Misssing', 'In Process', 'Issued', 'Not Applied', 'Not Applicable',
        'Paid', 'Payment Due', 'Rejected',
    ],

    bankAccountType: ['Current', 'DEMAT', 'Fixed', 'Salary', 'Saving'],

    landOwnershipType: ['Government', 'Landlord', 'Society'],

    flat_unit_Type: ['Commercial', 'Gym', 'Residential', 'Void'],

    residential_flat_configuration_Type: ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK', 'Duplex'],

    commercial_flat_configuration_Type: ['OFFICE', 'SHOP'],

    flat_unit_facing: ['EAST', 'FRONT', 'GARDEN', 'NORTH', 'PARK', 'ROAD', 'SOUTH', 'WEST'],

    applicant_type: ['Applicant', 'Co - Applicant'],

    speciality_type: ['Commercial Sale', 'Commercial Leasing', 'Residential Sale', 'Office Sale', 'Office Leasing '],

    carpet_area_type: ['MOFA', 'RERA'],

    tenure: ['Tenure 1', 'Tenure 2', 'Tenure 3', 'Tenure 4', 'Tenure 5', 'Tenure 6', 'Tenure 7', 'Tenure 8', 'Tenure 9', 'Tenure 10', 'Tenure 11', 'Tenure 12', 'Tenure 13', 'Tenure 14'],

    unit_sqft_lumsum: ['Per Sq Ft', 'Lump Sum'],

    business_category: ['Commercial', 'Gym', 'Residential', 'School'],

    project_scheme: ['BMC', 'MHADA', 'SRA', 'SLUM', 'TDR', 'Other'],

    project_sub_scheme: ['33 (20) B', '33 (19)', '33 (7) B', '33 (7) A', '33 (9)', '33 (12) B'],

    road_width: ['6.10 M', '9.15 M', '12.20 M', '13.40 M', '18.3 M', '27.45 M', '36.6 M'],

    calender_view_type: ['Month','Week','Day'],

    event_type: ['Task','Meeting','Conference Room Booking'],

    conference_room_name: ['Room 1','Room 2','Room 3'],
    
    occupationType: ['Salaried', 'Self-Employed', 'Others'],
   
    budget:['Less Than 1','UPTO 1.5','UPTO 2.5','UPTO 3','UPTO 4','UPTO 5','5 & Above'],

    accomodation: ["Self-Owned", "Rented"],

    requirement: ["Residential", "Commercial"],

    possessionType: ['Ready', 'Within 1 Year', 'More Than 2 Year'],
     
    source:['Channel Partner','Direct Walking','Exhibition','Reference','Enquiry','Advertisement'],
  
    subsource:['Hoarding','Facebook','Instagram','Google Ads','Newspaper'],

    finalStage:['Site Visit','Revisit','Negotiation','Booking Done','Lost','Inactive','Follow-up','Enquiry'],

    finalStageDetail:['Ready to Move','Location Issue','Did Not Like Project','Other Issues']

} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const toOptions = (list: readonly string[]): Option[] =>
    list.map(item => ({ id: item, name: item }))


export const filterOptions = (
    options: Option[],
    searchTerm: string = ''
): Option[] =>
    !searchTerm.trim()
        ? options
        : options.filter(opt =>
            opt.name.toLowerCase().includes(searchTerm.toLowerCase())
        )

// ============================================================================
// READY-TO-USE OPTION ARRAYS
// (For direct use in select components)
// ============================================================================

export const EMERGENCY_RELATION_OPTIONS = toOptions(MASTER_DATA.emergencyRelations)
export const EMPLOYEE_TYPE_OPTIONS = toOptions(MASTER_DATA.employeeTypes)
export const GENDER_OPTIONS = toOptions(MASTER_DATA.genders)
export const MONTHS_OPTIONS = toOptions(MASTER_DATA.months)
export const DEDUCTION_TYPE_OPTIONS = toOptions(MASTER_DATA.deductionType)
export const DAYS_OPTIONS = toOptions(MASTER_DATA.days)
export const MARITAL_STATUS_OPTIONS = toOptions(MASTER_DATA.maritalStatuses)
export const BLOOD_GROUP_OPTIONS = toOptions(MASTER_DATA.bloodGroups)
export const COMPANY_TYPE_OPTIONS = toOptions(MASTER_DATA.companyType)
export const PROJECT_STATUS_OPTIONS = toOptions(MASTER_DATA.projectStatus)
export const BUSINESS_CATEGORY_OPTIONS = toOptions(MASTER_DATA.businessCategory)
export const COMPANY_TYPE = toOptions(MASTER_DATA.companyType)
export const PROJECT_DOCUMENT_STATUS = toOptions(MASTER_DATA.documentStatus)
export const ACCOMODATION_TYPE_OPTIONS = toOptions(MASTER_DATA.accomodation)
export const REQUIREMENT_TYPE_OPTIONS = toOptions(MASTER_DATA.requirement)
export const BUDGET_TYPE_OPTIONS = toOptions(MASTER_DATA.budget)
export const OCCUPATION_TYPE_OPTIONS = toOptions(MASTER_DATA.occupationType)
export const SOURCE_TYPE_OPTIONS = toOptions(MASTER_DATA.source)
export const SUBSOURCE_TYPE_OPTIONS = toOptions(MASTER_DATA.subsource)
export const FINAL_STAGE_TYPE_OPTIONS = toOptions(MASTER_DATA.finalStage)
export const FINAL_STAGE_DETAILS_TYPE_OPTIONS = toOptions(MASTER_DATA.finalStageDetail)
export const POSSESSION_TYPE_OPTIONS = toOptions(MASTER_DATA.possessionType)
export const BANK_ACCOUNT_TYPE = toOptions(MASTER_DATA.bankAccountType)
export const LAND_OWNERSHIP_TYPE = toOptions(MASTER_DATA.landOwnershipType)
export const FLAT_UNIT_TYPE = toOptions(MASTER_DATA.flat_unit_Type)
export const RESIDENTIAL_FLAT_CONFIGURATION = toOptions(MASTER_DATA.residential_flat_configuration_Type)
export const COMMERCIAL_FLAT_CONFIGURATION = toOptions(MASTER_DATA.commercial_flat_configuration_Type)
export const FLAT_UNIT_FACING = toOptions(MASTER_DATA.flat_unit_facing)
export const APPLICANT_TYPE = toOptions(MASTER_DATA.applicant_type)
export const CARPET_AREA_TYPE = toOptions(MASTER_DATA.carpet_area_type)
export const TENURE = toOptions(MASTER_DATA.tenure)
export const UNIT_SQFT_LUMPSUM = toOptions(MASTER_DATA.unit_sqft_lumsum)
export const SPECIALITY_TYPE = toOptions(MASTER_DATA.speciality_type)
export const BUSINESS_CATEGORY = toOptions(MASTER_DATA.business_category)
export const PROJECT_SCHEME = toOptions(MASTER_DATA.project_scheme)
export const PROJECT_SUB_SCHEME = toOptions(MASTER_DATA.project_sub_scheme)
export const ROAD_WIDTH = toOptions(MASTER_DATA.road_width)
export const CALENDER_VIEW_TYPE = toOptions(MASTER_DATA.calender_view_type)
export const EVENT_TYPE = toOptions(MASTER_DATA.event_type)
export const CONFERENCE_ROOM_NAME = toOptions(MASTER_DATA.conference_room_name)



