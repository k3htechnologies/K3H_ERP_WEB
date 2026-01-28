import { fetchBuildingDropdown } from "@/features/building/buildingDropdown";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { FileText } from "lucide-react";

interface Props {
  onBuildingChange: (buildingId: number) => void;
  proposedOfferProposedPlanData: any[];

}

export default function RedevelopmentHeader({ onBuildingChange, proposedOfferProposedPlanData }: Props) {

  const { projectId } = useProject();

  const plan = proposedOfferProposedPlanData?.[0] || {};

  return (
    <div className="bg-white rounded-xl p-3 flex items-center justify-between" style={{boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

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

        <button className="flex items-center gap-2 border border-blue-600 text-blue-600 text-sm px-4 py-2 rounded-lg hover:bg-blue-50">
          <FileText size={14} />
          Generate Report
        </button>
      </div>
      
      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        <span className="bg-green-100 text-green-600 text-sm px-4 py-1 rounded-full">
          <FieldItem
            label=""
            value={"Project Plan"}
            urls={plan.PlanDocumentURL}
            isIcon
          />
        </span>

      </div>



    </div>
  );
}
