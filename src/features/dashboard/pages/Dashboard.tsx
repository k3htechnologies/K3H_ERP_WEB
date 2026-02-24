import WorktimeOverview from "../components/WorktimeOverview";

const Dashboard = () => (
  <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-6">

    <div className="grid grid-cols-12 gap-4 mt-5">
      <div className="col-span-4">
        <WorktimeOverview />
      </div>
      <div className="col-span-5">
      </div>
    </div>
  </div>
);

export default Dashboard;
