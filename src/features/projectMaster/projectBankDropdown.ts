import * as E from "fp-ts/Either";
import { projectMasterService } from "@/features/projectMaster/services/ProjectMasterService";

export interface ProjectBankDropdownItem {
  label: string;
  value: string;

  BeneficiaryAccountHolderName: string;
  BankListMasterId: number;
  BankName: string;
  AccountNumber: string;
  Branch: string;
  IFSCCode: string;
  AcType: string;
}

export const fetchProjectBankDropdown = async (
  _pageNumber: number,
  params?: { projectId?: number }
): Promise<{
  totalNumberOfRecord: number;
  itemList: ProjectBankDropdownItem[];
}> => {
  try {
    const responseEither =
      await projectMasterService.apiCallPullProjectMasterWithBankDetails(
        params?.projectId ?? 0
      );

    if (E.isLeft(responseEither)) {
      return { totalNumberOfRecord: 0, itemList: [] };
    }

    const apiResponse = responseEither.right;

    const itemList: ProjectBankDropdownItem[] = (apiResponse?.Data || []).map(
      (d: any) => ({
        label: d.BankName,
        value: String(d.BankListMasterId),

        BeneficiaryAccountHolderName: d.BeneficiaryAccountHolderName ?? "",
        BankListMasterId: d.BankListMasterId ?? 0,
        BankName: d.BankName ?? "",
        AccountNumber: d.AccountNumber ?? "",
        Branch: d.Branch ?? "",
        IFSCCode: d.IFSCCode ?? "",
        AcType: d.AcType ?? ""
      })
    );

    // IMPORTANT: stop pagination
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
