import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";

type DuplicateCheckParams = {
  fieldName: string; 
  fieldValue: string;
  apiCallback: (params: any) => Promise<any>;
  extraParams?: any;
  setIsLoading?: (val: boolean) => void;
  setLoadingMessage?: (msg: string) => void;
  loadingMessage?: string;
};


export const checkDuplicateField = async ({
  fieldName,
  fieldValue,
  apiCallback,
  extraParams = {},
  setIsLoading,
  setLoadingMessage,
  loadingMessage = "Checking duplicate..."
}: DuplicateCheckParams): Promise<boolean> => {


  try {
    if (!fieldValue) return false;

    const params = {
      PageNumber: 1,
      PageSize: 1,
      [fieldName]: fieldValue,
      ...extraParams
    };

    let isDuplicate = false;

    if (setIsLoading && setLoadingMessage) {

      await runApiWithLoader(
        setIsLoading,
        setLoadingMessage,
        async () => {

          const response = await apiCallback(params);

          if (E.isRight(response)) {
            isDuplicate = (response.right as any)?.Data?.length > 0;
          }

          return response;
        },
        
        undefined,
        undefined,
        undefined,
        loadingMessage
      );

    } else {

      const response = await apiCallback(params);

      if (E.isRight(response)) {

        isDuplicate = (response.right as any)?.Data?.length > 0;

      }
    }

    return isDuplicate;

  } catch (error) {
    return false;
  }
};