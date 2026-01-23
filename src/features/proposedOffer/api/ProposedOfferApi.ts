export const ProposedOfferApi = {
    //=============================================================
    // [ EXTRA CARPET ]
    //=============================================================
    PULL_EXTRA_CARPET_AREA: '/ProposedOffer/PullExtraCarpetArea',
    ADD_UPDATE_EXTRA_CARPET_AREA: '/ProposedOffer/AddUpdateExtraCarpetArea',

    //=============================================================
    // [ CORPUS DETAILS ]
    //=============================================================
    PULL_CORPUS_DETAILS: '/ProposedOffer/PullCorpusDetails',
    ADD_UPDATE_CORPUS_DETAILS: '/ProposedOffer/AddUpdateCorpusDetails',

    //=============================================================
    // [ RENT DETAILS ]
    //=============================================================
    PULL_RENT_DETAILS: '/ProposedOffer/PullRentDetails',
    ADD_UPDATE_RENT_DETAILS: '/ProposedOffer/AddUpdateRentDetails',
    DELETE_RENT_DETAILS: '/ProposedOffer/DeleteRentDetails',

    //=============================================================
    // [ SHIFTING DETAILS ]
    //=============================================================
    PULL_SHIFTING_DETAILS: '/ProposedOffer/PullShiftingDetails',
    ADD_UPDATE_SHIFTING_DETAILS: '/ProposedOffer/AddUpdateShiftingDetails',

    //=============================================================
    // [ SECURITY DEPOSIT DETAILS ]
    //=============================================================
    PULL_SECURITY_DEPOSIT_DETAILS: '/ProposedOffer/PullSecurityDepositDetails',
    ADD_UPDATE_SECURITY_DEPOSIT_DETAILS: '/ProposedOffer/AddUpdateSecurityDepositDetails',

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

    //=============================================================
    // [ GENERATE PROPOSED PLAN ]
    //=============================================================
    ADD_UPDATE_GENERATE_PROPOSED_PLAN: '/ProposedOffer/AddUpdateGenerateProposedOffer',
} as const


export type ProposedOfferApiKeys = keyof typeof ProposedOfferApi