import { Dummy } from 'dummy'
import { Externaltype } from './type'

interface IA {
    (): number
}

interface IB {
  st: 'st'
}
interface IC extends IB{
  dy: 'dy'
}

type AliasedType = {
    aliased: 1
}

type Check= {
  type: 'a'
  funcInteface: IA
  normalInterface: IB
  inheritedInterface: IC
  external: Externaltype
  aliased: AliasedType
  dummy: Dummy
}

type DummyType = {
   id: string
   type: 'dummy'
}
