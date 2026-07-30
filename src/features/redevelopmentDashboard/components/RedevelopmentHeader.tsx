import { fetchBuildingDropdown } from "@/features/building/buildingDropdown";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { Button } from "@/ui/components/forms";
import { useNavigate } from "react-router-dom";

interface Props {
  onBuildingChange: (buildingId: number) => void;

}

export default function RedevelopmentHeader({ onBuildingChange }: Props) {

  const { projectId } = useProject();
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl p-3 flex items-center justify-between" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

      <div className="flex items-center gap-3">

        <div className="flex items-center gap-2 rounded-lg w-[526px] text-sm text-gray-600">

          <SingleSelectDropdownWithPagination
            key={projectId}
            title="Select Building"
            size="lg"
            dataFetchCallBack={(pageNumber) =>
              fetchBuildingDropdown(pageNumber, { projectId: Number(projectId) })
            }
            onSelected={(item) => {
              const selectedBuildingId = Number(item?.value ?? 0);

              onBuildingChange(selectedBuildingId);
            }}
          />

        </div>


      </div>

      <div className="flex items-center gap-4">
        <Button
          color="blue"
          variant="solid"
          colorMode="extraLight"
          onClick={() => navigate("/proposedPlan")}>
          Proposed Plan
        </Button>

      </div>


    </div>
  );
}
