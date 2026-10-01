import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { Table1 } from "@/features/teamWorkspaceDashboard/models/TeamWorkspaceDashboardModel";

interface Props {
  pendingMomData: Table1[];
}

export default function PendingMomActions({ pendingMomData }: Props) {
  return (
    <div className="pt-5">
      <div
        className="bg-white p-4 rounded-xl border border-gray-100 space-y-3 h-[420px] flex flex-col"
        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
      >
        <h3 className="font-semibold text-gray-500">
          Pending MOM Actions{" "}
          <span className="text-sm font-normal text-gray-500">
            ({pendingMomData.length} Records)
          </span>
        </h3>

        <div className="flex-1 overflow-y-auto thin-scroll space-y-3 pr-1">
          <div className="h-full flex items-center justify-center">
            <NoDataView />
          </div>
        </div>
      </div>
    </div>
  );
}
