import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import { Tabs } from '@/ui/components/Tab/Tab';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchBuildingDropdown } from '@/features/building/buildingDropdown';
import { ExtraCarpetAreaTab } from '@/features/proposedOffer/components/ExtraCarpetAreaTab';
import { HardshipDetailsTab } from '@/features/proposedOffer/components/HardshipDetailsTab';
import { SecurityDepositTab } from '@/features/proposedOffer/components/SecurityDepositTab';
import { ShiftingDetailsTab } from '@/features/proposedOffer/components/ShiftingDetailsTab';
import { LienToSocietyDetailsTab } from '@/features/proposedOffer/components/LienToSocietyDetailsTab';
import { ParkingAllotmentTab } from '@/features/proposedOffer/components/ParkingAllotmentTab';
import { GSTonExistingPlusFreeAreaTab } from '@/features/proposedOffer/components/GSTonExistingPlusFreeAreaTab';
import { ProjectCompletionTab } from '@/features/proposedOffer/components/ProjectCompletionTab';
import { TemporaryAccommodationAlternativeTab } from '@/features/proposedOffer/components/TemporaryAccommodationAlternativeTab';
import { ReadyReckonerRateTab } from '@/features/proposedOffer/components/ReadyReckonerRateTab';
import { CarpetPlotAreaTab } from '@/features/proposedOffer/components/CarpetPloatAreaTab';
import { AdditionalInformationTab } from '@/features/proposedOffer/components/AdditionalInformationTab';
import { BankGuaranteeTab } from '@/features/proposedOffer/components/BankGuranteeTab';
import { Button } from '@/ui/components/forms';
import { handleExportFile } from '@/core/utils/exportFile';
import { runApiWithLoader } from '@/core/utils';
import type { FilterWithPaginationProposedOfferPdfRequest } from '@/features/proposedOffer/models/ProposedOfferModel';
import useToast from '@/core/hooks/useToast';
import { proposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';
import { BuildingOverviewTab } from '@/features/proposedOffer/components/BuildingOverviewTab';

export const ProposedOffer: React.FC = () => {
  const [buildingId, setBuildingId] = useState(0);
  const [buildingName, setBuildingName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const { projectId } = useProject();
  const { addToast } = useToast()

  const proposedOfferTabList = [
    { id: "BuildingOverview", label: "Building Overview" },
    { id: "ExtraCarpetArea", label: "Extra Carpet Area" },
    { id: "HardshipDetails", label: "Hardship Offer" },
    { id: "SecurityDeposit", label: "Security Deposit" },
    { id: "ShiftingDetails", label: "Shifting Details" },
    { id: "LienToSocietyDetails", label: "Lien to Society Details" },
    { id: "ParkingAllotment", label: "Parking Allotment" },
    { id: "GSTonExistingPlusFreeArea", label: "GST on Existing + Free Area" },
    { id: "ProjectCompletion", label: "Project Completion" },
    { id: "TemporaryAccommodationAlternative", label: "Temp Accom Alternative" },
    { id: "ReadyReckonerRate", label: "Ready Reckoner Rate" },
    { id: "CarpetPlotArea", label: "Carpet / Plot Area" },
    { id: "AdditionalInformation", label: "Additional Information" },
    { id: "BankGuarantee", label: "Bank Guarantee" }
  ];

  const [activeTab, setActiveTab] = useState<string>(proposedOfferTabList[0].id);

  const selectedBuilding = useMemo(() => {
    if (!projectId || !buildingId) return null;
    return { label: buildingName, value: buildingId };
  }, [buildingId, buildingName, projectId]);

  const fetchBuildingCallback = useCallback((pageNumber: number, params?: { value?: string }) =>
      fetchBuildingDropdown(pageNumber, { projectId: Number(projectId),buildingName: params?.value || "" }),
    [projectId]
  );
  
  useEffect(() => {
    setBuildingId(0);
    setBuildingName('');
  }, [projectId]);

  const handleExportPDF = async (exportType: 'Excel' | 'PDF') => {

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationProposedOfferPdfRequest = {
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          ExportType: exportType
        }
        const response = await proposedOfferService.apiCallPullProposedOfferPDF(params);

        handleExportFile(response, exportType, 'Proposed Offer', addToast);

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' })
      },
      undefined,
      'Preparing Export'
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

      <Loader loading={isLoading} title={loadingMessage}> <div></div></Loader>

      <div className="pb-5 flex items-end justify-between">

        <div className="w-[526px]">
          <SingleSelectDropdownWithPagination
            label="Building"
            title="Select Building"
            isShowClearSelection={false}
            size="lg"
            initialValue={selectedBuilding}
            dataFetchCallBack={fetchBuildingCallback}

            onSelected={(item) => {
              if (!item) return;
              setBuildingId(Number(item.value));
              setBuildingName(item.label);
            }}
          />
        </div>

        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleExportPDF('PDF');

          }}
          color="blue"
          colorMode="gradient_light"
          disabled={Number(projectId) > 0 ? false : true}
          size="mxs"
          title="Export as PDF"
          style={{ width: '95px' }}>
          PDF
        </Button>

      </div>

      <Tabs
        tabs={proposedOfferTabList}
        defaultActive={activeTab}
        onTabChange={(t) => {
          setActiveTab(t.id);
        }}
        islarge={true}
      />

      <div className="mt-6">
        {activeTab === 'BuildingOverview' && (
          <BuildingOverviewTab
            projectId={projectId}
            buildingId={buildingId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
          />
        )}
        {activeTab === 'ExtraCarpetArea' && (
          <ExtraCarpetAreaTab
            projectId={projectId}
            buildingId={buildingId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
          />
        )}

        {activeTab === 'ParkingAllotment' && (
          <ParkingAllotmentTab
            projectId={projectId}
            buildingId={buildingId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
          />
        )}

        {activeTab === 'GSTonExistingPlusFreeArea' && (
          <GSTonExistingPlusFreeAreaTab
            projectId={projectId}
            buildingId={buildingId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
          />
        )}

        {activeTab === 'HardshipDetails' && (
          <HardshipDetailsTab
            projectId={projectId}
            buildingId={buildingId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
          />
        )}

        {activeTab === 'SecurityDeposit' && (
          <SecurityDepositTab
            projectId={projectId}
            buildingId={buildingId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
          />
        )}

        {activeTab === 'ShiftingDetails' && (
          <ShiftingDetailsTab
            projectId={projectId}
            buildingId={buildingId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
          />
        )}

        {activeTab === 'LienToSocietyDetails' && (
          <LienToSocietyDetailsTab
            projectId={projectId}
            buildingId={buildingId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
          />
        )}

        {activeTab === 'ProjectCompletion' && (
          <ProjectCompletionTab
            projectId={projectId}
            buildingId={buildingId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
          />
        )}

        {activeTab === 'TemporaryAccommodationAlternative' && (
          <TemporaryAccommodationAlternativeTab
            projectId={projectId}
            buildingId={buildingId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
          />
        )}
        {activeTab === 'ReadyReckonerRate' && (
          <ReadyReckonerRateTab
            projectId={projectId}
            buildingId={buildingId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
          />
        )}
        {activeTab === 'CarpetPlotArea' && (
          <CarpetPlotAreaTab
            projectId={projectId}
            buildingId={buildingId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
          />
        )}
        {activeTab === 'AdditionalInformation' && (
          <AdditionalInformationTab
            projectId={projectId}
            buildingId={buildingId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
          />
        )}

        {activeTab === 'BankGuarantee' && (
          <BankGuaranteeTab
            projectId={projectId}
            buildingId={buildingId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
          />
        )}
      </div>
    </div>
  );
};

export default ProposedOffer;
