import { getFunctions, httpsCallable, HttpsCallable } from 'firebase/functions'
import { getApp } from 'firebase/app'

type IFunctionDefnitions = {
    [key: string]: {
        args: any,
        result: any
    }
}

type HttpsCallableFuntions<FunctionDefnitions extends IFunctionDefnitions> = {
    [functionName in keyof FunctionDefnitions]: HttpsCallable<FunctionDefnitions[functionName]['args'], FunctionDefnitions[functionName]['result']>
}

type HttpsCallableFuntionIds<FunctionDefnitions> = {
    [functionName in keyof FunctionDefnitions]: {
        id: string
        region?: string
    }
}

export function initializeFunctions<FunctionDefnitions extends IFunctionDefnitions>(functionNameObject: HttpsCallableFuntionIds<FunctionDefnitions>, app = getApp(), region = 'asia-northeast1'): HttpsCallableFuntions<FunctionDefnitions> {
  const functionDefinitions = Object.entries(functionNameObject)
  return functionDefinitions.reduce((current, [functionName, functionObj]) => {
    const functions = getFunctions(app, functionObj.region || region)
    return {
      ...current,
      [functionName]: httpsCallable(functions, functionObj.id),
    }
  }, {} as HttpsCallableFuntions<FunctionDefnitions>)
}
