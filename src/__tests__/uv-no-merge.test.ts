import { describe, expect, it } from 'vitest';

import { uv } from '../index';

describe('uv (no class merging)', () => {
  it('keeps conflicting base classes', () => {
    const button = uv({
      base: 'px-4 px-2 py-2 py-4 bg-blue-500 bg-red-500',
    });

    // All classes are preserved; conflict resolution is left to the CSS cascade
    expect(button()).toBe('px-4 px-2 py-2 py-4 bg-blue-500 bg-red-500');
  });

  it('keeps conflicting variant classes', () => {
    const button = uv({
      base: 'font-medium',
      variants: {
        size: {
          sm: 'text-sm text-xs px-2 px-3',
          md: 'text-base text-md px-4 px-5',
        },
        color: {
          primary: 'bg-blue-500 bg-blue-600 text-white text-gray-100',
          secondary: 'bg-gray-500 bg-gray-600',
        },
      },
    });

    // All conflicting classes should be preserved
    expect(button({ size: 'sm' })).toBe('font-medium text-sm text-xs px-2 px-3');
    expect(button({ size: 'md', color: 'primary' })).toBe(
      'font-medium text-base text-md px-4 px-5 bg-blue-500 bg-blue-600 text-white text-gray-100',
    );
  });

  it('keeps conflicting compound variant classes', () => {
    const button = uv({
      base: 'font-semibold',
      variants: {
        size: {
          sm: 'px-2',
          md: 'px-4',
        },
        variant: {
          primary: 'bg-blue-500',
          secondary: 'bg-gray-500',
        },
      },
      compoundVariants: [
        {
          size: 'sm',
          variant: 'primary',
          class: 'bg-blue-600 bg-blue-700 px-3 px-4',
        },
      ],
    });

    // Compound variant classes should be added without resolving conflicts
    expect(button({ size: 'sm', variant: 'primary' })).toBe(
      'font-semibold px-2 bg-blue-500 bg-blue-600 bg-blue-700 px-3 px-4',
    );
  });

  it('keeps conflicting slot classes', () => {
    const card = uv({
      slots: {
        base: 'rounded-lg rounded-xl p-4 p-6',
        header: 'text-lg text-xl font-bold font-semibold',
        body: 'text-gray-600 text-gray-700 mt-2 mt-4',
      },
    });

    const slots = card();

    // All conflicting classes in slots should be preserved
    expect(slots.base()).toBe('rounded-lg rounded-xl p-4 p-6');
    expect(slots.header()).toBe('text-lg text-xl font-bold font-semibold');
    expect(slots.body()).toBe('text-gray-600 text-gray-700 mt-2 mt-4');
  });

  it('keeps conflicts from class and className props', () => {
    const button = uv({
      base: 'px-4 py-2 rounded',
    });

    // Additional classes should be appended without conflict resolution
    expect(button({ class: 'px-2 py-4 rounded-lg' })).toBe('px-4 py-2 rounded px-2 py-4 rounded-lg');
    expect(button({ className: 'px-6 py-1 rounded-xl' })).toBe(
      'px-4 py-2 rounded px-6 py-1 rounded-xl',
    );
  });

  it('supports non-UnoCSS classes', () => {
    const button = uv({
      base: 'button',
      variants: {
        size: {
          sm: 'button--sm',
          md: 'button--md',
          lg: 'button--lg',
        },
        variant: {
          primary: 'button--primary',
          secondary: 'button--secondary',
        },
      },
    });

    expect(button()).toBe('button');
    expect(button({ size: 'sm' })).toBe('button button--sm');
    expect(button({ size: 'lg', variant: 'secondary' })).toBe('button button--lg button--secondary');
  });

  it('handles empty and falsy values', () => {
    const button = uv({
      base: 'base',
      variants: {
        size: {
          sm: 'small',
          md: '',
          lg: null,
        },
      },
    });

    expect(button({ size: 'sm' })).toBe('base small');
    expect(button({ size: 'md' })).toBe('base');
    expect(button({ size: 'lg' })).toBe('base');
  });

  it('handles arrays of classes', () => {
    const button = uv({
      base: ['px-4', 'py-2', ['rounded', ['bg-blue-500']]],
      variants: {
        size: {
          sm: ['text-sm', ['px-2', 'py-1']],
        },
      },
    });

    expect(button()).toBe('px-4 py-2 rounded bg-blue-500');
    expect(button({ size: 'sm' })).toBe('px-4 py-2 rounded bg-blue-500 text-sm px-2 py-1');
  });
});
