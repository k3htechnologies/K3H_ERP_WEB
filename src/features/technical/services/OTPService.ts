import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { authenticationService } from "@/features/authentication/services/AuthenticationService";

export interface SendOTPParams {
    mobileNumber: string;
    module: string;
    name?: string;
    companyName?: string;
    projectName?: string;
    source?: string;
    setIsLoading: (loading: boolean) => void;
    setLoadingMessage: (msg: string) => void;
    addToast: (toast: { type: "success" | "error"; title: string }) => void;
}

export const sendOTP = async ({
    mobileNumber,
    module,
    name,
    companyName,
    projectName,
    source,
    setIsLoading,
    setLoadingMessage,
    addToast
}: SendOTPParams): Promise<boolean> => {

    if (!mobileNumber || mobileNumber.length !== 10) {
        addToast({
            type: "error",
            title: "Please enter valid mobile number"
        });
        return false;
    }

    let isSuccess = false;

    await runApiWithLoader(
        setIsLoading,
        setLoadingMessage,
        async () => {

            const response =await authenticationService.apicallSendOTPMobileNumberAndModule(mobileNumber,module,name,companyName,projectName,source);

            if (E.isRight(response)) {

                addToast({ type: "success", title: response.right.SuccessMessage?.[0]});

                isSuccess = true;

            } else {

                addToast({type: "error",title: response.left.message });
            }

            return response;
        },

        undefined,
        (error: any) => {
            addToast({  type: "error",title: error.message});
        },

        undefined,
        "Sending OTP"
    );

    return isSuccess;
};
