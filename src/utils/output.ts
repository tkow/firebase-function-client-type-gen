import { ts } from 'ts-morph'

export function generateCodeFromAst(ast: ts.Node) {
  const resultFile = ts.createSourceFile(
    'dummy.ts',
    '',
    ts.ScriptTarget.Latest,
    /* setParentNodes */ false,
    ts.ScriptKind.TS,
  );
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const generatedCode = printer.printNode(
    ts.EmitHint.Unspecified,
    ast,
    resultFile,
  );
  return generatedCode;
}

export function readTypeSciptFilesAndChecker(sourcePaths: string[]): {
    checker: ts.TypeChecker;
    sources: ts.SourceFile[];
  } {
  const program = ts.createProgram(sourcePaths, {});
  return {
    checker: program.getTypeChecker(),
    sources: sourcePaths
      .map((spath) => program.getSourceFile(spath))
      .filter((v) => !!v) as ts.SourceFile[],
  };
}
