import type { Uv } from './types';
import { runtimeUv } from './internal/uv';
import { cx as runtimeCx } from './utils';

/**
 * Creates a variant-aware component function with UnoCSS classes.
 * Supports variants, slots, compound variants, and component composition.
 * Conflicting classes are NOT merged — resolution is left to the CSS cascade.
 */
export const uv = runtimeUv as Uv;

/**
 * Combines class names.
 */
export const cn = runtimeCx;
