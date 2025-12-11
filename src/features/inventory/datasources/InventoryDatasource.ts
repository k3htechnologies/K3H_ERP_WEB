import baseClient from "@/core/config/baseClient";
import type { InventoryApiPullReponse, } from "../models/InventoryMasterModel";
import { InventoryApis } from "../api/InventoryApis";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class InventoryDatasource {
   abstract apiCallToFetchInventory(projectId : number) : Promise<InventoryApiPullReponse>
}

export class InventoryDatasourceImpl extends InventoryDatasource {

    private get k3hHttpClient() {
        return baseClient;
    } 

    async apiCallToFetchInventory(projectId :number ): Promise<InventoryApiPullReponse> {
        try{
           const url = `${InventoryApis.PULL}?ProjectId=${projectId}`;
            const apiResponse = await this.k3hHttpClient.getRequestWithAuthentication(url);
            
            return apiResponse;
        } catch(error : any){
            if(error === TokenExpiredException){
                this.apiCallToFetchInventory( projectId)
            }
            throw error;
        }
    }

    async apiCallToExportExcelPdf(projectId : number,exportType : string) {
        try{
            const url = `${InventoryApis.PULL}?ProjectId=${projectId}&ExportType=${exportType}`;
            const apiResponse = await this.k3hHttpClient.getRequestWithAuthentication(url);
            
            return apiResponse;
        }catch(error){
            if(error === TokenExpiredException){
                this.apiCallToFetchInventory( projectId)
            }
            throw error;
        }
    }
}


