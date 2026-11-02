import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { ConstructionAreaApi } from "@/features/constructionArea/api/ConstructionAreaApi";
import type {
    ConstructionAreaListResponse,
    FilterWithPaginationConstructionAreaRequest,
    ConstructionAreaSaveResponse,
    AddUpdateConstructionAreaRequest,
} from "@/features/constructionArea/models/ConstructionAreaModel";

export abstract class ConstructionAreaDatasource {

    abstract pullConstructionArea(params: FilterWithPaginationConstructionAreaRequest, signal?: AbortSignal): Promise<ConstructionAreaListResponse>;
    abstract addUpdateConstructionArea(params: AddUpdateConstructionAreaRequest): Promise<ConstructionAreaSaveResponse>;
}

export class ConstructionAreaDatasourceImpl implements ConstructionAreaDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullConstructionArea(params: FilterWithPaginationConstructionAreaRequest, signal?: AbortSignal): Promise<ConstructionAreaListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 0).toString(),
                PageNumber: (params.PageNumber ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                ConstructionAreaId: (params.constructionAreaId ?? 0).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? false).toString(),
            });

            if (params.InventoryFlatId) queryParams.append("InventoryFlatId", (params.InventoryFlatId?? 0).toString());
            if (params.RERACarpetAreaSqFt) queryParams.append("RERACarpetAreaSqFt", (params.RERACarpetAreaSqFt?? 0).toString());
            if (params.BuildingNumber) queryParams.append('BuildingNumber', params.BuildingNumber);
            if (params.Wing) queryParams.append('Wing', params.Wing);
            if (params.Floor) queryParams.append('Floor', params.Floor);
            if (params.Flat) queryParams.append('Flat', params.Flat);
            if (params.FlatType) queryParams.append('FlatType', params.FlatType);
            if (params.FlatConfiguration) queryParams.append('FlatConfiguration', params.FlatConfiguration);
            if (params.FlatFacing) queryParams.append('FlatFacing', params.FlatFacing);
            if (params.FlatStatus) queryParams.append('FlatStatus', params.FlatStatus);
            if (params.ApprovalStatus) queryParams.append('ApprovalStatus', params.ApprovalStatus);
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(`${ConstructionAreaApi.PULL}?${queryParams.toString()}`, { signal });

        } catch (error: any) {

            console.error("ERROR: PULL CONSTRUCTION AREA :", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullConstructionArea(params);
            }
            throw error;
        }
    }

    async addUpdateConstructionArea(params: AddUpdateConstructionAreaRequest): Promise<ConstructionAreaSaveResponse> {
        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(ConstructionAreaApi.ADD_UPDATE, params );


        } catch (error: any) {

            console.error('ERROR: ADD UPDATE CONSTRUCTION AREA DATA :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateConstructionArea(params);
            }
            throw error
        }
    }
}
