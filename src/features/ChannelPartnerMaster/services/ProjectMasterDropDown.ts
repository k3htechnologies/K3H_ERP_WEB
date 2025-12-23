import { ProjectMasterService } from '@/features/projectMaster/services/ProjectMasterService';
import * as E from 'fp-ts/Either';

export const fetchProjectMasterDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await ProjectMasterService.apiCallPullProjectMaster({
            PageSize: 10,
            PageNumber: pageNumber,
            ProjectName: params?.value || "",
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.ProjectName,
            value: String(d.ProjectId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH PROJECT DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
