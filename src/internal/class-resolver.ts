import type {
  AnyRecord,
  CompiledCompoundSlot,
  CompiledCompoundVariant,
  CompiledVariant,
  ResolvedOptions,
  RuntimeComponent,
  RuntimeResult,
} from './types';
import { cx, falsyToString } from '../utils';
import { compileResolvedOptions } from './resolve-options';

const EMPTY_ARRAY: Array<never> = [];

function applyOverride(core: string | undefined, props?: AnyRecord): string | undefined {
  const classVal = props?.class;
  const classNameVal = props?.className;

  if ((classVal == null || classVal === '') && (classNameVal == null || classNameVal === '')) {
    return core;
  }

  return cx(core, classVal, classNameVal);
}

const variantClassesScratch: Array<any> = [];
const compoundClassesScratch: Array<any> = [];
const compoundVariantBySlotScratch: Array<any> = [];
const compoundSlotClassesScratch: Array<any> = [];

function getCompleteProps(defaultVariants: AnyRecord, props?: AnyRecord, slotProps?: AnyRecord): AnyRecord {
  const result: AnyRecord = {};

  for (const key of Object.keys(defaultVariants)) {
    result[key] = defaultVariants[key];
  }

  if (props) {
    for (const key of Object.keys(props)) {
      if (props[key] !== undefined) {
        result[key] = props[key];
      }
    }
  }

  if (slotProps) {
    for (const key of Object.keys(slotProps)) {
      if (slotProps[key] !== undefined) {
        result[key] = slotProps[key];
      }
    }
  }

  return result;
}

const isNullishOrFalse = (value: any): boolean => value == null || value === false;

function matchesCompoundValue(expected: any, actual: any): boolean {
  if (!Array.isArray(expected)) {
    return expected === actual || (isNullishOrFalse(expected) && isNullishOrFalse(actual));
  }

  for (let i = 0; i < expected.length; i++) {
    const expectedValue = expected[i];

    if (expectedValue === actual || (isNullishOrFalse(expectedValue) && isNullishOrFalse(actual))) {
      return true;
    }
  }

  return false;
}

function getVariantValue(variant: CompiledVariant, defaultVariants: AnyRecord, props?: AnyRecord, slotProps?: AnyRecord): any {
  if (variant.isEmpty) {
    return null;
  }

  const variantProp = slotProps?.[variant.key] ?? props?.[variant.key];

  if (variantProp === null) {
    return null;
  }

  const variantKey = falsyToString(variantProp);

  if (typeof variantKey === 'object') {
    return null;
  }

  const defaultVariantProp = defaultVariants?.[variant.key];
  const key = variantKey ?? falsyToString(defaultVariantProp);

  return variant.values[key || 'false'];
}

function matchesConditions(compound: CompiledCompoundVariant, completeProps: AnyRecord): boolean {
  const { conditionKeys, source } = compound;

  for (let i = 0; i < conditionKeys.length; i++) {
    const key = conditionKeys[i];

    if (!matchesCompoundValue(source[key], completeProps[key])) {
      return false;
    }
  }

  return true;
}

function pushCompoundClassForSlot(result: Array<any>, slotKey: string, classValue: any): void {
  if (typeof classValue === 'string') {
    if (slotKey === 'base') {
      result.push(classValue);
    }
  } else if (classValue && typeof classValue === 'object' && classValue[slotKey]) {
    result.push(classValue[slotKey]);
  }
}

function getVariantClassNames(variants: Array<CompiledVariant>, defaultVariants: AnyRecord, props?: AnyRecord): Array<any> {
  const result = variantClassesScratch;

  result.length = 0;

  for (let i = 0; i < variants.length; i++) {
    const value = getVariantValue(variants[i], defaultVariants, props);

    if (value) {
      result.push(value);
    }
  }

  return result;
}

