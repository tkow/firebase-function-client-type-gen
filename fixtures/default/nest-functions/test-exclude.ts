
import * as functions from 'firebase-functions'

export const onWrite = functions
  .region('asia-northeast1')
  .firestore.document(
    'examples/{example}',
  )
  .onWrite(async (change, context) => {
  })
