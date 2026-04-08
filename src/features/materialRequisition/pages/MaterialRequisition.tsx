import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react";
import type { FilterWithPaginationMaterialRequisition, MaterialRequisitionData } from "../models/MaterialRequisitionModel";
import { useToast } from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterInfo } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from "@/core/utils/dateFormat";
import { materialRequisitionService } from "../services/MaterialRequisitionService";
import * as E from "fp-ts/Either";

export const MaterialRequisition: React.FC = () => {
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const [matrialRequisitionData, setMaterialRequisitionData] = useState<MaterialRequisitionData []>([]);

    const { projectId } = useProject();


    useEffect(() => {
        if (!projectId) return;
        fetchDetailsdata();
    }, [projectId])

    const fetchDetailsdata = async (filterParams?: FilterInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisition = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: Number(projectId),
                    MaterialRequisitionStatus: filterParams?.MaterialRequisitionStatus ?? undefined,
                    MaterialRequisitionStage: filterParams?.MaterialRequisitionStage ?? undefined,
                    FromDate: filterParams?.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams?.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                };

                const response = await materialRequisitionService.apiCallPullMaterialRequisition(params);

                if (E.isRight(response)) {

                    setMaterialRequisitionData(response.right.Data);
                } else {
                    addToast({ type: "error", title: response.left.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Loading Material Requisition",
        );
    };

    //#region
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            {/* Loader */}
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>
            <h1>Material Requisition</h1>
        </div>
    )
}
export default MaterialRequisition;