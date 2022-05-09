import proxyquire from 'proxyquire'
import { MOCKS } from './mock'
import { outDefinitions } from '../'
import path from 'path'
import glob from 'glob'

const backend = proxyquire('../fixtures', MOCKS)

// Get document, or throw exception on error
try {
  const sources = glob.sync(path.resolve(__dirname, '../', 'fixtures/**/*.ts'))
  const result = outDefinitions(sources, backend, {
    symbolConfig: {
      args: 'Params',
      result: 'Return'
    }
  })
  console.log(result)
  console.log('done');
} catch (e) {
  console.error(e);
}
