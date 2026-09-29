import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { MomApi } from '@/features/meeting/api/MomApi'
import type { MOMDocumentSaveResponse } from '@/features/meeting/models/MomModel'

export abstract class MomDatasource {
    abstract addUpdateMOMDocuments(formData: FormData): Promise<MOMDocumentSaveResponse>
}

export class MomDatasourceImpl implements MomDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async addUpdateMOMDocuments(formData: FormData): Promise<MOMDocumentSaveResponse> {
        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                MomApi.ADD_UPDATE,
                formData,
            )

            return response
        } catch (error) {
            console.error('ERROR: ADD UPDATE MOM DOCUMENTS :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateMOMDocuments(formData)
            }

            throw error
        }
    }
}
