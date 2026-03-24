import type { InventoryData, InventoryFlatFloorBasementPodiumWingData } from "../models/InventoryMasterModel";

export const countFlatsByStatus = (
    inventory: InventoryData[],
    inventoryBuildingId: number,
    status: string
): number => {

    if (!inventory || inventory.length === 0) return 0;

    const building = inventory.find(
        b => b.InventoryBuildingId === inventoryBuildingId
    );

    if (!building) return 0;

    return building.InventoryFlatFloorBasementPodiumWingData.reduce(
        (wingTotal, wing) => {

            const wingFlats = wing.InventoryFloorData.reduce(
                (floorTotal, floor) => {

                    const count = floor.InventoryFlatData.filter(
                        flat => flat.FlatStatus === status
                    ).length;

                    return floorTotal + count;

                }, 0);

            return wingTotal + wingFlats;

        }, 0
    );
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

