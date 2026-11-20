import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {

    DarAllocationDeleteResponse,
    DarAllocationListResponse,
    DeleteDarAllocationRequest,
    FilterWithPaginationDarAllocationRequest,
    AddUpdateDarAllocationRequest,

} from "@/features/darAllocation/models/DarAllocationModel";
import { DarAllocationApi } from "@/features/darAllocation/api/DarAllocationApi";

export abstract class DarAllocationDatasource {

    abstract pullDarAllocation(params: FilterWithPaginationDarAllocationRequest, signal?: AbortSignal): Promise<DarAllocationListResponse>;
    abstract addUpdateDarAllocation(data: AddUpdateDarAllocationRequest): Promise<DarAllocationListResponse>;
    abstract deleteDarAllocation(params: DeleteDarAllocationRequest): Promise<DarAllocationDeleteResponse>;

}

export class DarAllocationDatasourceImpl implements DarAllocationDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullDarAllocation(params: FilterWithPaginationDarAllocationRequest, signal?: AbortSignal): Promise<DarAllocationListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            });

            if (params.EmployeeName?.trim()) queryParams.append("EmployeeName", params.EmployeeName.trim());
            if (params.Location?.trim()) queryParams.append("Location", params.Location.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${DarAllocationApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL DAR ALLOCATION :", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullDarAllocation(params);
            }

            throw error;

        }
    }

    async addUpdateDarAllocation(params: AddUpdateDarAllocationRequest): Promise<DarAllocationListResponse> {
        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                DarAllocationApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD DAR ALLOCATION:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateDarAllocation(params);
            }
            throw error
        }
    }

    async deleteDarAllocation(params: DeleteDarAllocationRequest): Promise<DarAllocationDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                DarAllocationId: (params.DarAllocationId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${DarAllocationApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE DAR ALLOCATION:', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteDarAllocation(params);
            }
            throw error
        }
    }

}
