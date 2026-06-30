// ============================================================================
// MASTER DATA (Static Dropdown Options)
// Centralized constants for select/dropdown fields
// ============================================================================

export interface Option {
  id: string;
  name: string;
}

// ============================================================================
// STATIC MASTER DATA
// ============================================================================

export const MASTER_DATA = {
  emergencyRelations: [
    "Aunt",
    "Brother",
    "Child",
    "Cousin",
    "Daughter",
    "Father",
    "Friend",
    "Grandfather",
    "Grandmother",
    "Mother",
    "Other",
    "Sister",
    "Son",
    "Spouse",
    "Uncle",
  ],

  employeeTypes: ["Permanent", "Contract", "Full - Time", "Intern", "Part Time", "Temporary"],

  genders: ["Male", "Female", "Other"],

  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],

  deductionType: [
    "Provident Fund",
    "Professional Tax",
    "Tax Deduction at Source",
    "Labor Welfare Fund",
    "ESI",
    "Labour WaleFare Fund",
    "National Pension Scheme",
    "Health Insurance Premiums",
  ],

  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

  maritalStatuses: ["Single", "Married", "Divorced", "Widowed", "Separated"],

  bloodGroups: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],

  firmsType: ["LLP", "Private Limited Company", "Proprietorship"],

  companyType: ["Existing Company", "New Company"],

  projectStatus: ["On-Going", "Up-Coming", "Completed", "On-Hold", "Cancelled", "Planning"],

  businessCategory: ["Real Estate", "Construction", "Infrastructure", "Residential", "Commercial", "Mixed Use"],

  documentStatus: ["Applied", "Doc Missing", "In Process", "Issued", "Not Applied", "Not Applicable", "Paid", "Payment Due", "Rejected"],

  bankAccountType: ["Current", "Overdraft", "RERA Escrow Current Account", "Salary", "Saving"],

  natureOfAccount: [
    "100% Collection Account",
    "100% RERA Account",
    "30% RERA Account",
    "70% RERA Account",
    "Collection Escrow Account",
    "Escrow",
    "Loan",
    "Master Escrow Account",
    "Non - Current Account",
    "Overdraft",
    "Regular Account",
    "RERA Escrow Account",
  ],

  landOwnershipType: ["Government", "Landlord", "Society"],

  flat_unit_Type: [
    "BMC",
    "Commercial",
    "eDeck",
    "Fitness Center",
    "Gym",
    "MHADA",
    "Multi Purpose Room",
    "Land Lord",
    "Lien",
    "Part Terrace",
    "Refuge",
    "Religious Structure",
    "Residential",
    "Society Office",
    "SRA",
    "Upashray",
    "Void",
  ],

  residential_flat_configuration_Type: [
    "1 RK",
    "1 BHK",
    "2 BHK",
    "3 BHK",
    "4 BHK",
    "5 BHK",
    "6 BHK",
    "7 BHK",
    "8 BHK",
    "9 BHK",
    "10 BHK",
    "1 + 1 JODI",
    "2 + 1 JODI",
    "2 + 2 JODI",
    "2 + 3 JODI",
    "DUPLEX",
    "PENTHOUSE",
  ],

  commercial_flat_configuration_Type: ["OFFICE", "SHOP"],

  flat_unit_facing: [
    "City View",
    "Forest / Mangrove View",
    "Building View",
    "Internal Amenity View",
    "Garden View",
    "Club - House View",
    "Sea View",
    "Open View",
    "Others",
  ],

  applicant_type: ["Applicant", "Co - Applicant"],

  speciality_type: ["Commercial Sale", "Commercial Leasing", "Residential Sale", "Commercial + Residential Sale"],

  carpet_area_type: ["MOFA", "RERA"],

  tenure: [
    "Tenure 1",
    "Tenure 2",
    "Tenure 3",
    "Tenure 4",
    "Tenure 5",
    "Tenure 6",
    "Tenure 7",
    "Tenure 8",
    "Tenure 9",
    "Tenure 10",
    "Tenure 11",
    "Tenure 12",
    "Tenure 13",
    "Tenure 14",
  ],

  unit_sqft_lumsum: ["Per Sq Ft", "Lumpsum"],

  project_category: ["Direct", "Tender"],

  business_category: ["Commercial", "Mixed Use", "Residential"],

  project_scheme: ["BMC", "MHADA", "SRA"],

  project_sub_scheme_BMC: ["33 (20) B", "33 (19)", "33 (7)", "33 (7) B", "33 (7) A", "33 (9)", "33 (12) B"],

  project_sub_scheme_MHADA: ["33 (5)"],

  project_sub_scheme_SRA: ["33 (10)", "33 (11)"],

  road_width: ["6.10 M", "9.15 M", "12.20 M", "13.40 M", "18.3 M", "27.45 M", "36.6 M"],

  calender_view_type: ["Month", "Week", "Day"],

  event_type: ["Task", "Meeting", "Conference Room Booking"],

  conference_room_name: ["Room 1", "Room 2", "Room 3"],

  occupationType: ["Business", "Homemaker", "Professional", "Salaried", "Retired"],

  budget: [
    "<1",
    "1.5",
    "2",
    "2.5",
    "3",
    "3.5",
    "4",
    "4.5",
    "5",
    "5.5",
    "6",
    "6.5",
    "7",
    "7.5",
    "8",
    "8.5",
    "9",
    "9.5",
    "10",
    "10.5",
    "11",
    "11.5",
    "12",
    "12.5",
    "15",
    "15.5",
    "20",
    "20.5",
    "25+",
  ],

  accomodation: ["Rented", "Self-Owned"],

  requirement: ["Commercial", "Commercial Leasing", "Residential"],

  possessionType: ["RTMI", "Under 1 Year", "1 Years To 2 Years", "2 Years To 3 Years", "3 Years & Above"],

  source: ["Channel Partner", "Direct Walkin"],

  subSources: [
    "Advertisement",
    "Exhibition",
    "Employee Reference",
    "HRR Website",
    "Loyalty",
    "Management Reference",
    "Property Search Portal",
    "SMS",
    "Site Branding",
    "Reference",
    "Other",
  ],

  subSubsource: ["Facebook", "Hoarding", "Instagram", "Google Ads", "Newspaper"],

  subSubsource_channelPartner: ["Channel Partner Data Calling", "Channel Partner Walked IN", "Digital Activity"],

  finalStage: [
    "Follow - Up",
    "Site Visit",
    "Re - Visit Proposed",
    "Re - Visit Scheduled",
    "Re - Visit",
    "Repeat Re - Visit",
    "Negotiation",
    "Unit Selection / Blocked",
    "Booking Done",
    "Blocked",
    "Cancelled",
    "Retention",
    "Lost",
  ],

  finalStageDetail: [
    "Purchased with competition",
    "Purchased somewhere else",
    "Not connected calls >7",
    "Low Budget",
    "Ready Possession",
    "Location",
    "Product Issue",
    "Pricing Issue",
    "Payment Issue",
    "Loan Issue",
    "Inventory Issue",
    "General Enquiry",
    "Wrong Number",
    "Dropped The Idea Of Buying",
    "Booked Somewhere Else",
  ],

  age: ["21-25", "26-35", "36-45", "46-55", "56-65", ">65"],

  desiredFloorBand: ["Higher", "Middle", "Lower"],

  neighborhoodPlaces: [
    "Creche",
    "Colleges",
    "Gardens",
    "Gyms",
    "Hospitals",
    "IT Parks",
    "Multiplexes",
    "Nightclubs",
    "Place of Worship",
    "Restaurants",
    "Schools",
    "Others",
  ],

  customerclassification: ["Hot", "Warm", "Cold"],

  sourceOfFunding: ["Loan", "Self-funded", "Sale Of Property"],

  ethnicity: [
    "Bengali",
    "Christian",
    "Gujarati",
    "Jain",
    "Muslim",
    "Marwari",
    "Maharashtrian",
    "North Indian",
    "Parsi",
    "Punjabi",
    "Sindhi",
    "South Indian",
    "Others",
  ],

  nationality: ["Indian", "NRI"],

  reasonsOfJobLeaving: [
    "Better career growth opportunity",
    "Business shutdown",
    "Career break for family reasons",
    "Career change / domain shift",
    "Company financial instability",
    "Company relocation",
    "Company restructuring / downsizing",
    "Completed internship / traineeship",
    "Contract completed",
    "Department closed",
    "End of probation period",
    "Extensive travel requirements",
    "Family responsibilities",
    "Freelancing / consulting interest",
    "Health issues in family",
    "Limited promotion opportunities",
    "Limited salary growth",
    "Long commute distance",
    "Looking for a more flexible work culture",
    "Looking for a more structured environment",
    "Looking for new challenges",
    "Management / organizational change",
    "Marriage relocation",
    "Moving closer to home",
    "Moving into leadership role",
    "Mutual separation",
    "Parental care responsibility",
    "Personal health reasons",
    "Professional certification / training",
    "Project successfully completed",
    "Pursuing higher education",
    "Relocation to another city",
    "Relocation to another country",
    "Retirement / early retirement",
    "Returning back to home country",
    "Role not matching my skills",
    "Role redundancy",
    "Seasonal job completed",
    "Seeking fair compensation",
    "Shift timing not suitable long-term",
    "Spouse / family relocation",
    "Starting my own business",
    "Temporary role ended",
    "Unstable work schedule",
    "Work profile / job expectation mismatch",
    "Work-life balance improvement",
  ],

  ctc_earning: [
    "Basic Salary",
    "HRA",
    "DA",
    "Conveyance Allowance",
    "Medical Allowance",
    "Special Allowance",
    "Other Allowance",
    "LTA",
    "Performance Bonus",
    "Incentive",
    "Variable Pay",
    "Annual Bonus",
    "Joining Bonus",
    "Retention Bonus",
    "Mobile Reimbursement",
    "Internet Reimbursement",
    "Fuel Reimbursement",
    "Food Allowance",
    "Shift Allowance",
    "Night Shift Allowance",
    "City Compensatory Allowance",
    "Employer PF",
    "Employer ESI",
    "Gratuity",
    "Superannuation",
    "NPS Employer",
    "Health Insurance",
    "Overtime Pay",
    "Leave Encashment",
    "Arrears",
    "Ex-Gratia",
    "Relocation Allowance",
  ],
  leaveTypeMaster: [
    "Adoption - Adoption Leave",
    "Birthday - Birthday Leave",
    "CL - Casual Leave",
    "CO - Compensatory Off",
    "ChildCare - Child Care Leave",
    "Conference - Conference / Seminar Leave",
    "Emergency - Emergency Leave",
    "LOP - Loss of Pay",
    "Marriage - Marriage Leave",
    "Maternity - Maternity Leave",
    "Paternity - Paternity Leave",
    "PL - Privilege / Paid Leave",
    "SL - Sick Leave",
  ],
  weekdays: ["1", "2", "3", "4", "5", "6"],

  weekoff_type: ["Every", "Alt(2,4)", "Alt(1,3)", "1st", "2nd", "3rd", "4th", "5th"],
  leavePeriodMode: ["Yearly", "Monthly"],

  inventoryFlatStatus: ["Available", "Booked", "Blocked", "Hold", "Alloted"],

  parkingCategory: [
    "Surface Parking",
    "Stack Parking",
    "Puzzle Parking",
    "Tower Parking",
    "Pit Puzzle Parking",
    "Cantilever Parking",
    "Tandem Parking",
    "Podium Parking",
    "Pit + Stack",
  ],

  parkingSubCategory_StackParking: ["PIT 1", "PIT 2", "PIT 3", "PIT 4", "PIT 5", "ST 1", "ST 2", "ST 3", "ST 4", "ST 5", "GROUND"],

  parkingSubCategory_SurfaceParking: ["SU 1", "GROUND"],

  parkingSubCategory_PuzzleParking: ["PU 1", "GROUND"],

  parkingSubCategory_TowerParking: ["TO 1", "GROUND"],

  parkingSubCategory_PitPuzzleParking: ["PIT 1", "GROUND"],

  parkingSubCategory_CantileverParking: ["CAN 1", "GROUND"],

  parkingSubCategory_TandemParking: ["TAN 1", "GROUND"],

  parkingSubCategory_PodiumParking: ["PO 1", "GROUND"],

  parkingSubCategory_Pit_StackParking: ["Pit + Stack 1", "Pit + Stack 2", "Pit + Stack 3", "Pit + Stack 4", "Pit + Stack 5", "GROUND"],

  parkingSize: ["Big", "Small"],

  parkingStatus: ["Available", "Blocked", "Hold", "Member"],

  // unitLayout: ['Entire Flat','Living / Dining', 'Passage', 'Kitchen', 'Toilet', 'Master Bed Room', 'Main Door JAMB', 'KIT / Bed Door Jamb', 'Toilet Door Jamb'],

  unitLayout: ["Entire Flat"],

  caseType: ["Civil", "Criminal"],

  courtType: [
    "Charity Commissioner",
    "City Civil and Sessions Court",
    "Civil Court",
    "Co-operative Court",
    "Debt Recovery Tribunal",
    "District Court",
    "District Deputy Registrar",
    "High Court",
    "Industrial / Labour Courts",
    "MahaRERA",
    "MahaREAT",
    "Metropolitan Magistrate Court",
    "National Consumer Dispute Redressal Commission",
    "Small Causes Court",
    "State Consumer Dispute Redressal Commission",
    "Supreme Court of India",
  ],

  paymentMode: ["Cheque", "Demand Draft", "IMPS", "NEFT", "Online Transfer", "RTGS", "UPI"],

  paymentType: ["Advance", "Late Fee", "Penalty", "Regular"],

  amountType: ["Monthly", "One Time", "Quarterly", "Yearly"],

  channelPartnerDesignation: ["Business Head", "Cluster Head", "Owner", "Partner", "Team Member"],

  channelPartnerType: ["International Channel Partner (IPC)", "Institutional Channel Partner (ICP)", "Retail Channel Partner (RCP)"],

  enquiryTimeLine: ["Beyond 1 Month", "Within 1 Month"],

  supportType: ["Below The Line (BTL)", "Paper Insert", "Standee Require", "Vedio Recording"],

  handoverType: ["Bare Shell", "Builder Finished"],

  reportType: ["Date", "Year"],

  year: [
    "2025",
    "2026",
    "2027",
    "2028",
    "2029",
    "2030",
    "2031",
    "2032",
    "2033",
    "2034",
    "2035",
    "2036",
    "2037",
    "2038",
    "2039",
    "2040",
    "2041",
    "2042",
  ],

  monthsShots: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

  activeInactive: ["Active", "Inactive"],

  paymentFor: [
    "Stamp Duty",
    "Registration Fees",
    "Agreement Value (Without TDS)",
    "Agreement Value GST",
    "Agreement Value TDS",
    "Other Charges Value",
    "Other Charges GST"
  ],

  paymentReceivedFrom: ["Bank", "Owner"],

  crmPayTrackFileName: [
    "Possession Letter",
    "OC/CC Letter",
    "Tax Receipt",
    "Society Deed",
    "Electricity & Water",
    "Maintenance Docs",
    "Registered Agreement",
    "Parking Allotment",
  ],

  callStatus: ["Connected", "Not Connected", "Wrong Number", "Switched Off", "Busy", "No Answer", "Disconnected", "Rescheduled"],

  callPurpose: [
    "Complaint",
    "Welcome Call",
    "Payment Follow - UP",
    "Registration Follow - UP",
    "Reminder",
    "Query Resolution",
    "Feedback",
    "Complaint",
    "Other",
  ],

  deliveryStatus: ["Acknowledged", "Delivered"],

  deliveryMode: ["Courier", "Hand-To-Hand"],

  documentType: ["Inward", "Outward"],

  reasonForInactivity: ["Firm Closed", "Key SPOC left", "Brokerage Pending", "Did not like project/brand"],


  platform: ["ERP", "Application", "Website"],

  module: [
    "Dashboard",
    "Inventory",
    "Project Document",
    "Legal",
    "Marketing",
    "Procurement",
    "Project",
    "Stock Management",
    "Channel Partner",
    "Sale",
    "CRM",
    "Setting",
    "Payroll",
    "Redevelopment",
    "Operation",
  ],

  assignStatusType: ["Open", "Assigned", "InProgress", "Resolved", "Closed", "ReOpen"],

  handOverStatus: ["Yes", "No", "Pending", "N/A"],

  ibmObmRangeFilter: [
    "Below 10",
    "Between 11 And 50",
    "Between 51 And 100",
    "Between 101 And 200",
    "Between 201 And 300",
    "Between 301 And 400",
    "Between 401 And 500",
    "Above 501"
  ],

  channelPartnerCategory: ["P1", "P2", "P3", "P4"],

  ibmObmReportStage: ["IBM", "OBM"],

  noticeType: ['Income Tax', 'GST'],

  budgetLevelType: ["L1", "L2", "L3"],

} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const toOptions = (list: readonly string[]): Option[] => list.map((item) => ({ id: item, name: item }));

