import { flat, isEmpty, isObjectType, isString } from '@vinicunca/perkakas';
import {
  falsyToString,
  mergeObjects,
  removeExtraSpaces,
} from './utils';

export const defaultConfig = {
  responsiveVariants: false,
};

export function cnBase(...classes) {
  return removeExtraSpaces(
    (
      flat(classes, 100).filter(Boolean).join(' ')
    ) || undefined,
  );
}

function joinObjects(obj1, obj2) {
  for (const key of Object.keys(obj2)) {
    if (Object.prototype.hasOwnProperty.call(obj1, key)) {
      obj1[key] = cnBase(obj1[key], obj2[key]);
    } else {
      obj1[key] = obj2[key];
    }
  };

  return obj1;
}

export function uv(options) {
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

  const component = (props) => {
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

    const getVariantValue = (variant, vrs = variants, slotProps = null) => {
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

      // If there is a variant key and it's not an object,
      // we use the variant key and ignore the default variant.
      const key = variantKey != null && !isObjectType(variantKey)
        ? variantKey
        : falsyToString(defaultVariantProp);

      const value = variantObj[key || 'false'];

      return value;
    };

    const getVariantClassNames = () => {
      if (!variants) {
        return null;
      }

      return Object.keys(variants).map((vk) => getVariantValue(vk, variants));
    };

    const getVariantClassNamesBySlotKey = (slotKey, slotProps) => {
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
    };

    const propsWithoutUndefined = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const prop in props) {
      if (props[prop] !== undefined) {
        propsWithoutUndefined[prop] = props[prop];
      }
    }

    const getCompleteProps = (key, slotProps) => {
      const initialProp
        = isObjectType(props?.[key])
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
    };

    const getCompoundVariantsValue = (cv = [], slotProps) => {
      const result = [];

      for (const { class: uvClass, className: uvClassName, ...compoundVariantOptions } of cv) {
        let isValid = true;

        for (const [key, value] of Object.entries(compoundVariantOptions)) {
          const completePropsValue = getCompleteProps(key, slotProps)[key];

          if (Array.isArray(value)) {
            if (!value.includes(completePropsValue)) {
              isValid = false;
              break;
            }
          } else {
            if (
              (value == null || value === false)
              && (completePropsValue == null || completePropsValue === false)
            ) {
              continue;
            }

            if (completePropsValue !== value) {
              isValid = false;
              break;
            }
          }
        }

        if (isValid) {
          if (uvClass) {
            result.push(uvClass);
          }

          if (uvClassName) {
            result.push(uvClassName);
          }
        }
      }

      return result;
    };

    const getCompoundVariantClassNamesBySlot = (slotProps) => {
      const compoundClassNames = getCompoundVariantsValue(compoundVariants, slotProps);

      if (!Array.isArray(compoundClassNames)) {
        return compoundClassNames;
      }

      const result = {};

      for (const className of compoundClassNames) {
        if (isString(className)) {
          result.base = cnBase(result.base, className);
        }

        if (isObjectType(className)) {
          for (const [slot, slotClassName] of Object.entries(className)) {
            result[slot] = cnBase(result[slot], slotClassName);
          }
        }
      }

      return result;
    };

    const getCompoundSlotClassNameBySlot = (slotProps) => {
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

            if (
              completePropsValue === undefined
              || (Array.isArray(slotVariantValue)
                ? !slotVariantValue.includes(completePropsValue)
                : slotVariantValue !== completePropsValue)
            ) {
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
    };

    // with slots
    if (!isEmpty(slotProps) || !isExtendedSlotsEmpty) {
      const slotsFns = {};

      if (isObjectType(slots) && !isEmpty(slots)) {
        for (const slotKey of Object.keys(slots)) {
          slotsFns[slotKey] = (slotProps) =>
            cnBase(
              slots[slotKey],
              getVariantClassNamesBySlotKey(slotKey, slotProps),
              (getCompoundVariantClassNamesBySlot(slotProps) ?? [])[slotKey],
              (getCompoundSlotClassNameBySlot(slotProps) ?? [])[slotKey],
              slotProps?.class,
              slotProps?.className,
            );
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
  };

  const getVariantKeys = () => {
    if (!variants || !isObjectType(variants)) {
      return;
    }

    return Object.keys(variants);
  };

  component.variantKeys = getVariantKeys();
  component.extend = extend;
  component.base = base;
  component.slots = slots;
  component.variants = variants;
  component.defaultVariants = defaultVariants;
  component.compoundSlots = compoundSlots;
  component.compoundVariants = compoundVariants;

  // console.log('🚀 ~ uv ~ component:', component);

  return component;
}

export function createUv() {
  return (options) => uv(options);
}
