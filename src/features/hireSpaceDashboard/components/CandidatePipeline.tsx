import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { Table1 } from "@/features/hireSpaceDashboard/models/HireSpaceDashboardModel";

interface Props {
  pipelineData: Table1[];
}

const COLORS = ["#22C55E", "#2563EB", "#EAB308", "#F97316", "#EF4444", "#6B7280"];

export default function CandidatePipeline({ pipelineData }: Props) {
  const total = pipelineData.reduce((sum, item) => sum + (item.CandidateCount ?? 0), 0);

  return (
    <div className="pt-5">
      <div
        className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col h-[315px]"
        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
      >
        <h3 className="font-semibold text-gray-500">Candidate Pipeline</h3>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="relative h-[220px] w-full max-w-[280px] shrink-0 [&_.recharts-wrapper_svg]:outline-none">
          {pipelineData.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <NoDataView />
            </div>
          ) : (
            <>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pipelineData}
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={3}
                    dataKey="CandidateCount"
                    nameKey="StageName"
                    cornerRadius={10}
                    style={{ outline: "none" }}
                  >
                    {pipelineData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xl font-semibold text-gray-900">{total}</p>
                <p className="text-xs text-gray-500">Total Applications</p>
              </div>
            </>
          )}
        </div>

        <div className="w-full flex-1 space-y-3 overflow-y-auto thin-scroll pr-2">
          {pipelineData.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-4 pr-2 py-1">
              <div className="flex items-center gap-10">
                <div
                  className="w-3 h-3 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <p className="text-sm text-gray-700">{item.StageName}</p>
              </div>
              <p className="text-sm font-semibold text-gray-800 mr-2">{item.CandidateCount ?? 0}</p>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
