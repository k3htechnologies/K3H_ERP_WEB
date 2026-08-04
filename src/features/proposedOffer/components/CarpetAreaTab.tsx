import { useState } from "react"
import type { AddUpdateCarpetAreaRequest } from "../models/ProposedOfferModel"
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions"
import { initialFormStateCarpetArea } from "../utils/initialStates"
import { Input } from "@/ui/components/forms"
import { filterNumbersWithDecimal } from "@/core/utils/fileValidation"
import { TextArea } from "@/ui/components/forms/Textarea"
import BottomActionBar from "@/ui/components/forms/BottomActionBar"

interface CarpetAreaTabProps {
  projectId: number | null
  buildingId?: number
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  setLoadingMessage: (message: string) => void
}

export const CarpetAreaTab: React.FC<CarpetAreaTabProps> = ({
  projectId,
  // buildingId,
  isLoading,
  // setIsLoading,
  // setLoadingMessage
}) => {

  const [formDataCarpetArea, setFormDataCarpetArea] = useState<AddUpdateCarpetAreaRequest>(() => initialFormStateCarpetArea());
  const [errorsCarpetArea, setErrorsCarpetArea] = useState<{ [k: string]: string }>({});
  const { canAction } = useMenuPermissions();

  const handleFieldChangeCarpetArea = (field: keyof AddUpdateCarpetAreaRequest, value: any) => {
    setFormDataCarpetArea((prev) => ({ ...prev, [field]: value }));
    if (errorsCarpetArea[field]) {
      setErrorsCarpetArea((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSaveCarpetAreaDetails = () => {

  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-500 pb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Carpet Area Details
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Input
              label="Existing Carpet Area Of Residential Members(SqFt)"
              required
              type="text"
              value={formDataCarpetArea.ExistingCarpetAreaResidentialMembersSqFt || ''}
              onChange={(e) => handleFieldChangeCarpetArea('ExistingCarpetAreaResidentialMembersSqFt', filterNumbersWithDecimal(e.target.value))}
              error={errorsCarpetArea.ExistingCarpetAreaResidentialMembersSqFt}
              placeholder="Existing Carpet Area Of Residential Members"
              rightIcon="SqFt"
            />
          </div>
          <div>
            <Input
              label="Existing Carpet Area Of Commercial Members(SqFt)"
              required
              type="text"
              value={formDataCarpetArea.ExistingCarpetAreaCommercialMembersSqFt || ''}
              onChange={(e) => handleFieldChangeCarpetArea('ExistingCarpetAreaCommercialMembersSqFt', filterNumbersWithDecimal(e.target.value))}
              error={errorsCarpetArea.ExistingCarpetAreaCommercialMembersSqFt}
              placeholder="Existing Carpet Area Of Commercial Members"
              rightIcon="SqFt"
            />
          </div>
          <div>
            <Input
              label="Total Existing Carpet Area Utilized By Members (SqFt)"
              placeholder="0.00"
              value={(Number(formDataCarpetArea?.ExistingCarpetAreaResidentialMembersSqFt) + Number(formDataCarpetArea?.ExistingCarpetAreaCommercialMembersSqFt) || 0).toFixed(2)}
              disabled
              rightIcon="SqFt"
            />
          </div>
          <div>
            <Input
              label="Existing Carpet Area Of Each Garage(SqFt)"
              required
              type="text"
              value={formDataCarpetArea.ExistingCarpetAreaOfEachGarageSqFt || ''}
              onChange={(e) => handleFieldChangeCarpetArea('ExistingCarpetAreaOfEachGarageSqFt', filterNumbersWithDecimal(e.target.value))}
              error={errorsCarpetArea.ExistingCarpetAreaOfEachGarageSqFt}
              placeholder="Existing Carpet Area Of Each Garage"
              rightIcon="SqFt"
            />
          </div>
          <div>
            <Input
              label="Terrace Area Utilized By Members(SqFt)"
              required
              type="text"
              value={formDataCarpetArea.TerraceAreaUtilizedByMembersSqFt || ''}
              onChange={(e) => handleFieldChangeCarpetArea('TerraceAreaUtilizedByMembersSqFt', filterNumbersWithDecimal(e.target.value))}
              error={errorsCarpetArea.TerraceAreaUtilizedByMembersSqFt}
              placeholder="Terrace Area Utilized By Members"
              rightIcon="SqFt"
            />
          </div>
        </div>

      </div>
      <div>
        <TextArea
          label="Remarks"
          className='thin-scroll'
          value={formDataCarpetArea.Remark ?? ""}
          placeholder="Enter Remarks"
          onChange={(e) => handleFieldChangeCarpetArea("Remark", e.target.value)}

        />
      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={(formDataCarpetArea.CarpetAreaId && formDataCarpetArea.CarpetAreaId > 0) ? 'Update' : 'Add'}
        onCancel={() => {
          setFormDataCarpetArea({
            ...initialFormStateCarpetArea(),
            ProjectId: Number(projectId)
          });
          setErrorsCarpetArea({});
        }}
        canAction={canAction}
        onSave={handleSaveCarpetAreaDetails}
        isLoading={isLoading}
      />

    </div>
  )
}