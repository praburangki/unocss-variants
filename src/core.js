import { flat, isEmpty, isObjectType, isString } from '@vinicunca/perkakas';
import {
  cnBase,
  falsyToString,
  joinObjects,
  mergeObjects,
} from './utils';

export function getUnoVariants() {
  function uv(options) {
    const {
      extend = null,
      slots: slotProps = {},
      variants: variantsProps = {},
      compoundVariants: compoundVariantsProps = [],
      compoundSlots = [],
      defaultVariants: defaultVariantsProps = {},
    } = options;

    const base = extend?.base ? cnBase(extend.base, options?.base) : options?.base;
    const variants = extend?.variants && !isEmpty(extend.variants)
      ? mergeObjects(variantsProps, extend.variants)
      : variantsProps;
    const defaultVariants = extend?.defaultVariants && !isEmpty(extend.defaultVariants)
      ? { ...extend.defaultVariants, ...defaultVariantsProps }
      : defaultVariantsProps;

    const isExtendedSlotsEmpty = isEmpty(extend?.slots);
    const componentSlots = !isEmpty(slotProps)
      ? {
        // add "base" to the slots object
          base: cnBase(options?.base, isExtendedSlotsEmpty && extend?.base),
          ...slotProps,
        }
      : {};

    // merge slots with the "extended" slots
    const slots = isExtendedSlotsEmpty
      ? componentSlots
      : joinObjects(
          { ...extend?.slots },
          // eslint-disable-next-line sonar/no-nested-conditional
          isEmpty(componentSlots) ? { base: options?.base } : componentSlots,
        );

    // merge compoundVariants with the "extended" compoundVariants
    const compoundVariants = isEmpty(extend?.compoundVariants)
      ? compoundVariantsProps
      : flat([extend?.compoundVariants, compoundVariantsProps], 100);

    function component(props) {
      if (isEmpty(variants) && isEmpty(slotProps) && isExtendedSlotsEmpty) {
        return cnBase(base, props?.class, props?.className);
      }

      if (compoundVariants && !Array.isArray(compoundVariants)) {
        throw new TypeError(
          `The "compoundVariants" prop must be an array. Received: ${typeof compoundVariants}`,
        );
      }

      if (compoundSlots && !Array.isArray(compoundSlots)) {
        throw new TypeError(
          `The "compoundSlots" prop must be an array. Received: ${typeof compoundSlots}`,
        );
      }

      function getVariantValue(variant, vrs = variants, slotProps = null) {
        const variantObj = vrs[variant];

        if (!variantObj || isEmpty(variantObj)) {
          return null;
        }

        const variantProp = slotProps?.[variant] ?? props?.[variant];

        if (variantProp === null) {
          return null;
        }

        const variantKey = falsyToString(variantProp);

        const defaultVariantProp = defaultVariants?.[variant];

        // If there is a variant key and it's not an object (screen variants),
        // we use the variant key and ignore the default variant.
        const key = variantKey != null && typeof variantKey != 'object'
          ? variantKey
          : falsyToString(defaultVariantProp);

        const value = variantObj[key || 'false'];

        return value;
      }

      function getVariantClassNames() {
        if (!variants) {
          return null;
        }

        const keys = Object.keys(variants);
        const result = [];

        for (let i = 0; i < keys.length; i++) {
          const value = getVariantValue(keys[i], variants);

          if (value) {
            result.push(value);
          }
        }

        return result;
      }

      function getVariantClassNamesBySlotKey(slotKey, slotProps) {
        if (!variants || !isObjectType(variants)) {
          return null;
        }

        const result = [];

        for (const variant of Object.keys(variants)) {
          const variantValue = getVariantValue(variant, variants, slotProps);

          const value = slotKey === 'base' && isString(variantValue)
            ? variantValue
            : variantValue && variantValue[slotKey];

          if (value) {
            result.push(value);
          }
        }

        return result;
      }

      const propsWithoutUndefined = {};

      // eslint-disable-next-line no-restricted-syntax
      for (const prop in props) {
        const value = props[prop];

        if (value !== undefined) {
          propsWithoutUndefined[prop] = value;
        }
      }

      function getCompleteProps(key, slotProps) {
        const initialProp = isObjectType(props?.[key])
          ? {
              [key]: props[key]?.initial,
            }
          : {};

        return {
          ...defaultVariants,
          ...propsWithoutUndefined,
          ...initialProp,
          ...slotProps,
        };
      }

      function getCompoundVariantsValue(cv = [], slotProps) {
        const result = [];
        const cvLength = cv.length;

        for (let i = 0; i < cvLength; i++) {
          const { class: tvClass, className: tvClassName, ...compoundVariantOptions } = cv[i];
          let isValid = true;
          const completeProps = getCompleteProps(null, slotProps);

          for (const [key, value] of Object.entries(compoundVariantOptions)) {
            const completePropsValue = completeProps[key];

            if (Array.isArray(value)) {
              if (!value.includes(completePropsValue)) {
                isValid = false;
                break;
              }
            } else {
              if ((value == null || value === false)
                && (completePropsValue == null || completePropsValue === false)) {
                continue;
              }

              if (completePropsValue !== value) {
                isValid = false;
                break;
              }
            }
          }

          if (isValid) {
            if (tvClass) {
              result.push(tvClass);
            }
            if (tvClassName) {
              result.push(tvClassName);
            }
          }
        }

        return result;
      }

      function getCompoundVariantClassNamesBySlot(slotProps) {
        const compoundClassNames = getCompoundVariantsValue(compoundVariants, slotProps);

        if (!Array.isArray(compoundClassNames)) {
          return compoundClassNames;
        }

        const result = {};
        for (let i = 0; i < compoundClassNames.length; i++) {
          const className = compoundClassNames[i];

          if (isString(className)) {
            result.base = cnBase(result.base, className);
          } else if (isObjectType(className)) {
            for (const [slot, slotClassName] of Object.entries(className)) {
              result[slot] = cnBase(result[slot], slotClassName);
            }
          }
        }

        return result;
      }

      function getCompoundSlotClassNameBySlot(slotProps) {
        if (compoundSlots.length < 1) {
          return null;
        }

        const result = {};
        const completeProps = getCompleteProps(null, slotProps);

        for (let i = 0; i < compoundSlots.length; i++) {
          const {
            slots = [],
            class: slotClass,
            className: slotClassName,
            ...slotVariants
          } = compoundSlots[i];

          if (!isEmpty(slotVariants)) {
            let isValid = true;

            for (const key of Object.keys(slotVariants)) {
              const completePropsValue = completeProps[key];
              const slotVariantValue = slotVariants[key];

              if (completePropsValue === undefined
                || (Array.isArray(slotVariantValue)
                  ? !slotVariantValue.includes(completePropsValue)
                  : slotVariantValue !== completePropsValue)) {
                isValid = false;
                break;
              }
            }

            if (!isValid) {
              continue;
            }
          }

          for (const slotName of slots) {
            result[slotName] = result[slotName] || [];
            result[slotName].push([slotClass, slotClassName]);
          }
        }

        return result;
      }

      // with slots
      if (!isEmpty(slotProps) || !isExtendedSlotsEmpty) {
        const slotsFns = {};

        if (isObjectType(slots) && !isEmpty(slots)) {
          for (const slotKey of Object.keys(slots)) {
            slotsFns[slotKey] = (slotProps) => {
              const compoundVariantClasses = getCompoundVariantClassNamesBySlot(slotProps);
              const compoundSlotClasses = getCompoundSlotClassNameBySlot(slotProps);

              return cnBase(
                slots[slotKey],
                getVariantClassNamesBySlotKey(slotKey, slotProps),
                compoundVariantClasses ? compoundVariantClasses[slotKey] : undefined,
                compoundSlotClasses ? compoundSlotClasses[slotKey] : undefined,
                slotProps?.class,
                slotProps?.className,
              );
            };
          }
        }

        return slotsFns;
      }

      // normal variants
      return cnBase(
        base,
        getVariantClassNames(),
        getCompoundVariantsValue(compoundVariants),
        props?.class,
        props?.className,
      );
    }

    function getVariantKeys() {
      if (!variants || !isObjectType(variants)) {
        return;
      }

      return Object.keys(variants);
    }

    component.variantKeys = getVariantKeys();
    component.extend = extend;
    component.base = base;
    component.slots = slots;
    component.variants = variants;
    component.defaultVariants = defaultVariants;
    component.compoundSlots = compoundSlots;
    component.compoundVariants = compoundVariants;

    return component;
  };

  function createUv() {
    return (options) => uv(options);
  }

  return { uv, createUv };
}
