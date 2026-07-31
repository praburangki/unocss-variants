import { describe, expect, it } from 'vitest';

import { falsyToString } from '../utils';

describe('falsyToString', () => {
  it('returns a string when given a boolean', () => {
    expect(falsyToString(true)).toBe('true');
    expect(falsyToString(false)).toBe('false');
  });

  it('returns 0 when given 0', () => {
    expect(falsyToString(0)).toBe('0');
  });

  it('returns the original value when given a value other than 0 or a boolean', () => {
    expect(falsyToString('test')).toBe('test');
    expect(falsyToString(4)).toBe(4);
    // eslint-disable-next-line sonar/prefer-specific-assertions
    expect(falsyToString(null)).toBe(null);
  });
});
