import { Input } from "@/ui/components/forms";
import { useState } from "react";
import type { AddUpdateReadyReckonerRequest } from "../models/ProposedOfferModel";
import { initialFormStateReadyReckoner } from "../utils/initialStates";
import { TextArea } from "@/ui/components/forms/Textarea";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

interface ReadyReckonerTabProps {
    projectId: number | null;
    buildingId: number;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    setLoadingMessage: (message: string) => void;
}

export const ReadyReckonerTab: React.FC<ReadyReckonerTabProps> = ({
    projectId,
    // buildingId,
    isLoading,
    // setIsLoading,
    // setLoadingMessage
}) => {
    const [formDataReadyReckoner, setFormDataReadyReckoner] = useState<AddUpdateReadyReckonerRequest>(() => initialFormStateReadyReckoner());
    const [errorsReadyReckoner, setErrorsReadyReckoner] = useState<{ [k: string]: string }>({});
    const { canAction } = useMenuPermissions();

    const handleFieldChangeReadyReckoner = (field: keyof AddUpdateReadyReckonerRequest, value: any) => {
        setFormDataReadyReckoner((prev) => ({ ...prev, [field]: value }));
        if (errorsReadyReckoner[field]) {
            setErrorsReadyReckoner((prev) => ({ ...prev, [field]: "" }));
        }
    };



    const handleSaveReadyReckonerDetails = () => {



    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-500 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Ready Reckoner Details
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <Input
                            label="Ready Reckoner Zone"
                            required
                            type="text"
                            value={formDataReadyReckoner.ReadyReckonerZone || ''}
                            onChange={(e) => handleFieldChangeReadyReckoner('ReadyReckonerZone', e.target.value)}
                            error={errorsReadyReckoner.ReadyReckonerZone}
                            placeholder="Enter Zone"
                        />
                    </div>
                    <div>
                        <Input
                            label="Land Ready Reckoner Rate (₹)"
                            required
                            type="text"
                            rightIcon="₹"
                            value={formDataReadyReckoner.LandReadyReckonerRate || ''}
                            error={errorsReadyReckoner.LandReadyReckonerRate}
                            placeholder="Land Ready Reckoner Rate"
                            onChange={(e) => handleFieldChangeReadyReckoner('LandReadyReckonerRate', e.target.value)}
                        />
                    </div>
                    <div>
                        <Input
                            label="Residential Ready Reckoner Rate (₹)"
                            required
                            type="text"
                            rightIcon="₹"
                            value={formDataReadyReckoner.ResidentialReadyReckonerRate || ''}
                            error={errorsReadyReckoner.ResidentialReadyReckonerRate}
                            placeholder="Residential Ready Reckoner Rate"
                            onChange={(e) => handleFieldChangeReadyReckoner('ResidentialReadyReckonerRate', e.target.value)}
                        />
                    </div>
                    <div>
                        <Input
                            label="Ground Shop Ready Reckoner Rate (₹)"
                            required
                            type="text"
                            rightIcon="₹"
                            value={formDataReadyReckoner.GroundShopReadyReckonerRate || ''}
                            error={errorsReadyReckoner.GroundShopReadyReckonerRate}
                            placeholder="Ground Shop Ready Reckoner Rate"
                            onChange={(e) => handleFieldChangeReadyReckoner('GroundShopReadyReckonerRate', e.target.value)}
                        />
                    </div>
                    <div>
                        <Input
                            label="Office Ready Reckoner Rate (₹)"
                            required
                            type="text"
                            rightIcon="₹"
                            value={formDataReadyReckoner.OfficeReadyReckonerRate || ''}
                            error={errorsReadyReckoner.OfficeReadyReckonerRate}
                            placeholder="Office Ready Reckoner Rate"
                            onChange={(e) => handleFieldChangeReadyReckoner('OfficeReadyReckonerRate', e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <TextArea
                        label="Remark"
                        className='thin-scroll'
                        value={formDataReadyReckoner.Remark ?? ""}
                        placeholder="Enter Remark"
                    />
                </div>

                <BottomActionBar
                    cancelText="Cancel"
                    saveText={(formDataReadyReckoner.ReadyReckonerId && formDataReadyReckoner.ReadyReckonerId > 0) ? 'Update' : 'Add'}
                    onCancel={() => {
                        setFormDataReadyReckoner({
                            ...initialFormStateReadyReckoner(),
                            ProjectId: Number(projectId)
                        });
                        setErrorsReadyReckoner({});
                    }}
                    canAction={canAction}
                    onSave={handleSaveReadyReckonerDetails}
                    isLoading={isLoading}
                />
            </div>
        </div>
    )
}



