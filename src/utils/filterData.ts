import {
  getPermissionedFields,
  splitFields,
  deletePropertyPath,
} from './utils';
import { FieldsWithConditions } from '../types';
import pickDeep from 'pick-deep';

export const filterObject = (
  data: {},
  fields: null | string[],
  fieldsWithConditions: null | FieldsWithConditions[]
): object => {
  const allowedFields = getPermissionedFields(
    data,
    fields,
    fieldsWithConditions
  );
  const { positiveFields, negativeFields } = splitFields(allowedFields);
  const filteredObj =
    positiveFields.length === 0 || positiveFields.includes('*')
      ? data
      : pickDeep(data, positiveFields);
  negativeFields.forEach(field => deletePropertyPath(filteredObj, field));
  return filteredObj;
};

export const filterData = (
  data: object[] | object,
  fields: null | string[],
  fieldsWithConditions: null | FieldsWithConditions[]
): object | object[] => {
  const isArray = Array.isArray(data);
  if (isArray) {
    // tslint:disable-next-line: prefer-type-cast
    return (data as object[]).map(item =>
      filterObject(item, fields, fieldsWithConditions)
    );
  }
  return filterObject(data, fields, fieldsWithConditions);
};
