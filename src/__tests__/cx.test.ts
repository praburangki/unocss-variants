import { describe, expect, it } from 'vitest';

import { cx } from '../index';

describe('cx', () => {
  it('joins strings and ignores falsy values', () => {
    // eslint-disable-next-line no-constant-binary-expression, sonar/no-redundant-boolean
    expect(cx('text-xl', false && 'font-bold', 'text-center')).toBe('text-xl text-center');
    expect(cx('text-xl', undefined, null, 0, '')).toBe('text-xl 0');
  });

  it('joins arrays of class names', () => {
    expect(cx(['px-4', 'py-2'], 'bg-blue-500')).toBe('px-4 py-2 bg-blue-500');
    expect(cx(['px-4', false, ['hover:bg-red-500', null, 'rounded-lg']])).toBe(
      'px-4 hover:bg-red-500 rounded-lg',
    );
  });

  it('handles nested arrays', () => {
    expect(cx(['px-4', ['py-2', ['bg-blue-500', ['rounded-lg', false, ['shadow-md']]]]])).toBe(
      'px-4 py-2 bg-blue-500 rounded-lg shadow-md',
    );
  });

  it('joins objects with truthy values as keys', () => {
    expect(cx({ 'text-sm': true, 'font-bold': false, 'bg-green-200': 1, 'm-0': 0 })).toBe(
      'text-sm bg-green-200',
    );
  });

  it('handles mixed class value arguments', () => {
    expect(
      cx(
        'text-lg',
        ['px-3', { 'hover:bg-yellow-300': true, 'focus:outline-none': false }],
        { 'rounded-md': true, 'shadow-md': null },
        'leading-tight',
      ),
    ).toBe('text-lg px-3 hover:bg-yellow-300 rounded-md leading-tight');
  });

  it('handles numbers and bigint', () => {
    expect(cx(123, 'text-base', 0n, { border: true })).toBe('123 text-base 0 border');
  });

  it('returns undefined for no input', () => {
    expect(cx()).toBeUndefined();
  });

  it('returns \'0\' for zero and ignores other falsy values', () => {
    expect(cx(false, null, undefined, '', 0)).toBe('0');
  });

  it('normalizes template strings with irregular whitespace', () => {
    const input = `
      px-4
      py-2

      bg-blue-500
        rounded-lg
    `;

    expect(cx(input)).toBe('px-4 py-2 bg-blue-500 rounded-lg');

    expect(
      cx(
        ` text-center
          font-semibold  `,
        ['text-sm', '   uppercase   '],
        { 'shadow-lg': true, 'opacity-50': false },
      ),
    ).toBe('text-center font-semibold text-sm uppercase shadow-lg');
  });

  it('handles empty and falsy values', () => {
    expect(cx('', null, undefined, false, NaN, 0, '0')).toBe('0 0');
  });

  it('does not merge conflicting classes (simple concatenation)', () => {
    expect(cx('px-2', 'px-4', 'py-2')).toBe('px-2 px-4 py-2');
  });

  it('handles conflicting classes without merging', () => {
    expect(cx('text-red-500', 'text-blue-500')).toBe('text-red-500 text-blue-500');
  });
});
