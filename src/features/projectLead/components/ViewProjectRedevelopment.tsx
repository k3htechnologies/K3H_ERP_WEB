import { Loader } from "@/core/utils/loader";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { FilterWithPaginationProjectRedevelopmentRequest, ProjectRedevelopmentData } from "../models/ProjectRedevelopmentModel";
import useToast from "@/core/hooks/useToast";
import * as E from "fp-ts/Either";
import { useProjectRedevelopmentListState } from "../context/ProjectRedevelopmentListStateContext";
import { runApiWithLoader } from "@/core/utils";
import { projectRedevelopmentService } from "../services/ProjectRedevelopmentService";

export const ViewProjectRedevelopment: React.FC = () => {
    const [ProjectRedevelopmentData, setProjectRedevelopmentData] = useState<ProjectRedevelopmentData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { ProjectRedevelopmentId } = useParams<{ ProjectRedevelopmentId?: string }>();
    const { listState } = useProjectRedevelopmentListState();
    const currentProjectRedevelopmentId = ProjectRedevelopmentId ? Number(ProjectRedevelopmentId) : listState.ProjectRedevelopmentId;

    useEffect(() => {
        LoadProjectRedevelopmentData()
    }, []);

    const LoadProjectRedevelopmentData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProjectRedevelopmentRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    ProjectRedevelopmentId: currentProjectRedevelopmentId
                }

                const response = await projectRedevelopmentService.apiCallPullProjectRedevelopment(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    setProjectRedevelopmentData((Array.isArray(data) ? (data[0] ?? null) : data));

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
            "Loading Project Redevelopment",
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <HeaderActionBar
                titleText={ProjectRedevelopmentData?.BuildingName ?? ""}
                cancelText="Cancel"
                onCancel={() =>
                    navigate("/projectLead", {
                        state: { activeTab: "Redevelopment" }
                    })}
                isLoading={false}
            />
        </div>
    )
}
export default ViewProjectRedevelopment;