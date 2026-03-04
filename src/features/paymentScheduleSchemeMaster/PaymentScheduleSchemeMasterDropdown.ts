import * as E from 'fp-ts/Either';
import { paymentScheduleSchemeMasterService } from '@/features/paymentScheduleSchemeMaster/services/PaymentScheduleSchemeMasterService';

export const fetchPaymentScheduleSchemeMasterDropDown = async (pageNumber: number, params?: { projectId?: number; paymentScheduleScheme?: string, inventoryBuildingId?: number, inventoryFlatFloorBasementPodiumWingId?: number }) => {
  try {

    const responseEither = await paymentScheduleSchemeMasterService.apiCallPullPaymentScheduleSchemeMaster({
      PageSize: 40,
      PageNumber: pageNumber,
      ProjectId: params?.projectId || 0,
      PaymentScheduleScheme: params?.paymentScheduleScheme || "",
      InventoryBuildingId: params?.inventoryBuildingId || 0,
      InventoryFlatFloorBasementPodiumWingId: params?.inventoryFlatFloorBasementPodiumWingId || 0,
      IsCheckPermission: false,
    });

    if (E.isLeft(responseEither)) {
      return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }

    const apiResponse = responseEither.right;

    const itemList = [
      ...(apiResponse?.Data || []).map((d: any) => ({
        label: d.PaymentScheduleScheme,
        value: String(d.PaymentScheduleSchemeMasterId)
      })),
      {
        label: "Other",
        value: "0"
      }
    ];


    return {
      totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
      itemList
    };

  } catch (err) {
    console.error('FETCH PAYMENT SCHEDULE SCHEME DROPDOWN ERROR', err);
    return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: number }[] };
  }
};
