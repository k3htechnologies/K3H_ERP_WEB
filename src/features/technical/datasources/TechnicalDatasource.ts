import baseClient from '../../../core/config/baseClient'
import { TechnicalApi } from '@/features/technical/api/TechnicalApi'
import type { TechnicalListResponse } from '../models/TechnicalModel'

export abstract class TechnicalDatasource {

    abstract getEnvironment(): Promise<TechnicalListResponse>;
}

export class TechnicalDatasourceImpl implements TechnicalDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async getEnvironment(): Promise<TechnicalListResponse> {
        try {

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TechnicalApi.GETENVIRONMENT}`);

            return response;

        } catch (error) {

            console.error('Error: GET ENVIRONMENT :', error);
            throw error
        }
    }
}
