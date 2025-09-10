import type { CnOptions, CnReturn } from './types.d.ts';

export declare const falsyToString: <T>(value: T) => T | string;

export declare const mergeObjects: <T extends object, U extends object>(
  obj1: T,
  obj2: U,
) => Record<string, unknown>;

export declare const removeExtraSpaces: (str: string) => string;

export declare const joinObjects: <
  T extends Record<string, unknown>,
  U extends Record<string, unknown>,
>(
  obj1: T,
  obj2: U,
) => T & U;

export declare const cnBase: <T extends CnOptions>(...classes: T) => () => CnReturn;
