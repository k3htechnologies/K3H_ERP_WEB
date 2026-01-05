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

    speciality_type: ['Commercial Sale', 'Commercial Leasing', 'Residential Sale', 'Office Sale', 'Office Leasing', 'Commercial + Residential Sale', 'Commercial + Residential + Office Sale',],

    carpet_area_type: ['MOFA', 'RERA'],

    tenure: ['Tenure 1', 'Tenure 2', 'Tenure 3', 'Tenure 4', 'Tenure 5', 'Tenure 6', 'Tenure 7', 'Tenure 8', 'Tenure 9', 'Tenure 10', 'Tenure 11', 'Tenure 12', 'Tenure 13', 'Tenure 14'],

    unit_sqft_lumsum: ['Per Sq Ft', 'Lump Sum'],

    business_category: ['Commercial', 'Gym', 'Residential', 'School'],

    project_scheme: ['BMC', 'MHADA', 'SRA', 'SLUM', 'TDR', 'Other'],

    project_sub_scheme: ['33 (20) B', '33 (19)', '33 (7) B', '33 (7) A', '33 (9)', '33 (12) B'],

    road_width: ['6.10 M', '9.15 M', '12.20 M', '13.40 M', '18.3 M', '27.45 M', '36.6 M'],

    calender_view_type: ['Month', 'Week', 'Day'],

    event_type: ['Task', 'Meeting', 'Conference Room Booking'],

    conference_room_name: ['Room 1', 'Room 2', 'Room 3'],

    occupationType: ['Business', 'Homemaker', 'Professional', 'Salaried', 'Retired',],

    budget: ['<1', '1.5', '2.5', '3', '4', '5', '5 <'],

    accomodation: ["Rented", "Self-Owned",],

    requirement: ["Commercial", "Residential"],

    possessionType: ['Ready', 'Within 1 Year', 'More Than 2 Year'],

    source: ['Advertisement', 'Channel Partner', 'Direct Walking', 'Exhibition', 'Enquiry', 'HRR Website', 'Reference'],

    subsource: ['Facebook', 'Hoarding', 'Instagram', 'Google Ads', 'Newspaper'],

    finalStage: ['Booking Done', 'Enquiry', 'Follow-up', 'Lost', 'Inactive', 'Negotiation', 'Revisit', 'Site Visit'],

    finalStageDetail: ['TimeLine Issue', 'Location Issue', 'Low Budget', 'Did Not Like Project', 'Other Issues'],

    age: ['21-25', '26-35', '36-45', '46-55', '56-65', '>65'],

    desiredFloorBand: ['Higher', 'Middle', 'Lower'],

    neighborhoodPlaces: ['Creche', 'Colleges', 'Gardens', 'Gyms', 'Hospitals', 'IT Parks', 'Multiplexes', 'Nightclubs', 'Place of Worship', 'Restaurants', 'Schools', 'Others'],

    customerclassification: ['Hot', 'Warm', 'Cold'],

    sourceOfFunding: ['Loan', 'Self-funded', 'Sale Of Property', 'Subvention Loan'],

    ethnicity: ['Bengali', 'Christian', 'Gujarati', 'Jain', 'Muslim', 'Marwari', 'Maharashtrian', 'North Indian', 'Parsi', 'Sindhi', 'south Indian', 'Others'],

    nationality: ['Indian', 'NRI'],

    amenities: [
        '24x7 Security',
        'Amphitheatre',
        'ATM',
        'Badminton Court',
        'Banquet Hall',
        'Basketball Court',
        'Billiards Room',
        'Cafeteria',
        'Children Play Area',
        'Club House',
        'Conference Room',
        'Convenience Store',
        'Co-working Space',
        'Covered Parking',
        'CCTV Surveillance',
        'Creche',
        'Cycling Track',
        'Day Care Centre',
        'EV Charging Points',
        'Earthquake Resistant Structure',
        'Fire Fighting System',
        'First Aid Room',
        'Garden',
        'Garbage Disposal System',
        'Gym',
        'Indoor Games',
        'Intercom Facility',
        'Jacuzzi',
        'Jogging Track',
        'Kids Pool',
        'Laundry Service',
        'Lift',
        'Library',
        'Lobby',
        'Meditation Area',
        'Parking',
        'Pet Care Area',
        'Pet Park',
        'Pharmacy',
        'Power Backup',
        'Rainwater Harvesting',
        'Reading Room',
        'School Bus Bay',
        'Security Cabin',
        'Sewage Treatment Plant',
        'Service Lift',
        'Society Office',
        'Spa',
        'Squash Court',
        'Steam Room',
        'Swimming Pool',
        'Table Tennis',
        'Temple / Prayer Hall',
        'Tennis Court',
        'Visitor Parking',
        'Water Supply',
        'Yoga Room'
    ],
    reasonsOfJobLeaving: [
        'Better career growth opportunity',
        'Business shutdown',
        'Career break for family reasons',
        'Career change / domain shift',
        'Company financial instability',
        'Company relocation',
        'Company restructuring / downsizing',
        'Completed internship / traineeship',
        'Contract completed',
        'Department closed',
        'End of probation period',
        'Extensive travel requirements',
        'Family responsibilities',
        'Freelancing / consulting interest',
        'Health issues in family',
        'Limited promotion opportunities',
        'Limited salary growth',
        'Long commute distance',
        'Looking for a more flexible work culture',
        'Looking for a more structured environment',
        'Looking for new challenges',
        'Management / organizational change',
        'Marriage relocation',
        'Moving closer to home',
        'Moving into leadership role',
        'Mutual separation',
        'Parental care responsibility',
        'Personal health reasons',
        'Professional certification / training',
        'Project successfully completed',
        'Pursuing higher education',
        'Relocation to another city',
        'Relocation to another country',
        'Retirement / early retirement',
        'Returning back to home country',
        'Role not matching my skills',
        'Role redundancy',
        'Seasonal job completed',
        'Seeking fair compensation',
        'Shift timing not suitable long-term',
        'Spouse / family relocation',
        'Starting my own business',
        'Temporary role ended',
        'Unstable work schedule',
        'Work profile / job expectation mismatch',
        'Work-life balance improvement'
    ]


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
export const AGE_TYPE_OPTION = toOptions(MASTER_DATA.age)
export const NEIGHBORHOOD_PLACES_TYPE_OPTION = toOptions(MASTER_DATA.neighborhoodPlaces)
export const DESIRED_FLOOR_BAND = toOptions(MASTER_DATA.desiredFloorBand)
export const CUSTOMER_CLASSIFICATION_TYPE = toOptions(MASTER_DATA.customerclassification)
export const SOURCE_OF_FUNDING_TYPE = toOptions(MASTER_DATA.sourceOfFunding)
export const ETHNICITY_TYPE_OPTION = toOptions(MASTER_DATA.ethnicity)
export const POSSESSION_TYPE_OPTIONS = toOptions(MASTER_DATA.possessionType)
export const NATIONALITY_TYPE_OPTION = toOptions(MASTER_DATA.nationality)
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
export const AMENITIES_OPTIONS = toOptions(MASTER_DATA.amenities)
export const REASONS_OF_JOB_LEAVING_OPTIONS = toOptions(MASTER_DATA.reasonsOfJobLeaving)



