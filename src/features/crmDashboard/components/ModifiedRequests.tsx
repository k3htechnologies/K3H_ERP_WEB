import type { Table6 } from "@/features/crmDashboard/models/CrmDashboardModel";

interface Props {
  data: Table6[];
}

const ModifiedRequests: React.FC<Props> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.TotalCount, 0);
  const approved = data.reduce((s, d) => s + d.ApprovedCount, 0);
  const pending = data.reduce((s, d) => s + d.PendingCount, 0);

  return (
    <div className="pt-5">
    <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-3" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
      <h3 className="font-semibold">Modified Requests</h3>

      <div className="flex gap-2 text-xs p-2" >
        <span className="bg-gray-100 px-2 py-1 rounded">{total} Total</span>
        <span className="bg-green-100 text-green-600 px-2 py-1 rounded">{approved} Approved</span>
        <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded">{pending} Pending</span>
      </div>

      {data.map((d, i) => (
        <div key={i} className="flex justify-between text-sm border-b border-gray-300  py-2">
          <p>{d.Name}</p>
          <p>{d.TotalCount}</p>
        </div>
      ))}
    </div>
    </div>
  );
};

export default ModifiedRequests;