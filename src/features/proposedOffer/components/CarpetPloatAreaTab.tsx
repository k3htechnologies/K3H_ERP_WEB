import { useEffect, useState } from "react"
import type { BuildingDetailsData, BuildingKeyContactDetails, FilterWithPaginationBuildingDetailsRequest } from "@/features/building/models/BuildingModel"
import { buildingService } from "@/features/building/services/BuildingService"
import * as E from 'fp-ts/Either';
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from '@/core/utils';
import { FieldItem } from "@/ui/components/forms/FieldItem";

interface CarpetPlotAreaTabProps {
  projectId: number | null
  buildingId?: number
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  setLoadingMessage: (message: string) => void
}

export const CarpetPlotAreaTab: React.FC<CarpetPlotAreaTabProps> = ({
  projectId,
  buildingId,
  setIsLoading,
  setLoadingMessage
}) => {
  const { addToast } = useToast();
  const [contactDetailsList, setContactDetailsList] = useState<Omit<BuildingKeyContactDetails, 'BuildingId' | 'ProjectId' | 'CreatedById' | 'CreatedBy' | 'CreatedDate' | 'ModifiedById' | 'ModifiedBy' | 'ModifiedDate' | 'LastModifiedBy' | 'LastModifiedDate'>[]>([]);
  const [buildingDetailsList, setBuildingDetailsList] = useState<BuildingDetailsData | null>(null);

  useEffect(() => {
      if (!projectId || !buildingId) return;
      loadBuildingDetailsFromServer();
  
    }, [projectId, buildingId]);

  const loadBuildingDetailsFromServer = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationBuildingDetailsRequest = {
          ProjectId: Number(projectId),
          BuildingId: buildingId
        }

        const response = await buildingService.apiCallPullBuildingDetails(params);

        if (E.isRight(response)) {

          setBuildingDetailsList(response.right.Data?.[0] ?? null);

          const row = response.right.Data?.[0];

          if (row.BuildingKeyContactDetailsData && row.BuildingKeyContactDetailsData.length > 0) {

            const contacts = row.BuildingKeyContactDetailsData.map(contact => ({
              BuildingKeyContactDetailsId: contact.BuildingKeyContactDetailsId ?? 0,
              Uniquekey: contact.Uniquekey ?? null,
              ContactType: contact.ContactType ?? '',
              ContactName: contact.ContactName ?? '',
              MobileNumber: contact.MobileNumber ?? '',
              EmailId: contact.EmailId ?? ''
            }));

            setContactDetailsList(contacts);

          } else {

            setContactDetailsList([]);
          }


        } else {
          addToast({
            type: 'error', title: response.left.message
          });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Loading Building Details'
    );
  };
  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-3">
      <div className="lg:col-span-3 space-y-6">

        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

          <div className="bg-[#E7F2FF] px-3 py-2 border-b border-[#D0D7DE]">
            <h4 className="text-sm font-semibold text-[#1D4ED8]">
              Plot Area
            </h4>
          </div>
          <div className="p-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FieldItem
                    label="Gross Plot Area (SqMt)"
                    value={buildingDetailsList?.GrossPlotAreaSqFt ?? 0}
                  />

                  <FieldItem
                    label="Physical Survey Area (SqMt)"
                    value={buildingDetailsList?.PlotAreaPhysicalSurveySqFt ?? 0}
                  />

                  <FieldItem
                    label="Old Approved Plan Area (SqMt)"
                    value={buildingDetailsList?.PlotAreaOldApprovedPlanSqFt ?? 0}
                  />
                </div>
              </div>


              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                  <FieldItem
                    label="Conveyance Area (SqMt)"
                    value={buildingDetailsList?.PlotAreaConveyanceSqFt ?? 0}
                  />

                  <FieldItem
                    label="PR Card Area (SqMt)"
                    value={buildingDetailsList?.PlotAreaPRCardSqFt ?? 0}
                  />

                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

          <div className="bg-[#E7F2FF] px-3 py-2 border-b border-[#D0D7DE]">
            <h4 className="text-sm font-semibold text-[#1D4ED8]">
              Construction Details
            </h4>
          </div>
          <div className="p-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FieldItem label="Total Carpet Area (SqFt)" value={buildingDetailsList?.TotalCarpetAreaSqFt ?? 0} />
                  <FieldItem label="Total Residential Units" value={buildingDetailsList?.TotalResidentialUnits ?? 0} />
                  <FieldItem label="Residential Carpet Area (SqFt)" value={buildingDetailsList?.TotalResidentialCarpetAreaSqFt ?? 0} />
                </div>
              </div>

              <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FieldItem label="Total Commercial Units" value={buildingDetailsList?.TotalCommercialUnits ?? 0} />
                  <FieldItem label="Commercial Carpet Area (SqFt)" value={buildingDetailsList?.TotalCommercialCarpetAreaSqFt ?? 0} />
                  <FieldItem label="Garage Carpet Area (SqFt)" value={buildingDetailsList?.TotalGarageCarpetAreaSqFt ?? 0} />
                </div>
              </div>
              <div className="lg:col-span-3 ">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FieldItem label="Terrace Carpet Area (SqFt)" value={buildingDetailsList?.TotalTerraceCarpetAreaSqFt ?? 0} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

          <div className="bg-[#E7F2FF] px-3 py-2 border-b border-[#D0D7DE]">
            <h4 className="text-sm font-semibold text-[#1D4ED8]">
              Key Contact Details
            </h4>
          </div>
          <div className="p-4 bg-white">
            <div className="space-y-4">


              {contactDetailsList.map((contact, index) => (
                  <div key={index}  className={`space-y-3 ${ index !== contactDetailsList.length - 1 ? "pb-4 border-b border-[#135bec2e]"  : "" }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    <FieldItem label="Contact Type" value={contact.ContactType} />
                    <FieldItem label="Contact Name" value={contact.ContactName} />
                    <FieldItem label="Mobile Number" value={contact?.MobileNumber ? `+91 ${contact.MobileNumber}` : ''} />
                    <FieldItem label="E-Mail ID" value={contact.EmailId} />

                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}