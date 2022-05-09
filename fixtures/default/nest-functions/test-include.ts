import * as functions from 'firebase-functions'

type Params = {
    id: string
}
type Return = {
    result: 'ok' | 'ng'
}

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
