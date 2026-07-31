import type { ResolvedOptions, RuntimeComponent, RuntimeUv } from './types';
import { createClassResolver } from './class-resolver';
import { resolveOptions } from './resolve-options';

function attachComponentMetadata(component: RuntimeComponent, resolved: ResolvedOptions): void {
  component.variantKeys = resolved.variantKeys;
  component.extend = resolved.extend;
  component.base = resolved.base;
  component.slots = resolved.slots;
  component.variants = resolved.variants;
  component.defaultVariants = resolved.defaultVariants;
  component.compoundSlots = resolved.compoundSlots;
  component.compoundVariants = resolved.compoundVariants;
}

export const runtimeUv: RuntimeUv = (options) => {
  const resolved = resolveOptions(options);
  const component = createClassResolver(resolved);

  attachComponentMetadata(component, resolved);

  return component;
};
