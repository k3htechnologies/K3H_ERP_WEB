import { CameraPlayerDataSourceImpl } from "@/features/cameraPlayer/datasources/CameraPlayerDataSource";
import type { CameraPlayerListResponse } from "@/features/cameraPlayer/models/CameraPlayerModel";
import type { Failure } from "@/core/api/FailureResponse";
import * as E from 'fp-ts/Either';

export const CameraPlayerDataSource = new CameraPlayerDataSourceImpl();

export const cameraPlayerService = {

    apiCallPullCameraPlayer: async (ProjectId: number, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CameraPlayerListResponse>> => {
        try {

            return E.right(await CameraPlayerDataSource.pullCameraPlayer(ProjectId, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }
}