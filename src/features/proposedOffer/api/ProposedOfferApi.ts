export const ProposedOfferApi = {
    //=============================================================
    // [ PDF ]
    //=============================================================
    PULL_PROPOSED_OFFER_PDF: '/ProposedOffer/PullProposedOfferPDF',
    //=============================================================
    // [ EXTRA CARPET ]
    //=============================================================
    PULL_EXTRA_CARPET_AREA: '/ProposedOffer/PullExtraCarpetArea',
    ADD_UPDATE_EXTRA_CARPET_AREA: '/ProposedOffer/AddUpdateExtraCarpetArea',

    //=============================================================
    // [ HARSHIP DETAILS ]
    //=============================================================
    PULL_HARSHIP_DETAILS: '/ProposedOffer/PullHardshipDetails',
    ADD_UPDATE_HARSHIP_DETAILS: '/ProposedOffer/AddUpdateHardshipDetails',
    DELETE_HARSHIP_DETAILS: '/ProposedOffer/DeleteHardshipDetails',

    //=============================================================
    // [ RENT DETAILS ]
    //=============================================================
    PULL_TEMPORARY_ALTERNATE_ACCOMMODATION: '/ProposedOffer/PullTemporaryAlternateAccommodationDetails',
    ADD_UPDATE_TEMPORARY_ALTERNATE_ACCOMMODATION: '/ProposedOffer/AddUpdateTemporaryAlternateAccommodationDetails',
    DELETE_TEMPORARY_ALTERNATE_ACCOMMODATION: '/ProposedOffer/DeleteTemporaryAlternateAccommodationDetails',

    //=============================================================
    // [ SHIFTING DETAILS ]
    //=============================================================
    PULL_SHIFTING_DETAILS: '/ProposedOffer/PullShiftingDetails',
    ADD_UPDATE_SHIFTING_DETAILS: '/ProposedOffer/AddUpdateShiftingDetails',
    DELETE_SHIFTING_DETAILS: '/ProposedOffer/DeleteShiftingDetails',

    //=============================================================
    // [ SECURITY DEPOSIT DETAILS ]
    //=============================================================
    PULL_SECURITY_DEPOSIT_DETAILS: '/ProposedOffer/PullSecurityDepositDetails',
    ADD_UPDATE_SECURITY_DEPOSIT_DETAILS: '/ProposedOffer/AddUpdateSecurityDepositDetails',
    DELETE_SECURITY_DEPOSIT_DETAILS: '/ProposedOffer/DeleteSecurityDepositDetails',

    //=============================================================
    // [ BANK GUARANTEE DETAILS ]
    //=============================================================
    PULL_BANK_GUARANTEE_DETAILS: '/ProposedOffer/PullBankGuaranteeDetails',
    ADD_UPDATE_BANK_GUARANTEE_DETAILS: '/ProposedOffer/AddUpdateBankGuaranteeDetails',
    DELETE_BANK_GUARANTEE_DETAILS: '/ProposedOffer/DeleteBankGuaranteeDetails',

    //=============================================================
    // [ LIEN TO SOCIETY DETAILS ]
    //=============================================================
    PULL_LIEN_TO_SOCIETY_DETAILS: '/ProposedOffer/PullLienToSocietyDetails',
    ADD_UPDATE_LIEN_TO_SOCIETY_DETAILS: '/ProposedOffer/AddUpdateLienToSocietyDetails',

    //=============================================================
    // [ PARKING ALLOTMENT ]
    //=============================================================
    PULL_PARKING_ALLOTMENT: '/ProposedOffer/PullParkingAllotment',
    ADD_UPDATE_PARKING_ALLOTMENT: '/ProposedOffer/AddUpdateParkingAllotment',

    //=============================================================
    // [ GST ON EXISTING + FREE AREA ]
    //=============================================================
    PULL_GST_ON_EXISTING_PLUS_FREE_AREA: '/ProposedOffer/PullGSTonExistingPlusFreeArea',
    ADD_UPDATE_GST_ON_EXISTING_PLUS_FREE_AREA: '/ProposedOffer/AddUpdateGSTonExistingPlusFreeArea',

    //=============================================================
    // [ PROJECT COMPLETION ]
    //=============================================================
    PULL_PROJECT_COMPLETION: '/ProposedOffer/PullProjectCompletion',
    ADD_UPDATE_PROJECT_COMPLETION: '/ProposedOffer/AddUpdateProjectCompletion',

    //=============================================================
    // [ PROPOSED PLAN ]
    //=============================================================
    PULL_PROPOSED_PLAN: '/ProposedOffer/PullProposedPlan',
    ADD_UPDATE_PROPOSED_PLAN: '/ProposedOffer/AddUpdateProposedPlan',
    ADD_UPDATE_BUILDING_PROPOSED_PLAN: '/ProposedOffer/AddUpdateBuildingProposedPlan',
    COPY_PROPOSED_PLAN: '/ProposedOffer/CopyProposedPlan',

    //=============================================================
    // [ GENERATE PROPOSED PLAN ]
    //=============================================================
    ADD_UPDATE_GENERATE_PROPOSED_PLAN: '/ProposedOffer/AddUpdateGenerateProposedOffer',

    //=============================================================
    // [ READY RECKONER ]
    //=============================================================
    PULL_READY_RECKONER_Rate: '/ProposedOffer/PullReadyReckonerRateDetails',
    ADD_UPDATE_READY_RECKONER_Rate: '/ProposedOffer/AddUpdateReadyReckonerRateDetails',
    DELETE_READY_RECKONER_Rate: '/ProposedOffer/DeleteReadyReckonerRateDetails',
    //=============================================================
    // [ ADDITIONAL INFORMATION ]
    //=============================================================
    PULL_ADDITIONAL_INFORMATION: '/ProposedOffer/PullAdditionalInformation',
    ADD_UPDATE_ADDITIONAL_INFORMATION: '/ProposedOffer/AddUpdateAdditionalInformation',

   

} as const


export type ProposedOfferApiKeys = keyof typeof ProposedOfferApi