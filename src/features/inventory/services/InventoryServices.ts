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
    },

    apiCallToExportPdfExcel : async (projectId : number, exportType : string) => {
        try{
            return E.right(await inventoryDatasource.apiCallToExportExcelPdf(projectId,exportType))
        }catch(error : any){
            return E.left({message : error.message})
        }
    }
}