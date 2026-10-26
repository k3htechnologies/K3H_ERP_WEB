import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Button } from "@/ui/components/forms";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  onGenerateReport: () => void;
}

const HireSpaceHeader: React.FC<Props> = ({ onGenerateReport }) => {
  const { canAction: canJobOpeningAction } = useMenuPermissions("/jobOpenings");
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl p-3 flex items-center justify-end" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3">
        <Button
          variant="solid"
          color="blue"
          className={!canJobOpeningAction ? "invisible" : ""}
          onClick={() => navigate("/jobOpenings/add")}
          leftIcon={<Plus size={14} />}
        >
          Add Opening
        </Button>

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
    </div>
  );
};

export default HireSpaceHeader;
