import ts from "typescript";
import { EOL } from 'os';
function makeFunctionDefinitionSignature(functionId: string, argsType: ts.TypeNode, resultType: ts.TypeNode) {
    return ts.factory.createPropertySignature(
        undefined,
        ts.factory.createStringLiteral(functionId),
        undefined,
        ts.factory.createTypeLiteralNode([
            ts.factory.createPropertySignature(
                undefined,
                ts.factory.createIdentifier("args"),
                undefined,
                argsType
            ),
            ts.factory.createPropertySignature(
                undefined,
                ts.factory.createIdentifier("result"),
                undefined,
                resultType
            )
        ])
    )
}

function readTypeSciptFilesAndChecker(sourcePaths: string[]): { checker: ts.TypeChecker; sources: ts.SourceFile[] } {
    const program = ts.createProgram(sourcePaths, {})
    return {
        checker: program.getTypeChecker(),
        sources: sourcePaths.map(spath => program.getSourceFile(spath)).filter(v => !!v) as ts.SourceFile[]
    }
}

function visitIdentifierFound(node: ts.Node, findingWord: string): boolean {
    if (ts.isIdentifier(node)) {
        if (node.text === findingWord) {
            return true
        }
    }
    const children = node.getChildren()
    if (children.length > 0) {
        return children.some(v => visitIdentifierFound(v, findingWord))
    }
    return false
}

type SymbolConfig = { args: string, result: string }

const ARGS_RESPONSE_TYPE_IDENTIFIER: SymbolConfig = {
    args: 'RequestArgs',
    result: 'ResponseResult'
}

type FunctionAst = {
    args: ts.TypeNode,
    result: ts.TypeNode
    functionName: string
}


function extractFunctionDefinition(source: ts.SourceFile, checker: ts.TypeChecker, symbolConfig: SymbolConfig): FunctionAst | undefined {
    const typeObjectNode: Partial<FunctionAst> = {
        functionName: ''
    }
    ts.forEachChild(source, function next(node) {
        if (ts.isTypeAliasDeclaration(node)) {
            if (node.name.text === symbolConfig.args) {
                node.forEachChild((v) => {
                    if (ts.isTypeLiteralNode(v)) {
                        const t = checker.getTypeAtLocation(v);
                        // NOTE: https://stackoverflow.com/questions/67423762/typescript-compilerapi-how-to-get-expanded-type-ast
                        const ast = checker.typeToTypeNode(t, undefined, ts.NodeBuilderFlags.NoTruncation | ts.NodeBuilderFlags.InTypeAlias)
                        typeObjectNode['args'] = ast
                    }
                })
            }
            if (node.name.text === symbolConfig.result) {
                node.forEachChild((v) => {
                    if (ts.isTypeLiteralNode(v)) {
                        const t = checker.getTypeAtLocation(v);
                        // NOTE: https://stackoverflow.com/questions/67423762/typescript-compilerapi-how-to-get-expanded-type-ast
                        const ast = checker.typeToTypeNode(t, undefined, ts.NodeBuilderFlags.NoTruncation | ts.NodeBuilderFlags.InTypeAlias)
                        typeObjectNode['result'] = ast
                    }
                })
            }
        }
        if (ts.isVariableStatement(node)) {
            node.forEachChild((v) => {
                if (v.kind === ts.SyntaxKind.ExportKeyword && !typeObjectNode.functionName) {
                    if (visitIdentifierFound(node, 'onCall')) {
                        typeObjectNode.functionName = (node as ts.VariableStatement).declarationList.declarations[0].name.getText()
                    }
                }
            })
        }
    })
    if (!typeObjectNode.functionName) return
    if (!typeObjectNode.args) typeObjectNode.args = ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
    if (!typeObjectNode.result) typeObjectNode.result = ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
    return typeObjectNode as FunctionAst
}

function makeFunctionDefinitionTypes(defs: FunctionAst[]) {
    const signatures = defs.map(def => makeFunctionDefinitionSignature(def.functionName, def.args, def.result))
    return ts.factory.createTypeAliasDeclaration(
        undefined,
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.factory.createIdentifier("FunctionDefinitions"),
        undefined,
        ts.factory.createTypeLiteralNode(signatures)
    )
}

export function getGeneratedFunctionDefinitionsAndFunctionNames(sources: string[], symbolConfig: SymbolConfig = ARGS_RESPONSE_TYPE_IDENTIFIER): { generatedCode: string; functionNames: string[]; } {
    const target = readTypeSciptFilesAndChecker(sources)

    const extractedFunctionDefinitions: FunctionAst[] = []

    target.sources.forEach(s => {
        const extractedDefinition = extractFunctionDefinition(s, target.checker, symbolConfig)
        if (extractedDefinition) extractedFunctionDefinitions.push(extractedDefinition)
    })

    const ast = makeFunctionDefinitionTypes(extractedFunctionDefinitions)
    const resultFile = ts.createSourceFile("dummy.ts", "", ts.ScriptTarget.Latest, /*setParentNodes*/ false, ts.ScriptKind.TS);
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

    const generatedCode = printer.printNode(ts.EmitHint.Unspecified, ast, resultFile);

    return {
        generatedCode,
        functionNames: extractedFunctionDefinitions.map(v => v.functionName)
    }
}

export function getFullFunctionNames(functionObj: Record<any, any>, current_value = ''): string[] {
    let results: string[] = []
    for (const [key, value] of Object.entries(functionObj)) {
        if (typeof value !== 'function') {
            const recured = getFullFunctionNames(value, key).map((posterier) => {
                if (!current_value) return posterier
                return `${current_value}-${posterier}`
            })
            results = results.concat(recured)
        } else {
            results.push(`${current_value}-${key}`)
        }
    }
    return results
}

export function getFullFunctionNamesMapGeneratedFile(functionNames: string[], functionObj: Record<any, any>): string {
    const functionFullNames = getFullFunctionNames(functionObj)
    const functionMap: Record<string, string> = functionNames.reduce((current, functionName) => {
        const targetFullName = functionFullNames.find(fn => fn.match(new RegExp(`${fn}$`)))
        return {
            ...current,
            [functionName]: targetFullName
        }
    }, {})
    const ast = ts.factory.createVariableStatement(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.factory.createVariableDeclarationList(
            [ts.factory.createVariableDeclaration(
                ts.factory.createIdentifier("functionsMap"),
                undefined,
                undefined,
                ts.factory.createObjectLiteralExpression(
                    Object.entries(functionMap).map(([key, value]) => {
                        return ts.factory.createPropertyAssignment(
                            ts.factory.createIdentifier(key),
                            ts.factory.createStringLiteral(value)
                        )
                    }
                    ),
                    true
                )
            )],
            ts.NodeFlags.Const
        )
    )
    const resultFile = ts.createSourceFile("dummy.ts", "", ts.ScriptTarget.Latest, /*setParentNodes*/ false, ts.ScriptKind.TS);
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const generated = printer.printNode(ts.EmitHint.Unspecified, ast, resultFile);
    return generated
}

export function outDefinitions(sources: string[], functionObj: Record<any, any>, options?: {
    symbolConfig?: SymbolConfig
}): string {
    const { symbolConfig = ARGS_RESPONSE_TYPE_IDENTIFIER } = { ...options }
    const generateDefinitions = getGeneratedFunctionDefinitionsAndFunctionNames(sources, symbolConfig)
    const generatedObjCode = getFullFunctionNamesMapGeneratedFile(generateDefinitions.functionNames, functionObj)
    return [
        generateDefinitions.generatedCode,
        generatedObjCode
    ].join(EOL + EOL) + EOL
}