function getVariantClassNamesBySlot(slotKey: string, variants: Array<CompiledVariant>, defaultVariants: AnyRecord, props?: AnyRecord, slotProps?: AnyRecord): Array<any> {
  const result = variantClassesScratch;

  result.length = 0;

  for (let i = 0; i < variants.length; i++) {
    const variantValue = getVariantValue(variants[i], defaultVariants, props, slotProps);
    const value
      = slotKey === 'base' && typeof variantValue === 'string'
        ? variantValue
        : variantValue && variantValue[slotKey];

    if (value) {
      result.push(value);
    }
  }

  return result;
}

function getCompoundVariantClasses(compoundVariants: Array<CompiledCompoundVariant>, completeProps: AnyRecord): Array<any> {
  const result = compoundClassesScratch;

  result.length = 0;

  for (let i = 0; i < compoundVariants.length; i++) {
    const compoundVariant = compoundVariants[i];

    if (!matchesConditions(compoundVariant, completeProps)) {
      continue;
    }
    if (compoundVariant.source.class) {
      result.push(compoundVariant.source.class);
    }
    if (compoundVariant.source.className) {
      result.push(compoundVariant.source.className);
    }
  }

  return result;
}

function getCompoundVariantClassesBySlot(slotKey: string, compoundVariants: Array<CompiledCompoundVariant>, completeProps: AnyRecord): Array<any> {
  const result = compoundVariantBySlotScratch;

  result.length = 0;

  for (let i = 0; i < compoundVariants.length; i++) {
    const compoundVariant = compoundVariants[i];

    if (!matchesConditions(compoundVariant, completeProps)) {
      continue;
    }

    pushCompoundClassForSlot(result, slotKey, compoundVariant.source.class);
    pushCompoundClassForSlot(result, slotKey, compoundVariant.source.className);
  }

  return result;
}

function getCompoundSlotClasses(compoundSlotsForKey: Array<CompiledCompoundSlot>, completeProps: AnyRecord): Array<any> {
  const result = compoundSlotClassesScratch;

  result.length = 0;

  for (let i = 0; i < compoundSlotsForKey.length; i++) {
    const compoundSlot = compoundSlotsForKey[i];

    if (!matchesConditions(compoundSlot, completeProps)) {
      continue;
    }

    if (compoundSlot.source.class) {
      result.push(compoundSlot.source.class);
    }
    if (compoundSlot.source.className) {
      result.push(compoundSlot.source.className);
    }
  }

  return result;
}

function createPlainResolver(resolved: ResolvedOptions): RuntimeComponent {
  const { base } = resolved;
  let core: string | undefined;
  let computed = false;

  return ((props?: AnyRecord): RuntimeResult => {
    if (!computed) {
      core = cx(base);
      computed = true;
    }

    return applyOverride(core, props);
  }) as RuntimeComponent;
}

function createVariantResolver(resolved: ResolvedOptions): RuntimeComponent {
  const { base, defaultVariants, deferredError } = resolved;
  let compiledCompoundVariants = resolved.compiledCompoundVariants;
  let compiledVariants = resolved.compiledVariants;

  const computeCore = (props?: AnyRecord) => {
    const compoundClasses
      = compiledCompoundVariants!.length > 0
        ? getCompoundVariantClasses(
            compiledCompoundVariants!,
            getCompleteProps(defaultVariants, props),
          )
        : undefined;

    return cx(
      base,
      getVariantClassNames(compiledVariants!, defaultVariants, props),
      compoundClasses,
    );
  };

  return ((props?: AnyRecord): RuntimeResult => {
    if (deferredError) {
      throw deferredError;
    }
    if (compiledVariants === null || compiledCompoundVariants === null) {
      compileResolvedOptions(resolved);
      compiledVariants = resolved.compiledVariants!;
      compiledCompoundVariants = resolved.compiledCompoundVariants!;
    }

    return applyOverride(computeCore(props), props);
  }) as RuntimeComponent;
}

