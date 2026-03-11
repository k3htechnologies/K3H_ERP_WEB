import * as E from 'fp-ts/Either';
import { projectMasterService } from '@/features/projectMaster/services/ProjectMasterService';

export const fetchPaginationProjectWithEmployeeDropdown = async (pageNumber?: number, params?: { projectId?: number, value?: string,departmentName?:string }) => {
  try {
    const responseEither = await projectMasterService.apiCallPullPaginationProjectMasterWithEmployee(50, pageNumber ?? 1, params?.projectId ?? 0, params?.value || "",params?.departmentName ||"");

    if (E.isLeft(responseEither)) {

      return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
      
    }

    const apiResponse = responseEither.right;

    const itemList = (apiResponse?.Data || []).map((d: any) => ({
      label: (d.FullName || '') + ' - ' + (d.Department || '') + ' - ' + (d.Designation || ''),
      value: String(d.EmployeeId)
    }));


    return {
      totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
      itemList
    };

  } catch (err) {
    console.error('FETCH EMPLOYEE DROPDOWN ERROR', err);
    return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
  }
};