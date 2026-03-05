import type { ChannelPartnerData } from "@/features/ChannelPartner/models/ChannelPartnerModel";

export const isChannelPartnerComplete = (channelPartner: ChannelPartnerData): boolean => {
  const requiredFields: (keyof ChannelPartnerData)[] = [
    "Name",
    "CompanyName",
    "FirmsType",
    "Designation",
    "Type",
    "MobileNumber",
    "EmailId",
    "OfficeAddress",
    "GSTNumber",
    "GSTCertificateURL",
    "PanNumber",
    "PanCardURL",
    "AadharCardURL",
    "AadharCardNumber",
    "CountryMasterId",
    "StateMasterId",
    "DistrictMasterId",
    "CityMasterId",
    "VillageMasterId",
    "Speciality"
  ];

  return requiredFields.every((field) => {
    const value = channelPartner[field];

    return (
      value !== null &&
      value !== undefined &&
      value.toString().trim() !== ""
    );
  });
};