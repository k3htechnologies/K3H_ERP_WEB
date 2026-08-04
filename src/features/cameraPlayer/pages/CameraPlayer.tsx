import { useCallback, useEffect, useState } from "react";
import { runApiWithLoader } from "@/core/utils";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { cameraPlayerService } from "@/features/cameraPlayer/services/CameraPlayerService";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import CameraVideo from "@/features/cameraPlayer/pages/CameraVideo";

export const CameraPlayer: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [liveUrl, setLiveUrl] = useState("");

    const { projectId } = useProject();
    const { addToast } = useToast();

    const loadCameraPlayer = useCallback(async () => {
        if (!projectId) return;

        let urlResult = "";

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await cameraPlayerService.apiCallPullCameraPlayer(
                    Number(projectId)
                );

                if (E.isRight(response)) {
                    urlResult = response.right.SuccessMessage?.[0] ?? "";
                    setLiveUrl(urlResult);
                } else {
                    addToast({
                        type: "error",
                        title: response.left.message,
                    });
                }
            },
            undefined,
            (error: any) =>
                addToast({
                    type: "error",
                    title: error.message || "Failed to load camera player",
                }),
            undefined,
            "Loading Camera Player"
        );

        return urlResult;
    }, [projectId, addToast]);

    useEffect(() => {
        let isActive = true;
        let intervalId: ReturnType<typeof setInterval>;

        const initializeStream = async () => {
            const url = await loadCameraPlayer();

            // ADDED: If we got a URL, start pinging the backend every 10 seconds 
            // so the .NET server knows we are still watching.
            if (url && isActive) {
                intervalId = setInterval(() => {
                    // Just call the endpoint silently to keep it alive
                    cameraPlayerService.apiCallPullCameraPlayer(Number(projectId)).catch(() => { });
                }, 10000);
            }
        };

        initializeStream();

        return () => {
            isActive = false;
            if (intervalId) clearInterval(intervalId);
        };
    }, [loadCameraPlayer, projectId]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 relative min-h-[300px]">
            <Loader loading={isLoading} title={loadingMessage}>
                <div />
            </Loader>

            {!isLoading && liveUrl ? (
                <div>
                    <h3 className="text-sm font-medium text-[#1D1D1D80] mb-2">
                        Live Camera
                    </h3>
                    <CameraVideo url={liveUrl} />
                </div>
            ) : !isLoading && !liveUrl ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    No Camera Stream Available
                </div>
            ) : null}
        </div>
    );
};

export default CameraPlayer;