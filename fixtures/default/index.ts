import {onWrite} from './nest-functions/test-exclude'
import {includeTest} from './nest-functions/test-include'
import {includeTestShallow} from './test-include-shallow'


export default {
    includeTestShallow,
    namespace: {
        onWrite,
        includeTest,

    }
}

