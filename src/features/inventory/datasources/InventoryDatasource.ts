import baseClient from "@/core/config/baseClient";
import type { InventoryApiPullReponse, InventoryFlatData, UpdateFlatApiResponse, } from "../models/InventoryMasterModel";
import { InventoryApis } from "../api/InventoryApis";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class InventoryDatasource {
    abstract apiCallToFetchInventory(projectId: number): Promise<InventoryApiPullReponse>

    abstract apiCallToUpdateInventoryFlat(flatDetails: InventoryFlatData, projectId: number): Promise<UpdateFlatApiResponse>

    abstract apiCallToDeleteInventoryFlat(flatDetails: InventoryFlatData, projectId: number): Promise<any>
}

export class InventoryDatasourceImpl implements InventoryDatasource {
  
    private get k3hHttpClient() {
        return baseClient;
    }

    async apiCallToFetchInventory(projectId: number): Promise<InventoryApiPullReponse> {
        try {
            const url = `${InventoryApis.PULL}?ProjectId=${projectId}`;
            const apiResponse = await this.k3hHttpClient.getRequestWithAuthentication(url);

            return apiResponse;
        } catch (error: any) {
            if (error === TokenExpiredException) {
                this.apiCallToFetchInventory(projectId)
            }
            throw error;
        }
    }

    async apiCallToUpdateInventoryFlat(flatDetails: InventoryFlatData, projectId: number): Promise<UpdateFlatApiResponse> {
        try {
            const url = `${InventoryApis.UPDATEFLAT}`;
            
            // Convert InventoryFlatSpecificationData array to JSON string
            const inventoryFlatSpecificationJSON = flatDetails.InventoryFlatSpecificationData 
                ? JSON.stringify(flatDetails.InventoryFlatSpecificationData)
                : "[]";
            
            var payload =
            {
                "ProjectId": projectId,
                "InventoryBuildingId": flatDetails.InventoryBuildingId,
                "InventoryFlatFloorBasementPodiumWingId": flatDetails.InventoryFlatFloorBasementPodiumWingId,
                "InventoryFlatId": flatDetails.InventoryFlatId,
                "Flat": flatDetails.Flat,
                "FlatType": flatDetails.FlatType,
                "RERACarpetAreaSqFt": flatDetails.RERACarpetAreaSqFt,
                "FlatConfiguration": flatDetails.FlatConfiguration,
                "FlatStatus": flatDetails.FlatStatus,
                "FlatFacing": flatDetails.FlatFacing,
                "InventoryFlatSpecificationJSON": inventoryFlatSpecificationJSON
            };
            
            const apiResponse = await baseClient.postRequestWithAuthentication(url, payload)
            return apiResponse
        } catch (error) {
            if (error === TokenExpiredException) {
                this.apiCallToUpdateInventoryFlat(flatDetails, projectId)
            }
            throw error;
        }
    }

    async apiCallToDeleteInventoryFlat(flatDetails: InventoryFlatData, projectId: number) {
        try{
            const url = `${InventoryApis.DELETEFLAT}?ProjectId=${projectId}&InventoryBuildingId=${flatDetails.InventoryBuildingId}&InventoryFlatFloorBasementPodiumWingId=${flatDetails.InventoryFlatFloorBasementPodiumWingId}&InventoryFloorId=${flatDetails.InventoryFloorId}&InventoryFlatId=${flatDetails.InventoryFlatId}`;

            const apiResponse = await baseClient.deleteRequestWithAuthentication(url)

            return apiResponse

        }catch(error){
            if (error === TokenExpiredException) {
               this.apiCallToDeleteInventoryFlat(flatDetails,projectId)
            }
            throw error;
        }
    }

    async apiCallToExportExcelPdf(projectId: number, exportType: string) {
        try {
            const url = `${InventoryApis.PULL}?ProjectId=${projectId}&ExportType=${exportType}`;
            const apiResponse = await this.k3hHttpClient.getRequestWithAuthentication(url);

            return apiResponse;
        } catch (error) {
            if (error === TokenExpiredException) {
                this.apiCallToExportExcelPdf(projectId, exportType)
            }
            throw error;
        }
    }
}


