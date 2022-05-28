type PrivateDummy = {
  type: 'dummy'
}

export type Dummy = {
  type: 'dummy'
  private: PrivateDummy
}

export const dummy: Dummy = {
  type: 'dummy',
  private: {
    type: 'dummy',
  },
}

export const privateDummy: PrivateDummy = {
  type: 'dummy',
}