export const filterOptions = (options: Option[], searchTerm: string = ""): Option[] =>
  !searchTerm.trim() ? options : options.filter((opt) => opt.name.toLowerCase().includes(searchTerm.toLowerCase()));

// ============================================================================
// READY-TO-USE OPTION ARRAYS
// (For direct use in select components)
// ============================================================================

export const EMERGENCY_RELATION_OPTIONS = toOptions(MASTER_DATA.emergencyRelations);
export const EMPLOYEE_TYPE_OPTIONS = toOptions(MASTER_DATA.employeeTypes);
export const GENDER_OPTIONS = toOptions(MASTER_DATA.genders);
export const MONTHS_OPTIONS = toOptions(MASTER_DATA.months);
export const MONTHS_SHOT_OPTIONS = toOptions(MASTER_DATA.monthsShots);
export const DEDUCTION_TYPE_OPTIONS = toOptions(MASTER_DATA.deductionType);
export const DAYS_OPTIONS = toOptions(MASTER_DATA.days);
export const MARITAL_STATUS_OPTIONS = toOptions(MASTER_DATA.maritalStatuses);
export const BLOOD_GROUP_OPTIONS = toOptions(MASTER_DATA.bloodGroups);
export const FIRMS_TYPE_OPTIONS = toOptions(MASTER_DATA.firmsType);
export const COMPANY_TYPE_OPTIONS = toOptions(MASTER_DATA.companyType);
export const PROJECT_STATUS_OPTIONS = toOptions(MASTER_DATA.projectStatus);
export const BUSINESS_CATEGORY_OPTIONS = toOptions(MASTER_DATA.businessCategory);
export const PROJECT_DOCUMENT_STATUS = toOptions(MASTER_DATA.documentStatus);
export const ACCOMODATION_TYPE_OPTIONS = toOptions(MASTER_DATA.accomodation);
export const REQUIREMENT_TYPE_OPTIONS = toOptions(MASTER_DATA.requirement);
export const BUDGET_TYPE_OPTIONS = toOptions(MASTER_DATA.budget);
export const OCCUPATION_TYPE_OPTIONS = toOptions(MASTER_DATA.occupationType);
export const SOURCE_TYPE_OPTIONS = toOptions(MASTER_DATA.source);
export const SUBSOURCE_TYPE_OPTIONS = toOptions(MASTER_DATA.subSources);
export const SUB_SUB_SOURCE_TYPE_OPTIONS = toOptions(MASTER_DATA.subSubsource);
export const SUB_SUB_SOURCE_CHANNEL_PARTNER_OPTIONS = toOptions(MASTER_DATA.subSubsource_channelPartner);
export const FINAL_STAGE_TYPE_OPTIONS = toOptions(MASTER_DATA.finalStage);
export const FINAL_STAGE_DETAILS_TYPE_OPTIONS = toOptions(MASTER_DATA.finalStageDetail);
export const AGE_TYPE_OPTION = toOptions(MASTER_DATA.age);
export const NEIGHBORHOOD_PLACES_TYPE_OPTION = toOptions(MASTER_DATA.neighborhoodPlaces);
export const DESIRED_FLOOR_BAND = toOptions(MASTER_DATA.desiredFloorBand);
export const CUSTOMER_CLASSIFICATION_TYPE = toOptions(MASTER_DATA.customerclassification);
export const SOURCE_OF_FUNDING_TYPE = toOptions(MASTER_DATA.sourceOfFunding);
export const ETHNICITY_TYPE_OPTION = toOptions(MASTER_DATA.ethnicity);
export const POSSESSION_TYPE_OPTIONS = toOptions(MASTER_DATA.possessionType);
export const NATIONALITY_TYPE_OPTION = toOptions(MASTER_DATA.nationality);
export const BANK_ACCOUNT_TYPE = toOptions(MASTER_DATA.bankAccountType);
export const NATURE_OF_ACCOUNT = toOptions(MASTER_DATA.natureOfAccount);
export const LAND_OWNERSHIP_TYPE = toOptions(MASTER_DATA.landOwnershipType);
export const FLAT_UNIT_TYPE = toOptions(MASTER_DATA.flat_unit_Type);
export const RESIDENTIAL_FLAT_CONFIGURATION = toOptions(MASTER_DATA.residential_flat_configuration_Type);
export const COMMERCIAL_FLAT_CONFIGURATION = toOptions(MASTER_DATA.commercial_flat_configuration_Type);
export const FLAT_UNIT_FACING = toOptions(MASTER_DATA.flat_unit_facing);
export const APPLICANT_TYPE = toOptions(MASTER_DATA.applicant_type);
export const CARPET_AREA_TYPE = toOptions(MASTER_DATA.carpet_area_type);
export const TENURE = toOptions(MASTER_DATA.tenure);
export const UNIT_SQFT_LUMPSUM = toOptions(MASTER_DATA.unit_sqft_lumsum);
export const SPECIALITY_TYPE = toOptions(MASTER_DATA.speciality_type);
export const PROJECT_CATEGORY = toOptions(MASTER_DATA.project_category);
export const BUSINESS_CATEGORY = toOptions(MASTER_DATA.business_category);
export const PROJECT_SCHEME = toOptions(MASTER_DATA.project_scheme);
export const PROJECT_SUB_SCHEME_BMC = toOptions(MASTER_DATA.project_sub_scheme_BMC);
export const PROJECT_SUB_SCHEME_MHADA = toOptions(MASTER_DATA.project_sub_scheme_MHADA);
export const PROJECT_SUB_SCHEME_SRA = toOptions(MASTER_DATA.project_sub_scheme_SRA);
export const ROAD_WIDTH = toOptions(MASTER_DATA.road_width);
export const CALENDER_VIEW_TYPE = toOptions(MASTER_DATA.calender_view_type);
export const EVENT_TYPE = toOptions(MASTER_DATA.event_type);
export const CONFERENCE_ROOM_NAME = toOptions(MASTER_DATA.conference_room_name);
export const REASONS_OF_JOB_LEAVING_OPTIONS = toOptions(MASTER_DATA.reasonsOfJobLeaving);
export const CTC_EARNINGS = toOptions(MASTER_DATA.ctc_earning);
export const LEAVE_TYPE_MASTER = toOptions(MASTER_DATA.leaveTypeMaster);
export const WEEKDAYS = toOptions(MASTER_DATA.weekdays);
export const WEEK_OFF_TYPE = toOptions(MASTER_DATA.weekoff_type);
export const LEAVE_PERIOD_MODES = toOptions(MASTER_DATA.leavePeriodMode);
export const INVENTORY_FLAT_STATUS = toOptions(MASTER_DATA.inventoryFlatStatus);
export const PARKING_CATEGORY = toOptions(MASTER_DATA.parkingCategory);
export const PARKING_SUBCATEGORY_STACK = toOptions(MASTER_DATA.parkingSubCategory_StackParking);
export const PARKING_SUBCATEGORY_SURFACE = toOptions(MASTER_DATA.parkingSubCategory_SurfaceParking);
export const PARKING_SUBCATEGORY_PUZZLE = toOptions(MASTER_DATA.parkingSubCategory_PuzzleParking);
export const PARKING_SUBCATEGORY_TOWER = toOptions(MASTER_DATA.parkingSubCategory_TowerParking);
export const PARKING_SUBCATEGORY_PIT_PUZZLE = toOptions(MASTER_DATA.parkingSubCategory_PitPuzzleParking);
export const PARKING_SUBCATEGORY_CANTILEVER = toOptions(MASTER_DATA.parkingSubCategory_CantileverParking);
export const PARKING_SUBCATEGORY_TANDEM = toOptions(MASTER_DATA.parkingSubCategory_TandemParking);
export const PARKING_SUBCATEGORY_PODIUM = toOptions(MASTER_DATA.parkingSubCategory_PodiumParking);
export const PARKING_SUBCATEGORY_PIT_STACK = toOptions(MASTER_DATA.parkingSubCategory_Pit_StackParking);
export const PARKING_SIZE = toOptions(MASTER_DATA.parkingSize);
export const PARKING_STATUS = toOptions(MASTER_DATA.parkingStatus);
export const UNIT_LAYOUT = toOptions(MASTER_DATA.unitLayout);
export const CASE_TYPE_OPTION = toOptions(MASTER_DATA.caseType);
export const COURT_TYPE_OPTION = toOptions(MASTER_DATA.courtType);

