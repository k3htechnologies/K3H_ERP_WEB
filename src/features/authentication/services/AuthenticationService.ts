
import type { ApiResponse } from '../../../core/api/ApiResponse';
import type { Failure } from '../../../core/api/FailureResponse';
import { AuthenticationDatasourceImpl } from '../datasources/AuthenticationDatasource';
import * as E from 'fp-ts/Either';
import type { AuthenticationResponse } from '../models/AuthenticationModel';

const authenticationDatasource = new AuthenticationDatasourceImpl();

export const authenticationService = {

    apicallIsValidMobileNumber: async (mobileNumber: string): Promise<E.Either<Failure, ApiResponse<string>>> => {
        try {

            return E.right(await authenticationDatasource.isValidMobileNumber(mobileNumber));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apicallIsValidOTP: async (mobileNumber: string, otp: string): Promise<E.Either<Failure, AuthenticationResponse>> => {
        try {

            return E.right(await authenticationDatasource.isValidOTP(mobileNumber, otp));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}
