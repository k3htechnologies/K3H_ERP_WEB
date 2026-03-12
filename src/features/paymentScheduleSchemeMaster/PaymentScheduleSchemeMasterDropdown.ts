import * as E from "fp-ts/Either";
import { paymentScheduleSchemeMasterService } from "@/features/paymentScheduleSchemeMaster/services/PaymentScheduleSchemeMasterService";

export const fetchPaymentScheduleSchemeMasterDropDown = async (
  pageNumber: number,
  params?: {
    projectId?: number;
    paymentScheduleScheme?: string;
    inventoryBuildingId?: number;
    inventoryFlatFloorBasementPodiumWingId?: number;
    isReuiredOthersOption?: boolean;
  },
) => {
  try {
    const responseEither = await paymentScheduleSchemeMasterService.apiCallPullPaymentScheduleSchemeMaster({
      PageSize: 40,
      PageNumber: pageNumber,
      ProjectId: params?.projectId || 0,
      PaymentScheduleScheme: params?.paymentScheduleScheme || "",
      IsCheckPermission: false,
    });

    if (E.isLeft(responseEither)) {
      return {
        totalNumberOfRecord: 0,
        itemList: [] as { label: string; value: string }[],
      };
    }

    const apiResponse = responseEither.right;

    const itemList = (apiResponse?.Data || []).map((d: any) => ({
      label: d.PaymentScheduleScheme,
      value: String(d.PaymentScheduleSchemeMasterId),
      inventoryBuildingId: d.InventoryBuildingId,
      inventoryFlatFloorBasementPodiumWingId: d.InventoryFlatFloorBasementPodiumWingId,
      buildingName: d.BuildingNumber,
      wingName: d.Wing,
    }));

    // ✅ Default true
    const isRequiredOthers = params?.isReuiredOthersOption ?? true;

    if (isRequiredOthers) {
      itemList.push({
        label: "Other",
        value: "0",
        inventoryBuildingId: 0,
        inventoryFlatFloorBasementPodiumWingId: 0,
        buildingName: "",
        wingName: "",
      });
    }

    return {
      totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
      itemList,
    };
  } catch (err) {
    console.error("FETCH PAYMENT SCHEDULE SCHEME DROPDOWN ERROR", err);
    return {
      totalNumberOfRecord: 0,
      itemList: [] as { label: string; value: number }[],
    };
  }
};
