/* eslint-disable no-undef */
import proxyquire from 'proxyquire';
import path from 'path';
import glob from 'glob';
import { expect } from 'chai';
import { writeFileSync, readFileSync } from 'fs';
import { MOCKS } from './mock';
import { collectDependencyTypesCode } from '../src/utils/visit-type-reference'

const defaultFunctions = proxyquire('../fixtures/default', MOCKS);
const snapshotsDir = path.resolve(__dirname, '../', 'snapshots')

// Get document, or throw exception on error
const sources = glob.sync(path.resolve(__dirname, '../', 'fixtures/typescript-file/type-placeholder.ts'));
const namedFunctions = proxyquire('../fixtures/named', MOCKS);

it('extracted all dependency types', () => {
  const output = collectDependencyTypesCode(sources, ['Check'])
  const snapPath = path.resolve(snapshotsDir, 'extract_all_types.snap.txt')
  if (!process.env.SNAP) {
    const expected = readFileSync(snapPath).toString();
    expect(output).to.equal(expected)
  }
  writeFileSync(snapPath, output);
})
