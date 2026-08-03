import * as E from "fp-ts/Either";
import { projectMasterService } from "@/features/projectMaster/services/ProjectMasterService";

export interface ProjectBankDropdownItem {
  label: string;
  value: string;
  BeneficiaryAccountHolderName: string;
  BankListMasterId: number;
  ProjectWithBankDetailsId: number;
  BankName: string;
  AccountNumber: string;
  Branch: string;
  IFSCCode: string;
  AcType: string;
  NatureOfAccount:string;
}

export const fetchProjectBankDropdown = async (_pageNumber: number, params?: { projectId?: number, bankName?: string, isCheckPermission?: boolean }): Promise<{ totalNumberOfRecord: number; itemList: ProjectBankDropdownItem[]; }> => {

  try {

    const responseEither = await projectMasterService.apiCallPullProjectMasterWithBankDetails(params?.projectId ?? 0, params?.bankName ?? "", params?.isCheckPermission ?? false);

    if (E.isLeft(responseEither)) {
      return { totalNumberOfRecord: 0, itemList: [] };
    }

    const apiResponse = responseEither.right;

    const itemList: ProjectBankDropdownItem[] = (apiResponse?.Data || []).map(

      (d: any) => ({

        label: d.BankName,
        value: String(d.ProjectWithBankDetailsId),
        ProjectWithBankDetailsId: d.ProjectWithBankDetailsId ?? 0,
        BeneficiaryAccountHolderName: d.BeneficiaryAccountHolderName ?? "",
        BankListMasterId: d.BankListMasterId ?? 0,
        BankName: d.BankName ?? "",
        AccountNumber: d.AccountNumber ?? "",
        Branch: d.Branch ?? "",
        IFSCCode: d.IFSCCode ?? "",
        AcType: d.AcType ?? "",
        NatureOfAccount:d.NatureOfAccount ?? ""
      })
    );

    return {
      totalNumberOfRecord: itemList.length,
      itemList
    };

  } catch (err) {
    console.error(err);
    return {
      totalNumberOfRecord: 0,
      itemList: []
    };
  }
};

export const fetchProjectBankDropdownById = async (projectId: number,BankName?: string, IsCheckPermission?: boolean) => {

  const responseEither = await projectMasterService.apiCallPullProjectMasterWithBankDetails(projectId,BankName,IsCheckPermission);

  if (E.isLeft(responseEither)) return null;

  return responseEither.right.Data?.[0] || null;
};

