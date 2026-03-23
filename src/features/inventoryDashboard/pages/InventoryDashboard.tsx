import React, { useCallback, useEffect, useState } from "react";
import OverviewCards from "@/features/inventoryDashboard/components/OverviewCards";
import BuildingOverview from "@/features/inventoryDashboard/components/BuildingOverview";
import AlertsPanel from "@/features/inventoryDashboard/components/Alert";
import InventoryHeader from "@/features/inventoryDashboard/components/InventoryHeader";
import { inventoryDashboardService } from "@/features/inventoryDashboard/services/InventoryDashboardService";
import UnitStatusDistribution from "@/features/inventoryDashboard/components/UnitStatusDistribution";
import ParkingDistribution from "@/features/inventoryDashboard/components/ParkingDistribution";

import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import useToast from "@/core/hooks/useToast";
import * as E from "fp-ts/Either";
import { type Table0, type Table1, type Table2, type Table3, type Table4 } from "@/features/inventoryDashboard/models/InventoryDashboardModel";
import WingDetails from "@/features/inventoryDashboard/components/WingDetails";

const InventoryDashboard: React.FC = () => {

  const { addToast } = useToast();
  const { projectId } = useProject();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [overViewData, setOverViewData] = useState<Table0[]>([]);
  const [parkingData, setParkingData] = useState<Table1[]>([]);
  const [buildingOverviewData, setBuildingOverviewData] = useState<Table2[]>([]);
  const [alertsData, setAlertsData] = useState<Table3[]>([]);
  const [wingData, setWingData] = useState<Table4[]>([])

  useEffect(() => {
    if (!projectId) return;
    fetchInventory();
  }, [projectId]);

  const fetchInventory = useCallback(async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const response = await inventoryDashboardService.apiCallPullInventoryDashboard(Number(projectId));

        if (E.isRight(response)) {

          const e = response.right.Data;
          setOverViewData(e.Table0 || []);
          setParkingData(e.Table1 || []);
          setBuildingOverviewData(e.Table2 || []);
          setAlertsData(e.Table3 || []);
          setWingData(e.Table4 || []);
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
  }, [projectId, addToast]);

  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}><div /></Loader>

      {overViewData.length > 0 ? (
        <>
          <InventoryHeader />

          <OverviewCards overViewData={overViewData} />

          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
            <UnitStatusDistribution overViewData={overViewData} />
            <ParkingDistribution parkingData={parkingData} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-5">
            <div className="md:col-span-12 lg:col-span-8">
              <BuildingOverview buildingOverviewData={buildingOverviewData} />
            </div>

            <div className="md:col-span-12 lg:col-span-4">
              <AlertsPanel alertsData={alertsData} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
            <WingDetails wingData={wingData} />
          </div>
        </>
      ) :
        <div className="flex items-center justify-center text-gray-400">
          {projectId ? "No inventory data found" : "Please select a project"}
        </div>
      }
    </div>
  );
};

export default InventoryDashboard;
