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
            if (params.sortBy?.trim()) queryParams.append('SortBy', params.sortBy.trim());
            if (params.exportType) queryParams.append('ExportType', params.exportType);

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
        try{
            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(`${MaterialMasterApi.DELETE}?MaterialMasterId=${params.MaterialMasterId}&Uniquekey=${params.Uniquekey}`)
            return response;
        }catch(error){
            console.log("Error occured while delete material ", error);
            if(error === TokenExpiredException){
                await this.deleteMaterialMaster(params)
            }
            throw error;
        }
    }

}