type SlotsResult = Record<string, (slotProps?: AnyRecord) => string | undefined>;
type SlotComputer = (propsRef?: AnyRecord, slotProps?: AnyRecord) => string | undefined;

function hasSlotVariantOverride(slotProps: AnyRecord): boolean {
  for (const key of Object.keys(slotProps)) {
    if (key === 'class' || key === 'className') {
      continue;
    }
    if (slotProps[key] !== undefined) {
      return true;
    }
  }

  return false;
}

function createSlotsResolver(resolved: ResolvedOptions): RuntimeComponent {
  const { defaultVariants, deferredError, slots } = resolved;

  let keys: Array<string> | null = null;
  let slotComputers: Array<SlotComputer> | null = null;

  const ensureCompiled = () => {
    if (keys !== null) {
      return;
    }

    if (
      resolved.compiledVariants === null
      || resolved.compiledCompoundVariants === null
      || resolved.compiledCompoundSlots === null
      || resolved.compiledCompoundSlotsBySlot === null
      || resolved.slotKeys === null
    ) {
      compileResolvedOptions(resolved);
    }

    const variants = resolved.compiledVariants!;
    const compoundVariants = resolved.compiledCompoundVariants!;
    const compoundSlots = resolved.compiledCompoundSlots!;
    const compoundSlotsBySlot = resolved.compiledCompoundSlotsBySlot!;
    const slotKeys = resolved.slotKeys!;
    const hasCompounds = compoundVariants.length > 0 || compoundSlots.length > 0;
    const computers: Array<SlotComputer> = Array.from({ length: slotKeys.length });

    for (let i = 0; i < slotKeys.length; i++) {
      const slotKey = slotKeys[i];
      const compoundSlotsForKey = compoundSlotsBySlot[slotKey] ?? EMPTY_ARRAY;

      computers[i] = (propsRef, slotProps) => {
        const completeProps = hasCompounds
          ? getCompleteProps(defaultVariants, propsRef, slotProps)
          : undefined;
        const compoundVariantClasses = completeProps
          ? getCompoundVariantClassesBySlot(slotKey, compoundVariants, completeProps)
          : undefined;
        const compoundSlotClasses = completeProps
          ? getCompoundSlotClasses(compoundSlotsForKey, completeProps)
          : undefined;

        return cx(
          slots[slotKey],
          getVariantClassNamesBySlot(slotKey, variants, defaultVariants, propsRef, slotProps),
          compoundVariantClasses,
          compoundSlotClasses,
        );
      };
    }

    keys = slotKeys;
    slotComputers = computers;
  };

  const createSlotsResult = (props?: AnyRecord): SlotsResult => {
    const slotKeys = keys!;
    const computers = slotComputers!;
    const result: SlotsResult = {};

    for (let i = 0; i < slotKeys.length; i++) {
      const compute = computers[i];
      // Capture parent props for this result instance (not shared mutable state).
      const core = compute(props);

      result[slotKeys[i]] = (slotProps) => {
        if (slotProps == null) {
          return core;
        }
        if (!hasSlotVariantOverride(slotProps)) {
          return applyOverride(core, slotProps);
        }

        return applyOverride(compute(props, slotProps), slotProps);
      };
    }

    return result;
  };

  return ((props?: AnyRecord): RuntimeResult => {
    if (deferredError) {
      throw deferredError;
    }

    ensureCompiled();

    return createSlotsResult(props);
  }) as RuntimeComponent;
}

export function createClassResolver(resolved: ResolvedOptions): RuntimeComponent {
  if (resolved.mode === 'plain') {
    return createPlainResolver(resolved);
  }

  let resolver: RuntimeComponent | undefined;

  // Defer slots/variants resolver setup until first call so tv() construction stays cheap.
  return ((props?: AnyRecord): RuntimeResult => {
    resolver
      ??= resolved.mode === 'slots' ? createSlotsResolver(resolved) : createVariantResolver(resolved);

    return resolver(props);
  }) as RuntimeComponent;
}
