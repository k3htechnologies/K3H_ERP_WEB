export const ClassificationParameterApi = {
    PULL: '/ClassificationParameter/PullClassificationParameter',
    ADD_UPDATE: '/ClassificationParameter/AddUpdateClassificationParameter',
    DELETE: '/ClassificationParameter/DeleteClassificationParameter'
} as const

export type ClassificationParameterApiKeys = keyof typeof ClassificationParameterApi