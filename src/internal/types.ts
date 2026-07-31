export type AnyRecord = Record<string, any>;

export interface CompiledVariant {
  key: string;
  values: AnyRecord;
  isEmpty: boolean;
}

export interface CompiledCompoundVariant {
  conditionKeys: Array<string>;
  source: AnyRecord;
}

export type CompiledCompoundSlot = CompiledCompoundVariant;

export type RuntimeResult
  = | string
    | undefined
    | Record<string, (slotProps?: AnyRecord) => string | undefined>;

export interface RuntimeComponent {
  (props?: AnyRecord): RuntimeResult;
  variantKeys: Array<string> | undefined;
  extend: RuntimeComponent | null;
  base: any;
  slots: AnyRecord;
  variants: AnyRecord;
  defaultVariants: AnyRecord;
  compoundSlots: Array<any>;
  compoundVariants: Array<any>;
}

export type RuntimeUv = (options: AnyRecord) => RuntimeComponent;

export interface ResolvedOptions {
  extend: RuntimeComponent | null;
  base: any;
  variants: AnyRecord;
  defaultVariants: AnyRecord;
  slots: AnyRecord;
  compoundVariants: Array<any>;
  compoundSlots: Array<any>;
  compiledVariants: Array<CompiledVariant> | null;
  compiledCompoundVariants: Array<CompiledCompoundVariant> | null;
  compiledCompoundSlots: Array<CompiledCompoundSlot> | null;
  compiledCompoundSlotsBySlot: Record<string, Array<CompiledCompoundSlot>> | null;
  deferredError: TypeError | null;
  mode: 'plain' | 'variants' | 'slots';
  slotKeys: Array<string> | null;
  variantKeys: Array<string>;
}
