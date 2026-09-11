import { useCallback, useEffect, useState } from "react";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { handleExportFile } from "@/core/utils/exportFile";
import { Loader } from "@/core/utils/loader";
import useToast from "@/core/hooks/useToast";
import HireSpaceHeader from "@/features/hireSpaceDashboard/components/HireSpaceHeader";
import OverviewCards from "@/features/hireSpaceDashboard/components/OverviewCards";
import CandidatePipeline from "@/features/hireSpaceDashboard/components/CandidatePipeline";
import CandidateByDepartment from "@/features/hireSpaceDashboard/components/CandidateByDepartment";
import ActiveJobRoleOpenings from "@/features/hireSpaceDashboard/components/ActiveJobRoleOpenings";
import UpcomingInterviews from "@/features/hireSpaceDashboard/components/UpcomingInterviews";
import UpcomingDeadlines from "@/features/hireSpaceDashboard/components/UpcomingDeadlines";
import { hireSpaceDashboardService } from "@/features/hireSpaceDashboard/services/HireSpaceDashboardService";
import type { Table0, Table1, Table2, Table3, Table4, Table5 } from "@/features/hireSpaceDashboard/models/HireSpaceDashboardModel";

const HireSpaceDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const { addToast } = useToast();

  const [overViewData, setOverViewData] = useState<Table0[]>([]);
  const [pipelineData, setPipelineData] = useState<Table1[]>([]);
  const [departmentData, setDepartmentData] = useState<Table2[]>([]);
  const [openingsData, setOpeningsData] = useState<Table3[]>([]);
  const [interviewsData, setInterviewsData] = useState<Table4[]>([]);
  const [deadlinesData, setDeadlinesData] = useState<Table5[]>([]);

  useEffect(() => {
    fetchHireSpaceDashboard();
  }, []);

  const fetchHireSpaceDashboard = useCallback(async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const response = await hireSpaceDashboardService.apiCallPullHireSpaceDashboard({});

        if (E.isRight(response)) {

          const e = response.right.Data;
          setOverViewData(e.Table0 || []);
          setPipelineData(e.Table1 || []);
          setDepartmentData(e.Table2 || []);
          setOpeningsData(e.Table3 || []);
          setInterviewsData(e.Table4 || []);
          setDeadlinesData(e.Table5 || []);
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
      "Loading Hire Space Dashboard"
    );
  }, [addToast]);

  const handleGenerateReport = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await hireSpaceDashboardService.apiCallPullHireSpaceDashboard({
          ExportType: exportType,
        });

        handleExportFile(response, exportType, 'Hire Space Dashboard', addToast);
        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Exporting Hire Space Dashboard',
    );
  };

  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}><div /></Loader>

      <HireSpaceHeader onGenerateReport={() => handleGenerateReport('Excel')} />

      <OverviewCards overViewData={overViewData} />

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
        <CandidatePipeline pipelineData={pipelineData} />
        <CandidateByDepartment departmentData={departmentData} />
      </div>

      <ActiveJobRoleOpenings openingsData={openingsData} />

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
        <UpcomingInterviews interviewsData={interviewsData} />
        <UpcomingDeadlines deadlinesData={deadlinesData} />
      </div>
    </div>
  );
};

export default HireSpaceDashboard;
