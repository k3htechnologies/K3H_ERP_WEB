import { useEffect, useState } from "react";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { payrollApprovalService } from "../services/PayrollServices";
import type { FilterWithPayrollApprovalStatus } from "../models/PayrollApprovalModel";

export const useApprovalStatus = (
  moduleName: string,
  id: number,
  requestId: number,
  remarks: string
) => {
  const [approvalData, setApprovalData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !moduleName || !requestId) return;


    const loadApprovalStatus = async () => {
      await runApiWithLoader(
        setIsLoading,
        setLoadingMessage,
        async () => {
          const params: FilterWithPayrollApprovalStatus = {
            Id: id,
            ModuleName: moduleName,
            RequestId: requestId,
            Remarks: remarks
          };

          const response =
            await payrollApprovalService.apiCallPullApprovalStatus(
              params
            );

          if (E.isRight(response)) {
            setApprovalData(response.right.Data);
          } else {
            setError(response.left.message ?? "Failed to load approval status");
          }

          return response;
        },
        undefined,
        (err: any) => setError(err.message ?? "Something went wrong"),
        undefined,
        "Loading Approval Status",
      );
    };

    loadApprovalStatus();

  }, [id, moduleName, requestId]);

  return { approvalData, isLoading, loadingMessage, error };
};