import { useEffect, useState } from "react";
import type { AdditionalInformationData, AddUpdateAdditionalInformationRequest, FilterWithPaginationAdditionalInformationRequest } from "../models/ProposedOfferModel";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { initialFormStateAdditionalInformation } from "../utils/initialStates";
import { Input } from "@/ui/components/forms";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { TextArea } from "@/ui/components/forms/Textarea";
import useToast from "@/core/hooks/useToast";
import { proposedOfferService } from "../services/ProposedOfferService";
import * as E from 'fp-ts/Either';
import { runApiWithLoader } from "@/core/utils";

interface AdditionalInformationTabProps {
    projectId: number | null;
    buildingId?: number;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    setLoadingMessage: (message: string) => void;
}

export const AdditionalInformationTab: React.FC<AdditionalInformationTabProps> = ({
    projectId,
    buildingId,
    isLoading,
    setIsLoading,
    setLoadingMessage

}) => {
    const [, setAdditionalInformationData] = useState<AdditionalInformationData | null>(null);
    const { addToast } = useToast();
    const { canAction } = useMenuPermissions();
    const [errorsAdditionalInformation, setErrorsAdditionalInformation] = useState<{ [k: string]: string }>({});
    const [formDataAdditionalInformation, setFormDataAdditionalInformation] = useState<AddUpdateAdditionalInformationRequest>(() => initialFormStateAdditionalInformation());

    useEffect(() => {
        if (!projectId || !buildingId) return;
        setErrorsAdditionalInformation({});
        fetchAdditionalInformationData();

    }, [projectId, buildingId]);

    const handleFieldChangeAdditionalInformation = (field: keyof AddUpdateAdditionalInformationRequest, value: any) => {
        setFormDataAdditionalInformation((prev) => ({ ...prev, [field]: value }));
        if (errorsAdditionalInformation[field]) {
            setErrorsAdditionalInformation((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const fetchAdditionalInformationData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationAdditionalInformationRequest = {
                    ProjectId: Number(projectId),
                    BuildingId: buildingId
                };

                const response = await proposedOfferService.apiCallPullAdditionalInformation(params);

                if (E.isRight(response)) {

                    const data = response.right.Data?.[0] || null;
                    setAdditionalInformationData(data);

                    if (data) {
                        setFormDataAdditionalInformation({
                            ProposedOfferAdditionalInformationId: data.ProposedOfferAdditionalInformationId || 0,
                            Uniquekey: data.Uniquekey || initialFormStateAdditionalInformation().Uniquekey,
                            BuildingId: buildingId,
                            ProjectId: Number(projectId),
                            TaxAndDutiesDetails: data.TaxAndDutiesDetails || '',
                            TaxRemark: data.TaxRemark ?? "",
                            PurchaseOfAdditonalAreaRemark: data.PurchaseOfAdditonalAreaRemark ?? "",
                            AdditionalRemark: data.AdditionalRemark ?? "",
                        });
                    } else {
                        setFormDataAdditionalInformation({
                            ...initialFormStateAdditionalInformation()
                        });
                    }
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Additional Remark'
        );
    };


    const handleSaveAdditionalInformation = async () => {

        setErrorsAdditionalInformation({})

        if (buildingId === 0) {
            addToast({ type: "error", title: "Please select proper building first" });
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload: AddUpdateAdditionalInformationRequest = {
                    ProposedOfferAdditionalInformationId: formDataAdditionalInformation.ProposedOfferAdditionalInformationId,
                    Uniquekey: formDataAdditionalInformation.Uniquekey,
                    BuildingId: buildingId,
                    ProjectId: Number(projectId),
                    TaxAndDutiesDetails: formDataAdditionalInformation.TaxAndDutiesDetails,
                    TaxRemark: formDataAdditionalInformation.TaxRemark ?? "",
                    PurchaseOfAdditonalAreaRemark: formDataAdditionalInformation.PurchaseOfAdditonalAreaRemark ?? "",
                    AdditionalRemark: formDataAdditionalInformation.AdditionalRemark
                };

                const response = await proposedOfferService.apiCallAddUpdateAdditionalInformation(payload);


                if (E.isRight(response)) {
                    const isAdd = formDataAdditionalInformation.ProposedOfferAdditionalInformationId === 0;

                    if (isAdd) {
                        const newRecord = response.right.Data[0] as AdditionalInformationData;
                        setAdditionalInformationData(newRecord);
                        setFormDataAdditionalInformation({
                            ...formDataAdditionalInformation,
                            ProposedOfferAdditionalInformationId: newRecord.ProposedOfferAdditionalInformationId || 0,
                            Uniquekey: newRecord.Uniquekey || formDataAdditionalInformation.Uniquekey
                        });
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    } else {
                        const updatedRecord = response.right.Data[0] as AdditionalInformationData;
                        setAdditionalInformationData(updatedRecord);
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }
                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            Number(formDataAdditionalInformation.ProposedOfferAdditionalInformationId) === 0 ? 'Add Additional Information' : 'Update Additional Information'
        )
    };

     const isBuildingSelected = buildingId?? 0 > 0;

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-500 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Tax Details
                    </h3>
                </div>

                <div>
                    <Input
                        label="Stamp Duty, Registration Charges, Other Govt. Levied Pertaining to Re-Development"
                        type="text"
                        value={formDataAdditionalInformation.TaxAndDutiesDetails || ''}
                        onChange={(e) => handleFieldChangeAdditionalInformation('TaxAndDutiesDetails', e.target.value)}
                        error={errorsAdditionalInformation.TaxAndDutiesDetails}
                        placeholder="Enter Stamp Duty, Registration Charges, Other Govt. Levied Pertaining to Re-Development"
                        disabled={!isBuildingSelected}
                    />
                </div>
                <div>
                    <TextArea
                        label="Remarks"
                        className='thin-scroll'
                        value={formDataAdditionalInformation.TaxRemark ?? ""}
                        placeholder="Enter Remarks"
                        onChange={(e) => handleFieldChangeAdditionalInformation("TaxRemark", e.target.value)}
                        disabled={!isBuildingSelected}
                        
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                        Purchase Of Additional Area Details
                    </h3>
                    <h1>1. Additional SqFt RERA Carpet area to be purchase by the members of the society. </h1>
                    <h1>2. Discount rate will be provided for the of extra area upto </h1>

                    <div>
                        <TextArea
                            label=""
                            className='thin-scroll'
                            value={formDataAdditionalInformation.PurchaseOfAdditonalAreaRemark ?? ""}
                            placeholder="Enter Remarks"
                            onChange={(e) => handleFieldChangeAdditionalInformation("PurchaseOfAdditonalAreaRemark", e.target.value)}
                            disabled={!isBuildingSelected}
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
                                disabled={!isBuildingSelected}
                            />
                        </div>
                    </div>
                </div>

                <BottomActionBar
                    saveText={(formDataAdditionalInformation.ProposedOfferAdditionalInformationId && formDataAdditionalInformation.ProposedOfferAdditionalInformationId > 0) ? 'Update' : 'Add'}
                     canAction={Number(buildingId) > 0 && canAction}
                    onSave={handleSaveAdditionalInformation}
                    isLoading={isLoading}
                />
            </div>
        </div>
    )
}