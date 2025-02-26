import 'vitest';

interface CustomMatchers<R = unknown> {
  toHaveClass: (expected: string | Array<string>) => R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
