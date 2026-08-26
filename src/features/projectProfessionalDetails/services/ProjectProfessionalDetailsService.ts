import type { Failure } from "@/core/api/FailureResponse";
import { ProjectProfessionalDetailsDatasourceImpl } from "@/features/projectProfessionalDetails/datasources/ProjectProfessionalDetailsDataSource";
import type { AddUpdateProjectProfessionalDetails, DeleteProjectProfessionalDetailsRequest, FilterWithPaginationProjectProfessionalDetails, ProjectProfessionalDetailsListResponse, ProjectProfessionalDetailsResponse, ProjectProfessionalDetailsSaveResponse } from "@/features/projectProfessionalDetails/models/ProjectProfessionalDetailsModel";
import * as E from 'fp-ts/Either';

const projectProfessionalDetailsDatasource = new ProjectProfessionalDetailsDatasourceImpl();

export const projectProfessionalDetailsService = {

    apiCallPullProjectProfessionalDetails: async (params: FilterWithPaginationProjectProfessionalDetails, options?: { signal: AbortSignal }): Promise<E.Either<Failure, ProjectProfessionalDetailsListResponse>> => {

        try {

            return E.right(await projectProfessionalDetailsDatasource.pullprojectProfessionalDetails(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddUpdateProjectProfessionalDettails: async (data: AddUpdateProjectProfessionalDetails): Promise<E.Either<Failure, ProjectProfessionalDetailsSaveResponse>> => {

        try {
            return E.right(await projectProfessionalDetailsDatasource.addUpdateprojectProfessionalDetails(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallDeleteProjectProfessionalDettails: async (params: DeleteProjectProfessionalDetailsRequest): Promise<E.Either<Failure, ProjectProfessionalDetailsResponse>> => {

        try {
            return E.right(await projectProfessionalDetailsDatasource.deleteProjectProfessionalDetails(params));
        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    }
}