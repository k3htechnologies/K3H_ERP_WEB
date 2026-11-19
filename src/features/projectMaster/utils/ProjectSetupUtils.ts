import * as E from "fp-ts/Either";
import { projectMasterService } from "@/features/projectMaster/services/ProjectMasterService";
import type { ProjectSetupStatus } from "@/features/projectMaster/models/ProjectMasterModel";

export const CheckProjectSetupStatus = async (projectId: number, pageName: string ): Promise<ProjectSetupStatus | null> => {

    const responseEither = await projectMasterService.apiCallCheckProjectSetupStatus(projectId, pageName );

    if (E.isLeft(responseEither)) {
        return null;
    }

    const data = responseEither.right.Data;

    return (Array.isArray(data) ? data[0] : data) ?? null;
};