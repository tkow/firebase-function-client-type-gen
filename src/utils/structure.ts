import { ts } from 'ts-morph'

export function makeFunctionDefinitionSignature(
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
