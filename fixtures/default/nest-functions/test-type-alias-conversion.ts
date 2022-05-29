import * as functions from 'firebase-functions'
import { Check } from '../../typescript-file/type-placeholder'

type Params = {
    id: string
    aliased: Check
}

type Return = {
    result: 'ok' | 'ng'
}

export const aliasTypeCheck = functions.runWith({
  memory: '1GB',
}).https.onCall((data: Params, _): Return => ({
  result: 'ok',
}))
