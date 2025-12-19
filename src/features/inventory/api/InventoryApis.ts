export const InventoryApis = {
    "PULL" : "/Inventory/PullInventory",
    "ADD" : "/Inventory/AddInventory",
    "DELETE" : "/Inventory/DeleteInventory",
    "UPDATEFLAT" : "/Inventory/UpdateInventoryFlat",
    "DELETEFLAT" : "/Inventory/"
}

export type InventoryApiKeys = keyof typeof InventoryApis