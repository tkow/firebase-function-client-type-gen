export const DUMMY_MOCKS = new Proxy<any>(
    () => DUMMY_MOCKS,
    {
        get(_, __): any {
            return DUMMY_MOCKS
        }
    }
)

export const MOCKS_BASE = {
    'firebase-functions': {
        region() {
            return DUMMY_MOCKS
        },
        config: () => {
            return {
            }
        },
        '@global': true,
        '@noCallThru': true
    },
    'firebase-admin': {
        apps: DUMMY_MOCKS,
        initializeApp: () => { return DUMMY_MOCKS },

        '@global': true,
        '@noCallThru': true
    },
}



export const MOCKS = new Proxy(MOCKS_BASE, {
    get(target, name) {
        const returnValue = target[name as keyof typeof MOCKS_BASE]
        return returnValue ?? DUMMY_MOCKS
    }
})
