/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
import path from 'path';
import {
  Project, ts, printNode, TypeLiteralNode, SourceFile, TypeAliasDeclaration, InterfaceDeclaration,
} from 'ts-morph';

type CollectType = TypeAliasDeclaration | InterfaceDeclaration

function registerInterfacesAndTypeAliases(files: SourceFile[], cacheDir: Record<string, CollectType> = {}): Record<string, CollectType> {
  files.forEach((f) => {
    f.getDescendantsOfKind(ts.SyntaxKind.TypeAliasDeclaration).forEach((v) => {
      v.toggleModifier('export', false)
      v.toggleModifier('declare', false)
      const id = v.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText()
      if (id && !cacheDir[id]) {
        cacheDir = {
          ...cacheDir,
          [id]: v,
        }
      }
    })
    f.getDescendantsOfKind(ts.SyntaxKind.InterfaceDeclaration).forEach((v) => {
      v.toggleModifier('export', false)
      v.toggleModifier('declare', false)
      const id = v.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText()
      if (id && !cacheDir[id]) {
        cacheDir = {
          ...cacheDir,
          [id]: v,
        }
      }
    })
  })
  return cacheDir
}

function whoistingDepenencyTypes(typeNames: string[], cacheDir: Record<string, CollectType>): CollectType[] {
  let cache : CollectType[] = []
  typeNames.forEach((typeName) => {
    const typeNode = cacheDir[typeName]
    if (!typeNode) return
    delete cacheDir[typeName]
    cache.push(typeNode)
    const nextSearches = typeNode.getDescendantsOfKind(ts.SyntaxKind.TypeReference).reduce(
      (c: string[], node) => {
        const id = node.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText()
        if (!id) return c
        return [...c, id]
      },
      [],
    )
    cache = [...cache, ...whoistingDepenencyTypes(nextSearches, cacheDir)]
  })
  return cache
}

export function collectDependencyTypesCode(filePaths: string| readonly string[], typeUnresolved: string[]): string {
  const project = new Project();
  project.addSourceFilesAtPaths(filePaths)

  project.resolveSourceFileDependencies()

  const sourceFiles = project.getSourceFiles()

  const typeLists = registerInterfacesAndTypeAliases(sourceFiles)

  const targets = whoistingDepenencyTypes(typeUnresolved, typeLists)

  return targets.map((v) => v.print()).join('\r\n\r\n')
}
