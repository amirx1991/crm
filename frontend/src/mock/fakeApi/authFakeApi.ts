import { mock } from '../MockAdapter'
import { signInUserData } from '../data/authData'

mock.onPost('/api/token/').reply((config) => {
    const data = JSON.parse(config.data as string) as {
        username: string
        password: string
    }

    const { username, password } = data

    const user = signInUserData.find(
        (user) => user.username === username && user.password === password,
    )

    if (user) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve([
                    200,
                    {
                        access: 'mock-access-token-wVYrxaeNa9OxdnULvde1Au5m5w63',
                        refresh: 'mock-refresh-token-wVYrxaeNa9OxdnULvde1Au5m5w63',
                    },
                ])
            }, 800)
        })
    }

    return [401, { detail: 'نام کاربری یا رمز عبور اشتباه است!' }]
})

mock.onGet('/api/users/me/').reply((config) => {
    const token = config.headers?.Authorization?.replace('Bearer ', '')
    
    if (token) {
        const user = {
            id: 1,
            username: 'admin',
            email: 'admin@demo.com',
            avatar: '/static/img/avatars/thumb-1.jpg',
            authority: ['admin', 'user'],
        }
        
        return [200, user]
    }
    
    return [401, { detail: 'توکن نامعتبر است' }]
})

mock.onPost('/api/token/refresh/').reply((config) => {
    const data = JSON.parse(config.data as string) as {
        refresh: string
    }

    if (data.refresh) {
        return [200, {
            access: 'mock-new-access-token-wVYrxaeNa9OxdnULvde1Au5m5w63'
        }]
    }

    return [401, { detail: 'توکن بازیابی نامعتبر است' }]
})

mock.onPost(`/sign-up`).reply((config) => {
    const data = JSON.parse(config.data as string) as {
        username: string
        password: string
        email: string
    }

    const { email, username } = data

    const usernameUsed = signInUserData.some((user) => user.username === username)
    const emailUsed = signInUserData.some((user) => user.email === email)
    
    if (usernameUsed) {
        return [400, { detail: 'این نام کاربری قبلاً استفاده شده است!' }]
    }
    
    if (emailUsed) {
        return [400, { detail: 'این ایمیل قبلاً استفاده شده است!' }]
    }

    const newUser = {
        id: signInUserData.length + 1,
        avatar: '/static/img/avatars/thumb-1.jpg',
        username,
        email,
        authority: ['user'],
    }

    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve([
                201,
                {
                    user: newUser,
                    access: 'mock-access-token-wVYrxaeNa9OxdnULvde1Au5m5w63',
                    refresh: 'mock-refresh-token-wVYrxaeNa9OxdnULvde1Au5m5w63',
                },
            ])
        }, 800)
    })
})

mock.onPost(`/sign-out`).reply(() => {
    return [200, { detail: 'با موفقیت خارج شدید' }]
})
