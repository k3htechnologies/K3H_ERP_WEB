import baseClient from "@/core/config/baseClient";
import type { AddUpdateMaterialMasterRequest, DeleteMaterialMasterRequest, FilterWithPaginationMaterialMaster, MaterialMasterDeleteResponse, MaterialMasterListResponse, MaterialMasterSaveReponse } from "../models/MaterialMasterModel";
import { MaterialMasterApi } from "../api/MaterialMasterApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class MaterialMasterDatasource {
    abstract pullMaterialMaster(params : FilterWithPaginationMaterialMaster,signal? : AbortSignal) : Promise<MaterialMasterListResponse>;
    abstract addUpdateMaterialMaster(payload : AddUpdateMaterialMasterRequest) : Promise<MaterialMasterSaveReponse>;
    abstract deleteMaterialMaster(params : DeleteMaterialMasterRequest) : Promise<MaterialMasterDeleteResponse>;
}

export class MaterialMasterDatasourceImpl implements MaterialMasterDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullMaterialMaster(params: FilterWithPaginationMaterialMaster, signal?: AbortSignal): Promise<MaterialMasterListResponse> {
        try{
            const queryParams = new URLSearchParams({
                PageSize : (params.PageSize ?? 10).toString(),
                PageNumber : (params.PageNumber ?? 1).toString(),
            })

            if(params.MaterialName?.trim())queryParams.append("MaterialName", params.MaterialName.trim())

            console.log(`${MaterialMasterApi.PULL}?${queryParams.toString()}`)

        const response = await this.k3hHttpClient.getRequestWithAuthentication(`${MaterialMasterApi.PULL}?${queryParams.toString()}`,{signal});
        
        return response;
        } catch(error : any){
            console.log("Error occured while material fetching ", error);
            if(error === TokenExpiredException){
                await this.pullMaterialMaster(params)
            }
            throw error;
        }
    }
    async addUpdateMaterialMaster(payload: AddUpdateMaterialMasterRequest): Promise<MaterialMasterSaveReponse> {
        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(`${MaterialMasterApi.ADD_UPDATE}`,payload)
            return response;
        } catch(error : any){
            console.log("Error occured while material fetching ", error);
            if(error === TokenExpiredException){
                await this.addUpdateMaterialMaster(payload)
            }
            throw error;
        }
    }
     
    async deleteMaterialMaster(params: DeleteMaterialMasterRequest): Promise<MaterialMasterDeleteResponse> {
        throw new Error("Method not implemented.");
    }

}