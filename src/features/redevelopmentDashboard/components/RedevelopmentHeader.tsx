import { fetchBuildingDropdown } from "@/features/building/buildingDropdown";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { FileText } from "lucide-react";

export default function RedevelopmentHeader() {

      const { projectId } = useProject();

    return (
        <div className="bg-white rounded-xl p-3 flex items-center justify-between">

            {/* LEFT SIDE */}
            <div className="flex items-center gap-3">


                {/* Buildings */}
                <div className="flex items-center gap-2  rounded-lg w-[526px] text-sm text-gray-600">
                    <SingleSelectDropdownWithPagination
                        key={projectId}
                        title="Select Building"
                        size="lg"
                        
                        dataFetchCallBack={(pageNumber) => fetchBuildingDropdown(pageNumber, { projectId: Number(projectId) })}
                        onSelected={(item) => {
                            const selectedBuildingId = Number(item?.value ?? 0);
                            const selectedBuildingName = item?.label ?? '';
                        }}
                    />
                </div>

               
                {/* Report */}
                <button className="flex items-center gap-2 border border-blue-600 text-blue-600 text-sm px-4 py-2 rounded-lg hover:bg-blue-50">
                    <FileText size={14} />
                    Generate Report
                </button>

            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4">

                <span className="text-xs text-gray-400">
                    Updated on : 16 January 2026
                </span>

                <span className="bg-green-100 text-green-600 text-sm px-4 py-1 rounded-full">
                    Offer Finalized
                </span>

            </div>

        </div>
    );
}
