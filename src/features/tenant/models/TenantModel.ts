import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationTenantRequest {
  PageSize: number
  PageNumber: number
  IsCheckPermission?: boolean
  ProjectId?: number
  BuildingId?: number
  TenantId?: number
  FlatNumber?: string | ''
  ApplicantName?: string | ''
  FlatConfiguration?: string | ''
  FlatType?: string | ''
  FlatCarpetAreaSqFt?: string | ''
  BuildingNumber?: string | ''
  Wing?: string | ''
  Flat?: string | ''
  ParkingNumber?: string | ''
  SortBy?: string
  UnitAnnexureSurveyNumber?: string | '';
  UnitCarpetAreaSqFt?: number;
  UnitFacing?: string | '';
  UnitType?: string | '';
  UnitConfiguration?: string | '';
  ExportType?: 'Excel' | 'PDF'
}

export interface TenantData {
  TenantId: number;
  Uniquekey: string | null;
  SystemGeneratedCode:string | null;
  ProjectId: number;
  BuildingId: number;

  InventoryFlatId: number | null;
  BuildingNumber: string | null;
  Wing: string | null;
  Floor: string | null;
  Flat: string | null;
  FlatFacing: string | null;
  RERACarpetAreaSqFt: number | null;
  InventoryFlatType: string | null;
  InventoryFlatConfiguration: string | null;

  ParkingData: Parking[];
  ParkingNumber: string | null;
  ParkingId: string | null;
  TenantApplicantData: TenantApplicant[];
  UnitAnnexureSurveyNumber: string | null;
  UnitCarpetAreaSqFt: number;
  UnitFacing: string | null;
  UnitType: string | null;
  UnitConfiguration: string | null;

  ExtraFreeCarpetAreaOfferedPercent: number;
  FreeMOFACarpetAreaSqFt: number;
  NewEligibilityMOFACarpetAreaSqFt: number;
  NewEligibilityRERACarpetAreaSqFt: number;
  MOFACarpetAreaPurchasedSqFt: number;
  RERACarpetAreaPurchasedSqFt: number;
  TotalNewMOFACarpetAreaSqFt: number;
  TotalNewRERACarpetAreaSqFt: number;
  DeckAreaSqFt: number;
  TotalNewRERACarpetAreaWithDeckSqFt: number;
  ExistingTerraceAreaSqFt: number;
  AreaAgainstTerraceSqFt: number;
  Remark: string | null;
  CreatedById: number | 0
  CreatedBy: string | ''
  CreatedDate: string | null
  ModifiedById: number | 0
  ModifiedBy: string | ''
  ModifiedDate: string | null
  LastModifiedBy: string | ''
  LastModifiedDate: string | null

  BookingId: number | null;
  ApplicantName?: string | null;
}

export interface Parking {
  ParkingId?: number | null;
  ParkingNumber?: string | null;

}

export interface TenantApplicant {
  TenantApplicantId: number | null;
  TenantId: number;
  BuildingId: number;
  ProjectId: number;

  ApplicantType: string | null;
  ApplicantName: string | null;
  ApplicantMobileNumberCountryCode: string | null;
  ApplicantMobileNumber: string | null;
  ApplicantEmailId: string | null;

  PhotoURL: string | null;

  AadharCardNumber: string | null;
  AadharCardURL: string | null;

  PanNumber: string | null;
  PanCardURL: string | null;

  PassportNumber: string | null;
  PassportURL: string | null;

  DrivingLicenseNumber: string | null;
  DrivingLicenseURL: string | null;

  VotingIdNumber: string | null;
  VotingIdURL: string | null;

  GSTNumber: string | null;
  GSTNumberURL: string | null;

  BankListMasterId: number | null;
  BankName: string | null;
  AccountNumber: string | null;
  IFSCCode: string | null;
  ChequeURL: string;

  CreatedById: number | 0
  CreatedBy: string | ''
  CreatedDate: string | null
  ModifiedById: number | 0
  ModifiedBy: string | ''
  ModifiedDate: string | null
  LastModifiedBy: string | ''
  LastModifiedDate: string | null
}

export interface AddUpdateTenantRequest {
  TenantId: number;
  Uniquekey: string | null;
  BuildingId: number;
  ProjectId: number;

  UnitAnnexureSurveyNumber: string;
  UnitCarpetAreaSqFt: number;
  UnitFacing: string | null;
  UnitType: string;
  UnitConfiguration: string | null;

  ExtraFreeCarpetAreaOfferedPercent: number;
  FreeMOFACarpetAreaSqFt: number;
  NewEligibilityMOFACarpetAreaSqFt: number;
  NewEligibilityRERACarpetAreaSqFt: number;
  MOFACarpetAreaPurchasedSqFt: number;
  RERACarpetAreaPurchasedSqFt: number;
  TotalNewMOFACarpetAreaSqFt: number;
  TotalNewRERACarpetAreaSqFt: number;
  DeckAreaSqFt: number;
  TotalNewRERACarpetAreaWithDeckSqFt: number;

  ExistingTerraceAreaSqFt: number;
  AreaAgainstTerraceSqFt: number;
  Remark: string | null;


}

export interface AddUpdateTenantApplicant {
  TenantApplicantId: number | null;
  TenantId: number;
  BuildingId: number;
  ProjectId: number;

