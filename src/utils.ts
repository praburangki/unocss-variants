import { isBoolean } from '@vinicunca/perkakas';

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

export function mergeObjects(obj1, obj2) {
  const result = {};
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  for (const key of keys1) {
    if (keys2.includes(key)) {
      const val1 = obj1[key];
      const val2 = obj2[key];

      if (Array.isArray(val1) || Array.isArray(val2)) {
        result[key] = flatMergeArrays(val2, val1);
      } else if (typeof val1 === 'object' && typeof val2 === 'object') {
        result[key] = mergeObjects(val1, val2);
      } else {
        result[key] = `${val2} ${val1}`;
      }
    } else {
      result[key] = obj1[key];
    }
  }

  for (const key of keys2) {
    if (!keys1.includes(key)) {
      result[key] = obj2[key];
    }
  }

  return result;
}

export function removeExtraSpaces(str) {
  if (!str || typeof str !== 'string') {
    return str;
  }

  return str.replace(/\s+/g, ' ').trim();
}
