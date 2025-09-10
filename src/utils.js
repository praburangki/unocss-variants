import { flat, isBigInt, isBoolean, isNonNullish, isNumber, isObjectType, isString } from '@vinicunca/perkakas';

export function removeExtraSpaces(str) {
  if (!str || !isString(str)) {
    return str;
  }

  return str.replace(/\s+/g, ' ').trim();
}

export function cnBase(...classNames) {
  const classList = [];

  // recursively process input
  function buildClassString(input) {
    // skip null, undefined or invalid numbers

    if (!input && input !== 0 && input !== 0n) {
      return;
    }

    if (Array.isArray(input)) {
      // handle array elements
      for (let i = 0, len = input.length; i < len; i++) {
        buildClassString(input[i]);
      }

      return;
    }

    if (isString(input) || isNumber(input) || isBigInt(input)) {
      classList.push(String(input));
    } else if (isObjectType(input)) {
      const keys = Object.keys(input);

      for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        if (input[key]) {
          classList.push(key);
        }
      }
    }
  }

  // process all args
  for (let i = 0, len = classNames.length; i < len; i++) {
    const c = classNames[i];

    if (isNonNullish(c)) {
      buildClassString(c);
    }
  }

  // join classes and remove extra spaces
  return classList.length > 0
    ? removeExtraSpaces(classList.join(' '))
    : undefined;
}

export function falsyToString(value) {
  if (isBoolean(value)) {
    return `${value}`;
  }

  return value === 0 ? '0' : value;
}

export function mergeObjects(obj1, obj2) {
  const result = {};
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  for (const key of keys1) {
    if (key in obj2) {
      const val1 = obj1[key];
      const val2 = obj2[key];

      if (Array.isArray(val1) || Array.isArray(val2)) {
        result[key] = flat([val2, val1], 100);
      } else if (isObjectType(val1) && isObjectType(val2) && val1 && val2) {
        result[key] = mergeObjects(val1, val2);
      } else {
        result[key] = `${val2} ${val1}`;
      }
    } else {
      result[key] = obj1[key];
    }
  }

  for (const key of keys2) {
    if (!(key in obj1)) {
      result[key] = obj2[key];
    }
  }

  return result;
}

export function joinObjects(obj1, obj2) {
  for (const key of Object.keys(obj2)) {
    if (Object.prototype.hasOwnProperty.call(obj1, key)) {
      obj1[key] = cnBase(obj1[key], obj2[key]);
    } else {
      obj1[key] = obj2[key];
    }
  };

  return obj1;
}
