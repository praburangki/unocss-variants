import { describe, expect, it } from 'vitest';

import { uv } from '../index';

describe('uv.extend', () => {
  it('includes the extended classes', () => {
    const p = uv({
      base: 'text-base text-green-500',
    });

    const h1 = uv({
      extend: p,
      base: 'text-3xl font-bold',
    });

    const result = h1();
    const expectedResult = ['text-3xl', 'font-bold', 'text-base', 'text-green-500'];

    expect(result).toHaveClass(expectedResult);
  });

  it('includes the extended classes with variants', () => {
    const p = uv({
      base: 'p--base text-base text-green-500',
      variants: {
        isBig: {
          true: 'text-5xl',
          false: 'text-2xl',
        },
        color: {
          red: 'text-red-500',
          blue: 'text-blue-500',
        },
      },
    });

    const h1 = uv({
      extend: p,
      base: 'text-3xl font-bold',
      variants: {
        color: {
          purple: 'text-purple-500',
          green: 'text-green-500',
        },
      },
    });

    const result = h1({
      isBig: true,
      color: 'red',
    });

    const expectedResult = [
      'font-bold',
      'text-red-500',
      'text-5xl',
      'p--base',
      'text-3xl',
      'text-base',
      'text-green-500',
    ];

    expect(result).toHaveClass(expectedResult);
  });

  it('includes classes from nested extensions', () => {
    const base = uv({
      base: 'text-base',
      variants: {
        color: {
          red: 'color--red',
        },
      },
    });

    const p = uv({
      extend: base,
      base: 'text-green-500',
      variants: {
        color: {
          blue: 'color--blue',
          yellow: 'color--yellow',
        },
      },
    });

    const h1 = uv({
      extend: p,
      base: 'text-3xl font-bold',
      variants: {
        color: {
          green: 'color--green',
        },
      },
    });

    const result = h1({
      color: 'red',
    });

    const expectedResult = ['text-3xl', 'font-bold', 'text-green-500', 'text-base', 'color--red'];

    expect(result).toHaveClass(expectedResult);

    const result2 = h1({
      color: 'blue',
    });

    const expectedResult2 = ['text-3xl', 'font-bold', 'text-green-500', 'text-base', 'color--blue'];

    expect(result2).toHaveClass(expectedResult2);

    const result3 = h1({
      color: 'green',
    });

    const expectedResult3 = [
      'text-3xl',
      'font-bold',
      'text-green-500',
      'text-base',
      'color--green',
    ];

    expect(result3).toHaveClass(expectedResult3);
  });

  it('overrides the extended classes with variants', () => {
    const p = uv({
      base: 'text-base text-green-500',
      variants: {
        isBig: {
          true: 'text-5xl',
          false: 'text-2xl',
        },
        color: {
          red: 'text-red-500 bg-red-100 tracking-normal',
          blue: 'text-blue-500',
        },
      },
    });

    const h1 = uv({
      extend: p,
      base: 'text-3xl font-bold',
      variants: {
        color: {
          red: ['text-red-200', 'bg-red-200'],
          green: 'text-green-500',
        },
      },
    });

    const result = h1({
      isBig: true,
      color: 'red',
    });

    const expectedResult = [
      'font-bold',
      'text-red-200',
      'bg-red-200',
      'tracking-normal',
      'text-5xl',
      'text-red-500',
      'bg-red-100',
      'text-3xl',
      'text-base',
      'text-green-500',
    ];

    expect(result).toHaveClass(expectedResult);
  });

  it('includes the extended classes with defaultVariants in parent', () => {
    const p = uv({
      base: 'text-base text-green-500',
      variants: {
        isBig: {
          true: 'text-5xl',
          false: 'text-2xl',
        },
        color: {
          red: 'text-red-500',
          blue: 'text-blue-500',
        },
      },
      defaultVariants: {
        isBig: true,
        color: 'red',
      },
    });

    const h1 = uv({
      extend: p,
      base: 'text-3xl font-bold',
      variants: {
        color: {
          purple: 'text-purple-500',
          green: 'text-green-500',
        },
      },
    });

    const result = h1();

    const expectedResult = [
      'font-bold',
      'text-red-500',
      'text-5xl',
      'text-3xl',
      'text-base',
      'text-green-500',
    ];

    expect(result).toHaveClass(expectedResult);
  });

  it('includes the extended classes with defaultVariants in child', () => {
    const p = uv({
      base: 'text-base text-green-500',
      variants: {
        isBig: {
          true: 'text-5xl',
          false: 'text-2xl',
        },
        color: {
          red: 'text-red-500',
          blue: 'text-blue-500',
        },
      },
    });

    const h1 = uv({
      extend: p,
      base: 'text-3xl font-bold',
      variants: {
        color: {
          purple: 'text-purple-500',
          green: 'text-green-500',
        },
      },
      defaultVariants: {
        isBig: true,
        color: 'red',
      },
    });

    const result = h1();

    const expectedResult = [
      'font-bold',
      'text-red-500',
      'text-5xl',
      'text-3xl',
      'text-base',
      'text-green-500',
    ];

    expect(result).toHaveClass(expectedResult);
  });

  it('overrides the extended defaultVariants in child', () => {
    const p = uv({
      base: 'text-base text-green-500',
      variants: {
        isBig: {
          true: 'text-5xl',
          false: 'text-2xl',
        },
        color: {
          red: 'text-red-500',
          blue: 'text-blue-500',
        },
      },
      defaultVariants: {
        isBig: true,
        color: 'blue',
      },
    });

    const h1 = uv({
      extend: p,
      base: 'text-3xl font-bold',
      variants: {
        color: {
          purple: 'text-purple-500',
          green: 'text-green-500',
        },
      },
      defaultVariants: {
        isBig: false,
        color: 'red',
      },
    });

    const result = h1();

    const expectedResult = [
      'font-bold',
      'text-red-500',
      'text-2xl',
      'text-3xl',
      'text-base',
      'text-green-500',
    ];

    expect(result).toHaveClass(expectedResult);
  });

  it('includes the extended classes with compoundVariants in parent', () => {
    const p = uv({
      base: 'text-base text-green-500',
      variants: {
        isBig: {
          true: 'text-5xl',
          false: 'text-2xl',
        },
        color: {
          red: 'text-red-500',
          blue: 'text-blue-500',
        },
      },
      defaultVariants: {
        isBig: true,
        color: 'red',
      },
      compoundVariants: [
        {
          isBig: true,
          color: 'red',
          class: 'bg-red-500',
        },
      ],
    });

    const h1 = uv({
      extend: p,
      base: 'text-3xl font-bold',
      variants: {
        color: {
          purple: 'text-purple-500',
          green: 'text-green-500',
        },
      },
    });

    const result = h1();

    const expectedResult = [
      'font-bold',
      'text-red-500',
      'bg-red-500',
      'text-5xl',
      'text-3xl',
      'text-base',
      'text-green-500',
    ];

    expect(result).toHaveClass(expectedResult);
  });

  it('includes the extended classes with compoundVariants in child', () => {
    const p = uv({
      base: 'text-base text-green-500',
      variants: {
        isBig: {
          true: 'text-5xl',
          false: 'text-2xl',
        },
        color: {
          red: 'text-red-500',
          blue: 'text-blue-500',
        },
      },
      defaultVariants: {
        isBig: true,
        color: 'red',
      },
    });

    const h1 = uv({
      extend: p,
      base: 'text-3xl font-bold',
      variants: {
        color: {
          purple: 'text-purple-500',
          green: 'text-green-500',
        },
      },
      defaultVariants: {
        color: 'green',
      },
      compoundVariants: [
        {
          isBig: true,
          color: 'green',
          class: 'bg-green-500',
        },
      ],
    });

    const result = h1();

    const expectedResult = [
      'font-bold',
      'bg-green-500',
      'text-green-500',
      'text-5xl',
      'text-3xl',
      'text-base',
      'text-green-500',
    ];

    expect(result).toHaveClass(expectedResult);
  });

  it('overrides the extended classes with compoundVariants in child', () => {
    const p = uv({
      base: 'text-base text-green-500',
      variants: {
        isBig: {
          true: 'text-5xl',
          false: 'text-2xl',
        },
        color: {
          red: 'text-red-500',
          blue: 'text-blue-500',
        },
      },
      defaultVariants: {
        isBig: true,
        color: 'red',
      },
      compoundVariants: [
        {
          isBig: true,
          color: 'red',
          class: 'bg-red-500',
        },
      ],
    });

    const h1 = uv({
      extend: p,
      base: 'text-3xl font-bold',
      variants: {
        color: {
          purple: 'text-purple-500',
          green: 'text-green-500',
        },
      },
      compoundVariants: [
        {
          isBig: true,
          color: 'red',
          class: 'bg-red-600',
        },
      ],
    });

    const result = h1();

    const expectedResult = [
      'font-bold',
      'bg-red-600',
      'text-red-500',
      'text-5xl',
      'bg-red-500',
      'text-3xl',
      'text-base',
      'text-green-500',
    ];

    expect(result).toHaveClass(expectedResult);
  });

  it('overrides extended classes when compound conditions use arrays', () => {
    const p = uv({
      base: 'text-base text-green-500',
      variants: {
        isBig: {
          true: 'text-5xl',
          false: ['text-2xl'],
        },
        color: {
          red: ['text-red-500 bg-red-100', 'tracking-normal'],
          blue: 'text-blue-500',
        },
      },
      defaultVariants: {
        isBig: true,
        color: 'red',
      },
      compoundVariants: [
        {
          isBig: true,
          color: 'red',
          class: 'bg-red-500',
        },
        {
          isBig: false,
          color: 'red',
          class: ['bg-red-500'],
        },
        {
          isBig: true,
          color: 'blue',
          class: ['bg-blue-500'],
        },
        {
          isBig: false,
          color: 'blue',
          class: 'bg-blue-500',
        },
      ],
    });

    const h1 = uv({
      extend: p,
      base: 'text-3xl font-bold',
      variants: {
        isBig: {
          true: 'text-7xl',
          false: 'text-3xl',
        },
        color: {
          red: ['text-red-200', 'bg-red-200'],
          green: ['text-green-500'],
        },
      },
      compoundVariants: [
        {
          isBig: true,
          color: 'red',
          class: 'bg-red-600',
        },
        {
          isBig: false,
          color: 'red',
          class: 'bg-red-600',
        },
        {
          isBig: true,
          color: 'blue',
          class: ['bg-blue-600'],
        },
        {
          isBig: false,
          color: 'blue',
          class: ['bg-blue-600'],
        },
      ],
    });

    expect(h1({ isBig: true, color: 'red' })).toHaveClass([
      'font-bold',
      'text-red-200',
      'bg-red-600',
      'tracking-normal',
      'text-7xl',
      'text-base',
      'text-green-500',
      'text-3xl',
      'text-5xl',
      'text-red-500',
      'bg-red-100',
      'bg-red-500',
      'bg-red-200',
    ]);

    expect(h1({ isBig: true, color: 'blue' })).toHaveClass([
      'font-bold',
      'text-blue-500',
      'bg-blue-600',
      'text-7xl',
      'bg-blue-500',
      'text-5xl',
      'text-base',
      'text-green-500',
      'text-3xl',
    ]);

    expect(h1({ isBig: false, color: 'red' })).toHaveClass([
      'font-bold',
      'text-red-200',
      'bg-red-600',
      'tracking-normal',
      'text-3xl',
      'text-base',
      'text-green-500',
      'text-2xl',
      'text-3xl',
      'text-red-500',
      'bg-red-100',
      'bg-red-200',
      'bg-red-500',
    ]);

    expect(h1({ isBig: false, color: 'blue' })).toHaveClass([
      'font-bold',
      'text-blue-500',
      'bg-blue-600',
      'text-3xl',
      'text-base',
      'text-green-500',
      'text-2xl',
      'text-3xl',
      'bg-blue-500',
    ]);
  });
});
