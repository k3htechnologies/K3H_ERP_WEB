import { useState } from "react";
import type { AddUpdateAdditionalInformationRequest } from "../models/ProposedOfferModel";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { initialFormStateAdditionalInformation } from "../utils/initialStates";
import { Input } from "@/ui/components/forms";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { TextArea } from "@/ui/components/forms/Textarea";

interface AdditionalInformationTabProps {
    projectId: number | null;
    buildingId?: number;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    setLoadingMessage: (message: string) => void;
}

export const AdditionalInformationTab: React.FC<AdditionalInformationTabProps> = ({
    projectId,
    // buildingId,
    isLoading,
    // setIsLoading,
    // setLoadingMessage

}) => {

    const [formDataAdditionalInformation, setFormDataAdditonalInformation] = useState<AddUpdateAdditionalInformationRequest>(() => initialFormStateAdditionalInformation());
    const [errorsAdditionalInformation, setErrorsAdditionalInformation] = useState<{ [k: string]: string }>({});
    const { canAction } = useMenuPermissions();


    const handleFieldChangeAdditionalInformation = (field: keyof AddUpdateAdditionalInformationRequest, value: any) => {
        setFormDataAdditonalInformation((prev) => ({ ...prev, [field]: value }));
        if (errorsAdditionalInformation[field]) {
            setErrorsAdditionalInformation((prev) => ({ ...prev, [field]: "" }));
        }
    };




    const handleSaveAdditionalInformationDetails = () => {


    };


    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-500 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Additional/Remarks Details
                    </h3>
                </div>

                <div>
                    <Input
                        label="Stamp Duty, Registration Charges, Other Govt. Levied Pertaining to Re-Development"
                        required
                        type="text"
                        value={formDataAdditionalInformation.TaxAndDutiesDetails || ''}
                        onChange={(e) => handleFieldChangeAdditionalInformation('TaxAndDutiesDetails', e.target.value)}
                        error={errorsAdditionalInformation.TaxAndDutiesDetails}
                        placeholder="Enter Stamp Duty, Registration Charges, Other Govt. Levied Pertaining to Re-Development"
                    />
                </div>
                <div>
                    <TextArea
                        label="Remarks"
                        className='thin-scroll'
                        value={formDataAdditionalInformation.TaxRemark ?? ""}
                        placeholder="Enter Remarks"
                        onChange={(e) => handleFieldChangeAdditionalInformation("TaxRemark", e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                        Purchase Of Additional Area Details
                    </h3>
                    <h1>1. Additional sq.ft RERA Carpet area to be purchase by the members of the society. </h1>
                    <h1>2. Discount rate will be provided for the of extra area upto </h1>

                    <div>
                        <TextArea
                            label=""
                            className='thin-scroll'
                            value={formDataAdditionalInformation.PurchaseOfAdditonalAreaRemark ?? ""}
                            placeholder="Enter Remarks"
                            onChange={(e) => handleFieldChangeAdditionalInformation("PurchaseOfAdditonalAreaRemark", e.target.value)}
                        />
                    </div>

                </div>
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                        Additional Remark
                    </h3>
                    <div>
                        <div>
                            <TextArea
                                label="Remarks"
                                className='thin-scroll'
                                value={formDataAdditionalInformation.AdditionalRemark ?? ""}
                                placeholder="Enter Remarks"
                                onChange={(e) => handleFieldChangeAdditionalInformation("AdditionalRemark", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <BottomActionBar
                    cancelText="Cancel"
                    saveText={(formDataAdditionalInformation.AdditionalInformationId && formDataAdditionalInformation.AdditionalInformationId > 0) ? 'Update' : 'Add'}
                    onCancel={() => {
                        setFormDataAdditonalInformation({
                            ...initialFormStateAdditionalInformation(),
                            ProjectId: Number(projectId)
                        });
                        setErrorsAdditionalInformation({});
                    }}
                    canAction={canAction}
                    onSave={handleSaveAdditionalInformationDetails}
                    isLoading={isLoading}
                />
            </div>
        </div>
    )
}