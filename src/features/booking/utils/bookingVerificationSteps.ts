export interface VerificationStep {
    id: string;
    label: string;
    completed: boolean;
}

export const getBookingVerificationSteps = (formData: any): VerificationStep[] => {

    // Applicant Details
    const isApplicant = true;

    // Project Details
    const isProject = true;

    // Payment Schedule
    const isPaymentSchedule =true;

    // Payment Details
    const isPayment =
        !!formData.PaymentMode ||
        !!formData.BookingAmount ||
        !!formData.TransactionNumber;

    // Other Charges
    const isOtherCharges =
        Array.isArray(formData.OtherCharges)
            ? formData.OtherCharges.length > 0
            : true;

    return [

        {
            id: "applicant",
            label: "Applicant Details",
            completed: isApplicant
        },

        {
            id: "project",
            label: "Project Details",
            completed: isProject
        },

        {
            id: "schedule",
            label: "Payment Schedule",
            completed: isPaymentSchedule
        },

        {
            id: "payment",
            label: "Payment Details",
            completed: isPayment
        },

        {
            id: "other",
            label: "Other Charge Details",
            completed: isOtherCharges
        }

    ];

};