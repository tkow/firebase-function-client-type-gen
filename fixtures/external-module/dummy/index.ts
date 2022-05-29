type PrivateDummy = {
  type: 'dummy'
}

export interface IDummy {
  type: 'idummy'
}

export type Dummy = {
  type: 'dummy'
  private: PrivateDummy
  interface: IDummy
}

export type DummyIgnored = {
  type: 'dummy'
  private: PrivateDummy
  interface: IDummy
}

export const dummy: Dummy = {
  type: 'dummy',
  private: {
    type: 'dummy',
  },
  interface: {
    type: 'idummy',
  },
}

export const privateDummy: PrivateDummy = {
  type: 'dummy',
}
