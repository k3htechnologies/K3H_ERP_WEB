import * as E from 'fp-ts/Either';
import { paymentScheduleMasterService } from './services/PaymentScheduleMasterService';

export const fetchBuildingDropdown = async (params?: {   projectId?: number; }) => {
  try {
    
    const responseEither = await paymentScheduleMasterService.apiCallPullProjectInventoryStructure({
      ProjectId: Number(params?.projectId),
    });

    if (E.isLeft(responseEither)) {
      return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: number }[] };
    }

    const apiResponse = responseEither.right;

    const uniqueBuildings = Array.from(
      new Map(
        (apiResponse?.Data || []).map((d: any) => [
          d.BuildingId,
          {
            label: d.BuildingNumber,
            value: d.BuildingId
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
  buildingId?: number;
}) => {
  try {
    const responseEither = await paymentScheduleMasterService.apiCallPullProjectInventoryStructure({
      ProjectId: Number(params?.projectId),
      BuildingId: Number(params?.buildingId),
    });

    if (E.isLeft(responseEither)) {
      return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }

    const apiResponse = responseEither.right;

    const uniqueWings = Array.from(
      new Set((apiResponse?.Data || [])
        .map((d: any) => d.Wing)
        .filter((wing: string) => wing))
        
    ).map((wing) => ({
      label: wing,
      value: wing,
    }));

    return {
      totalNumberOfRecord: uniqueWings.length,
      itemList: uniqueWings
    };

  } catch (err) {
    console.error('FETCH WING DROPDOWN ERROR', err);
    return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
  }
};