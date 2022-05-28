import proxyquire from 'proxyquire';
import path from 'path';
import glob from 'glob';
import { EOL } from 'os';
import { outDefinitions } from '..';
import { MOCKS } from './mock';

const defaultFunctions = proxyquire('../fixtures/default', MOCKS);

// Get document, or throw exception on error
const sources = glob.sync(path.resolve(__dirname, '../', 'fixtures/default/**/*.ts'));

try {
  const result = outDefinitions(sources, defaultFunctions, {
    symbolConfig: {
      args: 'Params',
      result: 'Return',
    },
  });
  console.log(result);
  console.log(`default functions type generated${EOL}`);
} catch (e) {
  console.error(e);
}

const namedFunctions = proxyquire('../fixtures/named', MOCKS);

// Get document, or throw exception on error
try {
  const namedSources = sources.concat(glob.sync(path.resolve(__dirname, '../', 'fixtures/named/**/*.ts')));
  const result = outDefinitions(namedSources, namedFunctions, {
    symbolConfig: {
      args: 'Params',
      result: 'Return',
    },
  });
  console.log(result);
  console.log(`named functions type generated${EOL}`);
} catch (e) {
  console.error(e);
}
