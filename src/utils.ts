import type { JoinClassValue } from './internal/join-class-value';
import type { CnOptions, CnReturn } from './types';
import { joinClassValue } from './internal/join-class-value';

const SPACE_REGEX = /\s+/g;

function removeExtraSpaces(str: string): string {
  if (typeof str !== 'string' || !str) {
    return str;
  }

  return str.replace(SPACE_REGEX, ' ').trim();
}

/** Dirty leading/trailing/doubled/non-space whitespace on the final joined string. */
function stringNeedsNormalize(str: string): boolean {
  const len = str.length;

  if (len === 0) {
    return false;
  }

  const first = str.charCodeAt(0);
  const last = str.charCodeAt(len - 1);

  if (
    first === 32
    || last === 32
    || (first >= 9 && first <= 13)
    || first === 160
    || (last >= 9 && last <= 13)
    || last === 160
  ) {
    return true;
  }

  for (let i = 0; i < len; i++) {
    const code = str.charCodeAt(i);

    if ((code >= 9 && code <= 13) || code === 160) {
      return true;
    }
    if (code === 32 && i + 1 < len && str.charCodeAt(i + 1) === 32) {
      return true;
    }
  }

  return false;
}

export function cx<T extends CnOptions>(...classnames: T): CnReturn {
  const result = joinClassValue(classnames as Array<JoinClassValue>);

  if (!result) {
    return undefined;
  }

  return stringNeedsNormalize(result) ? removeExtraSpaces(result) : result;
}

export function falsyToString<T>(value: T): T | string {
  if (value === false) {
    return 'false';
  }

  if (value === true) {
    return 'true';
  }

  if (value === 0) {
    return '0';
  }

  return value;
}

export function isEmptyObject(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') {
    return true;
  }

  // eslint-disable-next-line no-restricted-syntax, no-unreachable-loop
  for (const _ in obj) {
    return false;
  }

  return true;
}

export function joinObjects<T extends Record<string, unknown>, U extends Record<string, unknown>>(obj1: T, obj2: U): T & U {
  const target = obj1 as Record<string, any>;

  for (const key of Object.keys(obj2)) {
    const val2 = obj2[key];

    if (key in target) {
      target[key] = cx(target[key], val2 as any);
    } else {
      target[key] = val2;
    }
  }

  return obj1 as T & U;
}

export function flat<T>(arr: Array<unknown>, target: Array<T>): void {
  for (let i = 0; i < arr.length; i++) {
    const el = arr[i];

    if (Array.isArray(el)) {
      flat(el, target);
    } else if (el) {
      target.push(el as T);
    }
  }
}

export function flatMergeArrays<T>(...arrays: Array<Array<unknown>>): Array<T> {
  const result: Array<T> = [];

  flat(arrays, result);
  const filtered: Array<T> = [];

  for (let i = 0; i < result.length; i++) {
    if (result[i]) {
      filtered.push(result[i]);
    }
  }

  return filtered;
}

export function mergeObjects<T extends object, U extends object>(obj1: T, obj2: U): Record<string, unknown> {
  const record1 = obj1 as Record<string, any>;
  const record2 = obj2 as Record<string, any>;
  const result: Record<string, any> = {};

  for (const key of Object.keys(record1)) {
    const val1 = record1[key];

    if (key in record2) {
      const val2 = record2[key];

      if (Array.isArray(val1) || Array.isArray(val2)) {
        result[key] = flatMergeArrays(val2, val1);
      } else if (typeof val1 === 'object' && typeof val2 === 'object' && val1 && val2) {
        result[key] = mergeObjects(val1, val2);
      } else {
        result[key] = `${val2} ${val1}`;
      }
    } else {
      result[key] = val1;
    }
  }

  for (const key of Object.keys(record2)) {
    if (!(key in record1)) {
      result[key] = record2[key];
    }
  }

  return result;
}
