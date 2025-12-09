export const InventoryApis = {
    "PULL" : "/Inventory/PullInventory",
    "ADD" : "/Inventory/AddInventory",
    "DELETE" : "/Inventory/DeleteInventory",
}

export type InventoryApiKeys = keyof typeof InventoryApis