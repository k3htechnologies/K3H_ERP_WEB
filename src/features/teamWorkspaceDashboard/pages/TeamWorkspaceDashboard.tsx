import { useCallback, useEffect, useState } from "react";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { handleExportFile } from "@/core/utils/exportFile";
import { Loader } from "@/core/utils/loader";
import useToast from "@/core/hooks/useToast";
import TeamWorkspaceDashboardHeader from "@/features/teamWorkspaceDashboard/components/TeamWorkspaceDashboardHeader";
import OverviewCards from "@/features/teamWorkspaceDashboard/components/OverviewCards";
import TodaysSchedule from "@/features/teamWorkspaceDashboard/components/TodaysSchedule";
import MyTaskOverview from "@/features/teamWorkspaceDashboard/components/MyTaskOverview";
import PendingMomActions from "@/features/teamWorkspaceDashboard/components/PendingMomActions";
import RecentActivity from "@/features/teamWorkspaceDashboard/components/RecentActivity";
import { teamWorkspaceDashboardService } from "@/features/teamWorkspaceDashboard/services/TeamWorkspaceDashboardService";
import type {
  Table0,
  Table1,
  Table3,
  Table5,
} from "@/features/teamWorkspaceDashboard/models/TeamWorkspaceDashboardModel";

const TeamWorkspaceDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const { addToast } = useToast();

  const [filterType, setFilterType] = useState("TODAY");
  const [taskData, setTaskData] = useState<Table0[]>([]);
  const [pendingMomData, setPendingMomData] = useState<Table1[]>([]);
  const [roomsData, setRoomsData] = useState<Table3[]>([]);
  const [overviewData, setOverviewData] = useState<Table5[]>([]);

  useEffect(() => {
    fetchTeamWorkspaceDashboard();
  }, []);

  const fetchTeamWorkspaceDashboard = useCallback(async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await teamWorkspaceDashboardService.apiCallPullTeamWorkspaceDashboard();

        if (E.isRight(response)) {
          const e = response.right.Data;
          setTaskData(e?.Table0 || []);
          setPendingMomData(e?.Table1 || []);
          setRoomsData(e?.Table3 || []);
          setOverviewData(e?.Table5 || []);
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
      "Loading Team Workspace Dashboard"
    );
  }, [addToast]);

  const handleGenerateReport = async (exportType: "Excel" | "PDF") => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await teamWorkspaceDashboardService.apiCallPullTeamWorkspaceDashboard();

        handleExportFile(response, exportType, "Team Workspace Dashboard", addToast);
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Exporting Team Workspace Dashboard"
    );
  };

  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div />
      </Loader>

      <TeamWorkspaceDashboardHeader
        filterType={filterType}
        onFilterChange={setFilterType}
        onGenerateReport={() => handleGenerateReport("Excel")}
      />

      <OverviewCards overviewData={overviewData} roomsData={roomsData} />

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
        <TodaysSchedule scheduleData={taskData} />
        <MyTaskOverview overviewData={overviewData} taskData={taskData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
        <PendingMomActions pendingMomData={pendingMomData} />
        <RecentActivity activityData={taskData} />
      </div>
    </div>
  );
};

export default TeamWorkspaceDashboard;
