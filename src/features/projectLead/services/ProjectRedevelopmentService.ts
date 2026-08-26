import { ProjectRedevelopmentDatasourceImpl } from "@/features/projectLead/datasources/ProjectRedevelopmentDatasource";
import * as E from 'fp-ts/Either';
import type { DeleteProjectRedevelopmentRequest, DeleteProjectRedevelopmentResponse, FilterWithPaginationProjectRedevelopmentRequest, ProjectRedevelopmentListResponse, ProjectRedevelopmentSaveResponse } from "@/features/projectLead/models/ProjectRedevelopmentModel";
import type { Failure } from "@/core/api/FailureResponse";

export const ProjectRedevelopmentDataSource = new ProjectRedevelopmentDatasourceImpl();

export const projectRedevelopmentService = {

    apiCallPullProjectRedevelopment: async (params: FilterWithPaginationProjectRedevelopmentRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProjectRedevelopmentListResponse>> => {

        try {

            return E.right(await ProjectRedevelopmentDataSource.pullProjectRedevelopment(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateProjectRedevelopment: async (data: FormData): Promise<E.Either<Failure, ProjectRedevelopmentSaveResponse>> => {
        try {

            return E.right(await ProjectRedevelopmentDataSource.addUpdateProjectRedevelopment(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteProjectRedevelopment: async (params: DeleteProjectRedevelopmentRequest): Promise<E.Either<Failure, DeleteProjectRedevelopmentResponse>> => {

        try {

            return E.right(await ProjectRedevelopmentDataSource.deleteProjectRedevelopment(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    }
}