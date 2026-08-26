import type { Failure } from "@/core/api/FailureResponse";
import * as E from 'fp-ts/Either';
import { ProjectLandDatasourceImpl } from "@/features/projectLead/datasources/ProjectLandDatasource";
import type { DeleteProjectLandRequest, DeleteProjectLandResponse, FilterWithPaginationProjectLandRequest, ProjectLandListResponse, ProjectLandSaveResponse, } from "@/features/projectLead/models/ProjectLandModel";

export const ProjectLandDataSource = new ProjectLandDatasourceImpl();

export const projectLandService = {

    apiCallPullProjectLand: async (params: FilterWithPaginationProjectLandRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProjectLandListResponse>> => {

        try {

            return E.right(await ProjectLandDataSource.pullProjectLand(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateProjectLand: async (data: FormData): Promise<E.Either<Failure, ProjectLandSaveResponse>> => {

        try {

            return E.right(await ProjectLandDataSource.addUpdateProjectLand(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteProjectLand: async (params: DeleteProjectLandRequest): Promise<E.Either<Failure, DeleteProjectLandResponse>> => {

        try {

            return E.right(await ProjectLandDataSource.deleteProjectLand(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    }
}