import { expect } from 'vitest';

expect.extend({
  toHaveClass(received, expected) {
    expected = parseClasses(expected);
    received = parseClasses(received);

    return {
      pass: this.equals(expected, received) && expected.length === received.length,
      message: () => {
        return (
          `${this.utils.matcherHint(
            `${this.isNot ? '.not' : ''}.toHaveClass`,
            'element',
            this.utils.printExpected(expected.join(' ')),
          )
          }\n\n${
            this.utils.printDiffOrStringify(
              expected,
              received,
            )}`
        );
      },
    };
  },
});

function parseClasses(result: string | Array<string>) {
  return (typeof result === 'string' ? result.split(' ') : result).slice().sort();
}
