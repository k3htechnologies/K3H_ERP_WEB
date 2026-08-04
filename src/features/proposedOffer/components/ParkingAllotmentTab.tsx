import React, { useState, useEffect } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ProposedOfferParkingAllotmentData,
  FilterWithPaginationProposedOfferParkingAllotmentRequest,
  AddUpdateProposedOfferParkingAllotmentRequest,
} from '@/features/proposedOffer/models/ProposedOfferModel';
import { proposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';
import { Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { filterNumbers, filterNumbersWithDecimal, isValidPercentage, allowPercentage } from '@/core/utils/fileValidation';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { initialFormStateParkingAllotment } from '../utils/initialStates';
import { TextArea } from '@/ui/components/forms/Textarea';

interface ParkingAllotmentTabProps {
  projectId: number | null;
  buildingId: number;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

export const ParkingAllotmentTab: React.FC<ParkingAllotmentTabProps> = ({
  projectId,
  buildingId,
  isLoading,
  setIsLoading,
  setLoadingMessage,
}) => {
  const [, setParkingAllotmentData] = useState<ProposedOfferParkingAllotmentData | null>(null);
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions();
  const [errorsParkingAllotment, setErrorsParkingAllotment] = useState<{ [k: string]: string }>({});
  const [formDataParkingAllotment, setFormDataParkingAllotment] = useState<AddUpdateProposedOfferParkingAllotmentRequest>(() => initialFormStateParkingAllotment());

  useEffect(() => {
    if (!projectId || !buildingId) return;
    setErrorsParkingAllotment({});
    fetchParkingAllotmentData();
  }, [projectId, buildingId]);

  const handleFieldChangeParkingAllotment = (field: keyof AddUpdateProposedOfferParkingAllotmentRequest, value: any) => {
    setFormDataParkingAllotment((prev) => ({ ...prev, [field]: value }));
    if (errorsParkingAllotment[field]) {
      setErrorsParkingAllotment((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const fetchParkingAllotmentData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferParkingAllotmentRequest = {
          ProjectId: projectId ?? undefined,
          BuildingId: buildingId
        };

        const response = await proposedOfferService.apiCallPullParkingAllotment(params);

        if (E.isRight(response)) {
          const data = response.right.Data?.[0] || null;
          setParkingAllotmentData(data);

          if (data) {
            setFormDataParkingAllotment({
              ProposedOfferParkingAllotmentId: data.ProposedOfferParkingAllotmentId || 0,
              Uniquekey: data.Uniquekey || initialFormStateParkingAllotment().Uniquekey,
              BuildingId: buildingId,
              ProjectId: Number(projectId),
              NumberOfParkingAllottedToMembers: data.NumberOfParkingAllottedToMembers ?? 0,
              TotalParkingPercentageAllottedToSociety: data.TotalParkingPercentageAllottedToSociety ?? 0
            });
          } else {
            setFormDataParkingAllotment({
              ...initialFormStateParkingAllotment(),
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
      'Loading Parking Allotment'
    );
  };

  const validateParkingAllotmentForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataParkingAllotment.NumberOfParkingAllottedToMembers) {
      newErrors.NumberOfParkingAllottedToMembers = "Number of Parking Allotted to Members is required"
    }

    if (!formDataParkingAllotment.TotalParkingPercentageAllottedToSociety) {
      newErrors.TotalParkingPercentageAllottedToSociety = 'Total Parking Percentage is required'
    } else if (!isValidPercentage(String(formDataParkingAllotment.TotalParkingPercentageAllottedToSociety))) {
      newErrors.TotalParkingPercentageAllottedToSociety = 'Enter a valid percentage'
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleSaveParkingAllotment = async () => {
    if (buildingId === 0) {
      addToast({ type: "error", title: "Please select proper building first" });
      return
    }

    setErrorsParkingAllotment({})

    const validation = validateParkingAllotmentForm()

    if (!validation.isValid) {
      setErrorsParkingAllotment(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload: AddUpdateProposedOfferParkingAllotmentRequest = {
          ProposedOfferParkingAllotmentId: formDataParkingAllotment.ProposedOfferParkingAllotmentId,
          Uniquekey: formDataParkingAllotment.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          NumberOfParkingAllottedToMembers: formDataParkingAllotment.NumberOfParkingAllottedToMembers,
          TotalParkingPercentageAllottedToSociety: formDataParkingAllotment.TotalParkingPercentageAllottedToSociety
        };

        const response = await proposedOfferService.apiCallAddUpdateParkingAllotment(payload);

        if (E.isRight(response)) {
          const isAdd = formDataParkingAllotment.ProposedOfferParkingAllotmentId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProposedOfferParkingAllotmentData;
            setParkingAllotmentData(newRecord);
            setFormDataParkingAllotment({
              ...formDataParkingAllotment,
              ProposedOfferParkingAllotmentId: newRecord.ProposedOfferParkingAllotmentId || 0,
              Uniquekey: newRecord.Uniquekey || formDataParkingAllotment.Uniquekey
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as ProposedOfferParkingAllotmentData;
            setParkingAllotmentData(updatedRecord);
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
      Number(formDataParkingAllotment.ProposedOfferParkingAllotmentId) === 0 ? 'Add Parking Allotment' : 'Update Parking Allotment'
    )
  };

  return (
    <>
      <div className="space-y-6 pb-5">
        {/* Parking Allotment Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">
            Parking Allotment Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Input
                label="Number of Parking Allotted to Members"
                required
                type="text"
                value={formDataParkingAllotment.NumberOfParkingAllottedToMembers || ''}
                onChange={(e) => handleFieldChangeParkingAllotment('NumberOfParkingAllottedToMembers', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                error={errorsParkingAllotment.NumberOfParkingAllottedToMembers}
                placeholder="Enter Number of Parking Allotted to Members"
              />
            </div>
            <div>
              <Input
                label="Total Parking Percentage Allotted to Society (%)"
                required
                type="text"
                rightIcon="%"
                value={formDataParkingAllotment.TotalParkingPercentageAllottedToSociety || ''}
                onChange={(e) => {
                  const val = allowPercentage(e.target.value);
                  if (val !== null) {
                    handleFieldChangeParkingAllotment('TotalParkingPercentageAllottedToSociety', filterNumbersWithDecimal(e.target.value))
                  }
                }}
                error={errorsParkingAllotment.TotalParkingPercentageAllottedToSociety}
                placeholder="Enter Total Parking Percentage"
              />
            </div>
          </div>
          <div>
            <TextArea
              label="Remark"
              className='thin-scroll'
              value={formDataParkingAllotment.Remark ?? ""}
              placeholder="Enter Remark"
              onChange={(e) => handleFieldChangeParkingAllotment("Remark", e.target.value)}
            />
          </div>
        </div>
      </div>
      <BottomActionBar
        cancelText="Cancel"
        saveText={(formDataParkingAllotment.ProposedOfferParkingAllotmentId && formDataParkingAllotment.ProposedOfferParkingAllotmentId > 0) ? 'Update' : 'Add'}
        onCancel={() => {
          setFormDataParkingAllotment({
            ...initialFormStateParkingAllotment(),
            ProjectId: Number(projectId)
          });
          setErrorsParkingAllotment({});
          fetchParkingAllotmentData();
        }}
        canAction={canAction && buildingId > 0}
        onSave={handleSaveParkingAllotment}
        isLoading={isLoading}
      />
    </>
  );
};

