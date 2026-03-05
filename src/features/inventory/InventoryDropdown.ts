import * as E from 'fp-ts/Either';
import { inventoryService } from '@/features/inventory/services/InventoryServices';

export const fetchBuildingDropdown = async (params?: { projectId?: number; }) => {
  try {

    const responseEither = await inventoryService.apiCallPullProjectInventoryStructure({
      ProjectId: Number(params?.projectId),
    });

    if (E.isLeft(responseEither)) {
      return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: number }[] };
    }

    const apiResponse = responseEither.right;

    const uniqueBuildings = Array.from(
      new Map(
        (apiResponse?.Data || []).map((d: any) => [
          d.InventoryBuildingId,
          {
            label: d.BuildingNumber,
            value: d.InventoryBuildingId
          }])
      ).values()
    );

    return {
      totalNumberOfRecord: uniqueBuildings.length,
      itemList: uniqueBuildings
    };

  } catch (err) {
    console.error('FETCH BUILDING DROPDOWN ERROR', err);
    return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: number }[] };
  }
};

// Wing
export const fetchWingDropdown = async (params?: {
  projectId?: number;
  inventoryBuildingId?: number;
}) => {
  try {
    const responseEither = await inventoryService.apiCallPullProjectInventoryStructure({
      ProjectId: Number(params?.projectId),
      InventoryBuildingId: Number(params?.inventoryBuildingId),
    });

    if (E.isLeft(responseEither)) {
      return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: number }[] };
    }

    const apiResponse = responseEither.right;

    const uniqueWings = Array.from(
      new Map(
        (apiResponse?.Data || [])
          .filter((d: any) => d.Wing)
          .map((d: any) => [d.Wing, { label: d.Wing, value: d.InventoryFlatFloorBasementPodiumWingId }])
      ).values()
    );

    return {
      totalNumberOfRecord: uniqueWings.length,
      itemList: uniqueWings
    };

  } catch (err) {
    return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: number }[] };
  }
};