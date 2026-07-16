import { useState } from "react";
import type { AddUpdatePlotAreaRequest } from "../models/ProposedOfferModel";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { initialFormStatePlotArea } from "../utils/initialStates";
import { Input } from "@/ui/components/forms";
import { filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import { TextArea } from "@/ui/components/forms/Textarea";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";


interface PlotAreaTabProps {
    projectId: number | null;
    buildingId: number;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    setLoadingMessage: (message: string) => void;

}

export const PlotAreaTab: React.FC<PlotAreaTabProps> = ({
    projectId,
    // // buildingId,
    isLoading,
    // // setIsLoading,
    // // setLoadingMessage

}) => {

    const [formDataPlotArea, setFormDataPlotArea] = useState<AddUpdatePlotAreaRequest>(() => initialFormStatePlotArea());
    const [errorsPlotArea, setErrorsPlotArea] = useState<{ [k: string]: string }>({});
    const { canAction } = useMenuPermissions();


    const handleFieldChangePlotArea = (field: keyof AddUpdatePlotAreaRequest, value: any) => {
        setFormDataPlotArea((prev) => ({ ...prev, [field]: value }));
        if (errorsPlotArea[field]) {
            setErrorsPlotArea((prev) => ({ ...prev, [field]: "" }));
        }
    };



    const handleSavePlotAreaDetails = () => {


    }



    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-500 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Plot Area Details
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <Input
                            label="Gross Plot Area (SqMt)"
                            value={formDataPlotArea.GrossPlotAreaSqFt ?? ''}
                            onChange={(e) => handleFieldChangePlotArea("GrossPlotAreaSqFt", filterNumbersWithDecimal(e.target.value))}
                            placeholder="Enter Gross Plot Area"
                            rightIcon="SqMt"
                        />
                    </div>
                    <div>
                        <Input
                            label="Plot Area As Physical Survey (SqMt)"
                            value={formDataPlotArea.PlotAreaAsPhysicalSurveySqFt ?? ''}
                            onChange={(e) => handleFieldChangePlotArea("PlotAreaAsPhysicalSurveySqFt", filterNumbersWithDecimal(e.target.value))}
                            placeholder="Enter Plot Area As Physical Survey"
                            rightIcon="SqMt"
                        />
                    </div>

                    <div>
                        <Input
                            label="Plot Area As Per Old Approved Plans (SqMt)"
                            value={formDataPlotArea.PlotAreaAsPerOldApprovedPlansSqFt ?? ''}
                            onChange={(e) => handleFieldChangePlotArea("PlotAreaAsPerOldApprovedPlansSqFt", filterNumbersWithDecimal(e.target.value))}
                            placeholder="Enter Plot Area As Per Old Approved Plans"
                            rightIcon="SqMt"
                        />

                    </div>
                    <div>
                        <Input
                            label="Plot Area As Per Conveyance Deed (SqMt)"
                            value={formDataPlotArea.PlotAreaAsPerConveyanceSqFt ?? ''}
                            onChange={(e) => handleFieldChangePlotArea("PlotAreaAsPerConveyanceSqFt", filterNumbersWithDecimal(e.target.value))}
                            placeholder="Enter Plot Area As Per Conveyance Deed"
                            rightIcon="SqMt"
                        />

                    </div>
                    <div>
                        <Input
                            label="Plot Area As Per PR Card (SqMt)"
                            value={formDataPlotArea.PlotAreaAsPerPrCardSqFt ?? ''}
                            onChange={(e) => handleFieldChangePlotArea("PlotAreaAsPerPrCardSqFt", filterNumbersWithDecimal(e.target.value))}
                            placeholder="Enter Plot Area As PR Card"
                            rightIcon="SqMt"
                        />
                    </div>

                </div>
                <div>
                    <TextArea
                        label="Remarks"
                        className='thin-scroll'
                        value={formDataPlotArea.Remark ?? ""}
                        placeholder="Enter Remarks"
                        onChange={(e) => handleFieldChangePlotArea("Remark", e.target.value)}
                    />
                </div>

                <BottomActionBar
                    cancelText="Cancel"
                    saveText={(formDataPlotArea.PlotAreaId && formDataPlotArea.PlotAreaId > 0) ? 'Update' : 'Add'}
                    onCancel={() => {
                        setFormDataPlotArea({
                            ...initialFormStatePlotArea(),
                            ProjectId: Number(projectId)
                        });
                        setErrorsPlotArea({});
                    }}
                    canAction={canAction}
                    onSave={handleSavePlotAreaDetails}
                    isLoading={isLoading}
                />
            </div>
        </div>
    )
}