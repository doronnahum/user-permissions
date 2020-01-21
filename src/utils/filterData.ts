import { checkConditions, deletePropertyPath } from './utils';
import { FieldsWithConditions } from '../types';
import pick from 'pick-deep';

const splitFields = (allowedFields: string[]) => {
  const positiveFields: string[] = [];
  const negativeFields: string[] = [];
  allowedFields.forEach(field => {
    if (field.startsWith('-')) {
      negativeFields.push(field.substr(1));
    } else {
      positiveFields.push(field);
    }
  });
  return {
    positiveFields,
    negativeFields,
  };
};

const getAllowedFields = (
  data: {},
  fields: null | string[],
  fieldsWithConditions: null | FieldsWithConditions[]
) => {
  const allowedFields = fields ? [...fields] : [];
  if (fieldsWithConditions) {
    fieldsWithConditions.forEach(item => {
      if (checkConditions(item.conditions, data)) {
        allowedFields.push(...item.fields);
      }
    });
  }
  return allowedFields;
};

const filterObject = (
  data: {},
  fields: null | string[],
  fieldsWithConditions: null | FieldsWithConditions[]
): object => {
  const allowedFields = getAllowedFields(data, fields, fieldsWithConditions);
  const { positiveFields, negativeFields } = splitFields(allowedFields);
  const filteredObj =
    positiveFields.length === 0 || positiveFields.includes('*')
      ? data
      : pick(data, positiveFields);
  negativeFields.forEach(field => deletePropertyPath(filteredObj, field));
  return filteredObj;
};

export const filterData = (
  fields: null | string[],
  fieldsWithConditions: null | FieldsWithConditions[]
) => {
  return (data: object | object[]): object | object[] => {
    const isArray = Array.isArray(data);
    if (isArray) {
      return (data as Array<{}>).map(item =>
        filterObject(item, fields, fieldsWithConditions)
      );
    }
    return filterObject(data, fields, fieldsWithConditions);
  };
};
