import React, { useState, useEffect } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ProposedOfferProjectCompletionData,
  FilterWithPaginationProposedOfferProjectCompletionRequest,
  AddUpdateProposedOfferProjectCompletionRequest,
} from '@/features/proposedOffer/models/ProposedOfferModel';
import { proposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';
import { Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { filterNumbers } from '@/core/utils/fileValidation';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { initialFormStateProjectCompletion } from '../utils/initialStates';
import { TextArea } from '@/ui/components/forms/Textarea';

interface ProjectCompletionTabProps {
  projectId: number | null;
  buildingId: number;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

export const ProjectCompletionTab: React.FC<ProjectCompletionTabProps> = ({
  projectId,
  buildingId,
  isLoading,
  setIsLoading,
  setLoadingMessage,
}) => {
  const [, setProjectCompletionData] = useState<ProposedOfferProjectCompletionData | null>(null);
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions();
  const [errorsProjectCompletion, setErrorsProjectCompletion] = useState<{ [k: string]: string }>({});
  const [formDataProjectCompletion, setFormDataProjectCompletion] = useState<AddUpdateProposedOfferProjectCompletionRequest>(() => initialFormStateProjectCompletion());

  useEffect(() => {
    if (!projectId || !buildingId) return;
    setErrorsProjectCompletion({});
    fetchProjectCompletionData();
  }, [projectId, buildingId]);

  const handleFieldChangeProjectCompletion = (field: keyof AddUpdateProposedOfferProjectCompletionRequest, value: any) => {
    setFormDataProjectCompletion((prev) => ({ ...prev, [field]: value }));
    if (errorsProjectCompletion[field]) {
      setErrorsProjectCompletion((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const fetchProjectCompletionData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferProjectCompletionRequest = {
          ProjectId: projectId ?? undefined,
          BuildingId: buildingId
        };

        const response = await proposedOfferService.apiCallPullProjectCompletion(params);

        if (E.isRight(response)) {
          const data = response.right.Data?.[0] || null;
          setProjectCompletionData(data);

          if (data) {
            setFormDataProjectCompletion({
              ProposedOfferProjectCompletionId: data.ProposedOfferProjectCompletionId || 0,
              Uniquekey: data.Uniquekey || initialFormStateProjectCompletion().Uniquekey,
              BuildingId: buildingId,
              ProjectId: Number(projectId),
              CompletionTimelineMonths: data.CompletionTimelineMonths ?? 0,
              GracePeriodMonths: data.GracePeriodMonths ?? 0,
              Remark:data.Remark ?? ""
            });
          } else {
            setFormDataProjectCompletion({
              ...initialFormStateProjectCompletion(),
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
      'Loading Project Completion'
    );
  };

  const validateProjectCompletionForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataProjectCompletion.CompletionTimelineMonths) {
      newErrors.CompletionTimelineMonths = "Completion Timeline (Months) is required"
    }

    if (!formDataProjectCompletion.GracePeriodMonths) {
      newErrors.GracePeriodMonths = "Grace Period (Months) is required"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleSaveProjectCompletion = async () => {
    if (buildingId === 0) {
      addToast({ type: "error", title: "Please select proper building first" });
      return
    }

    setErrorsProjectCompletion({})

    const validation = validateProjectCompletionForm()

    if (!validation.isValid) {
      setErrorsProjectCompletion(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload: AddUpdateProposedOfferProjectCompletionRequest = {
          ProposedOfferProjectCompletionId: formDataProjectCompletion.ProposedOfferProjectCompletionId,
          Uniquekey: formDataProjectCompletion.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          CompletionTimelineMonths: formDataProjectCompletion.CompletionTimelineMonths,
          GracePeriodMonths: formDataProjectCompletion.GracePeriodMonths,
          Remark:formDataProjectCompletion.Remark ?? ""
        };

        const response = await proposedOfferService.apiCallAddUpdateProjectCompletion(payload);

        if (E.isRight(response)) {
          const isAdd = formDataProjectCompletion.ProposedOfferProjectCompletionId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProposedOfferProjectCompletionData;
            setProjectCompletionData(newRecord);
            setFormDataProjectCompletion({
              ...formDataProjectCompletion,
              ProposedOfferProjectCompletionId: newRecord.ProposedOfferProjectCompletionId || 0,
              Uniquekey: newRecord.Uniquekey || formDataProjectCompletion.Uniquekey
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as ProposedOfferProjectCompletionData;
            setProjectCompletionData(updatedRecord);
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
      Number(formDataProjectCompletion.ProposedOfferProjectCompletionId) === 0 ? 'Add Project Completion' : 'Update Project Completion'
    )
  };

   const isBuildingSelected = buildingId > 0;

  return (
    <>
      <div className="space-y-6 pb-5">
        {/* Project Completion Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">
            Project Completion Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="Completion Timeline (Months)"
                required
                type="text"
                value={formDataProjectCompletion.CompletionTimelineMonths || ''}
                onChange={(e) => handleFieldChangeProjectCompletion('CompletionTimelineMonths', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                error={errorsProjectCompletion.CompletionTimelineMonths}
                placeholder="Enter Completion Timeline in Months"
                disabled={!isBuildingSelected}
                maxLength={7}
              />
            </div>
            <div>
              <Input
                label="Grace Period (Months)"
                required
                type="text"
                value={formDataProjectCompletion.GracePeriodMonths || ''}
                onChange={(e) => handleFieldChangeProjectCompletion('GracePeriodMonths', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                error={errorsProjectCompletion.GracePeriodMonths}
                placeholder="Enter Grace Period in Months"
                disabled={!isBuildingSelected}
                 maxLength={7}
              />
            </div>
          </div>
          <div>
            <TextArea
              label="Remarks"
              className='thin-scroll'
              value={formDataProjectCompletion.Remark ?? ""}
              placeholder="Enter Remarks"
              onChange={(e) => handleFieldChangeProjectCompletion("Remark", e.target.value)}
              disabled={!isBuildingSelected}
            />

          </div>
        </div>
      </div>
      <BottomActionBar
        saveText={(formDataProjectCompletion.ProposedOfferProjectCompletionId && formDataProjectCompletion.ProposedOfferProjectCompletionId > 0) ? 'Update' : 'Add'}
      
        canAction={canAction && buildingId > 0}
        onSave={handleSaveProjectCompletion}
        isLoading={isLoading}
      />
    </>
  );
};

