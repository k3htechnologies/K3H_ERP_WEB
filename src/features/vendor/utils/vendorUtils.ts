import type { VendorData } from "@/features/vendor/models/VendorModel";

export const isVendorComplete = (vendor: VendorData): boolean => {
  const requiredFields: (keyof VendorData)[] = [
    "CompanyName",
    "CompanyType",
    "VendorName",
    "MobileNumber",
    "EmailId",
    "AadharCardNumber",
    "PanCardNumber",
    "GSTNumber",
    "Address",
    "CountryMasterId",
    "StateMasterId",
    "DistrictMasterId",
    "CityMasterId"
  ];

  return requiredFields.every((field) => {
    const value = vendor[field];

    return (
      value !== null &&
      value !== undefined &&
      value.toString().trim() !== ""
    );
  });
};