import * as functions from 'firebase-functions';

type Params = {
    id: string
}
type Return = {
    result: 'ok' | 'ng'
}

export const notImporetedTest = functions
  .region('asia-northeast1')
  .runWith({
    memory: '1GB',
  })
  .https.onCall((data: Params, _): Return => ({
    result: 'ok',
  }));
