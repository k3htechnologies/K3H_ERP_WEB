import { Button } from "@/ui/components/forms";
import { FileText } from "lucide-react";
import Tabs from "@/ui/components/Tab/Tab";

interface Props {
  filterType: string;
  onFilterChange: (filterType: string) => void;
  onGenerateReport: () => void;
}

const FILTER_TAB_LIST = [
  { id: "TODAY", label: "Today" },
  { id: "WEEKLY", label: "This Week" },
  { id: "MONTHLY", label: "This Month" },
];

const TeamWorkspaceDashboardHeader: React.FC<Props> = ({
  filterType,
  onFilterChange,
  onGenerateReport,
}) => {
  return (
    <div
      className="bg-white rounded-xl p-3 flex flex-wrap items-center justify-between gap-3"
      style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
    >
      <Tabs
        tabs={FILTER_TAB_LIST}
        defaultActive={filterType}
        islarge
        istoggleTab
        onTabChange={(tab) => onFilterChange(tab.id)}
      />

      <Button
        color="blue"
        variant="solid"
        colorMode="extraLight"
        leftIcon={<FileText size={14} />}
        onClick={onGenerateReport}
      >
        Generate Report
      </Button>
    </div>
  );
};

export default TeamWorkspaceDashboardHeader;
