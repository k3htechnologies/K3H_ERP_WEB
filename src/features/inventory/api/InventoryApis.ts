export const InventoryApis = {
    "IS_PROJECT_INVENTORY_EXISTS": "/Inventory/IsProjectInventoryExists",
    "PULL": "/Inventory/PullInventory",
    "ADD": "/Inventory/AddInventory",
    "DELETE": "/Inventory/DeleteInventory",

    "UPDATE_Inventory_WING": "/Inventory/UpdateInventoryWing",
    "UPDATE_Inventory_FLOOR": "Inventory/UpdateInventoryFloor",
    "UPDATE_Inventory_FLAT": "/Inventory/UpdateInventoryFlat",

    "DELETE_Inventory_BUILDING": "Inventory/DeleteInventoryBuilding",
    "DELETE_Inventory_WING": "Inventory/DeleteInventoryWing",
    "DELETE_Inventory_FLOOR": "Inventory/DeleteInventoryFloor",
    "DELETE_Inventory_FLAT": "/Inventory/DeleteInventoryFlat",

    "Add_Inventory_BUILDING": "Inventory/AddInventoryBuilding",
    "ADD_Inventory_WING": "Inventory/AddInventoryWing",
    "ADD_Inventory_FLOOR": "Inventory/AddInventoryFloor",
    "ADD_Inventory_FLAT": "/Inventory/AddInventoryFlat",

    "Add_Inventory_FLOOR_PAYMENT_SCHEDULE": "Inventory/PullInventoryFloorForPaymentSchedule",

    "Add_Inventory_FLOOR_PARKING_COUNT": "Inventory/AddUpdateInventoryFloorParkingCount",

    "PULL_PAGINATED_FLATS": "Inventory/PullPaginatedFlats",

    "PULL_PAGINATED_FLOOR": "Inventory/PullPaginatedFloor",
    
    "PULL_INVENTORY_STRUCTURE": '/Inventory/PullProjectInventoryStructure',
}

export type InventoryApiKeys = keyof typeof InventoryApis