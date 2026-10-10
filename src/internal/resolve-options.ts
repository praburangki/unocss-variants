import type {
  AnyRecord,
  CompiledCompoundSlot,
  CompiledCompoundVariant,
  CompiledVariant,
  ResolvedOptions,
} from './types';
import { cx, flatMergeArrays, isEmptyObject, joinObjects, mergeObjects } from '../utils';

function compileVariants(variants: AnyRecord, variantKeys: Array<string>): Array<CompiledVariant> {
  const compiledVariants: Array<CompiledVariant> = [];

  for (let i = 0; i < variantKeys.length; i++) {
    const key = variantKeys[i];
    const values = variants[key];

    compiledVariants.push({ key, values, isEmpty: isEmptyObject(values) });
  }

  return compiledVariants;
}

function compileCompoundVariants(compoundVariants: unknown): Array<CompiledCompoundVariant> {
  if (!Array.isArray(compoundVariants) || compoundVariants.length === 0) {
    return [];
  }
  const result: Array<CompiledCompoundVariant> = [];

  for (let i = 0; i < compoundVariants.length; i++) {
    const compoundVariant = compoundVariants[i];
    const conditionKeys: Array<string> = [];

    for (const key of Object.keys(compoundVariant)) {
      if (key !== 'class' && key !== 'className') {
        conditionKeys.push(key);
      }
    }

    result.push({ conditionKeys, source: compoundVariant });
  }

  return result;
}

function compileCompoundSlots(compoundSlots: unknown): Array<CompiledCompoundSlot> {
  if (!Array.isArray(compoundSlots) || compoundSlots.length === 0) {
    return [];
  }
  const result: Array<CompiledCompoundSlot> = [];

  for (let i = 0; i < compoundSlots.length; i++) {
    const compoundSlot = compoundSlots[i];
    const conditionKeys: Array<string> = [];

    for (const key of Object.keys(compoundSlot)) {
      if (key !== 'slots' && key !== 'class' && key !== 'className') {
        conditionKeys.push(key);
      }
    }

    result.push({ conditionKeys, source: compoundSlot });
  }

  return result;
}

function indexCompoundSlotsBySlot(compiledCompoundSlots: Array<CompiledCompoundSlot>): Record<string, Array<CompiledCompoundSlot>> {
  const index: Record<string, Array<CompiledCompoundSlot>> = {};

  for (let i = 0; i < compiledCompoundSlots.length; i++) {
    const compoundSlot = compiledCompoundSlots[i];
    const slots = compoundSlot.source.slots;

    if (!Array.isArray(slots)) {
      continue;
    }

    for (let j = 0; j < slots.length; j++) {
      const slotKey = slots[j];

      if (!index[slotKey]) {
        index[slotKey] = [];
      }
      index[slotKey].push(compoundSlot);
    }
  }

  return index;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function resolveOptions(options: AnyRecord): ResolvedOptions {
  const {
    extend = null,
    slots: slotProps = {},
    variants: variantsProps = {},
    compoundVariants: compoundVariantsProps = [],
    compoundSlots: compoundSlotsProps = [],
    defaultVariants: defaultVariantsProps = {},
  } = options;

  const hasSlots = options.slots !== undefined;
  const base = extend?.base ? cx(extend.base, options?.base) : options?.base;
  const variants
    = extend?.variants && !isEmptyObject(extend.variants)
      ? mergeObjects(variantsProps, extend.variants)
      : variantsProps;
  const defaultVariants
    = extend?.defaultVariants && !isEmptyObject(extend.defaultVariants)
      ? { ...extend.defaultVariants, ...defaultVariantsProps }
      : defaultVariantsProps;

  const isExtendedSlotsEmpty = !extend?.slots || isEmptyObject(extend.slots);

  let componentBase: unknown;
  if (!hasSlots) {
    componentBase = undefined;
  } else if (isExtendedSlotsEmpty && extend?.base) {
    componentBase = cx(options?.base, extend.base);
  } else if (typeof options?.base === 'string' || options?.base == null) {
    componentBase = options.base;
  } else {
    componentBase = cx(options.base);
  }

  const componentSlots = hasSlots
    ? {
        base: componentBase,
        ...slotProps,
      }
    : {};

  let slots: AnyRecord;
  if (isExtendedSlotsEmpty) {
    slots = componentSlots;
  } else {
    const slotsToJoin = isEmptyObject(componentSlots)
      ? { base: options?.base }
      : componentSlots;
    slots = joinObjects({ ...extend?.slots }, slotsToJoin);
  }
  const compoundVariants
    = !extend?.compoundVariants || isEmptyObject(extend.compoundVariants)
      ? compoundVariantsProps
      : flatMergeArrays(extend?.compoundVariants, compoundVariantsProps);
  const compoundSlots
    = !extend?.compoundSlots || isEmptyObject(extend.compoundSlots)
      ? compoundSlotsProps
      : flatMergeArrays(extend?.compoundSlots, compoundSlotsProps);
  const variantKeys = Object.keys(variants);

  let deferredError: TypeError | null = null;
  if (compoundVariants && !Array.isArray(compoundVariants)) {
    deferredError = new TypeError(
      `The "compoundVariants" prop must be an array. Received: ${typeof compoundVariants}`,
    );
  } else if (compoundSlots && !Array.isArray(compoundSlots)) {
    deferredError = new TypeError(
      `The "compoundSlots" prop must be an array. Received: ${typeof compoundSlots}`,
    );
  }

  let mode: 'slots' | 'plain' | 'variants';
  if (hasSlots || !isExtendedSlotsEmpty) {
    mode = 'slots';
  } else if (variantKeys.length === 0) {
    mode = 'plain';
  } else {
    mode = 'variants';
  }

  return {
    extend,
    base,
    variants,
    defaultVariants,
    slots,
    compoundVariants,
    compoundSlots,
    compiledVariants: null,
    compiledCompoundVariants: null,
    compiledCompoundSlots: null,
    compiledCompoundSlotsBySlot: null,
    deferredError,
    mode,
    slotKeys: null,
    variantKeys,
  };
}

export function compileResolvedOptions(resolved: ResolvedOptions): ResolvedOptions {
  if (resolved.compiledVariants !== null) {
    return resolved;
  }

  resolved.compiledVariants = compileVariants(resolved.variants, resolved.variantKeys);
  resolved.compiledCompoundVariants = compileCompoundVariants(resolved.compoundVariants);
  resolved.compiledCompoundSlots = compileCompoundSlots(resolved.compoundSlots);
  resolved.compiledCompoundSlotsBySlot = indexCompoundSlotsBySlot(resolved.compiledCompoundSlots);
  resolved.slotKeys
    = resolved.slots && typeof resolved.slots === 'object' ? Object.keys(resolved.slots) : [];

  return resolved;
}
