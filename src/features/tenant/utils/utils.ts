import type { InventoryFlatData } from "@/features/inventory/models/InventoryMasterModel";

export const getInventoryFlatIds = (inventoryFlatData: InventoryFlatData[] | null | undefined): string => {
    return (inventoryFlatData ?? [])
        .map((flat: InventoryFlatData) => flat.InventoryFlatId)
        .filter((id) => id && id > 0)
        .join(",");
};