export const PAYMENT_MODE = toOptions(MASTER_DATA.paymentMode);
export const HANDOVER_TYPE = toOptions(MASTER_DATA.handoverType);
export const PAYMENT_TYPE = toOptions(MASTER_DATA.paymentType);
export const AMOUNT_TYPE = toOptions(MASTER_DATA.amountType);
export const CHANNE_PARTNER_DESIGNATION = toOptions(MASTER_DATA.channelPartnerDesignation);
export const CHANNE_PARTNER_TYPE = toOptions(MASTER_DATA.channelPartnerType);
export const ENQUIRY_TIMELINE = toOptions(MASTER_DATA.enquiryTimeLine);
export const SUPPORT_TYPE_OPTIONS = toOptions(MASTER_DATA.supportType);
export const REPORT_TYPE_OPTIONS = toOptions(MASTER_DATA.reportType);
export const YEAR_OPTIONS = toOptions(MASTER_DATA.year);
export const ACTIVE_INACTIVE_OPTIONS = toOptions(MASTER_DATA.activeInactive);
export const PAYMENT_FOR_OPTIONS = toOptions(MASTER_DATA.paymentFor);
export const PAYMENT_RECEIVED_FROM_OPTIONS = toOptions(MASTER_DATA.paymentReceivedFrom);
export const CRM_PAY_TRACK_FILE_NAME_OPTIONS = toOptions(MASTER_DATA.crmPayTrackFileName);
export const CALL_STATUS_OPTIONS = toOptions(MASTER_DATA.callStatus);
export const CALL_PURPOSE_OPTIONS = toOptions(MASTER_DATA.callPurpose);
export const DELIVERY_STATUS = toOptions(MASTER_DATA.deliveryStatus);
export const DELIVERY_MODE = toOptions(MASTER_DATA.deliveryMode);
export const DOCUMENT_TYPE = toOptions(MASTER_DATA.documentType);
export const REASON_FOR_INAACTIVITY = toOptions(MASTER_DATA.reasonForInactivity);
export const PLATFORM_OPTIONS = toOptions(MASTER_DATA.platform);
export const MODULE_OPTIONS = toOptions(MASTER_DATA.module);
export const ASSIGN_STATUS_TYPE_OPTIONS = toOptions(MASTER_DATA.assignStatusType);
export const HANDOVER_STATUS = toOptions(MASTER_DATA.handOverStatus);
export const IBM_OBM_RANGE_FILTER_OPTIONS = toOptions(MASTER_DATA.ibmObmRangeFilter);
export const CHANNEL_PARTNER_CATEGORY_OPTIONS= toOptions(MASTER_DATA.channelPartnerCategory);
export const IBM_OBM_REPORT_STAGE_OPTIONS = toOptions(MASTER_DATA.ibmObmReportStage);
export const NOTICE_TYPE_OPTIONS = toOptions(MASTER_DATA.noticeType);
export const BUDGET_LEVEL_TYPE = toOptions(MASTER_DATA.budgetLevelType);

