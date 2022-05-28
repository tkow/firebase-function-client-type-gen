import * as functions from 'firebase-functions'

interface IA {
  (): number
}

interface IB {
  st: 'st'
}

interface IC extends IB{
  dy: 'dy'
}

type A = {
  type: 'a'
  funcInteface: IA
  normalInterface: IB
  inheritedInterface: IC
}

type Check = {
  test: A
}

type Params = {
    id: string
    aliased: Check
}

type Return = {
    result: 'ok' | 'ng'
}

export const aliasTypeCheck = functions
  .region('asia-northeast1')
  .runWith({
    memory: '1GB',
  })
  .https.onCall((data: Params, _): Return => ({
    result: 'ok',
  }))
