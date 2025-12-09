import * as E from "fp-ts/Either";
import { InventoryDatasourceImpl } from "../datasources/InventoryDatasource";

const inventoryDatasource = new InventoryDatasourceImpl

export const InventoryService = {
    apiCallPullInventory : async (projectId : number) => {
        try{
               return E.right(await inventoryDatasource.apiCallToFetchInventory(projectId 
                

               ))
        } catch(error : any){
           return E.left({message : error.message})
        }
    }
}