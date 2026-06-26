import { formatCurrency } from "@/core/utils/comman";
import type { Table5 } from "@/features/crmDashboard/models/CrmDashboardModel";

interface Props {
  data: Table5[];
}

const MilestoneCollection: React.FC<Props> = ({ data }) => {
  return (
    <div className="pt-5">
      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <h3 className="font-semibold mb-3">Milestone Collection  <span className="text-sm font-normal text-gray-500"> ({data.length} Records)</span></h3>

        <div className="overflow-auto thin-scroll max-h-[500px] rounded-lg">
          <table className="w-full min-w-[750px] text-sm">

            <thead className="sticky top-0 bg-white z-20 text-gray-500 shadow-sm">

              <tr>
                <th className="px-2 py-2 text-left">Stage</th>
                <th className="px-2 py-2 text-left">Expected</th>
                <th className="px-2 py-2 text-left">Received</th>
                <th className="px-2 py-2 text-left">Pending</th>
                <th className="px-2 py-2 text-left">Progress</th>
              </tr>
            </thead>

            <tbody className="w-full border-separate border-spacing-y-2">

             
               <tr className="sticky top-[35px] z-10 font-semibold border-t-2 border-gray-300 font-semibold bg-gray-50">
                <td className="px-2 py-3 rounded-l-lg">
                  Total
                </td>

                <td className="px-2 py-3">
                  {formatCurrency(
                    data.reduce((sum, item) => sum + (item.Expected || 0), 0)
                  )}
                </td>

                <td className="px-2 py-3 text-green-600">
                  {formatCurrency(
                    data.reduce((sum, item) => sum + (item.Received || 0), 0)
                  )}
                </td>

                <td className="px-2 py-3 text-red-500">
                  {formatCurrency(
                    data.reduce((sum, item) => sum + (item.Pending || 0), 0)
                  )}
                </td>

                <td className="px-2 py-3">
                  {(() => {
                    const totalExpected = data.reduce(
                      (sum, item) => sum + (item.Expected || 0),
                      0
                    );

                    const totalReceived = data.reduce(
                      (sum, item) => sum + (item.Received || 0),
                      0
                    );

                    const totalPercent = totalExpected
                      ? (totalReceived / totalExpected) * 100
                      : 0;

                    return (
                      <div className="w-full bg-gray-200 h-2 rounded">
                        <div
                          className="bg-green-500 h-2 rounded"
                          style={{ width: `${totalPercent}%` }}
                        />
                      </div>
                    );
                  })()}
                </td>
              </tr>

              {data.map((d, i) => {

                const percent = d.Expected ? (d.Received / d.Expected) * 100 : 0;

                return (
                  <tr key={i} className="border-t border-gray-100">

                    <td className="px-2 py-2 rounded-l-lg">{d.PaymentScheduleName}</td>
                    <td className="px-2 py-2">{formatCurrency(d.Expected || 0)}</td>
                    <td className="px-2 py-2 text-green-600">{formatCurrency(d.Received || 0)}</td>
                    <td className="px-2 py-2 text-red-500">{formatCurrency(d.Pending || 0)}</td>
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
    </div>
  );
};

export default MilestoneCollection;