export const InventoryApis = {
    "PULL" : "/Inventory/PullInventory",
    "ADD" : "/Inventory/AddInventory",
    "DELETE" : "/Inventory/DeleteInventory",
    "UPDATE_Inventory_FLAT" : "/Inventory/UpdateInventoryFlat",
    "DELETE_Inventory_FLAT" : "/Inventory/DeleteInventoryFlat"
}

export type InventoryApiKeys = keyof typeof InventoryApis