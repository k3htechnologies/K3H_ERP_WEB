import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import { Tabs } from '@/ui/components/Tab/Tab';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchBuildingDropdown } from '@/features/building/buildingDropdown';
import { ExtraCarpetAreaTab } from '../components/ExtraCarpetAreaTab';
import { CorpusDetailsTab } from '../components/CorpusDetailsTab';
import { SecurityDepositTab } from '../components/SecurityDepositTab';
import { ShiftingDetailsTab } from '../components/ShiftingDetailsTab';
import { LienToSocietyDetailsTab } from '../components/LienToSocietyDetailsTab';
import { ParkingAllotmentTab } from '../components/ParkingAllotmentTab';
import { GSTonExistingPlusFreeAreaTab } from '../components/GSTonExistingPlusFreeAreaTab';
import { ProjectCompletionTab } from '../components/ProjectCompletionTab';
import { RentDetailsTab } from '../components/RentDetailsTab';
import { ReadyReckonerTab } from '../components/ReadyReckonerTab';
import { CarpetAreaTab } from '../components/CarpetAreaTab';
import { AdditionalInformationTab } from '../components/AdditionalInformationTab';
import { PlotAreaTab } from '../components/PlotAreaTab';
import { BankGuaranteeTab } from '../components/BankGuranteeTab';

export const ProposedOffer: React.FC = () => {
  const [buildingId, setBuildingId] = useState(0);
  const [buildingName, setBuildingName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  //#region PROJECT SELECTION GET ID
  const { projectId } = useProject();
  //#endregion

  //#region TAB ACTIVITY
  const proposedOfferTabList = [
    { id: "ExtraCarpetArea", label: "Extra Carpet Area" },
    { id: "CorpusDetails", label: "Corpus Details" },
    { id: "SecurityDeposit", label: "Security Deposit" },
    { id: "ShiftingDetails", label: "Shifting Details" },
    { id: "LienToSocietyDetails", label: "Lien to Society Details" },
    { id: "ParkingAllotment", label: "Parking Allotment" },
    { id: "GSTonExistingPlusFreeArea", label: "GST on Existing + Free Area" },
    { id: "ProjectCompletion", label: "Project Completion" },
    { id: "RentDetails", label: "Rent Details" },
    { id: "ReadyReckoner", label: "Ready Reckoner" },
    { id: "CarpetArea", label: "Carpet Area" },
    { id: "AdditionalInformation", label: "Additional Information" },
    { id: "PlotArea", label: "Plot Area" },
    { id: "BankGuarantee", label: "Bank Guarantee" }
  ];

  const [activeTab, setActiveTab] = useState<string>(proposedOfferTabList[0].id);
  //#endregion

  const selectedBuilding = useMemo(() => {
    if (!projectId || !buildingId) return null;
    return { label: buildingName, value: buildingId };
  }, [buildingId, buildingName, projectId]);

  const fetchBuildingCallback = useCallback(
    (pageNumber: number) =>
      fetchBuildingDropdown(pageNumber, { projectId: Number(projectId) }),
    [projectId]
  );

  useEffect(() => {
    // project changed → reset building
    setBuildingId(0);
    setBuildingName('');
  }, [projectId]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>
      <div className="pb-5 flex">
        <div className="relative min-w-0 w-[526px]">
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

        {activeTab === 'CorpusDetails' && (
          <CorpusDetailsTab
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

        {activeTab === 'RentDetails' && (
          <RentDetailsTab
            projectId={projectId}
            buildingId={buildingId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
          />
        )}
        {activeTab === 'ReadyReckoner' && (
          <ReadyReckonerTab
            projectId={projectId}
            buildingId={buildingId}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
          />
        )}
        {activeTab === 'CarpetArea' && (
          <CarpetAreaTab
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
        {activeTab === 'PlotArea' && (
          <PlotAreaTab
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
