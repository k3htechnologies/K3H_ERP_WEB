export interface EnvironmentConfig {
    apiBaseUrl: string
    apiKey: string
    apiTimeout: number
    environment: 'DEVELOPMENT' | 'PRODUCTION'
}

//============================ [ DEVELOPMENT CONFIGURATION ] ========================================================
const developmentConfig: EnvironmentConfig = {
       // apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://45.126.168.205:402/api',

    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://k3herpapi.k3htechnologies.com/api',
    apiKey: import.meta.env.VITE_API_KEY || 'wedNfr4rZCr4IkpEede+5gSPN76RC5pchp9sDl3epZaNyvUlSt7cXY+/puYhJoiGgcp50WuqNCVtlf8i6A/LdA==',
    apiTimeout: 30000,
    environment: 'DEVELOPMENT',
}

//============================ [PRODUCTION CONFIGURATION ] ========================================================
const productionConfig: EnvironmentConfig = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.k3tech.com/api',
    apiKey: import.meta.env.VITE_API_KEY || 'wedNfr4rZCr4IkpEede+5gSPN76RC5pchp9sDl3epZaNyvUlSt7cXY+/puYhJoiGgcp50WuqNCVtlf8i6A/LdA==',
    apiTimeout: 30000,
    environment: 'PRODUCTION',
}

//============================ [GET CURRENT ENVIRONMENT ] ========================================================
const getCurrentEnvironment = (): 'DEVELOPMENT' | 'PRODUCTION' => {
    const env = import.meta.env.VITE_APP_ENVIRONMENT || import.meta.env.MODE

    switch (env) {
        case 'PRODUCTION':
            return 'PRODUCTION'
        default:
            return 'DEVELOPMENT'
    }
}

//============================ [ EXPORT CONFIGURATION BASED ON ENVIRONMENT ] ========================================================
const getConfig = (): EnvironmentConfig => {
    const currentEnv = getCurrentEnvironment()

    switch (currentEnv) {
        case 'PRODUCTION':
            return productionConfig
        default:
            return developmentConfig
    }
}

export const config = getConfig()

//============================ [ EXPORT INDIVIDUAL CONFIGS FOR TESTING ] ========================================================
export { developmentConfig, productionConfig }

//============================ [ HELPER FUNCTIONS ] ========================================================
export const isDevelopment = () => config.environment === 'DEVELOPMENT';
export const isProduction = () => config.environment === 'PRODUCTION';

//============================ [ API CONFIGURATION HELPERS ] ========================================================
export const getApiUrl = (endpoint: string) => {

    const baseUrl = config.apiBaseUrl.endsWith('/') ? config.apiBaseUrl.slice(0, -1) : config.apiBaseUrl;

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    return `${baseUrl}${cleanEndpoint}`
}

export default config

