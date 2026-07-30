import React, { useCallback, useEffect, useState } from "react";
import OverviewCards from "@/features/redevelopmentDashboard/components/OverviewCards";
import ProgressTimeline from "@/features/redevelopmentDashboard/components/ProgressTimeline";
import AreaUtilization from "@/features/redevelopmentDashboard/components/AreaUtilization";
import BuildingOverview from "@/features/redevelopmentDashboard/components/BuildingOverview";
import FinancialOverview from "@/features/redevelopmentDashboard/components/FinancialOverview";
import TenantOverview from "@/features/redevelopmentDashboard/components/TenantOverview";
import AlertsPanel from "@/features/redevelopmentDashboard/components/Alert";
import RedevelopmentHeader from "@/features/redevelopmentDashboard/components/RedevelopmentHeader";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import useToast from "@/core/hooks/useToast";
import * as E from "fp-ts/Either";
import { redevelopmentDashboardService } from "@/features/redevelopmentDashboard/services/RedevelopmentDashboardService";
import ParkingDetails from "@/features/redevelopmentDashboard/components/ParkingDetails";

const RedevelopmentDashboard: React.FC = () => {

  const { addToast } = useToast();
  const { projectId } = useProject();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [buildingData, setBuildingData] = useState<any[]>([]);
  const [tenantApplicantChargesData, setTenantApplicantChargesData] = useState<any[]>([]);
  const [parkingData, setParkingData] = useState<any[]>([]);
  const [tenantData, setTenantData] = useState<any[]>([]);
  const [alertsData, setAlertsData] = useState<any[]>([]);

  const [selectedBuildingId, setSelectedBuildingId] = useState<number>(0);

  useEffect(() => {
    setSelectedBuildingId(0);
  }, [projectId]);

  useEffect(() => {

    if (!projectId) return;
    fetchInventory();

  }, [projectId, selectedBuildingId]);

  const fetchInventory = useCallback(async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const response = await redevelopmentDashboardService.apiCallPullRedevelopmentDashboard(Number(projectId),selectedBuildingId );

        if (E.isRight(response)) {

          const e = response.right.Data;

          setBuildingData(e.Table0 || []);
          setTenantApplicantChargesData(e.Table1 || []);
          setParkingData(e.Table2 || []);
          setTenantData(e.Table3 || []);
          setAlertsData(e.Table4 || []);

        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Loading Data"
    );
  }, [projectId, selectedBuildingId, addToast]);

  return (
   <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">

      <Loader loading={isLoading} title={loadingMessage}><div /></Loader>

      {buildingData.length > 0 ? (
        <>
          <RedevelopmentHeader onBuildingChange={setSelectedBuildingId}/>

          <OverviewCards
            buildingData={buildingData}
            tenantApplicantChargesData={tenantApplicantChargesData}
            alertsData={alertsData}
          />

          <ProgressTimeline
            buildingData={buildingData}
            tenantApplicantChargesData={tenantApplicantChargesData}
            alertsData={alertsData}
            tenantData={tenantData}
            proposedOfferProposedPlanData={parkingData}
          />

          <FinancialOverview tenantApplicantChargesData={tenantApplicantChargesData} />

           <div className="grid grid-cols-12 gap-4 mt-5">
            <div className="col-span-4">
              <AreaUtilization tenantData={tenantData} />
            </div>

            <div className="col-span-4">
              <TenantOverview tenantData={tenantData} />
            </div>

             <div className="col-span-4">
              <ParkingDetails parkingData={parkingData} />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mt-5">
            <div className="col-span-8">
              <BuildingOverview buildingData={buildingData} />
            </div>

            <div className="col-span-4">
              <AlertsPanel alertsData={alertsData} />
            </div>
          </div>

          
        </>
      ) :
        <div className="flex items-center justify-center text-gray-400">
          {projectId ? "No data found" : "Please select a project"}
        </div>}

    </div>
  );
};

export default RedevelopmentDashboard;
