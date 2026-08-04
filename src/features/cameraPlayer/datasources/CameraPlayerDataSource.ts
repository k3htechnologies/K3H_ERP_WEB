import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { CameraPlayerApi } from "@/features/cameraPlayer/api/CameraPlayerApi";
import type { CameraPlayerListResponse } from "@/features/cameraPlayer/models/CameraPlayerModel";

export abstract class CameraPlayerDataSource {
    abstract pullCameraPlayer(ProjectId: number, signal?: AbortSignal): Promise<CameraPlayerListResponse>
}

export class CameraPlayerDataSourceImpl implements CameraPlayerDataSource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullCameraPlayer(ProjectId: number, signal?: AbortSignal): Promise<CameraPlayerListResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: ProjectId.toString()
            })

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${CameraPlayerApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL CAMERA PLAYER:", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullCameraPlayer(ProjectId);
            }
            throw error;
        }
    }
}