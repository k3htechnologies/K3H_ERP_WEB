import { specificationMasterService } from "@/features/specificationMaster/services/SpecificationMasterService"
import * as E from 'fp-ts/Either';

export const fetchSpecificationMasterDropdown = (levelType: string) => async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await specificationMasterService.apiCallPullSpecificationMaster({
            PageSize: 100,
            PageNumber: pageNumber,
            LevelType:levelType,
            IsCheckPermission:true,
            IsExpandChild:true,
            CategoryName: params?.value || "",
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.CategoryName,
            value: String(d.SpecificationMasterId),
        }));

        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };
    } catch (err) {
        console.error('FETCH SPECIFICATION MASTER DROPDOWN ERROR ', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};



// export const fetchSpecificationDropdownByLevel = (levelType: string) =>
//     async (pageNumber: number, params?: { value?: string }) => {

//         const responseEither =
//             await specificationMasterService.apiCallPullSpecificationMaster({
//                 PageSize: 100,
//                 PageNumber: pageNumber,
//                 LevelType: levelType,
//                 IsCheckPermission: true,
//                 IsExpandChild: true,
//                 CategoryName: params?.value ?? "",
//             });

//         if (E.isLeft(responseEither)) {
//             return {
//                 totalNumberOfRecord: 0, itemList: [],
//             };
//         }

//         const apiResponse = responseEither.right;

//         return {
//             totalNumberOfRecord:
//                 apiResponse.TotalNumberOfRecord,

//             itemList: apiResponse.Data.map((x) => ({
//                 label: x.CategoryName ?? "",
//                 value: String(x.SpecificationMasterId),
//             }))
//         };
//     };