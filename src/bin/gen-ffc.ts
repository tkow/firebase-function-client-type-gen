#! /usr/bin/env node
/* eslint-disable no-use-before-define */
import fs from 'fs'
import path from 'path'
import readline from 'readline'

const args = process.argv.slice(2)

if (args.length !== 1) {
  throw Error('One arguments are only allowed.')
}

/**
 * 標準入力を取得する
 */
const question = (questionMessage: string): Promise<string> => {
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    readlineInterface.question(questionMessage, (answer) => {
      resolve(answer);
      readlineInterface.close();
    });
  });
};

/**
 * ユーザーにYes/Noで答えられる質問をする
 */
const confirm = async (msg: string) => {
  const answer = await question(`${msg}(y/n): `);
  const sanitized = answer.trim().toLowerCase()
  return sanitized === 'y' || sanitized === 'yes';
};

async function main(pathInput: string) {
  const prefix = pathInput.startsWith('/') ? '' : process.cwd()
  const postfix = pathInput.endsWith('.ts') ? '' : '.ts'
  const outpath = path.resolve(prefix, `${pathInput}${postfix}`)
  const mainPath = require.resolve('firebase-function-client-type-gen')
  const templateFile = path.resolve(path.dirname(mainPath), '..', 'templates', 'firebase-function-type.ts')
  if (fs.existsSync(outpath)) {
    console.log('In specified path file already existed.')
    if (!await confirm('> Overwrite it, okey？')) {
      console.log('Generating file is canceled')
      return
    }
  }
  await new Promise((resolve) => {
    fs.createReadStream(templateFile).pipe(
      fs.createWriteStream(outpath),
    ).on('finish', () => {
      console.log('File is generated');
      resolve(true)
    }).on('error', (d) => {
      console.error(d)
    })
  })
}

main(args[0])
