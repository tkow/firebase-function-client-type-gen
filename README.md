## About firebase-function-client-type-gen

Generator of client types of firebase functions derived from orginal firebase deploy definition object.

## Get Started

```shell
npm i --save-dev firebase-function-client-type-gen proxyquire @types/proxyquire typescript
```

```mock.ts
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
```

```fixtures.ts
import * as functions from 'firebase-functions'

// You define two types in function definition file and they must be in a file include function declaration.
type RequestArgs = {
    id: string
}
type ResponseResult = {
    result: 'ok' | 'ng'
}

// You must export "only one const https onCall" in a file.
// If you export many httpsOnCall functions, it may happen unexpected result when mapping args and result types.'
export const includeTest = functions
    .region('asia-northeast1')
    .runWith({
        memory: '1GB'
    })
    .https.onCall((data: Params,_): Return => {
        return {
            result: 'ok'
        }
    })
```


```main.ts
import proxyquire from 'proxyquire'
import { MOCKS } from './mock'
import { outDefinitions } from 'firebase-function-client-type-gen'
import path from 'path'
import glob from 'glob'

const firebaseFunctionEntrypoint = proxyquire('../functions/index', MOCKS)

// Get document, or throw exception on error
try {
  const sources = glob.sync(path.resolve(__dirname, '../', 'functions/endpoints/**/*.ts'))
  // The symbolConfig determine what type should be read from your https onCall definition file as its args or result.
  // If you do not specify it, default is 'RequestArgs' and 'ResponseResult'
  const result = outDefinitions(sources, firebaseFunctionEntrypoint, {
    symbolConfig: {
      args: 'RequestArgs',
      result: 'ResponseResult'
    }
  })
  console.log(result)
  console.log('done');
} catch (e) {
  console.error(e);
}
```

See tests/index.ts code more detailed usage.

## Warning

- This library for typescript firebase function users.
- You mustn't define more than two firebase https functions in a file, they may cause bug.
- Your args and result type must be included in the function definition file.

## LICENSE

[MIT](./LICENSE)
>>>>>>> 7045c26 (feat: remove if not export function definition included)
