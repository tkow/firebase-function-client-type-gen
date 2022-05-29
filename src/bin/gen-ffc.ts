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

function main(pathInput: string) {
  const prefix = pathInput.startsWith('.') ? process.cwd() : ''
  const postfix = pathInput.endsWith('.ts') ? '' : '.ts'
  const outpath = path.resolve(prefix, `${pathInput}${postfix}`)
  const templateFile = path.resolve(__dirname, '..', '..', 'templates', 'firebase-function-type.ts')
  if (fs.existsSync(outpath)) {
    console.log('In specified path file already existed.')
    if (!await confirm('> Overwrite it, okey？')) {
      console.log('Generating file is canceled')
      return
    }
  }
  fs.createReadStream(templateFile).pipe(
    fs.createWriteStream(outpath),
  ).end(() => {
    console.log('File is generated');
    process.exit();
  })
}

main(args[0])
