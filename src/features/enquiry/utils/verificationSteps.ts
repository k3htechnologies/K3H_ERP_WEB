import type { VerificationStep } from "@/ui/components/TwoWayVerification/CompleteVerificationSection";
import type { AddUpdateEnquiryRequest } from "@/features/enquiry/models/EnquiryModel";

interface GetVerificationStepsParams {  formData: AddUpdateEnquiryRequest; }

export const getEnquiryVerificationSteps = ({ formData }: GetVerificationStepsParams): VerificationStep[] => {

    // Enquiry Details
    const isEnquiryCompleted =
        !!formData.Name?.trim() &&
        !!formData.MobileNumber?.trim() &&
        !!formData.Accommodation &&
        !!formData.OccupationType;

    // Source Details
    let isSourceCompleted =  !!formData.Source

    

    // Property Preference
    const isPropertyCompleted =
        !!formData.Budget ||
        !!formData.Requirement ||
        !!formData.PossessionType ||
        !!formData.AreaPreferred ||
        !!formData.DesiredFloorBand;

    // Customer Details
    const isCustomerCompleted =
        !!formData.SourceOfFunding ||
        !!formData.Ethnicity;

    // Follow-up Details
    const isFollowUpCompleted = !!formData.EnquiryDate;

    return [

        {
            id: "enquiry",
            label: "Enquiry Details",
            completed: isEnquiryCompleted,
        },

        {
            id: "source",
            label: "Source Details",
            completed: isSourceCompleted,
        },

        {
            id: "property",
            label: "Property Preference",
            completed: isPropertyCompleted,
        },

        {
            id: "customer",
            label: "Customer Details",
            completed: isCustomerCompleted,
        },

        {
            id: "followup",
            label: "Follow-up Details",
            completed: isFollowUpCompleted,
        },

    ];
};