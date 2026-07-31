import { describe, expect, it } from 'vitest';

import { uv } from '../index';

describe('uv (compound slots)', () => {
  it('applies compound slots without variants', () => {
    const pagination = uv({
      slots: {
        base: 'flex flex-wrap relative gap-1 max-w-fit',
        item: '',
        prev: '',
        next: '',
        cursor: ['absolute', 'flex', 'overflow-visible'],
      },
      compoundSlots: [
        {
          slots: ['item', 'prev', 'next'],
          class: ['flex', 'flex-wrap', 'truncate'],
        },
      ],
    });
    // with default values
    const { base, item, prev, next, cursor } = pagination();

    expect(base()).toHaveClass(['flex', 'flex-wrap', 'relative', 'gap-1', 'max-w-fit']);
    expect(item()).toHaveClass(['flex', 'flex-wrap', 'truncate']);
    expect(prev()).toHaveClass(['flex', 'flex-wrap', 'truncate']);
    expect(next()).toHaveClass(['flex', 'flex-wrap', 'truncate']);
    expect(cursor()).toHaveClass(['absolute', 'flex', 'overflow-visible']);
  });

  it('preserves deferred validation for invalid compoundSlots', () => {
    const component = uv({
      slots: { base: 'base' },
      // @ts-expect-error runtime validation coverage
      compoundSlots: {},
    });

    expect(component).toThrow('The "compoundSlots" prop must be an array. Received: object');
  });

  it('matches one default variant in compound slots', () => {
    const pagination = uv({
      slots: {
        base: 'flex flex-wrap relative gap-1 max-w-fit',
        item: '',
        prev: '',
        next: '',
        cursor: ['absolute', 'flex', 'overflow-visible'],
      },
      variants: {
        size: {
          xs: {},
          sm: {},
          md: {},
          lg: {},
          xl: {},
        },
      },
      compoundSlots: [
        {
          slots: ['item', 'prev', 'next'],
          class: ['flex', 'flex-wrap', 'truncate'],
        },
        {
          slots: ['item', 'prev', 'next'],
          size: 'xs',
          class: 'w-7 h-7 text-xs',
        },
      ],
      defaultVariants: {
        size: 'xs',
      },
    });
    // with default values
    const { base, item, prev, next, cursor } = pagination();

    expect(base()).toHaveClass(['flex', 'flex-wrap', 'relative', 'gap-1', 'max-w-fit']);
    expect(item()).toHaveClass(['flex', 'flex-wrap', 'truncate', 'w-7', 'h-7', 'text-xs']);
    expect(prev()).toHaveClass(['flex', 'flex-wrap', 'truncate', 'w-7', 'h-7', 'text-xs']);
    expect(next()).toHaveClass(['flex', 'flex-wrap', 'truncate', 'w-7', 'h-7', 'text-xs']);
    expect(cursor()).toHaveClass(['absolute', 'flex', 'overflow-visible']);
  });

  it('matches one explicit variant in compound slots', () => {
    const pagination = uv({
      slots: {
        base: 'flex flex-wrap relative gap-1 max-w-fit',
        item: '',
        prev: '',
        next: '',
        cursor: ['absolute', 'flex', 'overflow-visible'],
      },
      variants: {
        size: {
          xs: {},
          sm: {},
          md: {},
          lg: {},
          xl: {},
        },
      },
      compoundSlots: [
        {
          slots: ['item', 'prev', 'next'],
          class: ['flex', 'flex-wrap', 'truncate'],
        },
        {
          slots: ['item', 'prev', 'next'],
          size: 'xs',
          class: 'w-7 h-7 text-xs',
        },
      ],
      defaultVariants: {
        size: 'sm',
      },
    });
    // with default values
    const { base, item, prev, next, cursor } = pagination({
      size: 'xs',
    });

    expect(base()).toHaveClass(['flex', 'flex-wrap', 'relative', 'gap-1', 'max-w-fit']);
    expect(item()).toHaveClass(['flex', 'flex-wrap', 'truncate', 'w-7', 'h-7', 'text-xs']);
    expect(prev()).toHaveClass(['flex', 'flex-wrap', 'truncate', 'w-7', 'h-7', 'text-xs']);
    expect(next()).toHaveClass(['flex', 'flex-wrap', 'truncate', 'w-7', 'h-7', 'text-xs']);
    expect(cursor()).toHaveClass(['absolute', 'flex', 'overflow-visible']);
  });

  it('matches one boolean variant in compound slots', () => {
    const nav = uv({
      base: 'base',
      slots: {
        toggle: 'slot--toggle',
        item: 'slot--item',
      },
      variants: {
        isActive: {
          true: '',
        },
      },
      compoundSlots: [
        {
          slots: ['item', 'toggle'],
          class: 'compound--item-toggle',
        },
        {
          slots: ['item', 'toggle'],
          isActive: true,
          class: 'compound--item-toggle--active',
        },
      ],
    });

    let styles = nav({ isActive: false });

    expect(styles.base()).toHaveClass(['base']);
    expect(styles.toggle()).toHaveClass(['slot--toggle', 'compound--item-toggle']);
    expect(styles.item()).toHaveClass(['slot--item', 'compound--item-toggle']);

    styles = nav({ isActive: true });

    expect(styles.base()).toHaveClass(['base']);
    expect(styles.toggle()).toHaveClass([
      'slot--toggle',
      'compound--item-toggle',
      'compound--item-toggle--active',
    ]);
    expect(styles.item()).toHaveClass([
      'slot--item',
      'compound--item-toggle',
      'compound--item-toggle--active',
    ]);
  });

  it('treats missing boolean variants as false in compoundSlots', () => {
    const nav = uv({
      slots: {
        item: 'slot--item',
      },
      variants: {
        isActive: {
          true: {
            item: 'active',
          },
        },
      },
      compoundSlots: [
        {
          slots: ['item'],
          isActive: false,
          class: 'scalar-false',
        },
        {
          slots: ['item'],
          isActive: [false],
          class: 'array-false',
        },
        {
          slots: ['item'],
          isActive: [false, undefined],
          class: 'array-explicit-undefined',
        },
      ],
    });

    expect(nav().item()).toHaveClass([
      'slot--item',
      'scalar-false',
      'array-false',
      'array-explicit-undefined',
    ]);
    expect(nav({ isActive: true }).item()).toHaveClass(['slot--item', 'active']);
  });

  it('matches multiple default variants in compound slots', () => {
    const pagination = uv({
      slots: {
        base: 'flex flex-wrap relative gap-1 max-w-fit',
        item: '',
        prev: '',
        next: '',
        cursor: ['absolute', 'flex', 'overflow-visible'],
      },
      variants: {
        size: {
          xs: {},
          sm: {},
          md: {},
          lg: {},
          xl: {},
        },
        color: {
          primary: {},
          secondary: {},
        },
        isBig: {
          true: {},
        },
      },
      compoundSlots: [
        {
          slots: ['item', 'prev', 'next'],
          class: ['flex', 'flex-wrap', 'truncate'],
        },
        {
          slots: ['item', 'prev', 'next'],
          size: 'xs',
          color: 'primary',
          isBig: false,
          class: 'w-7 h-7 text-xs',
        },
      ],
      defaultVariants: {
        size: 'xs',
        color: 'primary',
        isBig: false,
      },
    });
    // with default values
    const { base, item, prev, next, cursor } = pagination();

    expect(base()).toHaveClass(['flex', 'flex-wrap', 'relative', 'gap-1', 'max-w-fit']);
    expect(item()).toHaveClass(['flex', 'flex-wrap', 'truncate', 'w-7', 'h-7', 'text-xs']);
    expect(prev()).toHaveClass(['flex', 'flex-wrap', 'truncate', 'w-7', 'h-7', 'text-xs']);
    expect(next()).toHaveClass(['flex', 'flex-wrap', 'truncate', 'w-7', 'h-7', 'text-xs']);
    expect(cursor()).toHaveClass(['absolute', 'flex', 'overflow-visible']);
  });

  it('matches multiple explicit variants in compound slots', () => {
    const pagination = uv({
      slots: {
        base: 'flex flex-wrap relative gap-1 max-w-fit',
        item: '',
        prev: '',
        next: '',
        cursor: ['absolute', 'flex', 'overflow-visible'],
      },
      variants: {
        size: {
          xs: {},
          sm: {},
          md: {},
          lg: {},
          xl: {},
        },
        color: {
          primary: {},
          secondary: {},
        },
        isBig: {
          true: {},
        },
      },
      compoundSlots: [
        {
          slots: ['item', 'prev', 'next'],
          class: ['flex', 'flex-wrap', 'truncate'],
        },
        {
          slots: ['item', 'prev', 'next'],
          size: 'xs',
          color: 'primary',
          isBig: true,
          class: 'w-7 h-7 text-xs',
        },
      ],
      defaultVariants: {
        size: 'sm',
        color: 'secondary',
        isBig: false,
      },
    });
    // with default values
    const { base, item, prev, next, cursor } = pagination({
      size: 'xs',
      color: 'primary',
      isBig: true,
    });

    expect(base()).toHaveClass(['flex', 'flex-wrap', 'relative', 'gap-1', 'max-w-fit']);
    expect(item()).toHaveClass(['flex', 'flex-wrap', 'truncate', 'w-7', 'h-7', 'text-xs']);
    expect(prev()).toHaveClass(['flex', 'flex-wrap', 'truncate', 'w-7', 'h-7', 'text-xs']);
    expect(next()).toHaveClass(['flex', 'flex-wrap', 'truncate', 'w-7', 'h-7', 'text-xs']);
    expect(cursor()).toHaveClass(['absolute', 'flex', 'overflow-visible']);
  });
});
