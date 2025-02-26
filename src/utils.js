import { isBoolean, isObjectType, isString } from '@vinicunca/perkakas';
import { createDefu } from 'defu';

export function falsyToString(value) {
  if (isBoolean(value)) {
    return `${value}`;
  }

  return value === 0 ? '0' : value;
}

function flat(arr, target) {
  arr.forEach((el) => {
    if (Array.isArray(el)) {
      flat(el, target);
    } else {
      target.push(el);
    }
  });
}

export function flatArray(arr) {
  const flattened = [];

  flat(arr, flattened);

  return flattened;
}

export const flatMergeArrays = (...arrays) => flatArray(arrays).filter(Boolean);

export const mergeObjects = createDefu((obj, key, value) => {
  if (isString(obj[key]) && isString(value)) {
    obj[key] += ` ${value}`;

    return true;
  }

  if (Array.isArray(obj[key]) || Array.isArray(value)) {
    obj[key] = flatMergeArrays(obj[key], value);

    return true;
  }

  if (isObjectType(obj[key]) && isObjectType(value)) {
    obj[key] = mergeObjects(obj[key], value);

    return true;
  }

  return false;
});

export function removeExtraSpaces(str) {
  if (!str || !isString(str)) {
    return str;
  }

  return str.replace(/\s+/g, ' ').trim();
}
