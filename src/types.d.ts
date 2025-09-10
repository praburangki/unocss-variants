/* eslint-disable ts/no-empty-object-type */
/* eslint-disable ts/no-unnecessary-type-constraint */
/**
 * ----------------------------------------
 * Base Types
 * ----------------------------------------
 */

export type ClassValue = ClassNameArray | string | null | undefined | 0 | 0n | false;
type ClassNameArray = Array<ClassValue>;

export type ClassProp<V extends unknown = ClassValue>
  = | { class?: V; className?: never }
    | { class?: never; className?: V };

type UvBaseName = 'base';

type UvSlots = Record<string, ClassValue> | undefined;

/**
 * ----------------------------------------------------------------------
 * Utils
 * ----------------------------------------------------------------------
 */

export type OmitUndefined<T> = T extends undefined ? never : T;

export type StringToBoolean<T> = T extends 'true' | 'false' ? boolean : T;

type CnClassValue
  = | string
    | number
    | bigint
    | boolean
    | null
    | undefined
    | CnClassDictionary
    | CnClassArray;

interface CnClassDictionary {
  [key: string]: any;
}

interface CnClassArray extends Array<CnClassValue> {}

export type CnOptions = Array<CnClassValue>;

export type CnReturn = string | undefined;

// compare if the value is true or array of values
export type isTrueOrArray<T> = T extends true | Array<unknown> ? true : false;

/**
 * ----------------------------------------------------------------------
 * Uv Types
 * ----------------------------------------------------------------------
 */

type UvSlotsWithBase<S extends UvSlots, B extends ClassValue> = B extends undefined
  ? keyof S
  : keyof S | UvBaseName;

type SlotsClassValue<S extends UvSlots, B extends ClassValue> = {
  [K in UvSlotsWithBase<S, B>]?: ClassValue;
};

type UvVariantsDefault<S extends UvSlots, B extends ClassValue> = S extends undefined
  ? {}
  : {
      [key: string]: {
        [key: string]: S extends UvSlots ? SlotsClassValue<S, B> | ClassValue : ClassValue;
      };
    };

export type UvVariants<
  S extends UvSlots | undefined,
  B extends ClassValue | undefined = undefined,
  EV extends UvVariants<ES> | undefined = undefined,
  ES extends UvSlots | undefined = undefined,
> = EV extends undefined
  ? UvVariantsDefault<S, B>
  : | {
    [K in keyof EV]: {
      [K2 in keyof EV[K]]: S extends UvSlots
        ? SlotsClassValue<S, B> | ClassValue
        : ClassValue;
    };
  }
  | UvVariantsDefault<S, B>;

export type UvCompoundVariants<
  V extends UvVariants<S>,
  S extends UvSlots,
  B extends ClassValue,
  EV extends UvVariants<ES>,
  ES extends UvSlots,
> = Array<
  {
    [K in keyof V | keyof EV]?:
      | (K extends keyof V ? StringToBoolean<keyof V[K]> : never)
      | (K extends keyof EV ? StringToBoolean<keyof EV[K]> : never)
      | (K extends keyof V ? Array<StringToBoolean<keyof V[K]>> : never);
  } & ClassProp<SlotsClassValue<S, B> | ClassValue>
>;

export type UvCompoundSlots<
  V extends UvVariants<S>,
  S extends UvSlots,
  B extends ClassValue,
> = Array<
  V extends undefined ? {
    slots: Array<UvSlotsWithBase<S, B>>;
  } & ClassProp : {
    slots: Array<UvSlotsWithBase<S, B>>;
  } & {
    [K in keyof V]?: StringToBoolean<keyof V[K]> | Array<StringToBoolean<keyof V[K]>>;
  } & ClassProp
>;

export type UvDefaultVariants<
  V extends UvVariants<S>,
  S extends UvSlots,
  EV extends UvVariants<ES>,
  ES extends UvSlots,
> = {
  [K in keyof V | keyof EV]?:
    | (K extends keyof V ? StringToBoolean<keyof V[K]> : never)
    | (K extends keyof EV ? StringToBoolean<keyof EV[K]> : never);
};

export type UvProps<
  V extends UvVariants<S>,
  S extends UvSlots,
  EV extends UvVariants<ES>,
  ES extends UvSlots,
> = EV extends undefined
  ? V extends undefined
    ? ClassProp<ClassValue>
    : {
      [K in keyof V]?: StringToBoolean<keyof V[K]> | undefined;
    } & ClassProp<ClassValue>
  : V extends undefined ? {
    [K in keyof EV]?: StringToBoolean<keyof EV[K]> | undefined;
  } & ClassProp<ClassValue> : {
    [K in keyof V | keyof EV]?:
          | (K extends keyof V ? StringToBoolean<keyof V[K]> : never)
          | (K extends keyof EV ? StringToBoolean<keyof EV[K]> : never)
          | undefined;
  } & ClassProp<ClassValue>;