// ============================================================================
// AMENITY CATEGORIES (Only for UI Grouping)
// ============================================================================

export const AMENITY_CATEGORIES: Record<string, readonly string[]> = {
  "Safety & Security": [
    "24x7 Security",
    "CCTV Surveillance",
    "Fire Fighting System",
    "First Aid Room",
    "Intercom Facility",
    "Security Cabin",
    "Earthquake Resistant Structure",
  ],

  "Sports & Fitness": [
    "Swimming Pool",
    "Gym",
    "Yoga Room",
    "Jogging Track",
    "Badminton Court",
    "Basketball Court",
    "Tennis Court",
    "Squash Court",
    "Table Tennis",
    "Kids Pool",
    "Indoor Games",
    "Cycling Track",
  ],

  "Community & Social Spaces": [
    "Club House",
    "Banquet Hall",
    "Amphitheatre",
    "Library",
    "Reading Room",
    "Society Office",
    "Temple / Prayer Hall",
  ],

  "Kids & Family": ["Children Play Area", "Creche", "Day Care Centre", "School Bus Bay"],

  "Pets - Friendly Facilities": ["Pet Park", "Pet Care Area"],

  "Work & Business": ["Co - Working Space", "Conference Room", "Society Office"],

  "Convenience & Utilities": [
    "Lift",
    "Power Backup",
    "Water Supply",
    "Parking",
    "Visitor Parking",
    "Covered Parking",
    "EV Charging Points",
    "Laundry Service",
    "Garbage Disposal System",
    "Sewage Treatment Plant",
    "Rainwater Harvesting",
    "Service Lift",
  ],
  "Health & Wellness": ["Spa", "Steam Room", "Meditation Area", "Jacuzzi"],

  "Commercial & Services": ["ATM", "Pharmacy", "Convenience Store", "Co-working Space", "Cafeteria"],
};
export const AMENITIES_BY_CATEGORY = Object.entries(AMENITY_CATEGORIES).map(([category, items]) => ({
  category,
  options: items.map((item) => ({
    label: item,
    value: item,
  })),
}));
