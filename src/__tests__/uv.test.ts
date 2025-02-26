import { uv } from '..';

describe('unocss variants (uv) - Default', () => {
  it('should work with nested arrays', () => {
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

  it('should work without variants', () => {
    const h1 = uv({
      base: 'text-3xl font-bold',
    });

    const expectedResult = 'text-3xl font-bold';
    const result = h1();

    expect(result).toBe(expectedResult);
  });

  it('should work with variants', () => {
    const h1 = uv({
      base: 'font-bold',
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

    const expectedResult = ['text-5xl', 'font-bold', 'text-blue-500'];

    expect(result).toHaveClass(expectedResult);
  });

  it('should work with variantKeys', () => {
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

  it('should work with compoundVariants', () => {
    const h1 = uv({
      base: 'font-bold',
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
    ).toHaveClass(['text-5xl', 'font-bold', 'text-red-500', 'bg-red-500']);

    expect(
      h1({
        isBig: false,
        color: 'red',
      }),
    ).toHaveClass(['text-2xl', 'font-bold', 'text-red-500', 'underline']);

    expect(
      h1({
        color: 'red',
      }),
    ).toHaveClass(['text-2xl', 'font-bold', 'text-red-500', 'underline']);
  });

  it('should throw error if the compoundVariants is not an array', () => {
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
        // @ts-expect-error missing types
        compoundVariants: {},
      }),
    ).toThrow();
  });

  it('should work with custom class & className', () => {
    const h1 = uv({
      base: 'font-bold',
    });

    const expectedResult = ['text-xl', 'font-bold'];

    const result1 = h1({
      className: 'text-xl',
    });

    const result2 = h1({
      class: 'text-xl',
    });

    expect(result1).toHaveClass(expectedResult);
    expect(result2).toHaveClass(expectedResult);
  });

  it('should work without anything', () => {
    const styles = uv({});
    const expectedResult = undefined;

    expect(styles()).toBe(expectedResult);
  });

  it('should work correctly', () => {
    const h1 = uv({
      base: 'font-bold text-xl text-blue-200',
    });

    const expectedResult = ['font-bold', 'text-xl', 'text-blue-200'];

    expect(h1()).toHaveClass(expectedResult);
  });

  it('should work without defaultsVariants', () => {
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

  it('should work with simple variants', () => {
    const h1 = uv({
      base: 'text-3xl font-bold',
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
      defaultVariants: {
        isUnderline: true,
      },
    });

    const expectedResult = 'text-3xl font-bold text-green-500 no-underline';

    expect(h1({ color: 'green', isUnderline: false })).toBe(expectedResult);
  });

  it('should support boolean variants', () => {
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

  it('should support false only variant', () => {
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

  it('should support false only variant -- default variant', () => {
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

  it('should support boolean variants -- default variants', () => {
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

  it('should support boolean variants -- missing false variant', () => {
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

  it('should support boolean variants -- missing false variant -- default variants', () => {
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
});
