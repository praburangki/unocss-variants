import type { CnOptions, CnReturn, Uv } from './types.d.ts';

export type * from './types.d.ts';

// util function
export declare const cnBase: <T extends CnOptions>(...classes: T) => CnReturn;

export declare const cn: <T extends CnOptions>(...classes: T) => CnReturn;

// main function
export declare const uv: Uv;

export declare function createUv(): Uv;
