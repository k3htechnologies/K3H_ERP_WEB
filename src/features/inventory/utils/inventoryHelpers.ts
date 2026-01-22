import type { InventoryData, InventoryFlatFloorBasementPodiumWingData } from "../models/InventoryMasterModel";

/**
 * Count flats by status across all buildings
 */
export const countFlatsByStatus = (inventory: InventoryData[], status: string): number => {
    if (inventory.length === 0) return 0;

    return inventory.reduce((total, building) => {
        const buildingFlats = building.InventoryFlatFloorBasementPodiumWingData.reduce((wingTotal, wing) => {
            const wingFlats = wing.InventoryFloorData.reduce((floorTotal, floor) => {
                const count = floor.InventoryFlatData.filter(
                    flat => flat.FlatStatus === status
                ).length;
                return floorTotal + count;
            }, 0);
            return wingTotal + wingFlats;
        }, 0);
        return total + buildingFlats;
    }, 0);
};

/**
 * Count flats by status for a specific wing
 */
export const countWingWiseFlatStatus = (
    wing: InventoryFlatFloorBasementPodiumWingData | undefined,
    status: string
): number => {
    if (!wing) return 0;

    return wing.InventoryFloorData.reduce((total, floor) => {
        const count = floor.InventoryFlatData.filter(
            flat => flat.FlatStatus === status
        ).length;
        return total + count;
    }, 0);
};

