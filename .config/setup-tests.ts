import { isString } from '@vinicunca/perkakas';
import { expect } from 'vitest';

function parseClasses(result: string | Array<string>) {
  return (isString(result) ? result.split(' ') : result).slice().sort();
}

expect.extend({
  toHaveClass(received: string | Array<string>, expected: string | Array<string>) {
    const expectedClasses = parseClasses(expected);
    const receivedClasses = parseClasses(received);

    return {
      pass:
        this.equals(expectedClasses, receivedClasses)
        && expectedClasses.length === receivedClasses.length,
      message: () =>
        `${this.utils.matcherHint(
          `${this.isNot ? '.not' : ''}.toHaveClass`,
          'element',
          this.utils.printExpected(expectedClasses.join(' ')),
        )
        }\n\n`
        + `Expected: ${this.utils.printExpected(expectedClasses)}\n`
        + `Received: ${this.utils.printReceived(receivedClasses)}`,
    };
  },
});

declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveClass: (expected: string | Array<string>) => T;
  }

  interface AsymmetricMatchersContaining {
    toHaveClass: (expected: string | Array<string>) => void;
  }
}
