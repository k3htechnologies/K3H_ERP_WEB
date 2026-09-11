import { JobRoleMasterService } from '@/features/hireSpace/JobRoleMaster/services/JobRoleMasterService';
import * as E from 'fp-ts/Either';
import { CandidateService } from './services/CandidateService';
import { JobOpeningService } from './services/JobOpeningService';

export const fetchJobOpeningDepartmentDropdown = async () => {
    try {
        const responseEither = await JobRoleMasterService.apiCallPullJobDepartment();

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { id: string; label: string; count: number }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            id: String(d.DepartmentId),
            label: d.DepartmentName,
            count: d.TotalRoles,
        }));

        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH JOB OPENING DEPARTMENT DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { id: string; label: string; count: number }[] };
    }
};

export const fetchJobOpeningJobTitleDropdown = async (
    pageNumber: number,
    params?: { value?: string; departmentId?: number },
) => {
    try {
        const responseEither = await JobRoleMasterService.apiCallPullJobRoleMaster({
            PageSize: 20,
            PageNumber: pageNumber,
            DepartmentId: params?.departmentId,
            JobRoleName: params?.value || '',
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d) => ({
            label: d.RoleName,
            value: String(d.JobRoleId),
            RoleDescription: d.RoleDescription,
            RoleResponsibility: d.RoleResponsibility,
            JobRequirement: d.JobRequirement,
            RoleQualification: d.RoleQualification,
            RoleSkills: d.RoleSkills,
        }));

        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList,
        };

    } catch (err) {
        console.error('FETCH JOB OPENING JOB TITLE DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};

export const fetchJobOpeningMasterDropdown = async (
    pageNumber: number,
    params?: { value?: string; departmentId?: number },
) => {
    try {
        const responseEither = await JobOpeningService.apiCallPullJobOpening({
            PageSize: 20,
            PageNumber: pageNumber,
            DepartmentMasterId: params?.departmentId,
            RoleName: params?.value || '',
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d) => ({
            label: d.JobRoleName || '',
            value: String(d.JobOpeningMasterId),
            JobRoleMasterId: d.JobRoleMasterId,
            DepartmentMasterId: d.DepartmentMasterId,
            DepartmentName: d.DepartmentName || '',
            JobRoleName: d.JobRoleName || '',
        }));

        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList,
        };

    } catch (err) {
        console.error('FETCH JOB OPENING MASTER DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};

export const fetchCandidateDropdown = async (
    _pageNumber: number,
    params?: {
        value?: string
        jobOpeningId?: number
        departmentId?: number
    },
) => {
    try {
        const responseEither = await CandidateService.apiCallPullCandidate({
            FullName: params?.value || '',
            JobOpeningId: params?.jobOpeningId,
            DepartmentId: params?.departmentId,
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d) => ({
            label: d.FullName,
            value: String(d.CandidateId),
            CurrentRole: d.CurrentRole,
            Email: d.Email,
            ApplicationStatus: d.ApplicationStatus,
        }));

        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList,
        };

    } catch (err) {
        console.error('FETCH CANDIDATE DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
