import React, { useState, useEffect } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ProposedOfferGSTonExistingPlusFreeAreaData,
  FilterWithPaginationProposedOfferGSTonExistingPlusFreeAreaRequest,
  AddUpdateProposedOfferGSTonExistingPlusFreeAreaRequest,
} from '@/features/proposedOffer/models/ProposedOfferModel';
import { ProposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';
import { Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { filterNumbersWithDecimal, isValidPercentage, allowPercentage } from '@/core/utils/fileValidation';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { initialFormStateGSTonExistingPlusFreeArea } from '../utils/initialStates';

interface GSTonExistingPlusFreeAreaTabProps {
  projectId: number | null;
  buildingId: number;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

export const GSTonExistingPlusFreeAreaTab: React.FC<GSTonExistingPlusFreeAreaTabProps> = ({
  projectId,
  buildingId,
  isLoading,
  setIsLoading,
  setLoadingMessage,
}) => {
  const [, setGSTonExistingPlusFreeAreaData] = useState<ProposedOfferGSTonExistingPlusFreeAreaData | null>(null);
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions();
  const [errorsGSTonExistingPlusFreeArea, setErrorsGSTonExistingPlusFreeArea] = useState<{ [k: string]: string }>({});
  const [formDataGSTonExistingPlusFreeArea, setFormDataGSTonExistingPlusFreeArea] = useState<AddUpdateProposedOfferGSTonExistingPlusFreeAreaRequest>(() => initialFormStateGSTonExistingPlusFreeArea());

  useEffect(() => {
    if (!projectId || !buildingId) return;
    fetchGSTonExistingPlusFreeAreaData();
  }, [projectId, buildingId]);

  const handleFieldChangeGSTonExistingPlusFreeArea = (field: keyof AddUpdateProposedOfferGSTonExistingPlusFreeAreaRequest, value: any) => {
    setFormDataGSTonExistingPlusFreeArea((prev) => ({ ...prev, [field]: value }));
    if (errorsGSTonExistingPlusFreeArea[field]) {
      setErrorsGSTonExistingPlusFreeArea((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const fetchGSTonExistingPlusFreeAreaData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferGSTonExistingPlusFreeAreaRequest = {
          ProjectId: projectId ?? undefined,
          BuildingId: buildingId
        };

        const response = await ProposedOfferService.apiCallPullGSTonExistingPlusFreeArea(params);

        if (E.isRight(response)) {
          const data = response.right.Data?.[0] || null;
          setGSTonExistingPlusFreeAreaData(data);

          if (data) {
            setFormDataGSTonExistingPlusFreeArea({
              ProposedOfferGSTonExistingPlusFreeAreaId: data.ProposedOfferGSTonExistingPlusFreeAreaId || 0,
              Uniquekey: data.Uniquekey || initialFormStateGSTonExistingPlusFreeArea().Uniquekey,
              BuildingId: buildingId,
              ProjectId: Number(projectId),
              GSTOnAreaByMemberPercent: data.GSTOnAreaByMemberPercent ?? 0,
              GSTOnAreaByDeveloperPercent: data.GSTOnAreaByDeveloperPercent ?? 0
            });
          } else {
            setFormDataGSTonExistingPlusFreeArea({
              ...initialFormStateGSTonExistingPlusFreeArea(),
              ProjectId: Number(projectId)
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
      'Loading GST on Existing Plus Free Area'
    );
  };

  const validateGSTonExistingPlusFreeAreaForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataGSTonExistingPlusFreeArea.GSTOnAreaByMemberPercent) {
      newErrors.GSTOnAreaByMemberPercent = 'GST on Area by Member Percentage is required'
    } else if (!isValidPercentage(String(formDataGSTonExistingPlusFreeArea.GSTOnAreaByMemberPercent))) {
      newErrors.GSTOnAreaByMemberPercent = 'Enter a valid percentage'
    }

    if (!formDataGSTonExistingPlusFreeArea.GSTOnAreaByDeveloperPercent) {
      newErrors.GSTOnAreaByDeveloperPercent = 'GST on Area by Developer Percentage is required'
    } else if (!isValidPercentage(String(formDataGSTonExistingPlusFreeArea.GSTOnAreaByDeveloperPercent))) {
      newErrors.GSTOnAreaByDeveloperPercent = 'Enter a valid percentage'
    }

    if (Number(formDataGSTonExistingPlusFreeArea.GSTOnAreaByMemberPercent) + Number(formDataGSTonExistingPlusFreeArea.GSTOnAreaByDeveloperPercent) > 100) {
      newErrors.TotalGSTPercent = "Total GST percentage cannot be more than 100%";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleSaveGSTonExistingPlusFreeArea = async () => {
    if (buildingId === 0) {
      addToast({ type: "error", title: "Please select proper building first" });
      return
    }

    setErrorsGSTonExistingPlusFreeArea({})

    const validation = validateGSTonExistingPlusFreeAreaForm()

    if (!validation.isValid) {
      setErrorsGSTonExistingPlusFreeArea(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload: AddUpdateProposedOfferGSTonExistingPlusFreeAreaRequest = {
          ProposedOfferGSTonExistingPlusFreeAreaId: formDataGSTonExistingPlusFreeArea.ProposedOfferGSTonExistingPlusFreeAreaId,
          Uniquekey: formDataGSTonExistingPlusFreeArea.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          GSTOnAreaByMemberPercent: formDataGSTonExistingPlusFreeArea.GSTOnAreaByMemberPercent,
          GSTOnAreaByDeveloperPercent: formDataGSTonExistingPlusFreeArea.GSTOnAreaByDeveloperPercent
        };

        const response = await ProposedOfferService.apiCallAddUpdateGSTonExistingPlusFreeArea(payload);

        if (E.isRight(response)) {
          const isAdd = formDataGSTonExistingPlusFreeArea.ProposedOfferGSTonExistingPlusFreeAreaId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProposedOfferGSTonExistingPlusFreeAreaData;
            setGSTonExistingPlusFreeAreaData(newRecord);
            setFormDataGSTonExistingPlusFreeArea({
              ...formDataGSTonExistingPlusFreeArea,
              ProposedOfferGSTonExistingPlusFreeAreaId: newRecord.ProposedOfferGSTonExistingPlusFreeAreaId || 0,
              Uniquekey: newRecord.Uniquekey || formDataGSTonExistingPlusFreeArea.Uniquekey
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as ProposedOfferGSTonExistingPlusFreeAreaData;
            setGSTonExistingPlusFreeAreaData(updatedRecord);
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
      Number(formDataGSTonExistingPlusFreeArea.ProposedOfferGSTonExistingPlusFreeAreaId) === 0 ? 'Add GST on Existing Plus Free Area' : 'Update GST on Existing Plus Free Area'
    )
  };

  return (
    <>
      <div className="space-y-6 pb-5">
        {/* GST on Existing Plus Free Area Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">
            GST on Existing Plus Free Area Details*
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="GST on Area by Member (%)"
                required
                type="text"
                rightIcon="%"
                value={formDataGSTonExistingPlusFreeArea.GSTOnAreaByMemberPercent || ''}
                onChange={(e) => {
                  const val = allowPercentage(e.target.value);
                  if (val !== null) {
                    handleFieldChangeGSTonExistingPlusFreeArea('GSTOnAreaByMemberPercent', filterNumbersWithDecimal(e.target.value))
                  }
                }}
                error={errorsGSTonExistingPlusFreeArea.GSTOnAreaByMemberPercent}
                placeholder="Enter GST on Area by Member Percent"
              />
            </div>

            <div>
              <Input
                label="GST on Area by Developer (%)"
                required
                type="text"
                rightIcon="%"
                value={formDataGSTonExistingPlusFreeArea.GSTOnAreaByDeveloperPercent || ''}
                onChange={(e) => {
                  const val = allowPercentage(e.target.value);
                  if (val !== null) {
                    handleFieldChangeGSTonExistingPlusFreeArea('GSTOnAreaByDeveloperPercent', filterNumbersWithDecimal(e.target.value))
                  }
                }}
                error={errorsGSTonExistingPlusFreeArea.GSTOnAreaByDeveloperPercent}
                placeholder="Enter GST on Area by Developer Percent"
              />
            </div>

            <div>
              <Input
                label="Total GST (%)"
                required
                type="text"
                rightIcon="%"
                disabled
                value={Number(formDataGSTonExistingPlusFreeArea.GSTOnAreaByDeveloperPercent) + Number(formDataGSTonExistingPlusFreeArea.GSTOnAreaByMemberPercent) || 0}
                error={errorsGSTonExistingPlusFreeArea.TotalGSTPercent}
                placeholder="System Calculated Total GST"
              />
            </div>
          </div>
        </div>
      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={(formDataGSTonExistingPlusFreeArea.ProposedOfferGSTonExistingPlusFreeAreaId && formDataGSTonExistingPlusFreeArea.ProposedOfferGSTonExistingPlusFreeAreaId > 0) ? 'Update' : 'Add'}
        onCancel={() => {
          setFormDataGSTonExistingPlusFreeArea({
            ...initialFormStateGSTonExistingPlusFreeArea(),
            ProjectId: Number(projectId)
          });
          setErrorsGSTonExistingPlusFreeArea({});
          fetchGSTonExistingPlusFreeAreaData();
        }}
        canAction={canAction}
        onSave={handleSaveGSTonExistingPlusFreeArea}
        isLoading={isLoading}
      />
    </>
  );
};

