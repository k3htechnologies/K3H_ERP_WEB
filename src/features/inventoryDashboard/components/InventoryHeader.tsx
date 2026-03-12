import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Button } from "@/ui/components/forms";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OverviewItem {
  ProjectName?: string;
}

interface Props {
  overViewData?: OverviewItem[];
}

export default function InventoryHeader({ overViewData = [] }: Props) {
  const { canAction: canInventoryAction } = useMenuPermissions("/inventory");
  const { canAction: canParkingAction } = useMenuPermissions("/parking");

  const data = overViewData[0] || {};

  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl p-3 flex items-center justify-between" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded-lg border border-blue-300 bg-white shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700">{data.ProjectName}</div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        {canInventoryAction && (
          <Button variant="solid" color="blue" onClick={() => navigate("/inventory")} leftIcon={<Plus size={14} />}>
            Add Inventory
          </Button>
        )}

        {canParkingAction && (
          <Button color="blue" variant="solid" colorMode="extraLight" onClick={() => navigate("/parking")} leftIcon={<Plus size={14} />}>
            Add Parking
          </Button>
        )}

        <Button color="blue" variant="solid" colorMode="extraLight" leftIcon={<FileText size={14} />}>
          Generate Report
        </Button>
      </div>
    </div>
  );
}
