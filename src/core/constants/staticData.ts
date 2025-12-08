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
        'Father', 'Mother', 'Spouse', 'Sibling', 'Child', 'Brother', 'Sister',
        'Son', 'Daughter', 'Grandfather', 'Grandmother', 'Uncle', 'Aunt',
        'Cousin', 'Friend', 'Other'
    ],

    employeeTypes: [
        'Permanent', 'Contract', 'Intern', 'Part Time', 'Consultant', 'Temporary'
    ],

    genders: ['Male', 'Female', 'Other'],

    maritalStatuses: ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'],

    bloodGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],

    companyType: ['LLP','Private Limited Company','Proprietorship'],
    
    projectStatus: ['On-Going', 'Completed', 'On-Hold', 'Cancelled', 'Planning'],
    
    businessCategory: ['Real Estate', 'Construction', 'Infrastructure', 'Residential', 'Commercial', 'Mixed Use'],

    documentStatus: [
        'Applied','Doc Misssing', 'In Process', 'Issued','Not Applied','Not Applicable',
        'Paid','Payment Due', 'Rejected',
    ],

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
export const MARITAL_STATUS_OPTIONS = toOptions(MASTER_DATA.maritalStatuses)
export const BLOOD_GROUP_OPTIONS = toOptions(MASTER_DATA.bloodGroups)
export const COMPANY_TYPE_OPTIONS = toOptions(MASTER_DATA.companyType)
export const PROJECT_STATUS_OPTIONS = toOptions(MASTER_DATA.projectStatus)
export const BUSINESS_CATEGORY_OPTIONS = toOptions(MASTER_DATA.businessCategory)
export const COMPANY_TYPE = toOptions(MASTER_DATA.companyType)
export const PROJECT_DOCUMENT_STATUS = toOptions(MASTER_DATA.documentStatus)