import { describe, expect, it } from 'vitest';
import { cnBase } from '../utils';

describe('cnBase function', () => {
  it('should join strings and ignore falsy values', () => {
    expect(cnBase('text-xl', 'text-center')).toBe('text-xl text-center');
    expect(cnBase('text-xl', undefined, null, 0, '')).toBe('text-xl 0');
  });

  it('should join arrays of class names', () => {
    expect(cnBase(['px-4', 'py-2'], 'bg-blue-500')).toBe('px-4 py-2 bg-blue-500');
    expect(cnBase(['px-4', false, ['hover:bg-red-500', null, 'rounded-lg']])).toBe(
      'px-4 hover:bg-red-500 rounded-lg',
    );
  });

  it('should handle nested arrays', () => {
    expect(cnBase(['px-4', ['py-2', ['bg-blue-500', ['rounded-lg', false, ['shadow-md']]]]])).toBe(
      'px-4 py-2 bg-blue-500 rounded-lg shadow-md',
    );
  });

  it('should join objects with truthy values as keys', () => {
    expect(cnBase({ 'text-sm': true, 'font-bold': false, 'bg-green-200': 1, 'm-0': 0 })).toBe(
      'text-sm bg-green-200',
    );
  });

  it('should handle mixed arguments correctly', () => {
    expect(
      cnBase(
        'text-lg',
        ['px-3', { 'hover:bg-yellow-300': true, 'focus:outline-none': false }],
        { 'rounded-md': true, 'shadow-md': null },
        'leading-tight',
      ),
    ).toBe('text-lg px-3 hover:bg-yellow-300 rounded-md leading-tight');
  });

  it('should handle numbers and bigint', () => {
    expect(cnBase(123, 'text-base', 0n, { border: true })).toBe('123 text-base 0 border');
  });

  it('should return undefined for no input', () => {
    expect(cnBase()).toBeUndefined();
  });

  it('should return \'0\' for zero and ignore other falsy', () => {
    expect(cnBase(false, null, undefined, '', 0)).toBe('0');
  });

  it('should normalize template strings with irregular whitespace', () => {
    const input = `
      px-4
      py-2

      bg-blue-500
        rounded-lg
    `;

    expect(cnBase(input)).toBe('px-4 py-2 bg-blue-500 rounded-lg');

    expect(
      cnBase(
        ` text-center
          font-semibold  `,
        ['text-sm', '   uppercase   '],
        { 'shadow-lg': true, 'opacity-50': false },
      ),
    ).toBe('text-center font-semibold text-sm uppercase shadow-lg');
  });

  it('should handle empty and falsy values correctly', () => {
    expect(cnBase('', null, undefined, false, Number.NaN, 0, '0')).toBe('0 0');
  });
});
