import React, { useState, useEffect } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ProposedOfferExtraCarpetAreaData,
  FilterWithPaginationProposedOfferExtraCarpetAreaRequest,
  AddUpdateProposedOfferExtraCarpetAreaRequest,
} from '@/features/proposedOffer/models/ProposedOfferModel';
import { proposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';
import { Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { filterNumbersWithDecimal, isValidPercentage, allowPercentage } from '@/core/utils/fileValidation';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { CARPET_AREA_TYPE } from '@/core/constants';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { initialFormStateExtraCarpetArea } from '../utils/initialStates';
import { TextArea } from '@/ui/components/forms/Textarea';
import { getInputValue, isEmpty } from '@/core/utils/comman';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';

interface ExtraCarpetAreaTabProps {
  projectId: number | null;
  buildingId: number;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

export const ExtraCarpetAreaTab: React.FC<ExtraCarpetAreaTabProps> = ({
  projectId,
  buildingId,
  isLoading,
  setIsLoading,
  setLoadingMessage,
}) => {
  const [extraCarpetAreaData, setExtraCarpetAreaData] = useState<ProposedOfferExtraCarpetAreaData | null>(null);
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions();
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [formDataExtraCarpetArea, setFormDataExtraCarpetArea] = useState<AddUpdateProposedOfferExtraCarpetAreaRequest>(() => initialFormStateExtraCarpetArea());

  useEffect(() => {
    if (!projectId || !buildingId) return;
    setErrors({});
    fetchExtraCarpetAreaData();

  }, [projectId, buildingId]);

  const handleFieldChangeExtraCarpetArea = (field: keyof AddUpdateProposedOfferExtraCarpetAreaRequest, value: any) => {
    setFormDataExtraCarpetArea((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const fetchExtraCarpetAreaData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferExtraCarpetAreaRequest = {
          ProjectId: Number(projectId),
          BuildingId: buildingId
        };

        const response = await proposedOfferService.apiCallPullExtraCarpetArea(params);

        if (E.isRight(response)) {

          const data = response.right.Data?.[0] || null;
          setExtraCarpetAreaData(data);

          if (data) {
            setFormDataExtraCarpetArea({
              ProposedOfferExtraCarpetAreaId: data.ProposedOfferExtraCarpetAreaId || 0,
              Uniquekey: data.Uniquekey || initialFormStateExtraCarpetArea().Uniquekey,
              BuildingId: buildingId,
              ProjectId: Number(projectId),
              ExtraCarpetAreaOfferedType: data.ExtraCarpetAreaOfferedType || '',
              ResidentialExtraCarpetPercent: data.ResidentialExtraCarpetPercent ?? 0,
              CommercialExtraCarpetPercent: data.CommercialExtraCarpetPercent ?? 0,
              Remark: data.Remark ?? "",
            });
          } else {
            setFormDataExtraCarpetArea({
              ...initialFormStateExtraCarpetArea()
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
      'Loading Extra Carpet Area'
    );
  };

  const validateExtraCarpetAreaForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataExtraCarpetArea.ExtraCarpetAreaOfferedType?.trim()) {
      newErrors.ExtraCarpetAreaOfferedType = "Extra Carpet Area Type is required"
    }

    if (isEmpty(formDataExtraCarpetArea.ResidentialExtraCarpetPercent)) {
      newErrors.ResidentialExtraCarpetPercent = 'Residential Extra Carpet Percentage is required'
    } else if (!isValidPercentage(String(formDataExtraCarpetArea.ResidentialExtraCarpetPercent))) {
      newErrors.ResidentialExtraCarpetPercent = 'Enter a valid percentage'
    }

    if (isEmpty(formDataExtraCarpetArea.CommercialExtraCarpetPercent)) {
      newErrors.CommercialExtraCarpetPercent = 'Commercial Extra Carpet Percentage is required'
    } else if (!isValidPercentage(String(formDataExtraCarpetArea.CommercialExtraCarpetPercent))) {
      newErrors.CommercialExtraCarpetPercent = 'Enter a valid percentage'
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleSaveExtraCarpetArea = async () => {
    setErrors({})

    if (buildingId === 0) {
      addToast({ type: "error", title: "Please select proper building first" });
      return
    }

    const validation = validateExtraCarpetAreaForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload: AddUpdateProposedOfferExtraCarpetAreaRequest = {
          ProposedOfferExtraCarpetAreaId: formDataExtraCarpetArea.ProposedOfferExtraCarpetAreaId,
          Uniquekey: formDataExtraCarpetArea.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          ExtraCarpetAreaOfferedType: formDataExtraCarpetArea.ExtraCarpetAreaOfferedType,
          ResidentialExtraCarpetPercent: formDataExtraCarpetArea.ResidentialExtraCarpetPercent ?? 0,
          CommercialExtraCarpetPercent: formDataExtraCarpetArea.CommercialExtraCarpetPercent ?? 0,
          Remark: formDataExtraCarpetArea.Remark
        };

        const response = await proposedOfferService.apiCallAddUpdateExtraCarpetArea(payload);

        if (E.isRight(response)) {
          const isAdd = formDataExtraCarpetArea.ProposedOfferExtraCarpetAreaId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProposedOfferExtraCarpetAreaData;
            setExtraCarpetAreaData(newRecord);
            setFormDataExtraCarpetArea({
              ...formDataExtraCarpetArea,
              ProposedOfferExtraCarpetAreaId: newRecord.ProposedOfferExtraCarpetAreaId || 0,
              Uniquekey: newRecord.Uniquekey || formDataExtraCarpetArea.Uniquekey
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as ProposedOfferExtraCarpetAreaData;
            setExtraCarpetAreaData(updatedRecord);
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
      Number(formDataExtraCarpetArea.ProposedOfferExtraCarpetAreaId) === 0 ? 'Add Extra Carpet Area' : 'Update Extra Carpet Area'
    )
  };

  const isBuildingSelected = buildingId > 0;

  return (
    <>
      <div className="space-y-6 pb-5">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">
            Basic Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <SinglePageSelection
                label="Extra Carpet Area Type"
                placeholder="Select Extra Carpet Area Type"
                required
                value={formDataExtraCarpetArea.ExtraCarpetAreaOfferedType}
                onChange={(e) => handleFieldChangeExtraCarpetArea('ExtraCarpetAreaOfferedType', String(e))}
                options={CARPET_AREA_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errors.ExtraCarpetAreaOfferedType}
                disabled={!isBuildingSelected}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
            Percentage Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="Residential Extra Carpet (%)"
                required
                type="text"
                value={getInputValue(formDataExtraCarpetArea.ProposedOfferExtraCarpetAreaId, formDataExtraCarpetArea.ResidentialExtraCarpetPercent)}
                onChange={(e) => {
                  const val = allowPercentage(e.target.value);
                  if (val !== null) {
                    handleFieldChangeExtraCarpetArea("ResidentialExtraCarpetPercent", filterNumbersWithDecimal(e.target.value));
                  }
                }}
                error={errors.ResidentialExtraCarpetPercent}
                placeholder="Enter Residential Extra Carpet"
                rightIcon="%"
                disabled={!isBuildingSelected}
              />
            </div>
            <div>
              <Input
                label="Commercial Extra Carpet (%)"
                required
                type="text"
                value={getInputValue(formDataExtraCarpetArea.ProposedOfferExtraCarpetAreaId, formDataExtraCarpetArea.CommercialExtraCarpetPercent)}
                onChange={(e) => {
                  const val = allowPercentage(e.target.value);
                  if (val !== null) {
                    handleFieldChangeExtraCarpetArea('CommercialExtraCarpetPercent', filterNumbersWithDecimal(e.target.value))
                  }
                }}
                error={errors.CommercialExtraCarpetPercent}
                placeholder="Enter Commercial Extra Carpet"
                rightIcon="%"
                disabled={!isBuildingSelected}
              />
            </div>

          </div>
          <div>
            <TextArea
              label="Remark"
              className='thin-scroll'
              value={formDataExtraCarpetArea.Remark ?? ""}
              placeholder="Enter Remark"
              onChange={(e) => handleFieldChangeExtraCarpetArea("Remark", e.target.value)}
              disabled={!isBuildingSelected}
            />
          </div>
          <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">
            <div className="bg-[#E1E2E4] px-3 py-2 border-b border-[#D0D7DE]">
              <h4 className="text-sm font-semibold text-[#333333]">
                Action Details
              </h4>
            </div>
            <div className="p-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 border-b border-[#135bec2e] pb-4">
                <FieldItem label="Created By" value={extraCarpetAreaData?.CreatedBy ?? '-'} />
                <FieldItem
                  label="Created Date"
                  value={formatDate_dd_MonthName_yy_hh_mm(extraCarpetAreaData?.CreatedDate ?? '-')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pt-4">
                <FieldItem label="Modified By" value={extraCarpetAreaData?.ModifiedBy ?? '-'} />
                <FieldItem
                  label="Modified Date"
                  value={formatDate_dd_MonthName_yy_hh_mm(extraCarpetAreaData?.ModifiedDate ?? '-')}
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      <BottomActionBar
        saveText={(formDataExtraCarpetArea.ProposedOfferExtraCarpetAreaId && formDataExtraCarpetArea.ProposedOfferExtraCarpetAreaId > 0) ? 'Update' : 'Add'}
        canAction={buildingId > 0 && canAction}
        onSave={handleSaveExtraCarpetArea}
        isLoading={isLoading}
      />
    </>
  );
};

