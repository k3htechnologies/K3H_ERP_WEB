import baseClient from "@/core/config/baseClient";
import type { AddUpdateClassificationParameterRequest, DeleteClassificationParameterRequest, FilterWithPaginationClassificationParameter, ClassificationParameterDeleteResponse, ClassificationParameterListResponse, ClassificationParameterSaveReponse } from "../models/ClassificationParameterModel";
import { ClassificationParameterApi } from "@/features/classificationParameter/api/ClassificationParameterApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class ClassificationParameterDatasource {
    abstract pullClassificationParameter(params: FilterWithPaginationClassificationParameter, signal?: AbortSignal): Promise<ClassificationParameterListResponse>;
    abstract addUpdateClassificationParameter(params: AddUpdateClassificationParameterRequest, signal?: AbortSignal): Promise<ClassificationParameterSaveReponse>;
    abstract deleteClassificationParameter(params: DeleteClassificationParameterRequest, signal?: AbortSignal): Promise<ClassificationParameterDeleteResponse>;
}

export class ClassificationParameterDatasourceImpl implements ClassificationParameterDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullClassificationParameter(params: FilterWithPaginationClassificationParameter, signal?: AbortSignal): Promise<ClassificationParameterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.ClassificationParameterId) queryParams.append('ClassificationParameterId', params.ClassificationParameterId.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ClassificationParameterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL CLASSIFICATION PARAMETER :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullClassificationParameter(params);
            }

            throw error
        }
    }

    async addUpdateClassificationParameter(params: AddUpdateClassificationParameterRequest): Promise<ClassificationParameterSaveReponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ClassificationParameterApi.ADD_UPDATE,
                params
            )

            return response

        } catch (error) {

            console.error('ERROR: ADD UPDATE CLASSIFICATION PARAMETER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateClassificationParameter(params);

            }
            throw error
        }
    }

    async deleteClassificationParameter(params: DeleteClassificationParameterRequest): Promise<ClassificationParameterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ClassificationParameterId: (params.ClassificationParameterId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString()
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ClassificationParameterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE CLASSIFICATION PARAMETER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteClassificationParameter(params);

            }

            throw error
        }
    }

}