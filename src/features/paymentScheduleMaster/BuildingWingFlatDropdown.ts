import { paymentScheduleMasterService } from "@/features/paymentScheduleMaster/services/PaymentScheduleMasterService";
import * as E from "fp-ts/Either";

/* ==========================================================
   ✅ TYPES
========================================================== */

export type NumberDropdownItem = {
  label: string;
  value: number;
};

export type StringDropdownItem = {
  label: string;
  value: string;
};

/* ==========================================================
   ✅ COMMON INVENTORY FETCH
========================================================== */

const getInventoryData = async (projectId?: number) => {
  const responseEither =
    await paymentScheduleMasterService.apiCallPullProjectInventoryStructure({
      ProjectId: Number(projectId),
      PageNumber: 1,
      PageSize: 1000,
    });

  if (E.isLeft(responseEither)) {
    return [];
  }

  return responseEither.right.Data || [];
};

/* ==========================================================
   ✅ BUILDING DROPDOWN (Number)
========================================================== */

export const fetchBuildingDropdown = async (params?: {
  projectId?: number;
}) => {
  try {
    const data = await getInventoryData(params?.projectId);

    const uniqueBuildings: NumberDropdownItem[] = Array.from(
      new Map(
        data.map((item: any) => [
          item.BuildingId,
          {
            label: item.BuildingNumber,
            value: Number(item.BuildingId),
          },
        ])
      ).values()
    );

    return {
      totalNumberOfRecord: uniqueBuildings.length,
      itemList: uniqueBuildings,
    };
  } catch (err) {
    console.error("FETCH BUILDING DROPDOWN ERROR", err);
    return { totalNumberOfRecord: 0, itemList: [] as NumberDropdownItem[] };
  }
};

/* ==========================================================
   ✅ WING DROPDOWN (String)
========================================================== */

export const fetchWingDropdown = async (params?: {
  projectId?: number;
  buildingId?: number;
}) => {
  try {
    const data = await getInventoryData(params?.projectId);

    const filtered = data.filter(
      (item: any) => item.BuildingId === Number(params?.buildingId)
    );

    const uniqueWings: StringDropdownItem[] = Array.from(
      new Set(filtered.map((item: any) => item.Wing))
    ).map((wing: string) => ({
      label: wing,
      value: wing,
    }));

    return {
      totalNumberOfRecord: uniqueWings.length,
      itemList: uniqueWings,
    };
  } catch (err) {
    console.error("FETCH WING DROPDOWN ERROR", err);
    return { totalNumberOfRecord: 0, itemList: [] as StringDropdownItem[] };
  }
};
