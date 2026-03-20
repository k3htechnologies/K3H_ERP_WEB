import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Button } from "@/ui/components/forms";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InventoryHeader: React.FC = () => {
  const { canAction: canInventoryAction } = useMenuPermissions("/inventory");
  const { canAction: canParkingAction } = useMenuPermissions("/parking");

  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl p-3 flex items-center justify-end" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
      {/* RIGHT SIDE */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
export default InventoryHeader;