export type UvVariantKeys<V extends UvVariants<S>, S extends UvSlots> = V extends object
  ? Array<keyof V>
  : undefined;

export interface UvReturnProps<
  V extends UvVariants<S>,
  S extends UvSlots,
  B extends ClassValue,
  EV extends UvVariants<ES>,
  ES extends UvSlots,
  // @ts-expect-error amount of generics
  E extends UvReturnType = undefined,
> {
  extend: E;
  base: B;
  slots: S;
  variants: V;
  defaultVariants: UvDefaultVariants<V, S, EV, ES>;
  compoundVariants: UvCompoundVariants<V, S, B, EV, ES>;
  compoundSlots: UvCompoundSlots<V, S, B>;
  variantKeys: UvVariantKeys<V, S>;
}

type HasSlots<S extends UvSlots, ES extends UvSlots> = S extends undefined
  ? ES extends undefined
    ? false
    : true
  : true;

export type UvReturnType<
  V extends UvVariants<S>,
  S extends UvSlots,
  B extends ClassValue,
  EV extends UvVariants<ES>,
  ES extends UvSlots,
  // @ts-expect-error amount of generics
  E extends UvReturnType = undefined,
> = {
  (props?: UvProps<V, S, EV, ES>): HasSlots<S, ES> extends true ? {
    [K in keyof (ES extends undefined ? {} : ES)]: (
      slotProps?: UvProps<V, S, EV, ES>,
    ) => string;
  } & {
    [K in keyof (S extends undefined ? {} : S)]: (slotProps?: UvProps<V, S, EV, ES>) => string;
  } & {
    [K in UvSlotsWithBase<{}, B>]: (slotProps?: UvProps<V, S, EV, ES>) => string;
  } : string;
} & UvReturnProps<V, S, B, EV, ES, E>;

export interface UvOptions<
  V extends UvVariants<S, B, EV>,
  CV extends UvCompoundVariants<V, S, B, EV, ES>,
  DV extends UvDefaultVariants<V, S, EV, ES>,
  B extends ClassValue = undefined,
  S extends UvSlots = undefined,
  // @ts-expect-error amount of generics
  E extends UvReturnType = UvReturnType<
    V,
    S,
    B,
    // @ts-expect-error amount of generics
    EV extends undefined ? {} : EV,
    // @ts-expect-error amount of generics
    ES extends undefined ? {} : ES
  >,
  EV extends UvVariants<ES, B, E['variants'], ES> = E['variants'],
  ES extends UvSlots = E['slots'] extends UvSlots ? E['slots'] : undefined,
> {
  /**
   * Extend allows for easy composition of components.
   * @see https://unocss-variants.vinicunca.dev/docs/composing-components
   */
  extend?: E;
  /**
   * Base allows you to set a base class for a component.
   */
  base?: B;
  /**
   * Slots allow you to separate a component into multiple parts.
   * @see https://unocss-variants.vinicunca.dev/docs/slots
   */
  slots?: S;
  /**
   * Variants allow you to create multiple versions of the same component.
   * @see https://unocss-variants.vinicunca.dev/docs/variants#adding-variants
   */
  variants?: V;
  /**
   * Compound variants allow you to apply classes to multiple variants at once.
   * @see https://unocss-variants.vinicunca.dev/docs/variants#compound-variants
   */
  compoundVariants?: CV;
  /**
   * Compound slots allow you to apply classes to multiple slots at once.
   */
  compoundSlots?: UvCompoundSlots<V, S, B>;
  /**
   * Default variants allow you to set default variants for a component.
   * @see https://unocss-variants.vinicunca.dev/docs/variants#default-variants
   */
  defaultVariants?: DV;
}

export interface Uv {
  <
    V extends UvVariants<S, B, EV>,
    CV extends UvCompoundVariants<V, S, B, EV, ES>,
    DV extends UvDefaultVariants<V, S, EV, ES>,
    B extends ClassValue = undefined,
    S extends UvSlots = undefined,
    // @ts-expect-error amount of generics
    E extends UvReturnType = UvReturnType<
      V,
      S,
      B,
      // @ts-expect-error amount of generics
      EV extends undefined ? {} : EV,
      // @ts-expect-error amount of generics
      ES extends undefined ? {} : ES
    >,
    EV extends UvVariants<ES, B, E['variants'], ES> = E['variants'],
    ES extends UvSlots = E['slots'] extends UvSlots ? E['slots'] : undefined,
  >(
    /**
     * The options object allows you to define the component.
     * @see https://unocss-variants.vinicunca.dev/docs/api-reference#options
     */
    options: UvOptions<V, CV, DV, B, S, E, EV, ES>,
  ): UvReturnType<V, S, B, EV, ES, E>;
}

export type VariantProps<Component extends (...args: any) => any> = Omit<
  OmitUndefined<Parameters<Component>[0]>,
  'class' | 'className'
>;
