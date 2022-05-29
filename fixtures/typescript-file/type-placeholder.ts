import { Dummy } from 'dummy'
import { ExternalType } from './type'

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

type AliasedTypeAltA = AliasedType['aliased']
type AliasedTypeAltB = AliasedType['aliased']

export type Check= {
  type: 'a'
  funcInteface: IA
  normalInterface: IB
  inheritedInterface: IC
  external: ExternalType
  aliased: AliasedType
  dummy: Dummy
  alta: AliasedTypeAltA
  altb: AliasedTypeAltB
}

type DummyType = {
   id: string
   type: 'dummy'
}
