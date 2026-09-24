import { useNavigate } from "react-router-dom";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { Table4 } from "@/features/hireSpaceDashboard/models/HireSpaceDashboardModel";
import { format24To12Hour } from "@/core/utils/comman";

interface Props {
  interviewsData: Table4[];
}

export default function UpcomingInterviews({ interviewsData }: Props) {
  const navigate = useNavigate();

  return (
    <div className="pt-5">
      <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-3" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-gray-500">Upcoming Interviews</h3>
          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
            TODAY · {interviewsData.length} INTERVIEWS
          </span>
        </div>

        <div className="h-[360px] overflow-y-auto thin-scroll pr-2">
          {interviewsData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <NoDataView />
            </div>
          ) : (
            interviewsData.map((item, i) => (
              <div key={i} className="bg-[#F9F9FF] rounded-lg p-4 mb-3 grid grid-cols-12 items-center gap-4">
                <span className="col-span-3 inline-flex items-center justify-center shrink-0 px-3 py-2 rounded-lg bg-[#D6E4FF] text-[#0058BE] text-xs font-semibold whitespace-nowrap w-fit">
                  TIME : {item.InterviewTime
                    ? format24To12Hour(item.InterviewTime.split(":")[0], item.InterviewTime.split(":")[1])
                    : "-"}
                </span>

                <div className="col-span-4 min-w-0">
                  <p className="font-semibold text-[#2D2D2D]">{item.CandidateName || "-"}</p>
                  <p className="text-sm text-gray-500">{item.MobileNo || "-"}</p>
                </div>

                <div className="col-span-5 min-w-0 space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Interviewer</p>
                    <p className="font-semibold text-[#2D2D2D]">{item.InterviewPanel || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-semibold text-[#2D2D2D]">{item.JobRole || "-"}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-center">
          <span
            className="cursor-pointer text-blue-600 hover:underline"
            onClick={() => navigate("/scheduleinterview")}
          >
            View Interview Schedule →
          </span>
        </div>
      </div>
    </div>
  );
}
