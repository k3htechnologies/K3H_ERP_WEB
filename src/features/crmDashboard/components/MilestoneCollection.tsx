import { formatCurrency } from "@/core/utils/comman";
import type { Table5 } from "@/features/crmDashboard/models/CrmDashboardModel";

interface Props {
  data: Table5[];
}

const MilestoneCollection: React.FC<Props> = ({ data }) => {
  return (
    <div className="pt-5">
    <div className="bg-white p-4 rounded-xl border border-gray-100">
      <h3 className="font-semibold mb-3">Milestone Collection  <span className="text-sm font-normal text-gray-500">
                    ({data.length} Records)
                </span></h3>

      <table className="w-full text-sm">
        <thead className="text-gray-500">
          <tr>
            <th className="text-left">Stage</th>
            <th className="text-left">Expected</th>
            <th className="text-left">Received</th>
            <th className="text-left">Pending</th>
            <th className="text-left">Progress</th>
          </tr>
        </thead>

        <tbody>
          {data.map((d, i) => {

            const percent = d.Expected ? (d.Received / d.Expected) * 100  : 0;

            return (
              <tr key={i} className="border-t border-gray-100">
                
                <td>{d.PaymentScheduleName}</td>
                <td>{formatCurrency(d.Expected || 0)}</td>
                <td className="text-green-600">{formatCurrency(d.Received || 0)}</td>
                <td className="text-red-500">{formatCurrency(d.Pending || 0)}</td>
                <td>
                  <div className="w-full bg-gray-200 h-2 rounded">
                    <div
                      className="bg-green-500 h-2 rounded"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default MilestoneCollection;