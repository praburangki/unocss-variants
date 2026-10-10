# unocss-variants

First-class variants, slots, and compound styles for [UnoCSS](https://unocss.dev/). Port of [Tailwind Variants](https://www.tailwind-variants.org/).

```ts
import { uv } from 'unocss-variants';

const button = uv({
  base: 'rounded-md font-medium px-3 py-1.5',
  variants: {
    color: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-zinc-200 text-zinc-900'
    }
  },
  defaultVariants: {
    color: 'primary'
  }
});

button({ color: 'secondary' });
```

Classes are **never merged**. Resolve conflicts with an UnoCSS `uv` layer and the `uno-layer-uv:` prefix.

## Install

```bash
pnpm add unocss-variants
```

## Docs

Full guides: [https://vinicunca.dev/unocss-variants/getting-started](https://vinicunca.dev/unocss-variants/getting-started)

- [Variants](https://vinicunca.dev/unocss-variants/concepts/variants)
- [Slots](https://vinicunca.dev/unocss-variants/concepts/slots)
- [Layers](https://vinicunca.dev/unocss-variants/concepts/layers)
- [Migration from Tailwind Variants](https://vinicunca.dev/unocss-variants/guides/migration)
- [API](https://vinicunca.dev/unocss-variants/api)
