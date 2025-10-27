import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import Views from '@/views'
import { AuthProvider } from '@/auth'
import appConfig from './configs/app.config'
import './locales'

if (appConfig.enableMock) {
    import('./mock')
}

function App() {
    return (
        <Provider store={store}>
            <Theme>
                <BrowserRouter>
                    <AuthProvider>
                        <Layout>
                            <Views />
                        </Layout>
                    </AuthProvider>
                </BrowserRouter>
            </Theme>
        </Provider>
    )
}

export default App
