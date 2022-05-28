import { onWrite } from './nest-functions/test-not-https-func';
import { includeTest } from './nest-functions/test-include';
import { includeTestShallow } from './test-include-shallow';
import { aliasTypeCheck } from './nest-functions/test-type-alias-conversion';

export default {
  includeTestShallow,
  namespace: {
    onWrite,
    includeTest,
    aliasTypeCheck,
  },
};
