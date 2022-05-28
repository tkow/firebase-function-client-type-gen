/* eslint-disable no-undef */
import proxyquire from 'proxyquire';
import path from 'path';
import glob from 'glob';
import { EOL } from 'os';
import { expect } from 'chai';
import { writeFileSync, readFileSync } from 'fs';
import { outDefinitions } from '..';
import { MOCKS } from './mock';

const defaultFunctions = proxyquire('../fixtures/default', MOCKS);
const snapshotsDir = path.resolve(__dirname, '../', 'snapshots')

// Get document, or throw exception on error
const sources = glob.sync(path.resolve(__dirname, '../', 'fixtures/default/**/*.ts'));
const namedFunctions = proxyquire('../fixtures/named', MOCKS);

it('named export function', () => {
  const result = outDefinitions(sources, defaultFunctions, {
    symbolConfig: {
      args: 'Params',
      result: 'Return',
    },
  });
  const snapPath = path.resolve(snapshotsDir, 'normal.snap.txt')
  if (!process.env.SNAP) {
    const expected = readFileSync(snapPath).toString();
    expect(result).to.equal(expected)
  }
  writeFileSync(snapPath, result);
})

it('named export function', () => {
  const namedSources = sources.concat(glob.sync(path.resolve(__dirname, '../', 'fixtures/named/**/*.ts')));
  const result = outDefinitions(namedSources, namedFunctions, {
    symbolConfig: {
      args: 'Params',
      result: 'Return',
    },
  });
  const snapPath = path.resolve(snapshotsDir, 'nested.snap.txt')
  if (!process.env.SNAP) {
    const expected = readFileSync(snapPath).toString();
    expect(result).to.equal(expected)
  }
  writeFileSync(snapPath, result);
})
