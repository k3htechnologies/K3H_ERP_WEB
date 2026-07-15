import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { technicalService } from "@/features/technical/services/TechnicalService";
import * as E from "fp-ts/Either";

export const fetchMaterialSubMaterialDropdown = async (params?: { value?: string; projectId?: number, ClientRegistrationId?: number }
) => {
    try {
        const employeeData = LocalStorageHelper.getStoredEmployeeData();

        const responseEither = await technicalService.apiCallMaterialSubMaterialMasterUOMList({
            ProjectId: params?.projectId ?? 0,
            ClientRegistrationId: params?.ClientRegistrationId ??
                Number(employeeData?.ClientRegistrationId ?? 0),
        });

        if (E.isLeft(responseEither)) {
            return {
                totalNumberOfRecord: 0,
                itemList: [],
                data: [],
            };
        }

        const apiResponse = responseEither.right;

        const data = apiResponse.Data.MaterialMasterSubMaterialMasterData;

        const uniqueMaterials = Array.from(new Map(
            data.map((item) => [item.MaterialMasterId, item])
        ).values());

        return {
            totalNumberOfRecord: uniqueMaterials.length, data,
            itemList: uniqueMaterials.map((item) => ({
                label: item.MaterialName,
                value: String(item.MaterialMasterId),
                data: item,
            })),
        };

    } catch (err) {
        console.error("FETCH MATERIAL SUB MATERIAL DROPDOWN ERROR", err);
        return {
            totalNumberOfRecord: 0,
            itemList: [],
            data: [],
        };
    }
};