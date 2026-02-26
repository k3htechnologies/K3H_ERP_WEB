export interface VerificationStep {
    id: string;
    label: string;
    completed: boolean;
}

interface ChannelPartnerVerificationParams {
    formData: any;
    panCardURLFiles?: (File | string)[];
    aadharCardURLFiles?: (File | string)[];
    gSTCertificateURLFiles?: (File | string)[];
    panCardURL?: string;
    aadharCardURL?: string;
    gSTCertificateURL?: string;
}

export const getChannelPartnerVerificationSteps = ({
    formData,
    panCardURLFiles = [],
    aadharCardURLFiles = [],
    gSTCertificateURLFiles = [],
    panCardURL,
    aadharCardURL,
    gSTCertificateURL
}: ChannelPartnerVerificationParams): VerificationStep[] => {

    // BASIC DETAILS
    const isBasicCompleted =
        !!formData.Name &&
        !!formData.MobileNumber &&
        !!formData.CompanyName &&
        !!formData.Designation &&
        !!formData.Type &&
        !!formData.FirmsType;

    // RERA
    const isRERACompleted =!!formData.RERANumber;

    // SPECIALITY
    const isSpecialityCompleted = !!formData.Speciality;

    // DOCUMENT
    const isDocumentCompleted =
        (
            !!formData.PanNumber &&
            (panCardURLFiles.length > 0 || !!panCardURL)
        )
        ||
        (
            !!formData.AadharCardNumber &&
            (aadharCardURLFiles.length > 0 || !!aadharCardURL)
        )
        ||
        (
            !!formData.GSTNumber &&
            (gSTCertificateURLFiles.length > 0 || !!gSTCertificateURL)
        );

    // ADDRESS
    const isAddressCompleted =
        !!formData.CountryMasterId &&
        !!formData.StateMasterId &&
        !!formData.DistrictMasterId &&
        !!formData.CityMasterId &&
        !!formData.VillageMasterId &&
        !!formData.OfficeAddress;

    return [

        {
            id: "basic",
            label: "Basic Details",
            completed: isBasicCompleted
        },

        {
            id: "rera",
            label: "RERA Details",
            completed: isRERACompleted
        },

        {
            id: "speciality",
            label: "Speciality",
            completed: isSpecialityCompleted
        },

        {
            id: "document",
            label: "Document Details",
            completed: isDocumentCompleted
        },

        {
            id: "address",
            label: "Address Details",
            completed: isAddressCompleted
        }

    ];
};