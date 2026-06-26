import { specificationMasterService } from "@/features/specificationMaster/services/SpecificationMasterService";
import * as E from "fp-ts/Either";

export const fetchSpecificationMasterDropdown = (levelType: string, parentLevelId1?: number) =>
    async (pageNumber: number, params?: { value?: string }) => {
        try {
            const responseEither = await specificationMasterService.apiCallPullSpecificationMaster({
                PageSize: 100,
                PageNumber: pageNumber,
                LevelType: levelType,
                CategoryName: params?.value || "",
                ...(parentLevelId1
                    ? {
                        SpecificationMasterId: parentLevelId1,
                        IsExpandChild: true,
                        IsCheckPermission: true,
                    }
                    : {}),
            });

            if (E.isLeft(responseEither)) {
                return {
                    totalNumberOfRecord: 0,
                    itemList: [],
                };
            }

            const data = responseEither.right.Data || [];

            const searchText = params?.value?.trim().toLowerCase();

            const finalData = searchText
                ? data.filter(item =>
                    item.CategoryName?.toLowerCase().includes(searchText)
                )
                : data;

            return {
                totalNumberOfRecord: finalData.length,
                itemList: finalData.map(item => ({
                    label: item.CategoryName!,
                    value: String(item.SpecificationMasterId),
                    uom: item.Uom,
                    uomMasterId: item.UomMasterId,
                })),
            };
        } catch (err) {
            console.error("FETCH SPECIFICATION MASTER DROPDOWN ERROR", err);
            return {
                totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[],
            };
        }
    };