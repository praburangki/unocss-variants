export type ClassValue = ClassArray | string | null | undefined | 0 | 0n | false;
type ClassArray = ReadonlyArray<ClassValue>;

export type ClassProp<V = ClassValue>
  = | { class?: V; className?: never }
    | { class?: never; className?: V };

type UvBaseName = 'base';
type UvSlots = Record<string, ClassValue> | undefined;
type UvVariantsShape = Record<string, Record<string, unknown>> | undefined;

export interface UvReturnTypeLike<V extends UvVariantsShape, S extends UvSlots> {
  (...args: Array<any>): any;
  variants: V;
  slots: S;
}

export type OmitUndefined<T> = T extends undefined ? never : T;
export type StringToBoolean<T> = T extends 'true' | 'false' ? boolean : T;

type VariantValue<V, K> = K extends keyof V ? StringToBoolean<keyof V[K]> : never;
type VariantValueWithBooleanUndefined<V, K>
  = | VariantValue<V, K>
    | (boolean extends VariantValue<V, K> ? undefined : never);

type CnClassValue
  = | string
    | number
    | bigint
    | boolean
    | null
    | undefined
    | CnClassDictionary
    | Array<CnClassValue>;

interface CnClassDictionary {
  [key: string]: any;
}

export type CnOptions = Array<CnClassValue>;
export type CnReturn = string | undefined;

type UvSlotsWithBase<S extends UvSlots, B extends ClassValue>
  = | keyof S
    | (B extends undefined ? never : UvBaseName);

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
  EV extends UvVariantsShape = undefined,
  _ES extends UvSlots | undefined = undefined,
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
  V extends UvVariantsShape,
  S extends UvSlots,
  B extends ClassValue,
  EV extends UvVariantsShape,
  _ES extends UvSlots,
> = Array<
  {
    [K in keyof V | keyof EV]?:
      | VariantValueWithBooleanUndefined<V, K>
      | VariantValueWithBooleanUndefined<EV, K>
      | (K extends keyof V ? Array<VariantValueWithBooleanUndefined<V, K>> : never);
  } & ClassProp<SlotsClassValue<S, B> | ClassValue>
>;

export type UvCompoundSlots<
  V extends UvVariantsShape,
  S extends UvSlots,
  B extends ClassValue,
> = Array<
  {
    slots: Array<UvSlotsWithBase<S, B>>;
  } & {
    [K in keyof V]?:
      | VariantValueWithBooleanUndefined<V, K>
      | Array<VariantValueWithBooleanUndefined<V, K>>;
  } & ClassProp
>;

export type UvDefaultVariants<
  V extends UvVariantsShape,
  _S extends UvSlots,
  EV extends UvVariantsShape,
  _ES extends UvSlots,
> = {
  [K in keyof V | keyof EV]?: VariantValue<V, K> | VariantValue<EV, K>;
};

export type UvProps<
  V extends UvVariantsShape,
  _S extends UvSlots,
  EV extends UvVariantsShape,
  _ES extends UvSlots,
> = EV extends undefined
  ? V extends undefined
    ? ClassProp<ClassValue>
    : {
      [K in keyof V]?: VariantValue<V, K> | undefined;
    } & ClassProp<ClassValue>
  : V extends undefined ? {
    [K in keyof EV]?: VariantValue<EV, K> | undefined;
  } & ClassProp<ClassValue> : {
    [K in keyof V | keyof EV]?: VariantValue<V, K> | VariantValue<EV, K> | undefined;
  } & ClassProp<ClassValue>;

export type UvVariantKeys<V extends UvVariantsShape, _S extends UvSlots> = V extends undefined
  ? undefined
  : Array<keyof V>;

type UvMergedVariants<V extends UvVariantsShape, EV extends UvVariantsShape> = V extends undefined
  ? EV
  : EV extends undefined
    ? V
    : V & EV;

type UvMergedSlots<S extends UvSlots, ES extends UvSlots> = S extends undefined
  ? ES
  : ES extends undefined
    ? S
    : S & ES;

export interface UvReturnProps<
  V extends UvVariantsShape,
  S extends UvSlots,
  B extends ClassValue,
  EV extends UvVariantsShape,
  ES extends UvSlots,
  E extends UvReturnTypeLike<any, any> | undefined = undefined,
> {
  extend: E;
  base: B;
  slots: UvMergedSlots<S, ES>;
  variants: UvMergedVariants<V, EV>;
  defaultVariants: UvDefaultVariants<V, S, EV, ES>;
  compoundVariants: UvCompoundVariants<V, S, B, EV, ES>;
  compoundSlots: UvCompoundSlots<V, S, B>;
  variantKeys: UvVariantKeys<UvMergedVariants<V, EV>, UvMergedSlots<S, ES>>;
}

type HasSlots<S extends UvSlots, ES extends UvSlots> = S extends undefined
  ? ES extends undefined
    ? false
    : true
  : true;

export interface UvReturnType<
  V extends UvVariantsShape,
  S extends UvSlots,
  B extends ClassValue,
  EV extends UvVariantsShape,
  ES extends UvSlots,
  E extends UvReturnTypeLike<any, any> | undefined = undefined,
> extends UvReturnProps<V, S, B, EV, ES, E> {
  (
    props?: UvProps<V, S, EV, ES>,
  ): HasSlots<S, ES> extends true ? {
    [K in keyof (ES extends undefined ? {} : ES)]: (
      slotProps?: UvProps<V, S, EV, ES>,
    ) => string;
  } & {
    [K in keyof (S extends undefined ? {} : S)]: (slotProps?: UvProps<V, S, EV, ES>) => string;
  } & {
    [K in UvBaseName]: (slotProps?: UvProps<V, S, EV, ES>) => string;
  }
    : string;
}

export type Uv = <
  V extends UvVariants<S, B, EV>,
  CV extends UvCompoundVariants<V, S, B, EV, ES>,
  DV extends UvDefaultVariants<V, S, EV, ES>,
  B extends ClassValue = undefined,
  S extends UvSlots = undefined,
  E extends UvReturnTypeLike<any, any> = UvReturnTypeLike<V, S>,
  EV extends UvVariants<ES, B, E['variants'], ES> = E['variants'],
  ES extends UvSlots = E['slots'] extends UvSlots ? E['slots'] : undefined,
>(options: {
  /**
   * Extend allows for easy composition of components.
   * @see https://vinicunca.dev/unocss-variants/composing-components
   */
  extend?: E;
  /**
   * Base allows you to set a base class for a component.
   */
  base?: B;
  /**
   * Slots allow you to separate a component into multiple parts.
   * @see https://vinicunca.dev/unocss-variants/slots
   */
  slots?: S;
  /**
   * Variants allow you to create multiple versions of the same component.
   * @see https://vinicunca.dev/unocss-variants/variants#adding-variants
   */
  variants?: V;
  /**
   * Compound variants allow you to apply classes to multiple variants at once.
   * @see https://vinicunca.dev/unocss-variants/variants#compound-variants
   */
  compoundVariants?: CV;
  /**
   * Compound slots allow you to apply classes to multiple slots at once.
   */
  compoundSlots?: UvCompoundSlots<V, S, B>;
  /**
   * Default variants allow you to set default variants for a component.
   * @see https://vinicunca.dev/unocss-variants/variants#default-variants
   */
  defaultVariants?: DV;
},
) => UvReturnType<V, S, B, EV, ES, E>;

export type VariantProps<Component extends (...args: any) => any> = Omit<
  OmitUndefined<Parameters<Component>[0]>,
  'class' | 'className'
>;
