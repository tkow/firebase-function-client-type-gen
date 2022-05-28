/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-bitwise */
/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable camelcase */
import ts from 'typescript';
import { EOL } from 'os';

function makeFunctionDefinitionSignature(
  functionId: string,
  argsType: ts.TypeNode,
  resultType: ts.TypeNode,
) {
  return ts.factory.createPropertySignature(
    undefined,
    ts.factory.createStringLiteral(functionId),
    undefined,
    ts.factory.createTypeLiteralNode([
      ts.factory.createPropertySignature(
        undefined,
        ts.factory.createIdentifier('args'),
        undefined,
        argsType,
      ),
      ts.factory.createPropertySignature(
        undefined,
        ts.factory.createIdentifier('result'),
        undefined,
        resultType,
      ),
    ]),
  );
}

function readTypeSciptFilesAndChecker(sourcePaths: string[]): {
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

function visitIdentifierFound(
  node: ts.Node,
  findingWord: string,
  checker?: ts.TypeChecker,
): ts.Node | undefined {
  if (ts.isIdentifier(node)) {
    if (node.text === findingWord) {
      return node;
    }
  }
  const children = node.getChildren();
  if (children.length > 0) {
    return children.find((v) => !!visitIdentifierFound(v, findingWord));
  }
  return undefined;
}

function visitCallExpressionFound(
  node: ts.Node,
  findingWord: string,
  checker?: ts.TypeChecker,
): [ts.Node, ts.NodeArray<ts.Expression>] | undefined {
  const children = node.getChildren();
  if (ts.isCallExpression(node)) {
    const callExpressionChildren = node.getChildren();
    if (children.length > 0) {
      let callExpression: ts.CallExpression | undefined;
      callExpressionChildren.forEach((v) => {
        if (ts.isPropertyAccessExpression(v)) {
          v.getChildren().forEach((target) => {
            if (ts.isIdentifier(target)) {
              if (target.text === findingWord) callExpression = node;
            }
          });
        }
      });
      if (callExpression) {
        return [callExpression, callExpression.arguments];
      }
    }
  }
  if (children.length > 0) {
    for (const child of children) {
      const n = visitCallExpressionFound(child, findingWord);
      if (n) return n;
    }
  }
  return undefined;
}

type SymbolConfig = { args: string; result: string };

const ARGS_RESPONSE_TYPE_IDENTIFIER: SymbolConfig = {
  args: 'RequestArgs',
  result: 'ResponseResult',
};

type FunctionAst = {
  args: ts.TypeNode;
  result: ts.TypeNode;
  functionName: string;
  region?: string;
};

function extractFunctionDefinition(
  source: ts.SourceFile,
  checker: ts.TypeChecker,
  symbolConfig: SymbolConfig,
): FunctionAst | undefined {
  const typeObjectNode: Partial<FunctionAst> = {
    functionName: '',
  };
  ts.forEachChild(source, (node) => {
    if (ts.isTypeAliasDeclaration(node)) {
      if (node.name.text === symbolConfig.args) {
        const t = checker.getTypeAtLocation(node);
        // NOTE: https://stackoverflow.com/questions/67423762/typescript-compilerapi-how-to-get-expanded-type-ast
        const ast = checker.typeToTypeNode(
          t,
          undefined,
          ts.NodeBuilderFlags.NoTruncation | ts.NodeBuilderFlags.InTypeAlias,
        );
        typeObjectNode.args = ast;
      }
      if (node.name.text === symbolConfig.result) {
        const t = checker.getTypeAtLocation(node);
        // NOTE: https://stackoverflow.com/questions/67423762/typescript-compilerapi-how-to-get-expanded-type-ast
        const ast = checker.typeToTypeNode(
          t,
          undefined,
          ts.NodeBuilderFlags.NoTruncation | ts.NodeBuilderFlags.InTypeAlias,
        );
        typeObjectNode.result = ast;
      }
    }
    if (ts.isVariableStatement(node)) {
      node.forEachChild((v) => {
        if (
          v.kind === ts.SyntaxKind.ExportKeyword
          && !typeObjectNode.functionName
        ) {
          if (visitIdentifierFound(node, 'https')) {
            typeObjectNode.functionName = (
              node as ts.VariableStatement
            ).declarationList.declarations[0].name.getText();
          }
          const regionNode = visitCallExpressionFound(node, 'region');
          if (regionNode) {
            const regionName = regionNode[1]
              .find((regionNodExpr) => ts.isStringLiteral(regionNodExpr))
              ?.getText().replace(/'/g, '');
            typeObjectNode.region = regionName;
          }
        }
      });
    }
  });
  if (!typeObjectNode.functionName) return;
  if (!typeObjectNode.args) {
    typeObjectNode.args = ts.factory.createKeywordTypeNode(
      ts.SyntaxKind.UndefinedKeyword,
    );
  }
  if (!typeObjectNode.result) {
    typeObjectNode.result = ts.factory.createKeywordTypeNode(
      ts.SyntaxKind.UndefinedKeyword,
    );
  }
  return typeObjectNode as FunctionAst;
}

function makeFunctionDefinitionTypes(defs: FunctionAst[]) {
  const signatures = defs.map((def) => makeFunctionDefinitionSignature(def.functionName, def.args, def.result));
  return ts.factory.createTypeAliasDeclaration(
    undefined,
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier('FunctionDefinitions'),
    undefined,
    ts.factory.createTypeLiteralNode(signatures),
  );
}

type GeneratedDefinition = {
  extractedFunctionDefinitions: FunctionAst[];
  functionNames: string[];
};

export function getGeneratedFunctionDefinitionsAndFunctionNames(
  sources: string[],
  symbolConfig: SymbolConfig = ARGS_RESPONSE_TYPE_IDENTIFIER,
): GeneratedDefinition {
  const target = readTypeSciptFilesAndChecker(sources);

  const extractedFunctionDefinitions: FunctionAst[] = [];

  target.sources.forEach((s) => {
    const extractedDefinition = extractFunctionDefinition(
      s,
      target.checker,
      symbolConfig,
    );
    if (extractedDefinition) { extractedFunctionDefinitions.push(extractedDefinition); }
  });

  return {
    extractedFunctionDefinitions,
    functionNames: extractedFunctionDefinitions.map((v) => v.functionName),
  };
}

function generateCodeFromAst(ast: ts.Node) {
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

export function getFullFunctionNames(
  functionObj: Record<any, any>,
  currentValue = '',
): string[] {
  let results: string[] = [];
  for (const [key, value] of Object.entries(functionObj)) {
    if (typeof value !== 'function') {
      const recured = getFullFunctionNames(value, key).map((posterier) => {
        if (!currentValue) return posterier;
        return `${currentValue}-${posterier}`;
      });
      results = results.concat(recured);
    } else if (currentValue) results.push(`${currentValue}-${key}`);
    else results.push(key);
  }
  return results;
}

export function getFullFunctionNamesMapGeneratedFile(
  functionDef: GeneratedDefinition,
  functionObj: Record<any, any>,
): [ts.TypeAliasDeclaration, ts.VariableStatement] {
  const { functionNames } = functionDef;
  const targetObj = functionObj.default ?? functionObj;
  const functionFullNames = getFullFunctionNames(targetObj);

  const functionMap: Record<string, {id:string, region?:string}> = functionNames.reduce(
    (current, functionName) => {
      const targetFullName = functionFullNames.find((fn) => fn.endsWith(functionName));
      if (!targetFullName) {
        // eslint-disable-next-line no-param-reassign
        functionDef.extractedFunctionDefinitions = functionDef.extractedFunctionDefinitions.filter(
          (v) => v.functionName !== functionName,
        );
        console.warn(
          `Not imported https function "${functionName}" detected. The definition reomoved\n`,
        );
        return current;
      }
      return {
        ...current,
        [functionName]: {
          id: targetFullName,
          region: functionDef.extractedFunctionDefinitions.find((v) => v.functionName === functionName)?.region,
        },
      };
    },
    {},
  );
  const ast = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier('functionsMap'),
          undefined,
          undefined,
          ts.factory.createObjectLiteralExpression(
            Object.entries(functionMap).map(([key, value]) => {
              const addRegion = value.region ? [
                ts.factory.createPropertyAssignment(
                  ts.factory.createIdentifier('region'),
                  ts.factory.createStringLiteral(value.region),
                ),
              ] : [];
              return ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(key),
                ts.factory.createObjectLiteralExpression(
                  [
                    ts.factory.createPropertyAssignment(
                      ts.factory.createIdentifier('id'),
                      ts.factory.createStringLiteral(value.id),
                    ),
                    ...addRegion,
                  ],
                  true,
                ),
              );
            }),
            true,
          ),
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );
  return [
    makeFunctionDefinitionTypes(functionDef.extractedFunctionDefinitions),
    ast,
  ];
}

export function outDefinitions(
  sources: string[],
  functionObj: Record<any, any>,
  options?: {
    symbolConfig?: SymbolConfig;
  },
): string {
  const { symbolConfig = ARGS_RESPONSE_TYPE_IDENTIFIER } = { ...options };
  const generateDefinitions = getGeneratedFunctionDefinitionsAndFunctionNames(
    sources,
    symbolConfig,
  );
  const [functionDefnitionAst, functionNamesAst] = getFullFunctionNamesMapGeneratedFile(generateDefinitions, functionObj);
  return (
    [
      generateCodeFromAst(functionDefnitionAst),
      generateCodeFromAst(functionNamesAst),
    ].join(EOL + EOL) + EOL
  );
}
