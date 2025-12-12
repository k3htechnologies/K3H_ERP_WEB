export const InventoryApis = {
    "PULL" : "/Inventory/PullInventory",
    "ADD" : "/Inventory/AddInventory",
    "DELETE" : "/Inventory/DeleteInventory",
    "UPDATEFLAT" : "/Inventory/UpdateInventoryFlat",
}

export type InventoryApiKeys = keyof typeof InventoryApis