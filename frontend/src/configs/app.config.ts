export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    patientAuthenticatedEntryPath: string
    patientUnAuthenticatedEntryPath: string
    patientStudyDetail: string
    locale: string
    accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
    enableMock: boolean
}

const appConfig: AppConfig = {
    apiPrefix: '/api',
    authenticatedEntryPath: '/dashboards/ecommerce',
    unAuthenticatedEntryPath: '/sign-in',
    patientAuthenticatedEntryPath: '/patient/dashboard',

    patientUnAuthenticatedEntryPath: '/patient/login',
    locale: 'en',
    accessTokenPersistStrategy: 'localStorage',
    enableMock: true,
}

export default appConfig
