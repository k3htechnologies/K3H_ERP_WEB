import * as E from 'fp-ts/Either';
import {projectMasterService  } from '@/features/projectMaster/services/ProjectMasterService';

export const fetchProjectDropdown = async (pageNumber: number, params?: { value?: string ,projectId?: number}) => {
    try {
        const responseEither = await projectMasterService.apiCallPullProjectMaster({
            PageSize: 20,
            PageNumber: pageNumber,
            ProjectName:params?.value,
            ProjectId: params?.projectId,
            IsProjectAccess: false
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

        console.error('FETCH PROJECT MASTER  DROPDOWN ERROR', err);

        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
