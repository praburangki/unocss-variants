import { describe, expect, it } from 'vitest';

import { uv } from '../index';

describe('uv.extend (advanced composition)', () => {
  it('inherits parent slots when the child only defines a base', () => {
    const menuBase = uv({ base: 'menuBase' });
    const menu = uv({
      extend: menuBase,
      base: 'menu',
      slots: {
        title: 'title',
      },
    });

    const { base, title } = menu();

    expect(base()).toHaveClass(['menuBase', 'menu']);
    expect(title()).toHaveClass(['title']);
  });

  it('supports multi-level extends', () => {
    const themeButton = uv({
      base: 'font-medium',
      variants: {
        color: {
          primary: 'text-blue-500',
        },
        disabled: {
          true: 'opacity-50',
        },
      },
      compoundVariants: [
        {
          color: 'primary',
          disabled: true,
          class: 'bg-black',
        },
      ],
      defaultVariants: {
        color: 'primary',
        disabled: true,
      },
    });

    const appButton = uv({ extend: themeButton });
    const button = uv({ extend: appButton });

    expect(appButton()).toHaveClass('font-medium text-blue-500 opacity-50 bg-black');
    expect(button()).toHaveClass('font-medium text-blue-500 opacity-50 bg-black');
  });
});
