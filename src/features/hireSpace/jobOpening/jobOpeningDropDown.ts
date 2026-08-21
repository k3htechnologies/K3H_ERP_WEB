import { JobRoleMasterService } from '@/features/hireSpace/JobRoleMaster/services/JobRoleMasterService';
import type { JobRoleMasterData } from '@/features/hireSpace/JobRoleMaster/models/JobRoleMasterModel';
import * as E from 'fp-ts/Either';

export const fetchJobOpeningDepartmentDropdown = async () => {
    try {
        const responseEither = await JobRoleMasterService.apiCallPullJobDepartment();

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || [])
            .filter((department) => department.DepartmentId && department.DepartmentName)
            .map((department) => ({
                label: department.DepartmentName,
                value: String(department.DepartmentId)
            }));

        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH JOB OPENING DEPARTMENT DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};

export const fetchJobOpeningJobTitleDropdown = async (departmentId: number) => {
    try {
        const responseEither = await JobRoleMasterService.apiCallPullJobRoleMaster({
            PageSize: 100,
            PageNumber: 1,
            IsCheckPermission: false,
            DepartmentId: departmentId,
        });

        if (E.isLeft(responseEither)) {
            return {
                totalNumberOfRecord: 0,
                itemList: [] as { label: string; value: string }[],
                data: [] as JobRoleMasterData[],
            };
        }

        const apiResponse = responseEither.right;
        const data = apiResponse?.Data ?? [];

        const itemList = data.map((jobRole) => ({
            label: jobRole.RoleName || '',
            value: String(jobRole.JobRoleId || ''),
        }));

        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList,
            data,
        };

    } catch (err) {
        console.error('FETCH JOB OPENING JOB TITLE DROPDOWN ERROR', err);
        return {
            totalNumberOfRecord: 0,
            itemList: [] as { label: string; value: string }[],
            data: [] as JobRoleMasterData[],
        };
    }
};
