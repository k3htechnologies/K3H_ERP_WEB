import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { ProjectMasterApi } from '@/features/projectMaster/api/ProjectMasterApi'
import type {
    FilterWithPaginationProjectMasterRequest,
    ProjectMasterListResponse,
    ProjectMasterSaveResponse,
} from '@/features/projectMaster/models/ProjectMasterModel'

export abstract class ProjectMasterDatasource {

    abstract pullProjectMaster(params: FilterWithPaginationProjectMasterRequest, signal?: AbortSignal): Promise<ProjectMasterListResponse>;
    abstract addUpdateProjectMaster(formData: FormData): Promise<ProjectMasterSaveResponse>;

}

export class ProjectMasterDatasourceImpl implements ProjectMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullProjectMaster(params: FilterWithPaginationProjectMasterRequest, signal?: AbortSignal): Promise<ProjectMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsProjectAccess: (params.IsProjectAccess ?? true).toString(),
            })
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.ProjectLocation) queryParams.append('ProjectLocation', params.ProjectLocation.toString());
            if (params.ProjectName?.trim()) queryParams.append('ProjectName', params.ProjectName.trim());
            if (params.CTCNumber?.trim()) queryParams.append('CTCNumber', params.CTCNumber.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProjectMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL PROJECT MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullProjectMaster(params);
            }

            throw error
        }
    }

    async addUpdateProjectMaster(formData: FormData): Promise<ProjectMasterSaveResponse> {

        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                ProjectMasterApi.ADD_UPDATE,
                formData
            );

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE PROJECT MASTER :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateProjectMaster(formData);
            }
            throw error
        }
    }


}