  ApplicantType: string | null;
  ApplicantName: string | null;
  ApplicantMobileNumberCountryCode: string | null;
  ApplicantMobileNumber: string | null;
  ApplicantEmailId: string | null;

  // Profile photo files and remove URL token(s)
  PhotoURL: File[] | null;
  RemovePhotoURL: string;

  // Aadhar
  AadharCardNumber: string | null;
  AadharCardURL: File[] | null;
  RemoveAadharCardURL: string;

  // PAN
  PanNumber: string | null;
  PanCardURL: File[] | null;
  RemovePanCardURL: string;

  // Passport
  PassportNumber: string | null;
  PassportURL: File[] | null;
  RemovePassportURL: string;

  // Driving License
  DrivingLicenseNumber: string | null;
  DrivingLicenseURL: File[] | null;
  RemoveDrivingLicenseURL: string;

  // Voting ID
  VotingIdNumber: string | null;
  VotingIdURL: File[] | null;
  RemoveVotingIdURL: string;

  // GST
  GSTNumber: string | null;
  GSTNumberURL: File[] | null;
  RemoveGSTNumberURL: string;

  // Bank details
  BankListMasterId: number | null;
  AccountNumber: string | null;
  IFSCCode: string | null;
  ChequeURL: File[] | null;
  RemoveChequeURL: string;
}

export interface DeleteTenantRequest {
  TenantId: number
  UniqueKey: string
  BuildingId: number
  ProjectId: number
}

export type TenantListResponse = ApiResponse<TenantData[]>;
export type TenantSaveResponse = ApiResponse<TenantData[]>;
export type TenantDeleteResponse = ApiResponse<number>;


// ================[TENANT DOCUMENT REQUIEST]======================

export interface FilterWithPaginationTenantDocumentRequest {
  PageSize: number
  PageNumber: number
  IsCheckPermission?: boolean
  ProjectId?: number
  BuildingId?: number
  TenantId?: number
  TenantDocumentId?: number
  DocumentName?: string | ''
  SortBy?: string
  ExportType?: 'Excel' | 'PDF'
}


export interface TenantDocumentData {
  TenantDocumentId: number | null;
  Uniquekey: string | null;
  TenantId: number | null;
  BuildingId: number;
  ProjectId: number;
  DocumentName: string;
  DocumentURL: string | null;

  CreatedById: number | 0
  CreatedBy: string | ''
  CreatedDate: string | null
  ModifiedById: number | 0
  ModifiedBy: string | ''
  ModifiedDate: string | null
  LastModifiedBy: string | ''
  LastModifiedDate: string | null
}

export interface AddUpdateTenantDocumentRequest {
  TenantDocumentId: number | null;
  Uniquekey: string | null;
  TenantId: number | null;
  BuildingId: number;
  ProjectId: number;
  DocumentName: string | null;

  DocumentURL: File[] | null;
  RemoveDocumentURL: string;

}

export interface DeleteTenantDocumentRequest {
  TenantDocumentId: number | null;
  Uniquekey: string | null;
  TenantId: number | null;
  BuildingId: number | null;
  ProjectId: number | null;
}

export type TenantDocumentListResponse = ApiResponse<TenantDocumentData[]>;
export type TenantDocumentSaveResponse = ApiResponse<TenantDocumentData[]>;
export type TenantDocumentDeleteResponse = ApiResponse<number>;

// public class AddUpdateTenant
// {
//     public int TenantId { get; set; } = 0;
//     public Guid? Uniquekey { get; set; } = Guid.NewGuid();
//     public int BuildingId { get; set; } = 0;
//     public int ProjectId { get; set; } = 0;
//     public string UnitAnnexureSurveyNumber { get; set; } = string.Empty;        // (T) Flat Number
//     public decimal? UnitCarpetAreaSqFt { get; set; } = 0;            // (T) Carpet Area
//     public string? UnitFacing { get; set; } = string.Empty;                         // (D) North, South, East, West
//     public string UnitType { get; set; } = string.Empty;          // (D) Residential / Commercial
//     public string? UnitConfiguration { get; set; } = string.Empty;               // (D) 1BHK, 2BHK, Shop, Office

//     //============================================================= [TENANT OFFER] ======================================================================================
//     public decimal? ExtraFreeCarpetAreaOfferedPercent { get; set; } = 0;
//     public decimal? FreeMOFACarpetAreaSqFt { get; set; } = 0;
//     public decimal? NewEligibilityMOFACarpetAreaSqFt { get; set; } = 0;
//     public decimal?  NewEligibilityRERACarpetAreaSqFt { get; set; } = 0;
//     public decimal?  MOFACarpetAreaPurchasedSqFt { get; set; } = 0;
//     public decimal?  RERACarpetAreaPurchasedSqFt { get; set; } = 0;
//     public decimal?  TotalNewMOFACarpetAreaSqFt { get; set; } = 0;
//     public decimal?  TotalNewRERACarpetAreaSqFt { get; set; } = 0;
//     public decimal?  DeckAreaSqFt { get; set; } = 0;
//     public decimal? TotalNewRERACarpetAreaWithDeckSqFt { get; set; } = 0;
// }


