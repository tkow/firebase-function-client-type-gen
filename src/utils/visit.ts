/* eslint-disable no-restricted-syntax */
import { ts } from 'ts-morph'

export function visitIdentifierFound(
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

export function visitCallExpressionFound(
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

export function collectTypeReferences(
  node: ts.Node,
  checker?: ts.TypeChecker,
): string[] {
  let cache: string[] = []
  const children = node.getChildren()
  if (ts.isTypeReferenceNode(node)) {
    for (const child of children) {
      if (ts.isIdentifier(child)) {
        cache = [...cache, child.getText()]
      }
    }
  }
  if (children.length > 0) {
    for (const child of children) {
      const n = collectTypeReferences(child);
      cache = [...cache, ...n]
    }
  }
  return cache;
}
