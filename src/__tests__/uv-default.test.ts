import { describe, expect, it } from 'vitest';

import { uv } from '../index';

describe('uv', () => {
  it('flattens nested class arrays', () => {
    const menu = uv({
      base: ['base--styles-1', ['base--styles-2', ['base--styles-3']]],
      slots: {
        item: ['slots--item-1', ['slots--item-2', ['slots--item-3']]],
      },
      variants: {
        color: {
          primary: {
            item: [
              'item--color--primary-1',
              ['item--color--primary-2', ['item--color--primary-3']],
            ],
          },
        },
      },
    });

    const popover = uv({
      variants: {
        isOpen: {
          true: ['isOpen--true-1', ['isOpen--true-2', ['isOpen--true-3']]],
          false: ['isOpen--false-1', ['isOpen--false-2', ['isOpen--false-3']]],
        },
      },
    });

    const { base, item } = menu({ color: 'primary' });

    expect(base()).toHaveClass(['base--styles-1', 'base--styles-2', 'base--styles-3']);
    expect(item()).toHaveClass([
      'slots--item-1',
      'slots--item-2',
      'slots--item-3',
      'item--color--primary-1',
      'item--color--primary-2',
      'item--color--primary-3',
    ]);
    expect(popover({ isOpen: true })).toHaveClass([
      'isOpen--true-1',
      'isOpen--true-2',
      'isOpen--true-3',
    ]);
    expect(popover({ isOpen: false })).toHaveClass([
      'isOpen--false-1',
      'isOpen--false-2',
      'isOpen--false-3',
    ]);
  });

  it('returns base classes without variants', () => {
    const h1 = uv({
      base: 'text-3xl font-bold',
    });

    const expectedResult = 'text-3xl font-bold';
    const result = h1();

    expect(result).toBe(expectedResult);
  });

  it('supports variants', () => {
    const h1 = uv({
      base: 'text-3xl font-bold',
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

    const result = h1({
      isBig: true,
      color: 'blue',
    });

    const expectedResult = ['text-3xl', 'text-5xl', 'font-bold', 'text-blue-500'];

    expect(result).toHaveClass(expectedResult);
  });

  it('supports variantKeys', () => {
    const h1 = uv({
      base: 'text-3xl font-bold',
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

    const expectedResult = ['isBig', 'color'];

    expect(h1.variantKeys).toHaveClass(expectedResult);
  });

  it('supports compoundVariants', () => {
    const h1 = uv({
      base: 'text-3xl font-bold',
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
      compoundVariants: [
        {
          isBig: true,
          color: 'red',
          class: 'bg-red-500',
        },
        {
          isBig: false,
          color: 'red',
          class: 'underline',
        },
      ],
    });

    expect(
      h1({
        isBig: true,
        color: 'red',
      }),
    ).toHaveClass(['text-3xl', 'text-5xl', 'font-bold', 'text-red-500', 'bg-red-500']);

    expect(
      h1({
        isBig: false,
        color: 'red',
      }),
    ).toHaveClass(['text-3xl', 'text-2xl', 'font-bold', 'text-red-500', 'underline']);

    expect(
      h1({
        color: 'red',
      }),
    ).toHaveClass(['text-3xl', 'text-2xl', 'font-bold', 'text-red-500', 'underline']);
  });

  it('treats missing boolean variants as false in compoundVariants', () => {
    const element = uv({
      variants: {
        color: {
          blue: 'color-blue',
        },
        monochrome: {
          true: 'monochrome',
        },
      },
      compoundVariants: [
        {
          color: 'blue',
          monochrome: false,
          class: 'scalar-false',
        },
        {
          color: 'blue',
          monochrome: [false],
          class: 'array-false',
        },
        {
          color: 'blue',
          monochrome: [false, undefined],
          class: 'array-explicit-undefined',
        },
      ],
    });

    expect(element({ color: 'blue' })).toHaveClass([
      'color-blue',
      'scalar-false',
      'array-false',
      'array-explicit-undefined',
    ]);
    expect(element({ color: 'blue', monochrome: false })).toHaveClass([
      'color-blue',
      'scalar-false',
      'array-false',
      'array-explicit-undefined',
    ]);
    expect(element({ color: 'blue', monochrome: true })).toHaveClass(['color-blue', 'monochrome']);
  });

  it('throws when compoundVariants is not an array', () => {
    expect(
      uv({
        base: 'text-3xl font-bold',
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
        // @ts-expect-error too complex
        compoundVariants: {},
      }),
    ).toThrow();
  });

  it('supports custom class and className', () => {
    const h1 = uv({
      base: 'text-3xl font-bold',
    });

    const expectedResult = ['text-3xl', 'text-xl', 'font-bold'];

    const result1 = h1({
      className: 'text-xl',
    });

    const result2 = h1({
      class: 'text-xl',
    });

    expect(result1).toHaveClass(expectedResult);
    expect(result2).toHaveClass(expectedResult);
  });

  it('returns an empty result without configuration', () => {
    const styles = uv({});
    const expectedResult = undefined;

    expect(styles()).toBe(expectedResult);
  });

  it('preserves conflicting classes', () => {
    const h1 = uv({
      base: 'text-3xl font-bold text-blue-400 text-xl text-blue-200',
    });

    const expectedResult = ['text-3xl', 'font-bold', 'text-blue-400', 'text-xl', 'text-blue-200'];

    expect(h1()).toHaveClass(expectedResult);
  });

  it('supports variants without defaultVariants', () => {
    const button = uv({
      base: 'button',
      variants: {
        variant: {
          primary: 'button--primary',
          secondary: 'button--secondary',
          warning: 'button--warning',
          error: 'button--danger',
        },
        isDisabled: {
          true: 'button--disabled',
          false: 'button--enabled',
        },
        size: {
          small: 'button--small',
          medium: 'button--medium',
          large: 'button--large',
        },
      },
      compoundVariants: [
        {
          variant: 'secondary',
          size: 'small',
          class: 'button--secondary-small',
        },
        {
          variant: 'warning',
          isDisabled: false,
          class: 'button--warning-enabled',
        },
        {
          variant: 'warning',
          isDisabled: true,
          class: 'button--warning-disabled',
        },
        {
          variant: ['warning', 'error'],
          class: 'button--warning-danger',
        },
        {
          variant: ['warning', 'error'],
          size: 'medium',
          class: 'button--warning-danger-medium',
        },
      ],
    });

    const expectedResult = [
      'button',
      'button--secondary',
      'button--small',
      'button--enabled',
      'button--secondary-small',
    ];

    expect(button({ variant: 'secondary', size: 'small', isDisabled: false })).toHaveClass(
      expectedResult,
    );
  });

  it('supports simple variants', () => {
    const h1 = uv({
      base: 'text-3xl font-bold underline',
      variants: {
        color: {
          red: 'text-red-500',
          blue: 'text-blue-500',
          green: 'text-green-500',
        },
        isUnderline: {
          true: 'underline',
          false: 'no-underline',
        },
      },
    });

    const expectedResult = 'text-3xl font-bold underline text-green-500 no-underline';

    expect(h1({ color: 'green', isUnderline: false })).toBe(expectedResult);
  });

  it('supports boolean variants', () => {
    const h1 = uv({
      base: 'text-3xl',
      variants: {
        bool: {
          true: 'underline',
          false: 'truncate',
        },
      },
    });

    expect(h1()).toHaveClass(['text-3xl', 'truncate']);
    expect(h1({ bool: true })).toHaveClass(['text-3xl', 'underline']);
    expect(h1({ bool: false })).toHaveClass(['text-3xl', 'truncate']);
    expect(h1({ bool: undefined })).toHaveClass(['text-3xl', 'truncate']);
  });

  it('supports a false-only variant', () => {
    const h1 = uv({
      base: 'text-3xl',
      variants: {
        bool: {
          false: 'truncate',
        },
      },
    });

    expect(h1()).toHaveClass(['text-3xl', 'truncate']);
    expect(h1({ bool: true })).toHaveClass(['text-3xl']);
    expect(h1({ bool: false })).toHaveClass(['text-3xl', 'truncate']);
    expect(h1({ bool: undefined })).toHaveClass(['text-3xl', 'truncate']);
  });

  it('supports a false-only default variant', () => {
    const h1 = uv({
      base: 'text-3xl',
      variants: {
        bool: {
          false: 'truncate',
        },
      },
      defaultVariants: {
        bool: true,
      },
    });

    expect(h1()).toHaveClass(['text-3xl']);
    expect(h1({ bool: true })).toHaveClass(['text-3xl']);
    expect(h1({ bool: false })).toHaveClass(['text-3xl', 'truncate']);
    expect(h1({ bool: undefined })).toHaveClass(['text-3xl']);
  });

  it('supports boolean default variants', () => {
    const h1 = uv({
      base: 'text-3xl',
      variants: {
        bool: {
          true: 'underline',
          false: 'truncate',
        },
      },
      defaultVariants: {
        bool: true,
      },
    });

    expect(h1()).toHaveClass(['text-3xl', 'underline']);
    expect(h1({ bool: true })).toHaveClass(['text-3xl', 'underline']);
    expect(h1({ bool: false })).toHaveClass(['text-3xl', 'truncate']);
    expect(h1({ bool: undefined })).toHaveClass(['text-3xl', 'underline']);
  });

  it('supports boolean variants without a false branch', () => {
    const h1 = uv({
      base: 'text-3xl',
      variants: {
        bool: {
          true: 'underline',
        },
      },
    });

    expect(h1()).toHaveClass(['text-3xl']);
    expect(h1({ bool: true })).toHaveClass(['text-3xl', 'underline']);
    expect(h1({ bool: false })).toHaveClass(['text-3xl']);
    expect(h1({ bool: undefined })).toHaveClass(['text-3xl']);
  });

  it('supports boolean defaults without a false branch', () => {
    const h1 = uv({
      base: 'text-3xl',
      variants: {
        bool: {
          true: 'underline',
        },
      },
      defaultVariants: {
        bool: true,
      },
    });

    expect(h1()).toHaveClass(['text-3xl', 'underline']);
    expect(h1({ bool: true })).toHaveClass(['text-3xl', 'underline']);
    expect(h1({ bool: false })).toHaveClass(['text-3xl']);
    expect(h1({ bool: undefined })).toHaveClass(['text-3xl', 'underline']);
  });

  it('supports compound className and null variant overrides', () => {
    const button = uv({
      base: 'base',
      variants: {
        color: {
          red: 'text-red-500',
          blue: 'text-blue-500',
        },
      },
      defaultVariants: { color: 'red' },
      compoundVariants: [{ color: 'red', className: 'font-bold' }],
    });

    expect(button()).toBe('base text-red-500 font-bold');
    // @ts-expect-error runtime compatibility coverage for JavaScript consumers
    expect(button({ color: null })).toBe('base');
  });

  it('preserves mutations to existing compound metadata', () => {
    const button = uv({
      variants: {
        color: {
          red: 'text-red-500',
          blue: 'text-blue-500',
        },
      },
      compoundVariants: [{ color: 'red', class: 'font-normal' }],
    });

    expect(button({ color: 'red' })).toBe('text-red-500 font-normal');

    button.compoundVariants[0].color = 'blue';
    button.compoundVariants[0].class = 'font-bold';

    expect(button({ color: 'red' })).toBe('text-red-500');
    expect(button({ color: 'blue' })).toBe('text-blue-500 font-bold');
  });
});
