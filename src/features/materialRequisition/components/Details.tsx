import { runApiWithLoader } from "@/core/utils";
import { useEffect, useState } from "react";
import type { FilterWithPaginationMaterialRequisition, MaterialRequisitionData } from "../models/MaterialRequisitionModel";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { materialRequisitionService } from "../services/MaterialRequisitionService";
import { Loader } from "@/core/utils/loader";
import { useParams } from "react-router-dom";
import type { FilterInfo } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from "@/core/utils/dateFormat";

export const Details: React.FC = () => {
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const [matrialRequisitionData, setMaterialRequisitionData] = useState<MaterialRequisitionData | null>(null);

    const { projectId } = useProject();

    const { MaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const currentMaterialRequisitionId = MaterialRequisitionId ? Number(MaterialRequisitionId) : 0;

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
                    MaterialRequisitionId: filterParams?.MaterialRequisitionId ? Number(filterParams.MaterialRequisitionId)
                        : currentMaterialRequisitionId || undefined,
                    MaterialRequisitionStatus: filterParams?.MaterialRequisitionStatus ?? undefined,
                    MaterialRequisitionStage: filterParams?.MaterialRequisitionStage ?? undefined,
                    FromDate: filterParams?.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams?.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                };

                const response = await materialRequisitionService.apiCallPullMaterialRequisition(params);

                if (E.isRight(response)) {
                    const data = response.right.Data;

                    setMaterialRequisitionData(Array.isArray(data) ? (data[0] ?? null) : data);
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
            <h1>Material Requisition Details</h1>
        </div>
    )
}
export default Details;