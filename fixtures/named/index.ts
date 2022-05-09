import {onWrite} from './nest-functions/test-exclude'
import {includeTest} from './nest-functions/test-include'


export const nameSpace = {
    includeTest,
    onWrite
}

export {includeTestShallow} from './test-include-shallow'
